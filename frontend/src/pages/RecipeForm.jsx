import { useState, useRef, useEffect } from 'react';
import { HiPlus, HiTrash, HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { supabase } from '../supabase';

const UNITS = ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'handful', 'pinch'];

const emptyIngredient = () => ({ qty: '', unit: 'g', name: '' });
const emptyStep = () => ({ text: '' });

export default function RecipeForm({ onClose, recipe }) {
  const isEdit = !!recipe?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [macrosOpen, setMacrosOpen] = useState(false);

  const [title, setTitle] = useState(recipe?.title || '');
  const [photoUrl, setPhotoUrl] = useState(recipe?.photo_url || '');
  const [servings, setServings] = useState(recipe?.servings ?? 2);
  const [prepTime, setPrepTime] = useState(recipe?.prep_time_mins?.toString() || '');
  const [cookTime, setCookTime] = useState(recipe?.cook_time_mins?.toString() || '');
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients?.length ? recipe.ingredients.map(i => ({ qty: i.qty || '', unit: i.unit || 'g', name: i.name || '' })) : [emptyIngredient()]
  );
  const [steps, setSteps] = useState(
    recipe?.method_steps?.length ? recipe.method_steps.map(s => ({ text: s.text || '' })) : [emptyStep()]
  );
  const [calories, setCalories] = useState(recipe?.calories?.toString() || '');
  const [protein, setProtein] = useState(recipe?.protein_g?.toString() || '');
  const [carbs, setCarbs] = useState(recipe?.carbs_g?.toString() || '');
  const [fat, setFat] = useState(recipe?.fat_g?.toString() || '');
  const [fibre, setFibre] = useState(recipe?.fibre_g?.toString() || '');
  const [tips, setTips] = useState(
    recipe?.tips?.length ? recipe.tips.map(t => ({ text: t.text || '' })) : []
  );
  const [tags, setTags] = useState(recipe?.tags || []);

  // Refs for focus management
  const ingredientQtyRefs = useRef([]);
  const stepRefs = useRef([]);
  const tipRefs = useRef([]);
  const [focusIngredient, setFocusIngredient] = useState(null);
  const [focusStep, setFocusStep] = useState(null);
  const [focusTip, setFocusTip] = useState(null);

  useEffect(() => {
    if (focusIngredient !== null && ingredientQtyRefs.current[focusIngredient]) {
      ingredientQtyRefs.current[focusIngredient].focus();
      setFocusIngredient(null);
    }
  }, [focusIngredient, ingredients.length]);

  useEffect(() => {
    if (focusStep !== null && stepRefs.current[focusStep]) {
      stepRefs.current[focusStep].focus();
      setFocusStep(null);
    }
  }, [focusStep, steps.length]);

  useEffect(() => {
    if (focusTip !== null && tipRefs.current[focusTip]) {
      tipRefs.current[focusTip].focus();
      setFocusTip(null);
    }
  }, [focusTip, tips.length]);

  function updateIngredient(index, field, value) {
    setIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, [field]: value } : ing));
  }

  function removeIngredient(index) {
    if (ingredients.length > 1) {
      setIngredients(prev => prev.filter((_, i) => i !== index));
    }
  }

  function addIngredient() {
    setIngredients(prev => [...prev, emptyIngredient()]);
    setFocusIngredient(ingredients.length);
  }

  function handleIngredientNameTab(e, index) {
    if (e.key === 'Tab' && !e.shiftKey && index === ingredients.length - 1) {
      e.preventDefault();
      addIngredient();
    }
  }

  function updateStep(index, value) {
    setSteps(prev => prev.map((s, i) => i === index ? { text: value } : s));
  }

  function removeStep(index) {
    if (steps.length > 1) {
      setSteps(prev => prev.filter((_, i) => i !== index));
    }
  }

  function addStep() {
    setSteps(prev => [...prev, emptyStep()]);
    setFocusStep(steps.length);
  }

  function handleStepTab(e, index) {
    if (e.key === 'Tab' && !e.shiftKey && index === steps.length - 1) {
      e.preventDefault();
      addStep();
    }
  }

  function updateTip(index, value) {
    setTips(prev => prev.map((t, i) => i === index ? { text: value } : t));
  }

  function removeTip(index) {
    setTips(prev => prev.filter((_, i) => i !== index));
  }

  function addTip() {
    setTips(prev => [...prev, { text: '' }]);
    setFocusTip(tips.length);
  }

  function handleTipTab(e, index) {
    if (e.key === 'Tab' && !e.shiftKey && index === tips.length - 1) {
      e.preventDefault();
      addTip();
    }
  }

  const [tagInput, setTagInput] = useState('');

  function handleTagKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim().toLowerCase();
      if (value && !tags.includes(value)) {
        setTags(prev => [...prev, value]);
      }
      setTagInput('');
    }
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      photo_url: photoUrl.trim() || null,
      servings: servings || 1,
      prep_time_mins: prepTime ? parseInt(prepTime) : null,
      cook_time_mins: cookTime ? parseInt(cookTime) : null,
      source_type: recipe?.source_type || 'manual',
      source_url: recipe?.source_url || null,
      ingredients: ingredients
        .filter(ing => ing.name.trim())
        .map(ing => ({ qty: ing.qty, unit: ing.unit, name: ing.name.trim() })),
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

  const inputClass = 'w-full rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-sm text-dark-text placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
  const labelClass = 'block text-sm font-medium text-dark-text mb-1';

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 p-4 pb-8">
      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={inputClass}
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
          className={inputClass}
          placeholder="Paste an image URL or leave blank"
        />
      </div>

      {/* Servings / Prep / Cook row */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
        <div>
          <label className={labelClass}>Servings</label>
          <input
            type="number"
            min="1"
            value={servings}
            onChange={e => setServings(parseInt(e.target.value) || '')}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Prep (min)</label>
          <input
            type="number"
            min="0"
            value={prepTime}
            onChange={e => setPrepTime(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>
        <div>
          <label className={labelClass}>Cook (min)</label>
          <input
            type="number"
            min="0"
            value={cookTime}
            onChange={e => setCookTime(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className={labelClass}>Ingredients</label>
        <div className="flex flex-col gap-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="grid grid-cols-[3.5rem_4.5rem_1fr_1.5rem] gap-2 items-start">
              <input
                ref={el => ingredientQtyRefs.current[i] = el}
                type="text"
                value={ing.qty}
                onChange={e => updateIngredient(i, 'qty', e.target.value)}
                className={inputClass}
                placeholder="Qty"
              />
              <select
                value={ing.unit}
                onChange={e => updateIngredient(i, 'unit', e.target.value)}
                className={inputClass}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input
                type="text"
                value={ing.name}
                onChange={e => updateIngredient(i, 'name', e.target.value)}
                onKeyDown={e => handleIngredientNameTab(e, i)}
                className={inputClass}
                placeholder="Ingredient"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => removeIngredient(i)}
                className="mt-2.5 text-dark-text/30 hover:text-red-500 transition-colors self-start"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          tabIndex={-1}
          onClick={addIngredient}
          className="mt-2 flex items-center gap-1 text-sm text-primary font-medium"
        >
          <HiPlus className="w-4 h-4" /> Add ingredient
        </button>
      </div>

      {/* Method Steps */}
      <div>
        <label className={labelClass}>Method</label>
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2.5 text-sm font-medium text-dark-text/40 w-6 shrink-0 text-right">
                {i + 1}.
              </span>
              <textarea
                ref={el => stepRefs.current[i] = el}
                value={step.text}
                onChange={e => updateStep(i, e.target.value)}
                onKeyDown={e => handleStepTab(e, i)}
                className={`${inputClass} flex-1 min-h-[60px] resize-y`}
                placeholder={`Step ${i + 1}`}
                rows={2}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => removeStep(i)}
                className="mt-2.5 text-dark-text/30 hover:text-red-500 transition-colors"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          tabIndex={-1}
          onClick={addStep}
          className="mt-2 flex items-center gap-1 text-sm text-primary font-medium"
        >
          <HiPlus className="w-4 h-4" /> Add step
        </button>
      </div>

      {/* Tips */}
      <div>
        <label className={labelClass}>Tips <span className="font-normal text-dark-text/40">(optional)</span></label>
        <div className="flex flex-col gap-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2.5 text-sm font-medium text-dark-text/40 w-6 shrink-0 text-right">
                {i + 1}.
              </span>
              <textarea
                ref={el => tipRefs.current[i] = el}
                value={tip.text}
                onChange={e => updateTip(i, e.target.value)}
                onKeyDown={e => handleTipTab(e, i)}
                className={`${inputClass} flex-1 min-h-[60px] resize-y`}
                placeholder={`Tip ${i + 1}`}
                rows={2}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => removeTip(i)}
                className="mt-2.5 text-dark-text/30 hover:text-red-500 transition-colors"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          tabIndex={-1}
          onClick={addTip}
          className="mt-2 flex items-center gap-1 text-sm text-primary font-medium"
        >
          <HiPlus className="w-4 h-4" /> Add tip
        </button>
      </div>

      {/* Nutrition (collapsible) */}
      <div className="border border-warm-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setMacrosOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-warm-100 text-sm font-medium text-dark-text"
        >
          Nutrition per serve
          {macrosOpen ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
        </button>
        {macrosOpen && (
          <div className="grid grid-cols-3 gap-3 p-3">
            <div>
              <label className={labelClass}>Calories</label>
              <input type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} className={inputClass} placeholder="—" />
            </div>
            <div>
              <label className={labelClass}>Protein (g)</label>
              <input type="number" min="0" value={protein} onChange={e => setProtein(e.target.value)} className={inputClass} placeholder="—" />
            </div>
            <div>
              <label className={labelClass}>Carbs (g)</label>
              <input type="number" min="0" value={carbs} onChange={e => setCarbs(e.target.value)} className={inputClass} placeholder="—" />
            </div>
            <div>
              <label className={labelClass}>Fat (g)</label>
              <input type="number" min="0" value={fat} onChange={e => setFat(e.target.value)} className={inputClass} placeholder="—" />
            </div>
            <div>
              <label className={labelClass}>Fibre (g)</label>
              <input type="number" min="0" value={fibre} onChange={e => setFibre(e.target.value)} className={inputClass} placeholder="—" />
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
          className={inputClass}
          placeholder="Type a tag and press Enter"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-xs font-medium">
                {tag}
                <button type="button" tabIndex={-1} onClick={() => removeTag(tag)} className="hover:text-white/70">
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Save */}
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : isEdit ? 'Update Recipe' : 'Save Recipe'}
      </button>
    </form>
  );
}
