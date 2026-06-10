import { Heart, Clock, Star } from 'lucide-react';
import { supabase } from '../supabase';
import { KumaraMark } from '../ui';

function PlaceholderImage() {
  return (
    <div className="w-full h-40 bg-stone-200/60 flex items-center justify-center text-stone-400">
      <KumaraMark className="w-12 h-12" />
    </div>
  );
}

function MacroStat({ label, value, unit = '' }) {
  if (value == null) return null;
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="font-narrow font-bold text-[13px] text-ink-900 leading-none">{value}{unit}</span>
      <span className="eyebrow-sm text-[9px] text-ink-600">{label}</span>
    </span>
  );
}

function StarRating({ rating, recipeId, onUpdate }) {
  async function setRating(newRating) {
    const value = newRating === rating ? 0 : newRating;
    const { error } = await supabase
      .from('recipes')
      .update({ rating: value })
      .eq('id', recipeId);
    if (!error) onUpdate({ rating: value });
  }

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={e => { e.stopPropagation(); setRating(star); }}
          className="transition-colors"
        >
          <Star className={`w-4 h-4 ${star <= (rating || 0) ? 'fill-ember-500 text-ember-500' : 'text-sand-50/80'}`} />
        </button>
      ))}
    </div>
  );
}

export default function RecipeCard({ recipe, onSelect, onUpdate }) {
  async function toggleFavourite(e) {
    e.stopPropagation();
    const { error } = await supabase
      .from('recipes')
      .update({ is_favourite: !recipe.is_favourite })
      .eq('id', recipe.id);
    if (!error) onUpdate({ is_favourite: !recipe.is_favourite });
  }

  const hasMacros = recipe.calories != null || recipe.protein_g != null ||
    recipe.carbs_g != null || recipe.fat_g != null;

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="bg-sand-100 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(45,42,36,.06)] cursor-pointer hover:shadow-[0_2px_6px_rgba(45,42,36,.1)] transition-shadow"
    >
      {/* Image */}
      <div className="relative">
        {recipe.photo_url ? (
          <img
            src={recipe.photo_url}
            alt={recipe.title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <PlaceholderImage />
        )}
        {/* Favourite heart */}
        <button
          onClick={toggleFavourite}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-sand-50/85 backdrop-blur-sm flex items-center justify-center shadow-[0_1px_2px_rgba(45,42,36,.06)] hover:bg-sand-50 transition-colors"
        >
          <Heart className={`w-4.5 h-4.5 ${recipe.is_favourite ? 'fill-ember-500 text-ember-500' : 'text-ink-600'}`} />
        </button>
        {/* Total time badge */}
        {(recipe.prep_time_mins || recipe.cook_time_mins) && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-sand-50/85 backdrop-blur-sm shadow-[0_1px_2px_rgba(45,42,36,.06)]">
            <Clock className="w-3.5 h-3.5 text-ink-600" />
            <span className="font-narrow font-bold text-[11px] text-ink-900">
              {(recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0)} min
            </span>
          </div>
        )}
        {/* Star rating overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-ink-900/45 to-transparent">
          <StarRating
            rating={recipe.rating}
            recipeId={recipe.id}
            onUpdate={onUpdate}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="font-display text-xl leading-[1.1] text-ink-900 line-clamp-2">{recipe.title}</h3>

        {/* Macro strip */}
        {hasMacros && (
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 pt-0.5">
            <MacroStat label="cal" value={recipe.calories} />
            <MacroStat label="prot" value={recipe.protein_g} unit="g" />
            <MacroStat label="carb" value={recipe.carbs_g} unit="g" />
            <MacroStat label="fat" value={recipe.fat_g} unit="g" />
          </div>
        )}
      </div>
    </div>
  );
}
