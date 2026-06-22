import { useState, useEffect, useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../supabase';
import { hasTable, MIGRATION_HINT } from '../schema';
import { getMonday, isoDate, todayIndexInWeek } from '../lib/dates';
import { signOut } from '../lib/auth';
import { getUnitsPref, setUnitsPref } from '../lib/units';
import StarterPack from './StarterPack';
import { input, label as labelClass } from '../ui';

const TARGET_FIELDS = [
  { key: 'calories', label: 'Calories' },
  { key: 'protein_g', label: 'Protein (g)' },
  { key: 'carbs_g', label: 'Carbs (g)' },
  { key: 'fat_g', label: 'Fat (g)' },
  { key: 'fibre_g', label: 'Fibre (g)' },
];

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Profile({ session }) {
  const email = session?.user?.email || '';
  const [units, setUnits] = useState(getUnitsPref());
  const [available, setAvailable] = useState(true);

  function chooseUnits(system) {
    setUnits(system);
    setUnitsPref(system);
  }
  const [rowId, setRowId] = useState(null);
  const [values, setValues] = useState({ calories: '', protein_g: '', carbs_g: '', fat_g: '', fibre_g: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dayCalories, setDayCalories] = useState(null); // [{day, calories}] for this week

  useEffect(() => {
    (async () => {
      if (!(await hasTable('nutrition_targets'))) {
        setAvailable(false);
        return;
      }
      const { data } = await supabase.from('nutrition_targets').select('*').limit(1);
      if (data?.length) {
        const row = data[0];
        setRowId(row.id);
        setValues(Object.fromEntries(
          TARGET_FIELDS.map(f => [f.key, row[f.key]?.toString() || ''])
        ));
      }
    })();
  }, []);

  // This week's per-day calorie totals for the chart.
  useEffect(() => {
    (async () => {
      if (!(await hasTable('meal_plan_entries'))) return;
      const weekStart = isoDate(getMonday());
      const { data: entries } = await supabase
        .from('meal_plan_entries')
        .select('day, slot, entry_type, recipe_id')
        .eq('week_start', weekStart)
        .eq('entry_type', 'recipe');
      if (!entries?.length) {
        setDayCalories(Array.from({ length: 7 }, () => 0));
        return;
      }
      const ids = [...new Set(entries.map(e => e.recipe_id).filter(Boolean))];
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id, calories')
        .in('id', ids);
      const calsById = Object.fromEntries((recipes || []).map(r => [String(r.id), r.calories || 0]));
      const totals = Array.from({ length: 7 }, () => 0);
      for (const e of entries) {
        totals[e.day] += calsById[String(e.recipe_id)] || 0;
      }
      setDayCalories(totals);
    })();
  }, [saved]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const payload = Object.fromEntries(
      TARGET_FIELDS.map(f => [f.key, values[f.key] ? parseInt(values[f.key]) : null])
    );
    const { data, error } = rowId
      ? await supabase.from('nutrition_targets').update(payload).eq('id', rowId).select().single()
      : await supabase.from('nutrition_targets').insert(payload).select().single();
    if (!error && data) {
      setRowId(data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  const targetCalories = values.calories ? parseInt(values.calories) : null;
  const todayIdx = todayIndexInWeek(getMonday());

  const chart = useMemo(() => {
    if (!dayCalories) return null;
    const max = Math.max(...dayCalories, targetCalories || 0, 1);
    return dayCalories.map(cal => {
      const heightPct = Math.round((cal / max) * 100);
      let tone = 'bg-stone-400/60';
      if (targetCalories && cal > 0) {
        const ratio = cal / targetCalories;
        tone = ratio > 1.15 ? 'bg-clay-500/70' : ratio >= 0.9 ? 'bg-sage-500/80' : 'bg-stone-400/60';
      }
      return { cal, heightPct, tone };
    });
  }, [dayCalories, targetCalories]);

  return (
    <div className="p-4 pb-8">
      <h2 className="type-h1 text-[28px] text-ink-900 mb-1">Profile</h2>

      {/* Account */}
      <div className="bg-sand-100 rounded-2xl p-4 mb-5 shadow-[0_1px_2px_rgba(45,42,36,.06)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow-sm text-ink-600">Signed in as</p>
          <p className="text-sm font-medium text-ink-900 truncate">{email || '—'}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-ink-900 text-sm font-semibold hover:bg-sand-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* Units */}
      <div className="bg-sand-100 rounded-2xl p-4 mb-5 shadow-[0_1px_2px_rgba(45,42,36,.06)]">
        <h3 className="eyebrow text-ink-600 mb-3">Recipe units</h3>
        <div className="inline-flex rounded-xl bg-sand-50 p-1 border border-stone-200">
          {[['metric', 'Metric (g, ml)'], ['imperial', 'Imperial (oz, cups)']].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => chooseUnits(val)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                units === val ? 'bg-plum-500 text-sand-50' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-600 mt-2">
          Converts ingredient amounts when you read a recipe. Saved per device.
        </p>
      </div>

      {/* Recipe packs */}
      <div className="bg-sand-100 rounded-2xl p-4 mb-5 shadow-[0_1px_2px_rgba(45,42,36,.06)]">
        <h3 className="eyebrow text-ink-600 mb-3">Recipe packs</h3>
        <StarterPack compact />
      </div>

      <p className="text-sm text-ink-600 mb-3">Daily targets drive the planner&rsquo;s traffic lights.</p>

      {!available ? (
        <p className="text-xs text-ink-600 bg-sand-100 rounded-xl px-3 py-2">{MIGRATION_HINT}</p>
      ) : (
        <>
          <form onSubmit={handleSave} className="bg-sand-100 rounded-2xl p-4 shadow-[0_1px_2px_rgba(45,42,36,.06)]">
            <h3 className="eyebrow text-ink-600 mb-3">Daily targets</h3>
            <div className="grid grid-cols-2 gap-3">
              {TARGET_FIELDS.map(f => (
                <div key={f.key}>
                  <label className={labelClass}>{f.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={values[f.key]}
                    onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className={`${input} bg-sand-50`}
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="grad-cta w-full mt-4 py-3 rounded-xl text-sand-50 font-semibold text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save targets'}
            </button>
            {saved && (
              <p className="font-display italic text-lg text-sage-500 text-center mt-2">Targets saved</p>
            )}
          </form>

          {/* This week, calories per day */}
          {chart && (
            <div className="bg-sand-100 rounded-2xl p-4 mt-4 shadow-[0_1px_2px_rgba(45,42,36,.06)]">
              <h3 className="eyebrow text-ink-600 mb-3">This week · calories per day</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {chart.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    {bar.cal > 0 && (
                      <span className="font-narrow font-bold text-[9px] text-ink-600">{bar.cal}</span>
                    )}
                    <div
                      className={`w-full rounded-t-md ${bar.tone}`}
                      style={{ height: `${Math.max(bar.heightPct, bar.cal > 0 ? 4 : 0)}%` }}
                    />
                    <span className={`font-narrow text-[10px] ${i === todayIdx ? 'font-bold text-plum-500' : 'text-ink-600'}`}>
                      {DAY_LETTERS[i]}
                    </span>
                  </div>
                ))}
              </div>
              {targetCalories ? (
                <p className="text-xs text-ink-600 mt-2">
                  Target <span className="font-narrow font-bold text-ink-900">{targetCalories} cal</span> — sage means on target, clay means well over.
                </p>
              ) : (
                <p className="text-xs text-ink-600 mt-2">Set a calorie target to colour the bars.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
