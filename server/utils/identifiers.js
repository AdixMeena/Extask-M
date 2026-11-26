/**
 * Rules for the three things a person can log in with: username, email, phone.
 * Kept free of any database code so they are easy to unit test.
 */

/** Domain for the internal emails given to people who register with only a phone. */
export const PHONE_EMAIL_DOMAIN = 'phone.extask.app';

/** Starts with a letter, so it can never be mistaken for a phone number or email. */
export const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,19}$/;

/**
 * Turns the ways people type an Indian mobile number into 10 digits.
 * "+91 98765 43210", "098765-43210" and "9876543210" all give "9876543210".
 *
 * @returns {string | null} null when it is not a valid Indian mobile number
 */
export function normalizePhone(input) {
  const raw = String(input ?? '').trim();
  if (!/^\+?[\d\s()-]+$/.test(raw)) return null;

  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** The email Supabase Auth stores for a phone-only account. */
export function phoneToAuthEmail(phone) {
  return `91${phone}@${PHONE_EMAIL_DOMAIN}`;
}

/**
 * Works out which profile column a login identifier refers to.
 *
 * @returns {{ column: 'email' | 'phone' | 'username', value: string }}
 */
export function parseIdentifier(identifier) {
  const text = String(identifier).trim();
  if (text.includes('@')) return { column: 'email', value: text.toLowerCase() };

  const phone = normalizePhone(text);
  if (phone) return { column: 'phone', value: phone };

  return { column: 'username', value: text.toLowerCase() };
}
