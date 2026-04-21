import { useState, useEffect, useCallback, useMemo } from 'react';
import { HiPlus, HiMagnifyingGlass, HiChevronDown, HiStar } from 'react-icons/hi2';
import { supabase } from '../supabase';
import RecipeForm from './RecipeForm';
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'rated', label: 'Highest rated' },
  { value: 'cooked', label: 'Most cooked' },
  { value: 'alpha', label: 'Alphabetical' },
];

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('newest');

  const fetchRecipes = useCallback(async () => {
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    setRecipes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = recipes;

    // Search by title and tags
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter by tag or favourites
    if (activeFilter === 'favourites') {
      result = result.filter(r => r.is_favourite);
    } else if (activeFilter !== 'all') {
      result = result.filter(r => r.tags?.includes(activeFilter));
    }

    // Filter by minimum rating
    if (minRating > 0) {
      result = result.filter(r => (r.rating || 0) >= minRating);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'rated':
          return (b.rating || 0) - (a.rating || 0);
        case 'cooked':
          return (b.times_cooked || 0) - (a.times_cooked || 0);
        case 'alpha':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return result;
  }, [recipes, search, activeFilter, minRating, sort]);

  function handleFormClose() {
    setView('list');
    setSelectedRecipe(null);
    fetchRecipes();
  }

  function handleCardUpdate(id, fields) {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  }

  function handleDeleted(id) {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setView('list');
    setSelectedRecipe(null);
  }

  // Form view (new or edit)
  if (view === 'form' || view === 'edit') {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-white sticky top-0 z-10">
          <button onClick={handleFormClose} className="text-sm text-primary font-medium">Cancel</button>
          <h2 className="text-base font-semibold text-dark-text">
            {view === 'edit' ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <div className="w-12" />
        </div>
        <RecipeForm onClose={handleFormClose} recipe={view === 'edit' ? selectedRecipe : null} />
      </div>
    );
  }

  // Detail view
  if (view === 'detail' && selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => { setView('list'); setSelectedRecipe(null); fetchRecipes(); }}
        onDeleted={handleDeleted}
        onEdit={(r) => { setSelectedRecipe(r); setView('edit'); }}
      />
    );
  }

  // List view
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-warm-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 3v4a1 1 0 0 1-2 0V3m2 0H5m2 0h1M12 3v4a1 1 0 0 1-2 0V3m2 0h-2m2 0h1" strokeLinecap="round" />
            <path d="M17 3c1.5 0 3 1 3 3s-1 3-3 3h-.5" strokeLinecap="round" />
            <path d="M17 9v1" strokeLinecap="round" />
            <path d="M4 11h16l-1.5 9a1 1 0 0 1-1 .85H6.5a1 1 0 0 1-1-.85L4 11z" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-dark-text">Your recipe library is empty</h2>
        <p className="text-sm text-dark-text/50">Tap + to add your first recipe!</p>
        <button
          onClick={() => setView('form')}
          className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-colors"
        >
          <HiPlus className="w-5 h-5" /> Add Recipe
        </button>
      </div>
    );
  }

  const chipClass = (isActive) =>
    `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'bg-warm-100 text-dark-text/60 hover:bg-warm-200'
    }`;

  return (
    <div className="p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-dark-text">
          {filtered.length} Recipe{filtered.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={() => setView('form')}
          className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary-light transition-colors"
        >
          <HiPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Search bar + clear */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or tag..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-warm-200 bg-white text-sm text-dark-text placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        {(search || activeFilter !== 'all' || minRating > 0) && (
          <button
            onClick={() => { setSearch(''); setActiveFilter('all'); setMinRating(0); }}
            className="text-xs text-primary font-medium whitespace-nowrap shrink-0"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Sort + Filter row */}
      <div className="flex items-center gap-2 mb-4">
        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="appearance-none bg-white border border-warm-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-text/40 pointer-events-none" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 items-center">
          <button onClick={() => setActiveFilter('all')} className={chipClass(activeFilter === 'all')}>
            All
          </button>
          <button onClick={() => setActiveFilter('favourites')} className={chipClass(activeFilter === 'favourites')}>
            Favourites
          </button>

          {/* Star rating filter */}
          <div className="flex gap-0.5 ml-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setMinRating(star === minRating ? 0 : star)}
                className="transition-colors"
              >
                <HiStar className={`w-5 h-5 ${star <= minRating ? 'fill-amber-400 text-amber-400' : 'fill-warm-200 text-warm-200'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-dark-text/50">No recipes match your search.</p>
          <button
            onClick={() => { setSearch(''); setActiveFilter('all'); setMinRating(0); }}
            className="mt-2 text-sm text-primary font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={(r) => { setSelectedRecipe(r); setView('detail'); }}
              onUpdate={(fields) => handleCardUpdate(recipe.id, fields)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
