/**
 * Builds a "contains" pattern for ILIKE. The characters % _ \ and * have a
 * special meaning in patterns, so they are neutralised in what the user typed.
 */
export function containsPattern(term) {
  const escaped = term.replaceAll('*', ' ').replace(/[\\%_]/g, '\\$&');
  return `%${escaped}%`;
}

/** Today's date in India as YYYY-MM-DD (servers usually run on UTC). */
export function todayInIndia(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
}
