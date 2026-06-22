import { useState } from 'react';
import { ArrowLeft, PencilLine, Trash2, Clock, Star, Heart, Users, Minus, Plus, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';
import { getUnitsPref, convertIngredient } from '../lib/units';
import { btnGhost, EstimatedChip } from '../ui';

// Recipes carry either grouped ingredients (Phase 2) or a flat list (Phase 1);
// normalise to groups for display.
export function getIngredientGroups(recipe) {
  if (recipe.ingredient_groups?.length) return recipe.ingredient_groups;
  if (recipe.ingredients?.length) {
    return [{
      group_name: null,
      ingredients: recipe.ingredients.map(i => ({
        quantity: i.quantity ?? i.qty ?? '',
        unit: i.unit || '',
        name: i.name || '',
        note: i.note || '',
      })),
    }];
  }
  return [];
}

export default function RecipeDetail({ recipe: initial, onBack, onDeleted, onEdit }) {
  const [recipe, setRecipe] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [displayServings, setDisplayServings] = useState(recipe.servings || 1);
  const baseServings = initial.servings || 1;
  const scale = displayServings / baseServings;
  const units = getUnitsPref();

  async function toggleFavourite() {
    const { error } = await supabase
      .from('recipes')
      .update({ is_favourite: !recipe.is_favourite })
      .eq('id', recipe.id);
    if (!error) setRecipe(prev => ({ ...prev, is_favourite: !prev.is_favourite }));
  }

  async function setRating(star) {
    const value = star === recipe.rating ? 0 : star;
    const { error } = await supabase
      .from('recipes')
      .update({ rating: value })
      .eq('id', recipe.id);
    if (!error) setRecipe(prev => ({ ...prev, rating: value }));
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
    if (!error) {
      onDeleted(recipe.id);
    } else {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const hasMacros = recipe.calories != null || recipe.protein_g != null ||
    recipe.carbs_g != null || recipe.fat_g != null || recipe.fibre_g != null;
  const groups = getIngredientGroups(recipe);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header bar */}
      <div className="grad-header-wash flex items-center justify-between px-4 py-3 border-b border-stone-200 sticky top-0 z-10">
        <button onClick={onBack} className={btnGhost}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(recipe)} className="p-2 text-plum-500 hover:bg-sand-100 rounded-xl transition-colors">
            <PencilLine className="w-5 h-5" />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-2 text-clay-500 hover:bg-clay-500/10 rounded-xl transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mx-4 mt-3 p-3 bg-clay-500/10 border border-clay-500/30 rounded-xl flex items-center justify-between">
          <span className="text-sm text-clay-500 font-medium">Delete this recipe?</span>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 text-sm text-ink-600 hover:text-ink-900">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="px-3 py-1 text-sm border border-clay-500/40 text-clay-500 rounded-xl font-semibold disabled:opacity-50">
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col gap-5 pb-8">
        {/* Photo */}
        {recipe.photo_url && (
          <img src={recipe.photo_url} alt={recipe.title} className="w-full h-52 object-cover rounded-2xl" />
        )}

        {/* Title + fav */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {recipe.pack_source && (
              <span className="inline-flex items-center gap-1 eyebrow-sm text-plum-500 mb-1">
                <Sparkles className="w-3 h-3" /> From {recipe.pack_source}
              </span>
            )}
            <h2 className="type-h1 text-[32px] text-ink-900">{recipe.title}</h2>
          </div>
          <button onClick={toggleFavourite} className="shrink-0 mt-1">
            <Heart className={`w-6 h-6 ${recipe.is_favourite ? 'fill-ember-500 text-ember-500' : 'text-ink-600'}`} />
          </button>
        </div>

        {/* Rating */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
              <Star className={`w-5 h-5 ${star <= (recipe.rating || 0) ? 'fill-ember-500 text-ember-500' : 'text-stone-400'}`} />
            </button>
          ))}
        </div>

        {/* Servings adjuster + times */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <button
              onClick={() => setDisplayServings(s => Math.max(1, s - 1))}
              className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-ink-900 hover:bg-sand-100 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-narrow font-bold text-base text-ink-900 w-6 text-center">{displayServings}</span>
            <button
              onClick={() => setDisplayServings(s => s + 1)}
              className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-ink-900 hover:bg-sand-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className="eyebrow-sm text-ink-600">serves</span>
          </div>
          {recipe.prep_time_mins && (
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Prep <span className="font-narrow font-bold text-ink-900">{recipe.prep_time_mins}m</span></span>
          )}
          {recipe.cook_time_mins && (
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Cook <span className="font-narrow font-bold text-ink-900">{recipe.cook_time_mins}m</span></span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-sand-100 text-xs font-medium text-ink-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Macros */}
        {hasMacros && (
          <div className="bg-sand-100 rounded-2xl p-4 shadow-[0_1px_2px_rgba(45,42,36,.06)]">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="eyebrow text-ink-600">Per serve</h3>
              {recipe.macros_estimated && <EstimatedChip />}
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: 'Cal', value: recipe.calories },
                { label: 'Protein', value: recipe.protein_g, unit: 'g' },
                { label: 'Carbs', value: recipe.carbs_g, unit: 'g' },
                { label: 'Fat', value: recipe.fat_g, unit: 'g' },
                { label: 'Fibre', value: recipe.fibre_g, unit: 'g' },
              ].map(m => (
                <div key={m.label}>
                  <div className="font-narrow font-bold text-2xl text-ink-900">{m.value ?? '—'}</div>
                  <div className="eyebrow-sm text-[9px] text-ink-600">{m.label}{m.unit ? ` (${m.unit})` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients (grouped) */}
        {groups.length > 0 && (
          <div>
            <h3 className="eyebrow text-ink-600 mb-2">Ingredients</h3>
            <div className="flex flex-col gap-4">
              {groups.map((group, gi) => (
                <div key={gi}>
                  {group.group_name && (
                    <h4 className="font-display italic text-lg text-ink-900 mb-1.5">{group.group_name}</h4>
                  )}
                  <ul className="flex flex-col gap-1.5">
                    {group.ingredients.map((ing, i) => {
                      // Convert units to the user's preference, then scale by servings.
                      const conv = convertIngredient(ing.quantity, ing.unit, units);
                      const raw = parseFloat(conv.quantity);
                      const scaled = !isNaN(raw) ? Math.round(raw * scale * 100) / 100 : conv.quantity;
                      return (
                        <li key={i} className="flex gap-2 text-sm text-ink-900/85">
                          <span className="font-narrow font-bold text-ink-900 min-w-[4rem] text-right shrink-0">
                            {scaled} {conv.unit}
                          </span>
                          <span>
                            {ing.name}
                            {ing.note ? <span className="text-ink-600"> — {ing.note}</span> : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Method */}
        {recipe.method_steps?.length > 0 && (
          <div>
            <h3 className="eyebrow text-ink-600 mb-2">Method</h3>
            <ol className="flex flex-col gap-3">
              {recipe.method_steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink-900/85">
                  <span className="w-6 h-6 rounded-full bg-stone-200 text-plum-700 font-narrow font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {step.step || i + 1}
                  </span>
                  <p className="flex-1 leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tips */}
        {recipe.tips?.length > 0 && (
          <div>
            <h3 className="eyebrow text-ink-600 mb-2">Tips</h3>
            <ul className="flex flex-col gap-2">
              {recipe.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-900/85">
                  <span className="text-plum-500 mt-0.5 shrink-0">&bull;</span>
                  <p className="flex-1 leading-relaxed">{tip.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source */}
        {recipe.source_url && (
          <p className="text-xs text-ink-600 break-all">
            Source: {recipe.source_url.startsWith('http')
              ? <a href={recipe.source_url} target="_blank" rel="noreferrer" className="text-plum-500 hover:text-plum-700">{recipe.source_url}</a>
              : recipe.source_url}
          </p>
        )}
      </div>
    </div>
  );
}
