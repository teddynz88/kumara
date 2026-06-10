-- ============================================================
-- Kūmara Phase 2 migration — recipes hardening + meal planner
-- ============================================================
-- HOW TO RUN: paste this whole file into the Supabase SQL Editor
-- (dashboard → SQL Editor → New query) and click Run. It is safe
-- to run more than once.
--
-- This migration is ADDITIVE ONLY: it never drops or rewrites
-- existing columns or tables, and the 12 seeded recipes survive
-- untouched. The app feature-detects these changes, so it works
-- before and after this runs.
-- ============================================================

-- ---------- 1. Recipes: harden the data model ----------

-- Grouped ingredients ("For the meatballs" / "For the sauce").
-- Shape: [{ "group_name": text|null, "ingredients":
--           [{ "quantity": number|string|null, "unit": text,
--              "name": text, "note": text }] }]
alter table recipes add column if not exists ingredient_groups jsonb;

-- How an imported recipe was parsed: 'structured' (schema.org JSON-LD,
-- no AI involved) or 'ai' (Claude extraction). Manual entries stay null.
alter table recipes add column if not exists source_method text;

-- True when the per-serve macros were estimated by AI rather than
-- stated by the source. The app surfaces this as an ESTIMATED chip.
alter table recipes add column if not exists macros_estimated boolean not null default false;

-- Backfill: wrap each existing flat ingredient list in a single
-- unnamed group, splitting qty into a proper numeric where possible.
update recipes
set ingredient_groups = jsonb_build_array(
  jsonb_build_object(
    'group_name', null,
    'ingredients', (
      select jsonb_agg(jsonb_build_object(
        'quantity', case
          when (i->>'qty') ~ '^[0-9]+\.?[0-9]*$' then to_jsonb((i->>'qty')::numeric)
          when coalesce(i->>'qty', '') = '' then 'null'::jsonb
          else to_jsonb(i->>'qty')
        end,
        'unit', coalesce(i->>'unit', ''),
        'name', coalesce(i->>'name', ''),
        'note', ''
      ))
      from jsonb_array_elements(recipes.ingredients) as i
    )
  )
)
where ingredient_groups is null
  and ingredients is not null
  and jsonb_array_length(ingredients) > 0;

-- ---------- 2. Meal planner ----------

-- One entry per day+slot per week. day 0 = Monday.
create table if not exists meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  day smallint not null check (day between 0 and 6),
  slot text not null check (slot in ('breakfast', 'lunch', 'snack', 'dinner')),
  entry_type text not null default 'recipe'
    check (entry_type in ('recipe', 'freedom', 'takeaway', 'restaurant')),
  recipe_id uuid references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (week_start, day, slot)
);

create index if not exists meal_plan_entries_week_idx
  on meal_plan_entries (week_start);

-- ---------- 3. Nutrition targets (single-row table) ----------

create table if not exists nutrition_targets (
  id uuid primary key default gen_random_uuid(),
  calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  fibre_g integer,
  updated_at timestamptz not null default now()
);

-- ---------- 4. Shopping list ----------

create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  week_start date,
  name text not null,
  quantity numeric,
  unit text,
  category text not null default 'Other',
  checked boolean not null default false,
  source text not null default 'plan' check (source in ('plan', 'manual')),
  created_at timestamptz not null default now()
);

create index if not exists shopping_list_items_week_idx
  on shopping_list_items (week_start);

-- Note on row-level security: this is a single-household app and the
-- existing recipes table runs without RLS (the anon key reads/writes
-- directly). The new tables follow the same model for consistency.
-- Revisit if the app ever gets a second user or public exposure.
