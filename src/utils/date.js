/** Ubah Date → string YYYY-MM-DD (local timezone) */
export function toDateString(dateObj) {
  const d = new Date(dateObj);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

export function today() {
  return toDateString(new Date());
}

export function startOfDay(dateObj) {
  const d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / (1000 * 60 * 60 * 24));
}

export function formatDeadline(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateLabel(dateObj, opts = {}) {
  return dateObj.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', ...opts,
  });
}