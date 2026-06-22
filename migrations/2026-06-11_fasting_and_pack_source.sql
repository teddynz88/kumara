-- ============================================================
-- Kūmara — fasting slot + pack source attribution
-- ============================================================
-- Paste into the Supabase SQL editor and Run. Safe to run once.
-- ============================================================

-- 1. Allow a "fasting" meal-plan slot (alongside freedom/takeaway/restaurant).
alter table meal_plan_entries drop constraint if exists meal_plan_entries_entry_type_check;
alter table meal_plan_entries add constraint meal_plan_entries_entry_type_check
  check (entry_type in ('recipe', 'freedom', 'takeaway', 'restaurant', 'fasting'));

-- 2. Record which pack a recipe came from, so it can show "From Teddy's
--    Starting Recipe Pack" in a user's library.
alter table recipes add column if not exists pack_source text;

-- 3. add_starter_pack now stamps the pack name onto each copied recipe.
create or replace function add_starter_pack(pack_slug text)
returns integer language plpgsql security definer as $$
declare
  pid uuid;
  pname text;
  copied integer;
begin
  select id, name into pid, pname from recipe_packs where slug = pack_slug and is_public;
  if pid is null then return 0; end if;

  insert into recipes (
    title, photo_url, servings, prep_time_mins, cook_time_mins,
    source_type, source_url, source_method, ingredients, ingredient_groups,
    method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
    macros_estimated, tags, is_favourite, rating, times_cooked,
    user_id, pack_id, pack_source
  )
  select
    t.title, t.photo_url, t.servings, t.prep_time_mins, t.cook_time_mins,
    t.source_type, t.source_url, t.source_method, t.ingredients, t.ingredient_groups,
    t.method_steps, t.tips, t.calories, t.protein_g, t.carbs_g, t.fat_g, t.fibre_g,
    t.macros_estimated, t.tags, false, null, 0,
    auth.uid(), null, pname
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
