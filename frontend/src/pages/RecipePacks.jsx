import { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { addStarterPack, packRecipeCount, listPacks } from '../lib/auth';

// Offers every public recipe pack (Teddy's starter pack, the Health with Bec
// plans, …) and copies a chosen pack's recipes into the signed-in user's own
// library. Shown on the empty library and in Profile. Quietly renders nothing
// until the users/accounts migration has been run (no packs to offer yet).
export default function RecipePacks({ onAdded, compact = false }) {
  const [packs, setPacks] = useState(null); // [{ slug, name, creator_name, count }]

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listPacks();
      const withCounts = await Promise.all(
        list.map(async (p) => ({ ...p, count: await packRecipeCount(p.slug) })),
      );
      // Only offer packs that actually have recipes in them.
      const offerable = withCounts.filter((p) => p.count > 0);
      if (!cancelled) setPacks(offerable);
    })();
    return () => { cancelled = true; };
  }, []);

  if (packs === null || packs.length === 0) return null;

  return (
    <div className={compact ? 'flex flex-col gap-2' : 'flex flex-col items-center gap-3'}>
      {packs.map((p) => (
        <PackRow key={p.slug} pack={p} onAdded={onAdded} compact={compact} />
      ))}
    </div>
  );
}

function PackRow({ pack, onAdded, compact }) {
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(0);
  const [error, setError] = useState(null);

  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      const n = await addStarterPack(pack.slug);
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
        Added {added} recipe{added !== 1 ? 's' : ''} from {pack.name}.
      </div>
    );
  }

  return (
    <div className={compact ? 'flex items-center justify-between gap-3' : 'flex flex-col items-center gap-1'}>
      {compact && (
        <div className="min-w-0">
          <p className="text-sm text-ink-900 font-medium truncate">{pack.name}</p>
          {pack.creator_name && (
            <p className="text-xs text-ink-600 truncate">by {pack.creator_name}</p>
          )}
        </div>
      )}
      <button
        onClick={handleAdd}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-2 px-5 py-3 rounded-xl border border-plum-500/40 bg-plum-500/10 text-plum-700 font-semibold text-sm hover:bg-plum-500/15 transition-colors disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        {busy ? 'Adding…' : compact ? `Add (${pack.count})` : `Add ${pack.name} (${pack.count})`}
      </button>
      {error && <p className="text-xs text-clay-500">{error}</p>}
    </div>
  );
}
