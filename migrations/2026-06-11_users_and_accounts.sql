-- ============================================================
-- Kūmara — Users & accounts
-- ============================================================
-- WHAT THIS DOES (plain English):
--   * gives every recipe / plan / list / target an OWNER
--   * makes all your existing data yours
--   * turns your recipes into "Teddy's Starting Recipe Pack" that
--     new users can add on signup
--   * turns ON row-level security so each person only ever sees
--     their own data (this is the real, multi-user version of the
--     security we temporarily turned OFF as a single-user stopgap)
--
-- WHEN TO RUN IT:
--   AFTER you have signed up in the app with your own account, and
--   BEFORE you share the link with anyone. It claims all existing
--   data to the FIRST account that signed up — that's you.
--
-- HOW:  paste the whole file into the Supabase SQL editor and Run.
--       Safe to run once. (If a friend somehow signs up before you
--       run this, see the note on the claim step below.)
-- ============================================================

-- 0. Safety guard — refuse to run if nobody has signed up yet,
--    otherwise we'd lock everyone (including you) out of the data.
do $$
begin
  if not exists (select 1 from auth.users) then
    raise exception
      'No accounts exist yet. Sign up in the Kumara app first, then run this.';
  end if;
end $$;

-- 1. Recipe packs — a named collection of recipes by a creator.
--    The starter pack is the seed of the future creator marketplace.
create table if not exists recipe_packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  creator_name text,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

insert into recipe_packs (slug, name, creator_name, description)
values (
  'teddy-starter',
  'Teddy''s Starting Recipe Pack',
  'Teddy',
  'A starter set of low-carb, high-protein wholefood recipes to get you going.'
)
on conflict (slug) do nothing;

-- 2. Owner + pack columns (nullable for now; filled in below).
--    A recipe with pack_id set and user_id null is a PACK TEMPLATE —
--    a master copy new users copy from, not anyone's personal recipe.
alter table recipes             add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table recipes             add column if not exists pack_id uuid references recipe_packs(id) on delete cascade;
alter table meal_plan_entries   add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table nutrition_targets   add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table shopping_list_items add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 3. Claim all existing rows to YOU (the first account that signed up).
--    If you signed up with a known email and want to be explicit,
--    swap the subquery for:  (select id from auth.users where email = 'you@email.com')
update recipes             set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null and pack_id is null;
update meal_plan_entries   set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null;
update nutrition_targets   set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null;
update shopping_list_items set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null;

-- 4. Seed the starter pack: copy your current library into pack templates
--    (user_id null, pack_id = teddy-starter). Idempotent on title, so
--    re-running won't create duplicates.
insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, source_method, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  r.title, r.photo_url, r.servings, r.prep_time_mins, r.cook_time_mins,
  r.source_type, r.source_url, r.source_method, r.ingredients, r.ingredient_groups,
  r.method_steps, r.tips, r.calories, r.protein_g, r.carbs_g, r.fat_g, r.fibre_g,
  r.macros_estimated, r.tags, false, null, 0,
  null, (select id from recipe_packs where slug = 'teddy-starter')
from recipes r
where r.user_id = (select id from auth.users order by created_at asc limit 1)
  and r.pack_id is null
  and not exists (
    select 1 from recipes t
    where t.pack_id = (select id from recipe_packs where slug = 'teddy-starter')
      and t.title = r.title
  );

-- 5. Auto-fill the owner on every new row, so the app code doesn't
--    have to remember to. (auth.uid() = the logged-in user.)
create or replace function set_user_id()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['recipes','meal_plan_entries','nutrition_targets','shopping_list_items']
  loop
    execute format('drop trigger if exists set_user_id_trg on %I', t);
    execute format('create trigger set_user_id_trg before insert on %I for each row execute function set_user_id()', t);
  end loop;
end $$;

-- 6. Row-level security — the actual privacy boundary.
--    Each table: you can only touch rows you own. Pack templates
--    (user_id null) are invisible to direct queries; users only ever
--    get them via the copy function in step 7.
alter table recipes             enable row level security;
alter table meal_plan_entries   enable row level security;
alter table nutrition_targets   enable row level security;
alter table shopping_list_items enable row level security;
alter table recipe_packs        enable row level security;

drop policy if exists recipes_own on recipes;
create policy recipes_own on recipes
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists mpe_own on meal_plan_entries;
create policy mpe_own on meal_plan_entries
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists targets_own on nutrition_targets;
create policy targets_own on nutrition_targets
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists shopping_own on shopping_list_items;
create policy shopping_own on shopping_list_items
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Anyone signed in can see the LIST of public packs (to offer them).
drop policy if exists packs_public_read on recipe_packs;
create policy packs_public_read on recipe_packs
  for select using (is_public);

-- 7. Copy a pack's recipes into my own library (I get my own editable
--    copies — true sharing/subscribe comes later). SECURITY DEFINER so
--    it can read the templates; auth.uid() still scopes the copies to me.
create or replace function add_starter_pack(pack_slug text)
returns integer language plpgsql security definer as $$
declare
  pid uuid;
  copied integer;
begin
  select id into pid from recipe_packs where slug = pack_slug and is_public;
  if pid is null then return 0; end if;

  insert into recipes (
    title, photo_url, servings, prep_time_mins, cook_time_mins,
    source_type, source_url, source_method, ingredients, ingredient_groups,
    method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
    macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
  )
  select
    t.title, t.photo_url, t.servings, t.prep_time_mins, t.cook_time_mins,
    t.source_type, t.source_url, t.source_method, t.ingredients, t.ingredient_groups,
    t.method_steps, t.tips, t.calories, t.protein_g, t.carbs_g, t.fat_g, t.fibre_g,
    t.macros_estimated, t.tags, false, null, 0, auth.uid(), null
  from recipes t
  where t.pack_id = pid
    and not exists (
      select 1 from recipes mine
      where mine.user_id = auth.uid() and mine.title = t.title
    );
  get diagnostics copied = row_count;
  return copied;
end $$;

grant execute on function add_starter_pack(text) to authenticated, anon;

-- How many recipes are in a pack (for the "Add pack (N recipes)" offer).
create or replace function pack_recipe_count(pack_slug text)
returns integer language sql security definer stable as $$
  select count(*)::int from recipes r
  join recipe_packs p on p.id = r.pack_id
  where p.slug = pack_slug and p.is_public;
$$;

grant execute on function pack_recipe_count(text) to authenticated, anon;
