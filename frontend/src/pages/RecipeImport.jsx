import { useState } from 'react';
import { HiLink, HiArrowRight, HiExclamationCircle } from 'react-icons/hi2';

const LOADING_MESSAGES = [
  'Fetching the page…',
  'Reading the recipe…',
  'Extracting ingredients…',
  'Estimating macros…',
  'Almost done…',
];

export default function RecipeImport({ onExtracted }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState(null);

  async function handleExtract() {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http')) {
      setError('Please enter a full URL starting with https://');
      return;
    }

    setLoading(true);
    setError(null);

    // Cycle through loading messages for feedback
    let msgIndex = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIndex]);
    }, 2000);

    try {
      const res = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onExtracted(data.recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !loading) handleExtract();
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <p className="text-sm text-dark-text/60 mb-4 leading-relaxed">
          Paste any recipe URL and Kumara will extract the title, ingredients, method steps, and macros automatically.
        </p>

        <label className="block text-sm font-medium text-dark-text mb-1">Recipe URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text/30" />
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="https://www.example.com/recipe"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-warm-200 bg-white text-sm text-dark-text placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={loading || !url.trim()}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiArrowRight className="w-4 h-4" />
            )}
            Extract
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="mt-4 flex flex-col items-center gap-3 py-6">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-dark-text/50 animate-pulse">{loadingMsg}</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="mt-3 flex gap-2 items-start p-3 bg-red-50 border border-red-200 rounded-lg">
            <HiExclamationCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Supported sites hint */}
      {!loading && !error && (
        <div className="rounded-lg bg-warm-100 p-3">
          <p className="text-xs font-medium text-dark-text/50 mb-1.5">Works great with</p>
          <div className="flex flex-wrap gap-1.5">
            {['taste.com.au', 'allrecipes.com', 'bbcgoodfood.com', 'recipetineats.com', 'delicious.com.au', 'most food blogs'].map(site => (
              <span key={site} className="px-2 py-0.5 rounded-full bg-warm-200 text-[10px] text-dark-text/60">
                {site}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
