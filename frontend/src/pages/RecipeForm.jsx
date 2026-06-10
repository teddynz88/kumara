import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../supabase';
import { hasPhase2Recipes } from '../schema';
import { input, label as labelClass, btnGhost, EstimatedChip } from '../ui';
import { getIngredientGroups } from './RecipeDetail';

const UNIT_SUGGESTIONS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'clove', 'handful', 'pinch', 'can', 'slice'];

const emptyIngredient = () => ({ quantity: '', unit: 'g', name: '', note: '' });
const emptyGroup = (name = null) => ({ group_name: name, ingredients: [emptyIngredient()] });
const emptyStep = () => ({ text: '' });

export default function RecipeForm({ onClose, recipe, isReview = false }) {
  const isEdit = !!recipe?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [macrosOpen, setMacrosOpen] = useState(isReview);

  const [title, setTitle] = useState(recipe?.title || '');
  const [photoUrl, setPhotoUrl] = useState(recipe?.photo_url || '');
  const [servings, setServings] = useState(recipe?.servings ?? 2);
  const [prepTime, setPrepTime] = useState(recipe?.prep_time_mins?.toString() || '');
  const [cookTime, setCookTime] = useState(recipe?.cook_time_mins?.toString() || '');

  // Ingredients live as groups; Phase 1 flat lists are normalised on load.
  const [groups, setGroups] = useState(() => {
    const g = recipe ? getIngredientGroups(recipe) : [];
    return g.length
      ? g.map(grp => ({
          group_name: grp.group_name || null,
          ingredients: grp.ingredients.map(i => ({
            quantity: i.quantity?.toString() ?? '',
            unit: i.unit || '',
            name: i.name || '',
            note: i.note || '',
          })),
        }))
      : [emptyGroup()];
  });

  const [steps, setSteps] = useState(
    recipe?.method_steps?.length ? recipe.method_steps.map(s => ({ text: s.text || '' })) : [emptyStep()]
  );
  const [calories, setCalories] = useState(recipe?.calories?.toString() || '');
  const [protein, setProtein] = useState(recipe?.protein_g?.toString() || '');
  const [carbs, setCarbs] = useState(recipe?.carbs_g?.toString() || '');
  const [fat, setFat] = useState(recipe?.fat_g?.toString() || '');
  const [fibre, setFibre] = useState(recipe?.fibre_g?.toString() || '');
  // AI-estimated macros keep their flag until the user edits a value —
  // at that point they become the user's numbers.
  const [macrosEstimated, setMacrosEstimated] = useState(!!recipe?.macros_estimated);
  const [tips, setTips] = useState(
    recipe?.tips?.length ? recipe.tips.map(t => ({ text: t.text || '' })) : []
  );
  const [tags, setTags] = useState(recipe?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const stepRefs = useRef([]);
  const [focusStep, setFocusStep] = useState(null);

  useEffect(() => {
    if (focusStep !== null && stepRefs.current[focusStep]) {
      stepRefs.current[focusStep].focus();
      setFocusStep(null);
    }
  }, [focusStep, steps.length]);

  // --- Ingredient group editing ---
  function updateGroupName(gi, value) {
    setGroups(prev => prev.map((g, i) => i === gi ? { ...g, group_name: value || null } : g));
  }
  function addGroup() {
    setGroups(prev => [...prev, emptyGroup('')]);
  }
  function removeGroup(gi) {
    setGroups(prev => prev.length > 1 ? prev.filter((_, i) => i !== gi) : prev);
  }
  function updateIngredient(gi, ii, field, value) {
    setGroups(prev => prev.map((g, i) => i !== gi ? g : {
      ...g,
      ingredients: g.ingredients.map((ing, j) => j === ii ? { ...ing, [field]: value } : ing),
    }));
  }
  function addIngredient(gi) {
    setGroups(prev => prev.map((g, i) => i !== gi ? g : {
      ...g, ingredients: [...g.ingredients, emptyIngredient()],
    }));
  }
  function removeIngredient(gi, ii) {
    setGroups(prev => prev.map((g, i) => i !== gi ? g : {
      ...g, ingredients: g.ingredients.length > 1 ? g.ingredients.filter((_, j) => j !== ii) : g.ingredients,
    }));
  }
  function handleIngredientTab(e, gi, ii) {
    const group = groups[gi];
    if (e.key === 'Tab' && !e.shiftKey && ii === group.ingredients.length - 1) {
      e.preventDefault();
      addIngredient(gi);
    }
  }

  // --- Steps ---
  function updateStep(index, value) {
    setSteps(prev => prev.map((s, i) => i === index ? { text: value } : s));
  }
  function removeStep(index) {
    if (steps.length > 1) setSteps(prev => prev.filter((_, i) => i !== index));
  }
  function addStep() {
    setSteps(prev => [...prev, emptyStep()]);
    setFocusStep(steps.length);
  }
  function moveStep(index, dir) {
    setSteps(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function handleStepTab(e, index) {
    if (e.key === 'Tab' && !e.shiftKey && index === steps.length - 1) {
      e.preventDefault();
      addStep();
    }
  }

  // --- Tips ---
  function updateTip(index, value) {
    setTips(prev => prev.map((t, i) => i === index ? { text: value } : t));
  }
  function removeTip(index) {
    setTips(prev => prev.filter((_, i) => i !== index));
  }
  function addTip() {
    setTips(prev => [...prev, { text: '' }]);
  }

  // --- Tags ---
  function handleTagKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim().toLowerCase();
      if (value && !tags.includes(value)) setTags(prev => [...prev, value]);
      setTagInput('');
    }
  }
  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  function setMacro(setter) {
    return (e) => {
      setter(e.target.value);
      setMacrosEstimated(false);
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);

    const cleanGroups = groups
      .map(g => ({
        group_name: g.group_name?.trim() || null,
        ingredients: g.ingredients
          .filter(ing => ing.name.trim())
          .map(ing => ({
            quantity: ing.quantity === '' ? null : (parseFloat(ing.quantity) || ing.quantity),
            unit: ing.unit.trim(),
            name: ing.name.trim(),
            note: ing.note?.trim() || '',
          })),
      }))
      .filter(g => g.ingredients.length > 0);

    // Flat list kept in sync for Phase 1 compatibility (and anything still reading it).
    const flatIngredients = cleanGroups.flatMap(g =>
      g.ingredients.map(ing => ({ qty: ing.quantity?.toString() ?? '', unit: ing.unit, name: ing.name + (ing.note ? ` (${ing.note})` : '') }))
    );

    const payload = {
      title: title.trim(),
      photo_url: photoUrl.trim() || null,
      servings: servings || 1,
      prep_time_mins: prepTime ? parseInt(prepTime) : null,
      cook_time_mins: cookTime ? parseInt(cookTime) : null,
      source_type: recipe?.source_type || 'manual',
      source_url: recipe?.source_url || null,
      ingredients: flatIngredients,
      method_steps: steps
        .filter(s => s.text.trim())
        .map((s, i) => ({ step: i + 1, text: s.text.trim() })),
      tips: tips
        .filter(t => t.text.trim())
        .map(t => ({ text: t.text.trim() })),
      calories: calories ? parseInt(calories) : null,
      protein_g: protein ? parseInt(protein) : null,
      carbs_g: carbs ? parseInt(carbs) : null,
      fat_g: fat ? parseInt(fat) : null,
      fibre_g: fibre ? parseInt(fibre) : null,
      tags,
    };

    // Phase 2 columns only once the migration has run.
    if (await hasPhase2Recipes()) {
      payload.ingredient_groups = cleanGroups;
      payload.source_method = recipe?.source_method || null;
      payload.macros_estimated = macrosEstimated;
    }

    const { error: dbError } = isEdit
      ? await supabase.from('recipes').update(payload).eq('id', recipe.id)
      : await supabase.from('recipes').insert(payload);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
    } else {
      onClose();
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 p-4 pb-8">
      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={input}
          placeholder="e.g. Butter Chicken"
          required
        />
      </div>

      {/* Photo URL */}
      <div>
        <label className={labelClass}>Photo URL</label>
        <input
          type="url"
          value={photoUrl}
          onChange={e => setPhotoUrl(e.target.value)}
          className={input}
          placeholder="Paste an image URL or leave blank"
        />
      </div>

      {/* Servings / Prep / Cook row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Servings</label>
          <input
            type="number"
            min="1"
            value={servings}
            onChange={e => setServings(parseInt(e.target.value) || '')}
            className={input}
          />
        </div>
        <div>
          <label className={labelClass}>Prep (min)</label>
          <input type="number" min="0" value={prepTime} onChange={e => setPrepTime(e.target.value)} className={input} placeholder="—" />
        </div>
        <div>
          <label className={labelClass}>Cook (min)</label>
          <input type="number" min="0" value={cookTime} onChange={e => setCookTime(e.target.value)} className={input} placeholder="—" />
        </div>
      </div>

      {/* Ingredient groups */}
      <div>
        <label className={labelClass}>Ingredients</label>
        <div className="flex flex-col gap-4">
          {groups.map((group, gi) => (
            <div key={gi} className="bg-sand-100 rounded-2xl p-3 flex flex-col gap-2">
              {/* Group name — null group on a single-group recipe stays headerless */}
              {(groups.length > 1 || group.group_name !== null) ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={group.group_name || ''}
                    onChange={e => updateGroupName(gi, e.target.value)}
                    className={`${input} font-display italic text-base`}
                    placeholder="Group name (e.g. For the sauce)"
                  />
                  <button type="button" tabIndex={-1} onClick={() => removeGroup(gi)} className="text-ink-600 hover:text-clay-500 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
              {group.ingredients.map((ing, ii) => (
                <div key={ii} className="flex flex-col gap-1">
                  <div className="grid grid-cols-[3.5rem_4.5rem_1fr_1.5rem] gap-2 items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={ing.quantity}
                      onChange={e => updateIngredient(gi, ii, 'quantity', e.target.value)}
                      className={input}
                      placeholder="Qty"
                    />
                    <input
                      type="text"
                      list="kumara-units"
                      value={ing.unit}
                      onChange={e => updateIngredient(gi, ii, 'unit', e.target.value)}
                      className={input}
                      placeholder="Unit"
                    />
                    <input
                      type="text"
                      value={ing.name}
                      onChange={e => updateIngredient(gi, ii, 'name', e.target.value)}
                      onKeyDown={e => handleIngredientTab(e, gi, ii)}
                      className={input}
                      placeholder="Ingredient"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => removeIngredient(gi, ii)}
                      className="text-ink-600/50 hover:text-clay-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {ing.note ? (
                    <input
                      type="text"
                      value={ing.note}
                      onChange={e => updateIngredient(gi, ii, 'note', e.target.value)}
                      className={`${input} text-xs py-1.5 ml-[3.5rem] w-auto`}
                      placeholder="Note"
                    />
                  ) : null}
                </div>
              ))}
              <button type="button" tabIndex={-1} onClick={() => addIngredient(gi)} className={`${btnGhost} self-start`}>
                <Plus className="w-4 h-4" /> Add ingredient
              </button>
            </div>
          ))}
        </div>
        <datalist id="kumara-units">
          {UNIT_SUGGESTIONS.map(u => <option key={u} value={u} />)}
        </datalist>
        <button type="button" tabIndex={-1} onClick={addGroup} className={`${btnGhost} mt-2`}>
          <Plus className="w-4 h-4" /> Add group
        </button>
      </div>

      {/* Method Steps */}
      <div>
        <label className={labelClass}>Method</label>
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2.5 font-narrow font-bold text-sm text-ink-600 w-6 shrink-0 text-right">
                {i + 1}.
              </span>
              <textarea
                ref={el => stepRefs.current[i] = el}
                value={step.text}
                onChange={e => updateStep(i, e.target.value)}
                onKeyDown={e => handleStepTab(e, i)}
                className={`${input} flex-1 min-h-[60px] resize-y`}
                placeholder={`Step ${i + 1}`}
                rows={2}
              />
              <div className="flex flex-col gap-0.5 mt-1.5">
                <button type="button" tabIndex={-1} onClick={() => moveStep(i, -1)} disabled={i === 0} className="text-ink-600/50 hover:text-plum-500 disabled:opacity-25 transition-colors">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" tabIndex={-1} onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1} className="text-ink-600/50 hover:text-plum-500 disabled:opacity-25 transition-colors">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" tabIndex={-1} onClick={() => removeStep(i)} className="text-ink-600/50 hover:text-clay-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" tabIndex={-1} onClick={addStep} className={`${btnGhost} mt-2`}>
          <Plus className="w-4 h-4" /> Add step
        </button>
      </div>

      {/* Tips */}
      <div>
        <label className={labelClass}>Tips <span className="font-normal text-ink-600">(optional)</span></label>
        <div className="flex flex-col gap-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2.5 font-narrow font-bold text-sm text-ink-600 w-6 shrink-0 text-right">
                {i + 1}.
              </span>
              <textarea
                value={tip.text}
                onChange={e => updateTip(i, e.target.value)}
                className={`${input} flex-1 min-h-[60px] resize-y`}
                placeholder={`Tip ${i + 1}`}
                rows={2}
              />
              <button type="button" tabIndex={-1} onClick={() => removeTip(i)} className="mt-2.5 text-ink-600/50 hover:text-clay-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" tabIndex={-1} onClick={addTip} className={`${btnGhost} mt-2`}>
          <Plus className="w-4 h-4" /> Add tip
        </button>
      </div>

      {/* Nutrition (collapsible) */}
      <div className="bg-sand-100 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setMacrosOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-ink-900"
        >
          <span className="flex items-center gap-2">
            Nutrition per serve
            {macrosEstimated && <EstimatedChip />}
          </span>
          {macrosOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {macrosOpen && (
          <div className="p-3 pt-0">
            {macrosEstimated && (
              <p className="text-xs text-ink-600 mb-2">These were estimated by AI from the ingredients — edit any value to make it yours.</p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Calories</label>
                <input type="number" min="0" value={calories} onChange={setMacro(setCalories)} className={input} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Protein (g)</label>
                <input type="number" min="0" value={protein} onChange={setMacro(setProtein)} className={input} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Carbs (g)</label>
                <input type="number" min="0" value={carbs} onChange={setMacro(setCarbs)} className={input} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Fat (g)</label>
                <input type="number" min="0" value={fat} onChange={setMacro(setFat)} className={input} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Fibre (g)</label>
                <input type="number" min="0" value={fibre} onChange={setMacro(setFibre)} className={input} placeholder="—" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags</label>
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className={input}
          placeholder="Type a tag and press Enter"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-plum-500 text-sand-50 text-xs font-medium">
                {tag}
                <button type="button" tabIndex={-1} onClick={() => removeTag(tag)} className="hover:text-sand-50/70">
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-clay-500 bg-clay-500/10 rounded-xl px-3 py-2">{error}</p>
      )}

      {/* Save */}
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="grad-cta w-full py-3 rounded-xl text-sand-50 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : isReview ? 'Save to library' : isEdit ? 'Update Recipe' : 'Save Recipe'}
      </button>
    </form>
  );
}
