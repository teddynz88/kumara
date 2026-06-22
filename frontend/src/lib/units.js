// Display-only unit conversion. Stored ingredient data is never changed; we
// convert just for reading, based on the user's metric/imperial preference.
// Only the genuinely region-specific units are converted (cups, oz, lb, etc.);
// tbsp/tsp/piece/clove and friends are left alone since they read fine in both.

const PREF_KEY = 'kumara_units';

export function getUnitsPref() {
  try { return localStorage.getItem(PREF_KEY) === 'imperial' ? 'imperial' : 'metric'; }
  catch { return 'metric'; }
}

export function setUnitsPref(system) {
  try { localStorage.setItem(PREF_KEY, system === 'imperial' ? 'imperial' : 'metric'); } catch { /* ignore */ }
}

// imperial unit -> metric
const TO_METRIC = {
  oz: { f: 28.35, unit: 'g' },
  ounce: { f: 28.35, unit: 'g' },
  ounces: { f: 28.35, unit: 'g' },
  lb: { f: 453.6, unit: 'g' },
  lbs: { f: 453.6, unit: 'g' },
  pound: { f: 453.6, unit: 'g' },
  pounds: { f: 453.6, unit: 'g' },
  cup: { f: 240, unit: 'ml' },
  cups: { f: 240, unit: 'ml' },
  'fl oz': { f: 29.57, unit: 'ml' },
  pint: { f: 473, unit: 'ml' },
  pints: { f: 473, unit: 'ml' },
  quart: { f: 946, unit: 'ml' },
  quarts: { f: 946, unit: 'ml' },
};

// metric unit -> imperial
const TO_IMPERIAL = {
  g: { f: 1 / 28.35, unit: 'oz' },
  gram: { f: 1 / 28.35, unit: 'oz' },
  grams: { f: 1 / 28.35, unit: 'oz' },
  kg: { f: 2.205, unit: 'lb' },
  ml: { f: 1 / 29.57, unit: 'fl oz' },
  l: { f: 4.227, unit: 'cup' },
};

function tidy(n) {
  // Whole-ish numbers print clean; otherwise one decimal.
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r : r;
}

// Returns { quantity, unit } converted for the target system, or the inputs
// unchanged when there's nothing to convert (non-numeric qty, unknown unit,
// or already in the target system).
export function convertIngredient(quantity, unit, system) {
  const u = (unit || '').trim().toLowerCase();
  const qty = typeof quantity === 'number' ? quantity : parseFloat(quantity);
  if (!isFinite(qty)) return { quantity, unit };

  const table = system === 'imperial' ? TO_IMPERIAL : TO_METRIC;
  const rule = table[u];
  if (!rule) return { quantity, unit };

  let value = qty * rule.f;
  let outUnit = rule.unit;

  // Promote big metric amounts to kg / l for readability.
  if (system === 'metric') {
    if (outUnit === 'g' && value >= 1000) { value /= 1000; outUnit = 'kg'; }
    else if (outUnit === 'ml' && value >= 1000) { value /= 1000; outUnit = 'l'; }
  }

  return { quantity: tidy(value), unit: outUnit };
}
