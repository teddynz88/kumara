// Shared Kūmara UI primitives — class strings and tiny components used on
// every screen, so the design system lives in one place.

// Buttons (brief §6.5): primary = ember gradient, secondary = stone outline,
// destructive = clay text/outline, never filled red.
export const btnPrimary =
  'grad-cta text-sand-50 font-semibold text-sm rounded-xl px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
export const btnSecondary =
  'bg-transparent border border-stone-200 text-ink-900 font-semibold text-sm rounded-xl px-5 py-3 transition-colors hover:bg-sand-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
export const btnDestructive =
  'bg-transparent border border-clay-500/40 text-clay-500 font-semibold text-sm rounded-xl px-5 py-3 transition-colors hover:bg-clay-500/10 disabled:opacity-50 inline-flex items-center justify-center gap-2';
export const btnGhost =
  'text-plum-500 hover:text-plum-700 font-medium text-sm transition-colors inline-flex items-center gap-1';

// Inputs: stone background, borderless at rest, plum ring on focus.
export const input =
  'w-full rounded-xl bg-stone-200/60 border border-transparent px-3 py-2.5 text-sm text-ink-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-plum-500 focus:bg-sand-50 transition-colors';

export const label = 'block text-sm font-medium text-ink-900 mb-1';

// Filter / selection chip
export const chip = (active) =>
  `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
    active
      ? 'bg-plum-500 text-sand-50'
      : 'bg-sand-100 text-ink-600 hover:bg-stone-200'
  }`;

export const card =
  'bg-sand-100 rounded-2xl shadow-[0_1px_2px_rgba(45,42,36,.06)]';

// The bare kūmara mark — line-drawn tuber, used in the header and empty
// states with currentColor so it takes any ink/plum context colour.
export function KumaraMark({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 23.8C13.5 26.6 24.2 19.8 24.5 11.6C18.6 8.4 6.3 16.4 6.5 23.8Z" />
        <path d="M24.5 11.6C25 10.2 25.5 9 26.2 7.9" />
        <path d="M11.6 17.6L13 16.6" />
        <path d="M16.4 19.4L17.8 18.4" />
        <path d="M12.2 21.4L13.2 20.7" />
      </g>
    </svg>
  );
}

// Estimated-value chip (brief §6.5) — plum eyebrow tag for AI-guessed fields.
export function EstimatedChip() {
  return (
    <span className="eyebrow-sm inline-flex items-center rounded-full bg-plum-500/12 text-plum-500 px-2 py-0.5">
      Estimated
    </span>
  );
}

// Macro traffic-light chip (brief §6.2): within ±10% of target → sage;
// >15% over → clay; under / no target → neutral ink. Tinted backgrounds only.
export function macroTone(value, target) {
  if (target == null || target <= 0 || value == null) return 'neutral';
  const ratio = value / target;
  if (ratio > 1.15) return 'over';
  if (ratio >= 0.9) return 'on';
  return 'neutral';
}

export function MacroChip({ label: macroLabel, value, target, unit = '' }) {
  const tone = macroTone(value, target);
  const toneClass =
    tone === 'on'
      ? 'bg-sage-500/12 text-sage-500'
      : tone === 'over'
        ? 'bg-clay-500/12 text-clay-500'
        : 'bg-stone-200/70 text-ink-600';
  return (
    <span className={`inline-flex items-baseline gap-1 rounded-full px-2.5 py-1 ${toneClass}`}>
      <span className="font-narrow font-bold text-sm leading-none">
        {value == null ? '—' : Math.round(value)}{unit}
      </span>
      <span className="eyebrow-sm">{macroLabel}</span>
    </span>
  );
}
