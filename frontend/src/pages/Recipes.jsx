import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, ChevronDown, Star, PencilLine, Link2, FileText } from 'lucide-react';
import { supabase } from '../supabase';
import RecipeForm from './RecipeForm';
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';
import RecipeImport from './RecipeImport';
import StarterPack from './StarterPack';
import { chip, btnGhost, input } from '../ui';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'rated', label: 'Highest rated' },
  { value: 'cooked', label: 'Most cooked' },
  { value: 'alpha', label: 'Alphabetical' },
];

// Meal-type filter chips (brief §2): All / Breakfast / Lunch / Snack / Dinner / Favourites
const MEAL_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snack', label: 'Snack' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'favourites', label: 'Favourites' },
];

function PageHeader({ title, onBack, backLabel = 'Back' }) {
  return (
    <div className="grad-header-wash flex items-center justify-between px-4 py-3 border-b border-stone-200 sticky top-0 z-10">
      <button onClick={onBack} className={`${btnGhost} w-16 justify-start`}>{backLabel}</button>
      <h2 className="font-display text-xl text-ink-900">{title}</h2>
      <div className="w-16" />
    </div>
  );
}

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

  const filtered = useMemo(() => {
    let result = recipes;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeFilter === 'favourites') {
      result = result.filter(r => r.is_favourite);
    } else if (activeFilter !== 'all') {
      result = result.filter(r => r.tags?.includes(activeFilter));
    }

    if (minRating > 0) {
      result = result.filter(r => (r.rating || 0) >= minRating);
    }

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

  // Add-recipe entry: choose manual, URL, or PDF
  if (view === 'add') {
    const options = [
      { icon: PencilLine, title: 'Manual', caption: 'Type it in yourself', action: () => setView('form') },
      { icon: Link2, title: 'From URL', caption: 'Paste a recipe link', action: () => setView('import-url') },
      { icon: FileText, title: 'From PDF', caption: 'Upload a recipe PDF', action: () => setView('import-pdf') },
    ];
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Add Recipe" onBack={handleFormClose} backLabel="Cancel" />
        <div className="flex flex-1 flex-col items-center justify-center p-6 gap-5 text-center">
          <p className="type-h2 text-ink-900">How would you like to add it?</p>
          <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
            {options.map(({ icon: Icon, title, caption, action }) => (
              <button
                key={title}
                onClick={action}
                className="flex items-center gap-4 p-4 bg-sand-100 rounded-2xl shadow-[0_1px_2px_rgba(45,42,36,.06)] hover:bg-stone-200/60 transition-colors text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-stone-200 text-plum-700 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{title}</span>
                  <span className="block text-xs text-ink-600 mt-0.5">{caption}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Form view (manual entry or edit)
  if (view === 'form' || view === 'edit') {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader
          title={view === 'edit' ? 'Edit Recipe' : 'New Recipe'}
          onBack={() => view === 'edit' ? handleFormClose() : setView('add')}
          backLabel={view === 'edit' ? 'Cancel' : 'Back'}
        />
        <RecipeForm onClose={handleFormClose} recipe={view === 'edit' ? selectedRecipe : null} />
      </div>
    );
  }

  // Import views (URL or PDF) — shared extract → review → save flow
  if (view === 'import-url' || view === 'import-pdf') {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader
          title={view === 'import-pdf' ? 'Import from PDF' : 'Import from URL'}
          onBack={() => setView('add')}
        />
        <RecipeImport
          mode={view === 'import-pdf' ? 'pdf' : 'url'}
          onExtracted={(recipe) => {
            setSelectedRecipe(recipe);
            setView('review');
          }}
        />
      </div>
    );
  }

  // Review screen after extraction — every field editable, nothing saved yet
  if (view === 'review') {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Review" onBack={() => setView('add')} />
        <div className="grad-hero px-4 py-5 border-b border-stone-200">
          <p className="type-h2 text-ink-900">Here&rsquo;s what we found</p>
          <p className="text-sm text-ink-600 mt-1">Check everything before saving — edit anything that looks off.</p>
        </div>
        <RecipeForm onClose={handleFormClose} recipe={selectedRecipe} isReview />
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
        <div className="w-6 h-6 border-2 border-plum-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 gap-3 text-center min-h-full">
        <h2 className="type-h2 text-ink-900">Your library is empty</h2>
        <p className="text-sm text-ink-600">Add some recipes to get cooking — or start with Teddy’s pack.</p>
        <div className="mt-3"><StarterPack onAdded={fetchRecipes} /></div>
        <button onClick={() => setView('add')} className="text-plum-500 hover:text-plum-700 font-medium text-sm mt-1 inline-flex items-center gap-1">
          <Plus className="w-4 h-4" /> Or add your own recipe
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="type-h1 text-[28px] text-ink-900">Recipe Library</h2>
        <button
          onClick={() => setView('add')}
          className="grad-cta w-10 h-10 rounded-full text-sand-50 flex items-center justify-center shadow-[0_1px_2px_rgba(45,42,36,.06)]"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <p className="eyebrow-sm text-ink-600 mb-3">{filtered.length} recipe{filtered.length !== 1 ? 's' : ''}</p>

      {/* Search bar + clear */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or tag..."
            className={`${input} pl-9`}
          />
        </div>
        {(search || activeFilter !== 'all' || minRating > 0) && (
          <button
            onClick={() => { setSearch(''); setActiveFilter('all'); setMinRating(0); }}
            className={`${btnGhost} text-xs whitespace-nowrap shrink-0`}
          >
            Clear
          </button>
        )}
      </div>

      {/* Meal-type filter chips */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar -mx-4 px-4">
        {MEAL_FILTERS.map(f => (
          <button key={f.value} onClick={() => setActiveFilter(f.value)} className={chip(activeFilter === f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort + rating filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="appearance-none bg-stone-200/60 rounded-xl pl-3 pr-7 py-1.5 text-xs font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-plum-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-600 pointer-events-none" />
        </div>

        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setMinRating(star === minRating ? 0 : star)}
              className="transition-colors"
            >
              <Star className={`w-5 h-5 ${star <= minRating ? 'fill-ember-500 text-ember-500' : 'text-stone-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-display italic text-xl text-ink-600">Nothing matches.</p>
          <button
            onClick={() => { setSearch(''); setActiveFilter('all'); setMinRating(0); }}
            className={`${btnGhost} mt-2`}
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
