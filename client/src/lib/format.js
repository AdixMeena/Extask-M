/** Display formatting, in Indian style. */

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const rupees = (amount) => money.format(amount);

const dayMonth = { day: 'numeric', month: 'short', year: 'numeric' };

/** For date-only values ("2026-12-05"); UTC stops the day from shifting. */
export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { ...dayMonth, timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );

export const formatMonth = (timestamp) =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(timestamp));

const relative = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });
const STEPS = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export function timeAgo(timestamp) {
  const seconds = (new Date(timestamp).getTime() - Date.now()) / 1000;
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

/** Today in India as YYYY-MM-DD, for the earliest allowed deadline. */
export const todayInIndia = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/**
 * A small tilt between -1.8 and 1.8 degrees. It is worked out from the id, so a
 * card keeps the same angle every time the page redraws.
 */
export function tiltFor(id = '') {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  const tilt = ((hash % 37) - 18) / 10;
  return tilt === 0 ? 0.8 : tilt;
}
