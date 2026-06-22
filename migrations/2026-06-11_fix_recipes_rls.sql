-- ============================================================
-- Kūmara — FIX: recipes was world-readable
-- ============================================================
-- The recipes table kept a leftover permissive RLS policy from the
-- Phase 1 setup (an "allow everyone" / using(true) policy). Postgres
-- ORs permissive policies together, so it overrode the per-user rule
-- and let any caller read every recipe (including the pack templates,
-- which also made your own library show each recipe twice).
--
-- This drops ALL policies on the four user tables and recreates only
-- the correct "you can only touch your own rows" policy on each.
-- Paste into the Supabase SQL editor and Run. Safe to run once.
-- ============================================================

do $$
declare pol record;
begin
  for pol in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('recipes', 'meal_plan_entries', 'nutrition_targets', 'shopping_list_items')
  loop
    execute format('drop policy if exists %I on %I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table recipes             enable row level security;
alter table meal_plan_entries   enable row level security;
alter table nutrition_targets   enable row level security;
alter table shopping_list_items enable row level security;

create policy recipes_own on recipes
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy mpe_own on meal_plan_entries
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy targets_own on nutrition_targets
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy shopping_own on shopping_list_items
  using (user_id = auth.uid()) with check (user_id = auth.uid());
