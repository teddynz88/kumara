import { supabase } from './supabase';

// The Phase 2 migration (migrations/2026-06-10_phase2_recipes_and_planner.sql)
// adds columns and tables. Until it has been run in the Supabase SQL editor,
// the app keeps working against the Phase 1 schema — these helpers detect,
// once per session, what the database currently supports.

let recipesV2 = null;
const tableCache = {};

// True once recipes has the Phase 2 columns (ingredient_groups etc).
export async function hasPhase2Recipes() {
  if (recipesV2 !== null) return recipesV2;
  const { error } = await supabase.from('recipes').select('ingredient_groups').limit(1);
  recipesV2 = !error;
  return recipesV2;
}

// True if a table (meal_plan_entries, nutrition_targets, shopping_list_items) exists.
export async function hasTable(name) {
  if (tableCache[name] !== undefined) return tableCache[name];
  const { error } = await supabase.from(name).select('id').limit(1);
  tableCache[name] = !error;
  return tableCache[name];
}

// Friendly banner copy when a feature needs the migration first.
export const MIGRATION_HINT =
  'This feature needs the Phase 2 database update. Run migrations/2026-06-10_phase2_recipes_and_planner.sql in the Supabase SQL editor, then refresh.';
