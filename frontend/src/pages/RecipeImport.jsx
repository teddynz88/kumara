import { useState, useRef } from 'react';
import { Link2, ArrowRight, CircleAlert, FileText, Upload } from 'lucide-react';
import { input } from '../ui';
import { authedFetch } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const LOADING_MESSAGES = [
  'Reading the recipe…',
  'Sorting the ingredients…',
  'Following the method…',
  'Checking the numbers…',
  'Nearly there…',
];

// The backend returns the shared extraction schema (brief §7.1);
// map it onto the shape RecipeForm expects.
function toFormRecipe(extracted, sourceType) {
  const macros = extracted.macros_per_serve || {};
  return {
    title: extracted.title || '',
    photo_url: extracted.photo_url || null,
    servings: extracted.servings || 2,
    prep_time_mins: extracted.prep_minutes,
    cook_time_mins: extracted.cook_minutes,
    ingredient_groups: extracted.ingredient_groups || [],
    method_steps: (extracted.steps || []).map((text, i) => ({ step: i + 1, text })),
    tips: [],
    calories: macros.calories,
    protein_g: macros.protein,
    carbs_g: macros.carbs,
    fat_g: macros.fat,
    fibre_g: macros.fibre,
    macros_estimated: macros.estimated !== false,
    tags: extracted.tags || [],
    source_url: extracted.source_url || null,
    source_type: sourceType,
    source_method: extracted.source_method || 'ai',
    _notes: extracted.notes || null,
  };
}

export default function RecipeImport({ mode = 'url', onExtracted }) {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  async function runExtraction(makeRequest, sourceType) {
    setLoading(true);
    setError(null);

    let msgIndex = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIndex]);
    }, 2200);

    try {
      const res = await makeRequest();
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Something went wrong talking to the kitchen. Is the backend running?');
      }
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Something went wrong');
      }
      onExtracted(toFormRecipe(data, sourceType));
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('We couldn’t reach the import service. Make sure the backend is running, then try again.');
      } else {
        setError(err.message);
      }
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  }

  function handleExtractUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http')) {
      setError('Please enter a full link starting with https://');
      return;
    }
    runExtraction(
      () => authedFetch(`${API_BASE}/import/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      }),
      'url'
    );
  }

  function handleExtractPdf() {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    runExtraction(
      () => authedFetch(`${API_BASE}/import/pdf`, { method: 'POST', body: form }),
      'pdf'
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      {mode === 'url' ? (
        <div>
          <p className="text-sm text-ink-600 mb-4 leading-relaxed">
            Paste a recipe link and Kūmara will pull out the title, ingredients, method, and macros for you to check.
          </p>

          <label className="block text-sm font-medium text-ink-900 mb-1">Recipe URL</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setError(null); }}
                onKeyDown={e => { if (e.key === 'Enter' && !loading) handleExtractUrl(); }}
                placeholder="https://www.example.com/recipe"
                className={`${input} pl-9`}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleExtractUrl}
              disabled={loading || !url.trim()}
              className="grad-cta shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sand-50 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-sand-50 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Extract
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-ink-600 mb-4 leading-relaxed">
            Upload a recipe PDF (like a Health with Bec meal plan) and Kūmara will read it for you to check.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={e => { setFile(e.target.files?.[0] || null); setError(null); }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full flex flex-col items-center gap-2 p-8 bg-sand-100 rounded-2xl border-2 border-dashed border-stone-400 text-ink-600 hover:border-plum-500 hover:text-plum-500 transition-colors"
          >
            <FileText className="w-8 h-8" />
            <span className="text-sm font-medium">
              {file ? file.name : 'Tap to choose a PDF'}
            </span>
          </button>

          {file && (
            <button
              onClick={handleExtractPdf}
              disabled={loading}
              className="grad-cta mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sand-50 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-sand-50 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Extract recipe
            </button>
          )}
        </div>
      )}

      {/* Loading state — an emotional moment, so serif italic */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-8 h-8 border-2 border-plum-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-display italic text-xl text-ink-600">{loadingMsg}</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex gap-2 items-start p-3 bg-clay-500/10 rounded-xl">
          <CircleAlert className="w-4 h-4 text-clay-500 shrink-0 mt-0.5" />
          <p className="text-sm text-clay-500">{error}</p>
        </div>
      )}

      {mode === 'url' && !loading && !error && (
        <div className="rounded-2xl bg-sand-100 p-3">
          <p className="eyebrow-sm text-ink-600 mb-1.5">Works great with</p>
          <div className="flex flex-wrap gap-1.5">
            {['recipetineats.com', 'taste.com.au', 'allrecipes.com', 'bbcgoodfood.com', 'most food blogs'].map(site => (
              <span key={site} className="px-2 py-0.5 rounded-full bg-stone-200 text-[10px] text-ink-600">
                {site}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
