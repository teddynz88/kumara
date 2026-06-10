// Week math for the planner. Weeks start Monday; day 0 = Monday.

export function getMonday(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - dow);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Local-timezone ISO date (yyyy-mm-dd) — toISOString() would shift across UTC.
export function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatWeekLabel(monday) {
  const sunday = addDays(monday, 6);
  const opts = { day: 'numeric', month: 'short' };
  return `${monday.toLocaleDateString('en-NZ', opts)} – ${sunday.toLocaleDateString('en-NZ', opts)}`;
}

export function todayIndexInWeek(monday) {
  const today = new Date();
  const diff = Math.floor(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()) - monday) / 86400000
  );
  return diff >= 0 && diff <= 6 ? diff : -1;
}
