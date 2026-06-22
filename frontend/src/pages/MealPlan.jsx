import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Search, Star, Heart, BookOpen,
  Sparkles, Wind, ShoppingBag, UtensilsCrossed, Trash2, Undo2, Hourglass,
  EggFried, Sandwich, Cookie, Utensils, CircleAlert,
} from 'lucide-react';
import { supabase } from '../supabase';
import { getMonday, addDays, isoDate, formatWeekLabel, todayIndexInWeek } from '../lib/dates';
import {
  SLOTS, keyOf, loadWeek, saveSlot, clearSlot, clearWeek as clearWeekDb,
  generatePlan,
} from '../lib/planApi';
import { input, btnGhost } from '../ui';
import RecipeDetail from './RecipeDetail';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
// Column-header icons (the labels were truncating at this size).
const SLOT_ICONS = { breakfast: EggFried, lunch: Sandwich, snack: Cookie, dinner: Utensils };

// Non-recipe slot types — line icons, never emoji (brief §6.3).
const SPECIAL_TYPES = [
  { value: 'freedom', label: 'Freedom', icon: Wind },
  { value: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'fasting', label: 'Fasting', icon: Hourglass },
];
const specialIcon = (type) => SPECIAL_TYPES.find(s => s.value === type)?.icon || Wind;

const MACRO_FIELDS = [
  { key: 'calories', label: 'cal' },
  { key: 'protein_g', label: 'prot', unit: 'g' },
  { key: 'carbs_g', label: 'carb', unit: 'g' },
  { key: 'fat_g', label: 'fat', unit: 'g' },
  { key: 'fibre_g', label: 'fib', unit: 'g' },
];

// Soft alternating purple/orange per macro.
const MACRO_TEXT = {
  cal: 'text-ember-600', prot: 'text-plum-700', carb: 'text-ember-600',
  fat: 'text-plum-700', fib: 'text-ember-600',
};

