// Meal-plan persistence (Supabase) + AI generation (FastAPI backend).
//
// Before the Phase 2 migration runs, meal_plan_entries doesn't exist —
// every function degrades gracefully so the planner still works in-memory
// for the session (changes just aren't saved).

import { supabase } from '../supabase';
import { hasTable } from '../schema';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];

export const keyOf = (day, slot) => `${day}:${slot}`;

export async function loadWeek(weekStart) {
  if (!(await hasTable('meal_plan_entries'))) return { entries: {}, persisted: false };
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .select('*')
    .eq('week_start', weekStart);
  if (error) return { entries: {}, persisted: false };
  const entries = {};
  for (const row of data || []) {
    entries[keyOf(row.day, row.slot)] = {
      id: row.id,
      entry_type: row.entry_type,
      recipe_id: row.recipe_id,
    };
  }
  return { entries, persisted: true };
}

export async function saveSlot(weekStart, day, slot, entryType, recipeId) {
  if (!(await hasTable('meal_plan_entries'))) return null;
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .upsert(
      {
        week_start: weekStart,
        day,
        slot,
        entry_type: entryType,
        recipe_id: recipeId ?? null,
      },
      { onConflict: 'week_start,day,slot' }
    )
    .select()
    .single();
  return error ? null : data;
}

export async function clearSlot(weekStart, day, slot) {
  if (!(await hasTable('meal_plan_entries'))) return;
  await supabase
    .from('meal_plan_entries')
    .delete()
    .eq('week_start', weekStart)
    .eq('day', day)
    .eq('slot', slot);
}

export async function clearWeek(weekStart) {
  if (!(await hasTable('meal_plan_entries'))) return;
  await supabase.from('meal_plan_entries').delete().eq('week_start', weekStart);
}

export async function fetchTargets() {
  if (!(await hasTable('nutrition_targets'))) return null;
  const { data, error } = await supabase
    .from('nutrition_targets')
    .select('*')
    .limit(1);
  if (error || !data?.length) return null;
  return data[0];
}

export async function generatePlan(weekStart, prompt, slotsToFill) {
  const res = await fetch(`${API_BASE}/plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      week_start: weekStart,
      prompt: prompt || null,
      slots_to_fill: slotsToFill,
    }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('The planning service didn’t answer. Is the backend running?');
  }
  if (!res.ok) throw new Error(data.detail || data.error || 'Plan generation failed');
  return data;
}
