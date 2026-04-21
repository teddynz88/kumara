import { useState } from 'react';
import { HiArrowLeft, HiPencil, HiTrash, HiClock, HiStar, HiHeart, HiUsers } from 'react-icons/hi2';
import { supabase } from '../supabase';

export default function RecipeDetail({ recipe: initial, onBack, onDeleted, onEdit }) {
  const [recipe, setRecipe] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [displayServings, setDisplayServings] = useState(recipe.servings || 1);
  const baseServings = initial.servings || 1;
  const scale = displayServings / baseServings;

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

  return (
    <div className="flex flex-col min-h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary font-medium">
          <HiArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(recipe)} className="p-2 text-primary hover:bg-warm-100 rounded-lg transition-colors">
            <HiPencil className="w-5 h-5" />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <HiTrash className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-700">Delete this recipe?</span>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 text-sm text-dark-text/60 hover:text-dark-text">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg font-medium disabled:opacity-50">
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col gap-5 pb-8">
        {/* Photo */}
        {recipe.photo_url && (
          <img src={recipe.photo_url} alt={recipe.title} className="w-full h-52 object-cover rounded-xl" />
        )}

        {/* Title + fav */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-dark-text">{recipe.title}</h2>
          <button onClick={toggleFavourite} className="shrink-0 mt-1">
            <HiHeart className={`w-6 h-6 ${recipe.is_favourite ? 'fill-red-500 text-red-500' : 'fill-none text-dark-text/30'}`} />
          </button>
        </div>

        {/* Rating */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
              <HiStar className={`w-5 h-5 ${star <= (recipe.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-none text-dark-text/20'}`} />
            </button>
          ))}
        </div>

        {/* Servings adjuster + times */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-dark-text/60">
          <div className="flex items-center gap-2">
            <HiUsers className="w-4 h-4" />
            <button
              onClick={() => setDisplayServings(s => Math.max(1, s - 1))}
              className="w-7 h-7 rounded-full border border-warm-200 flex items-center justify-center text-dark-text font-bold hover:bg-warm-100 transition-colors"
            >
              &minus;
            </button>
            <span className="text-sm font-semibold text-dark-text w-6 text-center">{displayServings}</span>
            <button
              onClick={() => setDisplayServings(s => s + 1)}
              className="w-7 h-7 rounded-full border border-warm-200 flex items-center justify-center text-dark-text font-bold hover:bg-warm-100 transition-colors"
            >
              +
            </button>
            <span className="text-dark-text/40 text-xs">serves</span>
          </div>
          {recipe.prep_time_mins && (
            <span className="flex items-center gap-1"><HiClock className="w-4 h-4" /> Prep {recipe.prep_time_mins}m</span>
          )}
          {recipe.cook_time_mins && (
            <span className="flex items-center gap-1"><HiClock className="w-4 h-4" /> Cook {recipe.cook_time_mins}m</span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-warm-100 text-xs font-medium text-dark-text/60">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Macros */}
        {hasMacros && (
          <div className="bg-warm-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-dark-text mb-3">Nutrition per serve</h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: 'Cal', value: recipe.calories },
                { label: 'Protein', value: recipe.protein_g, unit: 'g' },
                { label: 'Carbs', value: recipe.carbs_g, unit: 'g' },
                { label: 'Fat', value: recipe.fat_g, unit: 'g' },
                { label: 'Fibre', value: recipe.fibre_g, unit: 'g' },
              ].map(m => (
                <div key={m.label}>
                  <div className="text-lg font-bold text-primary">{m.value ?? '—'}</div>
                  <div className="text-[10px] text-dark-text/50">{m.label}{m.unit ? ` (${m.unit})` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-dark-text mb-2">Ingredients</h3>
            <ul className="flex flex-col gap-1.5">
              {recipe.ingredients.map((ing, i) => {
                const raw = parseFloat(ing.qty);
                const scaled = !isNaN(raw) ? Math.round(raw * scale * 100) / 100 : ing.qty;
                return (
                  <li key={i} className="flex gap-2 text-sm text-dark-text/80">
                    <span className="font-medium text-dark-text min-w-[4rem] text-right shrink-0">
                      {scaled} {ing.unit}
                    </span>
                    <span>{ing.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Method */}
        {recipe.method_steps?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-dark-text mb-2">Method</h3>
            <ol className="flex flex-col gap-3">
              {recipe.method_steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-dark-text/80">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
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
            <h3 className="text-sm font-semibold text-dark-text mb-2">Tips</h3>
            <ul className="flex flex-col gap-2">
              {recipe.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-dark-text/80">
                  <span className="text-primary mt-0.5 shrink-0">&#x2022;</span>
                  <p className="flex-1 leading-relaxed">{tip.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