// Five macros spread evenly across one line under the day's recipes.
function MacroStrip({ totals }) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {MACRO_FIELDS.map(f => (
        <div key={f.key} className="text-center leading-none">
          <div className={`font-narrow font-bold text-[13px] ${MACRO_TEXT[f.label]}`}>
            {totals[f.key] == null ? '—' : Math.round(totals[f.key])}{f.unit || ''}
          </div>
          <div className="font-narrow text-[8px] uppercase tracking-[0.08em] text-ink-600 mt-0.5">{f.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function MealPlan() {
  const [monday, setMonday] = useState(() => getMonday());
  const weekStart = isoDate(monday);

  const [entries, setEntries] = useState({});
  const [persisted, setPersisted] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeSlot, setActiveSlot] = useState(null);   // {day, slot} for the action sheet
  const [picking, setPicking] = useState(false);        // recipe picker open
  const [viewRecipe, setViewRecipe] = useState(null);   // recipe shown in the detail overlay
  const [search, setSearch] = useState('');
  const [saveError, setSaveError] = useState(null);

  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const recipesById = useMemo(
    () => Object.fromEntries(recipes.map(r => [String(r.id), r])),
    [recipes]
  );

  // --- Loading ---
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('recipes')
        .select('id,title,tags,calories,protein_g,carbs_g,fat_g,fibre_g,rating,is_favourite,prep_time_mins,cook_time_mins,photo_url');
      setRecipes(data || []);
    })();
  }, []);

  const reloadWeek = useCallback(async () => {
    setLoading(true);
    const { entries: loaded, persisted: ok } = await loadWeek(weekStart);
    setEntries(loaded);
    setPersisted(ok);
    setLoading(false);
    setUndoSnapshot(null);
  }, [weekStart]);

  useEffect(() => { reloadWeek(); }, [reloadWeek]);

  // --- Mutations (optimistic; persistence degrades gracefully pre-migration) ---
  function setSlotEntry(day, slot, entryType, recipeId = null) {
    setEntries(prev => ({
      ...prev,
      [keyOf(day, slot)]: { entry_type: entryType, recipe_id: recipeId },
    }));
    setSaveError(null);
    // A null result means the write was rejected — surface a precise, honest
    // message rather than letting the slot silently evaporate on reload.
    saveSlot(weekStart, day, slot, entryType, recipeId).then(row => {
      if (!row) {
        setSaveError(
          `Couldn't save that ${entryType} slot. If you just started using a new slot type, ` +
          `run the latest migration (migrations/2026-06-11_fasting_and_pack_source.sql) in Supabase.`
        );
      }
    });
  }

  function removeSlotEntry(day, slot) {
    setEntries(prev => {
      const next = { ...prev };
      delete next[keyOf(day, slot)];
      return next;
    });
    clearSlot(weekStart, day, slot);
  }

  async function handleClearWeek() {
    setUndoSnapshot(entries);
    setEntries({});
    setConfirmClear(false);
    await clearWeekDb(weekStart);
  }

  async function applyUndo() {
    if (!undoSnapshot) return;
    setEntries(undoSnapshot);
    // Re-persist the restored entries one by one.
    for (const [key, entry] of Object.entries(undoSnapshot)) {
      const [day, slot] = key.split(':');
      saveSlot(weekStart, Number(day), slot, entry.entry_type, entry.recipe_id);
    }
    setUndoSnapshot(null);
  }

  // --- Generation (objective 9) ---
  async function handleGenerate() {
    setGenError(null);

    // Generation fills empty slots; "redo the whole week" style prompts
    // also replace existing recipe slots (manually marked freedom/takeaway/
    // restaurant slots are always respected).
    const redoAll = /\b(redo|start over|from scratch|replace)\b/i.test(prompt || '');
    const slotsToFill = [];
    for (let day = 0; day < 7; day++) {
      for (const slot of SLOTS) {
        const existing = entries[keyOf(day, slot)];
        if (!existing || (redoAll && existing.entry_type === 'recipe')) {
          slotsToFill.push({ day, slot });
        }
      }
    }
    if (!slotsToFill.length) {
      setGenError('The week is already full — clear some slots first (or say "redo the whole week").');
      return;
    }

    setGenerating(true);
    const snapshot = entries;
    try {
      const result = await generatePlan(weekStart, prompt, slotsToFill);
      if (!result.entries?.length) {
        setGenError('No plan came back — try adding more recipes to your library first.');
        return;
      }
      setUndoSnapshot(snapshot);
      setEntries(prev => {
        const next = { ...prev };
        for (const e of result.entries) {
          next[keyOf(e.day, e.slot)] = { entry_type: 'recipe', recipe_id: e.recipe_id };
        }
        return next;
      });
      for (const e of result.entries) {
        saveSlot(weekStart, e.day, e.slot, 'recipe', e.recipe_id);
      }
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  // --- Macro rollup (objective 10) ---
  const dayTotals = useMemo(() => {
    return Array.from({ length: 7 }, (_, day) => {
      const totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fibre_g: 0, count: 0 };
      for (const slot of SLOTS) {
        const entry = entries[keyOf(day, slot)];
        if (entry?.entry_type !== 'recipe') continue; // freedom/takeaway/restaurant excluded
        const recipe = recipesById[String(entry.recipe_id)];
        if (!recipe) continue;
        totals.count += 1;
        for (const f of MACRO_FIELDS) totals[f.key] += recipe[f.key] || 0;
      }
      return totals;
    });
  }, [entries, recipesById]);

  const weekAverage = useMemo(() => {
    const activeDays = dayTotals.filter(t => t.count > 0);
    if (!activeDays.length) return null;
    const avg = {};
    for (const f of MACRO_FIELDS) {
      avg[f.key] = activeDays.reduce((sum, t) => sum + t[f.key], 0) / activeDays.length;
    }
    return avg;
  }, [dayTotals]);

  const todayIdx = todayIndexInWeek(monday);

  // --- Pickers ---
  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (activeSlot && !search.trim()) {
      // Default the picker to recipes tagged for this slot, with the rest after.
      const tagged = result.filter(r => r.tags?.includes(activeSlot.slot));
      const rest = result.filter(r => !r.tags?.includes(activeSlot.slot));
      result = [...tagged, ...rest];
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) || r.tags?.some(t => t.includes(q))
      );
    }
    return result;
  }, [recipes, search, activeSlot]);

  function closeSheets() {
    setActiveSlot(null);
    setPicking(false);
    setSearch('');
  }

  const activeEntry = activeSlot ? entries[keyOf(activeSlot.day, activeSlot.slot)] : null;
  const activeRecipe = activeEntry?.entry_type === 'recipe'
    ? recipesById[String(activeEntry.recipe_id)]
    : null;

  // --- Rendering ---
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-plum-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-8 relative">
      <h2 className="type-h1 text-[28px] text-ink-900 mb-3">Meal Plan</h2>

      {!persisted && (
        <p className="text-xs text-clay-500 bg-clay-500/10 rounded-xl px-3 py-2 mb-3">
          The planner can&rsquo;t reach its database table, so changes here won&rsquo;t
          be saved. Run the latest Kūmara migrations in Supabase, then refresh.
        </p>
      )}

      {saveError && (
        <div className="flex gap-2 items-start text-xs text-clay-500 bg-clay-500/10 rounded-xl px-3 py-2 mb-3">
          <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{saveError}</span>
          <button onClick={() => setSaveError(null)} className="shrink-0 font-semibold">Dismiss</button>
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonday(m => addDays(m, -7))} className="p-2 rounded-xl hover:bg-sand-100 text-ink-900">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-narrow font-bold text-base text-ink-900">{formatWeekLabel(monday)}</p>
          {todayIdx === -1 && (
            <button onClick={() => setMonday(getMonday())} className={`${btnGhost} text-xs`}>
              Today
            </button>
          )}
        </div>
        <button onClick={() => setMonday(m => addDays(m, 7))} className="p-2 rounded-xl hover:bg-sand-100 text-ink-900">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Generate bar */}
      <div className="bg-sand-100 rounded-2xl p-3 mb-2 shadow-[0_1px_2px_rgba(45,42,36,.06)]">
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder='e.g. "easy week, high protein, no fish"'
          className={`${input} bg-sand-50 mb-2`}
          disabled={generating}
        />
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating || !recipes.length}
            className="grad-cta flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sand-50 font-semibold text-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Planning…' : 'Generate'}
          </button>
          {undoSnapshot && (
            <button onClick={applyUndo} className="px-3 rounded-xl border border-stone-200 text-ink-900 text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-sand-50">
              <Undo2 className="w-4 h-4" /> Undo
            </button>
          )}
          <button onClick={() => setConfirmClear(true)} className="px-3 rounded-xl border border-clay-500/40 text-clay-500 text-sm font-semibold hover:bg-clay-500/10">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {genError && <p className="text-xs text-clay-500 mt-2">{genError}</p>}
      </div>

      {generating && (
        <p className="font-display italic text-xl text-ink-600 text-center py-3">
          Planning your week…
        </p>
      )}

      {confirmClear && (
        <div className="mb-3 p-3 bg-clay-500/10 rounded-xl flex items-center justify-between">
          <span className="text-sm text-clay-500 font-medium">Clear the whole week?</span>
          <div className="flex gap-2">
            <button onClick={() => setConfirmClear(false)} className="px-3 py-1 text-sm text-ink-600">Cancel</button>
            <button onClick={handleClearWeek} className="px-3 py-1 text-sm border border-clay-500/40 text-clay-500 rounded-xl font-semibold">Clear</button>
          </div>
        </div>
      )}

      {/* Slot column headers — icons (the words were truncating at this width) */}
      <div className="grid grid-cols-[4.5rem_1fr_1fr_1fr_1fr] gap-1.5 mb-1 px-0.5">
        <span />
        {SLOTS.map(slot => {
          const Icon = SLOT_ICONS[slot];
          return (
            <span key={slot} className="flex justify-center text-ink-600" title={SLOT_LABELS[slot]}>
              <Icon className="w-4 h-4" />
            </span>
          );
        })}
      </div>

      {/* 7-day grid */}
      <div className="flex flex-col gap-2">
        {DAY_NAMES.map((dayName, day) => {
          const totals = dayTotals[day];
          return (
            <div key={day} className="bg-sand-100/60 rounded-2xl p-1.5">
              <div className="grid grid-cols-[4.5rem_1fr_1fr_1fr_1fr] gap-1.5 items-stretch">
                {/* Day label */}
                <div className="flex flex-col justify-center pl-1">
                  <span className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                    {dayName.slice(0, 3)}
                    {day === todayIdx && <span className="w-1.5 h-1.5 rounded-full bg-plum-500" />}
                  </span>
                  <span className="font-narrow text-xs text-ink-600">
                    {addDays(monday, day).getDate()}
                  </span>
                </div>

                {/* Slot cells */}
                {SLOTS.map(slot => {
                  const entry = entries[keyOf(day, slot)];
                  if (!entry) {
                    return (
                      <button
                        key={slot}
                        onClick={() => setActiveSlot({ day, slot })}
                        className="min-h-[3.5rem] rounded-xl border border-dashed border-stone-400 flex items-center justify-center text-stone-400 hover:border-plum-500 hover:text-plum-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    );
                  }
                  if (entry.entry_type !== 'recipe') {
                    // Non-recipe slots: lighter/airier than recipe cards.
                    const Icon = specialIcon(entry.entry_type);
                    return (
                      <button
                        key={slot}
                        onClick={() => setActiveSlot({ day, slot })}
                        className="min-h-[3.5rem] rounded-xl bg-sand-50 border border-stone-200/50 flex flex-col items-center justify-center gap-0.5 text-ink-600 px-1"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium capitalize">{entry.entry_type}</span>
                      </button>
                    );
                  }
                  // Recipe slots: more present than non-recipe cards. Sans font
                  // (matches the slot-type labels — easier to read than serif here).
                  const recipe = recipesById[String(entry.recipe_id)];
                  return (
                    <button
                      key={slot}
                      onClick={() => setActiveSlot({ day, slot })}
                      className="min-h-[3.5rem] rounded-xl bg-sand-100 shadow-[0_1px_2px_rgba(45,42,36,.08)] flex flex-col items-center justify-center px-1 py-1 text-center"
                    >
                      <span className="text-[10px] font-medium leading-tight text-ink-900 line-clamp-3">
                        {recipe?.title || '…'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Per-day rollup — only when the day has recipe slots */}
              {totals.count > 0 && (
                <div className="mt-2 px-1 pb-0.5">
                  <MacroStrip totals={totals} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week summary */}
      {weekAverage && (
        <div className="bg-sand-100 rounded-2xl p-4 mt-4 shadow-[0_1px_2px_rgba(45,42,36,.06)]">
          <p className="eyebrow text-ink-600 mb-3">This week · daily average</p>
          <MacroStrip totals={weekAverage} />
        </div>
      )}

      {/* Slot action sheet */}
      {activeSlot && !picking && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink-900/30" onClick={closeSheets}>
          <div
            className="w-full max-w-md bg-sand-50 rounded-t-3xl p-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display italic text-2xl text-ink-900">
                {DAY_NAMES[activeSlot.day]} {SLOT_LABELS[activeSlot.slot].toLowerCase()}
              </h3>
              <button onClick={closeSheets} className="p-1.5 text-ink-600 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeRecipe ? (
              // A recipe is in this slot: lead with viewing it.
              <>
                <p className="text-base font-semibold text-ink-900 mb-3 leading-snug">{activeRecipe.title}</p>
                <button
                  onClick={() => { setViewRecipe(activeRecipe); closeSheets(); }}
                  className="grad-cta w-full py-3 rounded-xl text-sand-50 font-semibold text-sm mb-2 inline-flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> View recipe
                </button>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setPicking(true)}
                    className="py-2.5 rounded-xl border border-stone-200 text-ink-900 text-sm font-semibold hover:bg-sand-100 inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Swap
                  </button>
                  <button
                    onClick={() => { removeSlotEntry(activeSlot.day, activeSlot.slot); closeSheets(); }}
                    className="py-2.5 rounded-xl border border-clay-500/40 text-clay-500 text-sm font-semibold hover:bg-clay-500/10 inline-flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </>
            ) : (
              <>
                {activeEntry && (
                  <button
                    onClick={() => { removeSlotEntry(activeSlot.day, activeSlot.slot); closeSheets(); }}
                    className="w-full mb-2 py-3 rounded-xl border border-clay-500/40 text-clay-500 text-sm font-semibold hover:bg-clay-500/10 inline-flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Remove from slot
                  </button>
                )}
                <button
                  onClick={() => setPicking(true)}
                  className="grad-cta w-full py-3 rounded-xl text-sand-50 font-semibold text-sm mb-4 inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Pick a recipe
                </button>
              </>
            )}

            <p className="eyebrow-sm text-ink-600 mb-2">Or mark as</p>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => { setSlotEntry(activeSlot.day, activeSlot.slot, value); closeSheets(); }}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-sand-100 text-ink-600 hover:bg-stone-200/70 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe picker sheet */}
      {activeSlot && picking && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink-900/30" onClick={closeSheets}>
          <div
            className="w-full max-w-md bg-sand-50 rounded-t-3xl p-5 pb-8 max-h-[80dvh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display italic text-2xl text-ink-900">Pick a recipe</h3>
              <button onClick={closeSheets} className="p-1.5 text-ink-600 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search your library..."
                className={`${input} pl-9 bg-sand-100`}
              />
            </div>
            <div className="overflow-y-auto flex flex-col gap-1.5">
              {filteredRecipes.length === 0 && (
                <p className="text-sm text-ink-600 text-center py-6">No recipes match.</p>
              )}
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    setSlotEntry(activeSlot.day, activeSlot.slot, 'recipe', recipe.id);
                    closeSheets();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-sand-100 hover:bg-stone-200/70 transition-colors text-left"
                >
                  {recipe.photo_url ? (
                    <img src={recipe.photo_url} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="w-11 h-11 rounded-lg bg-stone-200 shrink-0" />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-ink-900 truncate">{recipe.title}</span>
                    <span className="flex items-center gap-2 mt-0.5">
                      {recipe.calories != null && (
                        <span className="font-narrow font-bold text-xs text-ink-600">{recipe.calories} cal</span>
                      )}
                      {recipe.protein_g != null && (
                        <span className="font-narrow font-bold text-xs text-ink-600">{recipe.protein_g}g prot</span>
                      )}
                      {recipe.rating > 0 && (
                        <span className="inline-flex items-center gap-0.5 font-narrow font-bold text-xs text-ink-600">
                          <Star className="w-3 h-3 fill-ember-500 text-ember-500" />{recipe.rating}
                        </span>
                      )}
                      {recipe.is_favourite && <Heart className="w-3 h-3 fill-ember-500 text-ember-500" />}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe detail overlay (opened from a recipe slot's "View recipe") */}
      {viewRecipe && (
        <div className="fixed inset-0 z-40 bg-sand-50 overflow-y-auto">
          <div className="max-w-md mx-auto min-h-full">
            <RecipeDetail recipe={viewRecipe} onBack={() => setViewRecipe(null)} hideActions />
          </div>
        </div>
      )}
    </div>
  );
}
