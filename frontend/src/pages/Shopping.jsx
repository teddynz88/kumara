import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, ListPlus } from 'lucide-react';
import { supabase } from '../supabase';
import { hasTable, MIGRATION_HINT } from '../schema';
import { getMonday, addDays, isoDate, formatWeekLabel } from '../lib/dates';
import { AISLES, categorise } from '../lib/aisles';
import { getIngredientGroups } from './RecipeDetail';
import { input } from '../ui';

let idCounter = 0;
const localId = () => `local-${++idCounter}`;

export default function Shopping() {
  const [monday, setMonday] = useState(() => getMonday());
  const weekStart = isoDate(monday);

  const [items, setItems] = useState([]);
  const [persisted, setPersisted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(null);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newCategory, setNewCategory] = useState('Other');

  const reload = useCallback(async () => {
    setLoading(true);
    if (await hasTable('shopping_list_items')) {
      const { data, error: dbError } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('week_start', weekStart)
        .order('created_at');
      setItems(dbError ? [] : data || []);
      setPersisted(!dbError);
    } else {
      setItems([]);
      setPersisted(false);
    }
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { reload(); }, [reload]);

  // --- Build from plan: aggregate ingredients across the week's recipe slots ---
  async function buildFromPlan() {
    setBuilding(true);
    setError(null);
    try {
      if (!(await hasTable('meal_plan_entries'))) {
        setError(MIGRATION_HINT);
        return;
      }
      const { data: entries } = await supabase
        .from('meal_plan_entries')
        .select('recipe_id, entry_type')
        .eq('week_start', weekStart)
        .eq('entry_type', 'recipe');
      const recipeIds = [...new Set((entries || []).map(e => e.recipe_id).filter(Boolean))];
      if (!recipeIds.length) {
        setError('No recipes on this week’s plan yet — plan some meals first.');
        return;
      }
      const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds);

      // Count how many slots each recipe fills — its ingredients scale by that.
      const slotCounts = {};
      for (const e of entries) {
        slotCounts[e.recipe_id] = (slotCounts[e.recipe_id] || 0) + 1;
      }

      // Aggregate: same name + same unit -> summed quantity; different
      // units stay separate lines (no conversion tonight, brief §7.3).
      const merged = new Map();
      for (const recipe of recipes || []) {
        const times = slotCounts[recipe.id] || 1;
        for (const group of getIngredientGroups(recipe)) {
          for (const ing of group.ingredients) {
            const name = (ing.name || '').trim();
            if (!name) continue;
            const unit = (ing.unit || '').trim();
            const mapKey = `${name.toLowerCase()}|${unit.toLowerCase()}`;
            const qty = parseFloat(ing.quantity);
            const existing = merged.get(mapKey);
            if (existing) {
              if (!isNaN(qty) && existing.quantity != null) {
                existing.quantity = Math.round((existing.quantity + qty * times) * 100) / 100;
              } else {
                existing.quantity = null; // unknown amounts stay unitless
              }
            } else {
              merged.set(mapKey, {
                name,
                unit,
                quantity: !isNaN(qty) ? Math.round(qty * times * 100) / 100 : null,
                category: categorise(name),
              });
            }
          }
        }
      }

      const built = [...merged.values()];
      const canPersist = await hasTable('shopping_list_items');

      if (canPersist) {
        // Rebuild replaces auto items, keeps manual ones (brief §7.3).
        await supabase
          .from('shopping_list_items')
          .delete()
          .eq('week_start', weekStart)
          .eq('source', 'plan');
        const rows = built.map(item => ({ ...item, week_start: weekStart, source: 'plan' }));
        const { data: inserted } = await supabase
          .from('shopping_list_items')
          .insert(rows)
          .select();
        const { data: manual } = await supabase
          .from('shopping_list_items')
          .select('*')
          .eq('week_start', weekStart)
          .eq('source', 'manual');
        setItems([...(inserted || []), ...(manual || [])]);
      } else {
        const manualItems = items.filter(i => i.source === 'manual');
        setItems([
          ...built.map(item => ({ ...item, id: localId(), checked: false, source: 'plan' })),
          ...manualItems,
        ]);
      }
    } finally {
      setBuilding(false);
    }
  }

  async function toggleChecked(item) {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i));
    if (persisted && !String(item.id).startsWith('local-')) {
      await supabase
        .from('shopping_list_items')
        .update({ checked: !item.checked })
        .eq('id', item.id);
    }
  }

  async function removeItem(item) {
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (persisted && !String(item.id).startsWith('local-')) {
      await supabase.from('shopping_list_items').delete().eq('id', item.id);
    }
  }

  async function addManual(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const item = {
      week_start: weekStart,
      name,
      quantity: newQty ? parseFloat(newQty) || null : null,
      unit: newUnit.trim(),
      category: newCategory,
      checked: false,
      source: 'manual',
    };
    if (await hasTable('shopping_list_items')) {
      const { data } = await supabase.from('shopping_list_items').insert(item).select().single();
      setItems(prev => [...prev, data || { ...item, id: localId() }]);
    } else {
      setItems(prev => [...prev, { ...item, id: localId() }]);
    }
    setNewName(''); setNewQty(''); setNewUnit(''); setNewCategory('Other');
    setAdding(false);
  }

  const grouped = useMemo(() => {
    const byAisle = Object.fromEntries(AISLES.map(a => [a, []]));
    for (const item of items) {
      (byAisle[item.category] || byAisle.Other).push(item);
    }
    return byAisle;
  }, [items]);

  const remaining = items.filter(i => !i.checked).length;

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-plum-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      <h2 className="type-h1 text-[28px] text-ink-900 mb-3">Shopping</h2>

      {!persisted && (
        <p className="text-xs text-ink-600 bg-sand-100 rounded-xl px-3 py-2 mb-3">
          {MIGRATION_HINT} Until then, this list isn&rsquo;t saved.
        </p>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonday(m => addDays(m, -7))} className="p-2 rounded-xl hover:bg-sand-100 text-ink-900">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <p className="font-narrow font-bold text-base text-ink-900">{formatWeekLabel(monday)}</p>
        <button onClick={() => setMonday(m => addDays(m, 7))} className="p-2 rounded-xl hover:bg-sand-100 text-ink-900">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={buildFromPlan}
          disabled={building}
          className="grad-cta flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sand-50 font-semibold text-sm disabled:opacity-50"
        >
          <ListPlus className="w-4 h-4" />
          {building ? 'Building…' : items.some(i => i.source === 'plan') ? 'Rebuild from plan' : 'Build from plan'}
        </button>
        <button
          onClick={() => setAdding(a => !a)}
          className="px-4 rounded-xl border border-stone-200 text-ink-900 text-sm font-semibold hover:bg-sand-100 inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {error && <p className="text-xs text-clay-500 mb-3">{error}</p>}

      {/* Manual add */}
      {adding && (
        <form onSubmit={addManual} className="bg-sand-100 rounded-2xl p-3 mb-4 flex flex-col gap-2">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Item" className={`${input} bg-sand-50`} autoFocus />
          <div className="grid grid-cols-[4rem_5rem_1fr] gap-2">
            <input type="text" inputMode="decimal" value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Qty" className={`${input} bg-sand-50`} />
            <input type="text" value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Unit" className={`${input} bg-sand-50`} />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className={`${input} bg-sand-50`}>
              {AISLES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button type="submit" disabled={!newName.trim()} className="grad-cta py-2.5 rounded-xl text-sand-50 font-semibold text-sm disabled:opacity-50">
            Add to list
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="type-h2 text-ink-900 mb-1">Nothing on the list</p>
          <p className="text-sm text-ink-600">Build it from this week&rsquo;s plan, or add items by hand.</p>
        </div>
      ) : (
        <>
          <p className="eyebrow-sm text-ink-600 mb-3">{remaining} item{remaining !== 1 ? 's' : ''} to get</p>
          <div className="flex flex-col gap-4">
            {AISLES.filter(a => grouped[a].length).map(aisle => (
              <div key={aisle}>
                <h3 className="eyebrow text-ink-600 mb-1.5">{aisle}</h3>
                <div className="bg-sand-100 rounded-2xl overflow-hidden divide-y divide-stone-200/70">
                  {grouped[aisle].map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                      <button
                        onClick={() => toggleChecked(item)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          item.checked ? 'bg-sage-500 border-sage-500' : 'border-stone-400 bg-sand-50'
                        }`}
                      >
                        {item.checked && (
                          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="#F7F2E9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6.5L4.5 9L10 3" />
                          </svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${item.checked ? 'text-ink-600 line-through' : 'text-ink-900'}`}>
                        {item.name}
                        {item.source === 'manual' && <span className="eyebrow-sm text-plum-500 ml-2">Added</span>}
                      </span>
                      {(item.quantity != null || item.unit) && (
                        <span className="font-narrow font-bold text-xs text-ink-600 shrink-0">
                          {item.quantity ?? ''} {item.unit}
                        </span>
                      )}
                      <button onClick={() => removeItem(item)} className="text-ink-600/40 hover:text-clay-500 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
