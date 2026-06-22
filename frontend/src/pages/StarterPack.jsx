import { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { addStarterPack, packRecipeCount } from '../lib/auth';

// "Add Teddy's Starting Recipe Pack" — copies the pack's recipes into the
// signed-in user's own library. Shown on the empty library and in Profile.
// Quietly hides itself if the pack doesn't exist yet (i.e. before the users
// migration has been run).
export default function StarterPack({ onAdded, compact = false }) {
  const [count, setCount] = useState(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    packRecipeCount('teddy-starter').then(setCount);
  }, []);

  // Pack unavailable (migration not run, or already counts 0) → render nothing.
  if (count === null || count === 0) return null;

  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      const n = await addStarterPack('teddy-starter');
      setAdded(n);
      onAdded?.(n);
    } catch {
      setError('Couldn’t add the pack just now — try again.');
    } finally {
      setBusy(false);
    }
  }

  if (added > 0) {
    return (
      <div className={`inline-flex items-center gap-2 text-sage-500 ${compact ? 'text-sm' : ''}`}>
        <Check className="w-4 h-4" />
        Added {added} recipe{added !== 1 ? 's' : ''} to your library.
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'flex flex-col items-center gap-2'}>
      <button
        onClick={handleAdd}
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-plum-500/40 bg-plum-500/10 text-plum-700 font-semibold text-sm hover:bg-plum-500/15 transition-colors disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        {busy ? 'Adding…' : `Add Teddy’s Starting Pack (${count})`}
      </button>
      {error && <p className="text-xs text-clay-500">{error}</p>}
    </div>
  );
}
