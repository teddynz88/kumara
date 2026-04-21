import { HiHeart, HiClock, HiStar } from 'react-icons/hi2';
import { supabase } from '../supabase';

function PlaceholderImage() {
  return (
    <div className="w-full h-44 bg-warm-100 flex items-center justify-center">
      <svg className="w-12 h-12 text-warm-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 3v4a1 1 0 0 1-2 0V3m2 0H5m2 0h1M12 3v4a1 1 0 0 1-2 0V3m2 0h-2m2 0h1" strokeLinecap="round" />
        <path d="M17 3c1.5 0 3 1 3 3s-1 3-3 3h-.5" strokeLinecap="round" />
        <path d="M17 9v1" strokeLinecap="round" />
        <path d="M4 11h16l-1.5 9a1 1 0 0 1-1 .85H6.5a1 1 0 0 1-1-.85L4 11z" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function MacroPill({ label, value }) {
  if (value == null) return null;
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-dark-text text-[10px] font-medium">
      {value} {label}
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
          <HiStar className={`w-4 h-4 drop-shadow-sm ${star <= (rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-white/40 text-white/60'}`} />
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
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-warm-200/60 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative">
        {recipe.photo_url ? (
          <img
            src={recipe.photo_url}
            alt={recipe.title}
            className="w-full h-44 object-cover"
          />
        ) : (
          <PlaceholderImage />
        )}
        {/* Favourite heart */}
        <button
          onClick={toggleFavourite}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <HiHeart className={`w-5 h-5 ${recipe.is_favourite ? 'fill-red-500 text-red-500' : 'fill-none text-dark-text/30'}`} />
        </button>
        {/* Total time badge */}
        {(recipe.prep_time_mins || recipe.cook_time_mins) && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-[11px] font-medium text-dark-text shadow-sm">
            <HiClock className="w-3.5 h-3.5" />
            {(recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0)} min
          </div>
        )}
        {/* Star rating overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/50 to-transparent">
          <StarRating
            rating={recipe.rating}
            recipeId={recipe.id}
            onUpdate={onUpdate}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-base font-bold text-dark-text line-clamp-2 leading-snug">{recipe.title}</h3>

        {/* Macro pills */}
        {hasMacros && (
          <div className="flex flex-wrap gap-1">
            <MacroPill label="cal" value={recipe.calories} />
            <MacroPill label="g P" value={recipe.protein_g} />
            <MacroPill label="g C" value={recipe.carbs_g} />
            <MacroPill label="g F" value={recipe.fat_g} />
          </div>
        )}

      </div>
    </div>
  );
}
