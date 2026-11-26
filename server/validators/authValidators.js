import { z } from 'zod';
import { PHONE_EMAIL_DOMAIN, USERNAME_PATTERN, normalizePhone } from '../utils/identifiers.js';
import { text } from './common.js';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(120, 'Email is too long.')
  .pipe(z.email('Enter a valid email address.'))
  // Stops anyone claiming the internal address of a phone-only account.
  .refine((value) => !value.endsWith(`@${PHONE_EMAIL_DOMAIN}`), 'That email cannot be used.');

const phone = z.string().transform((value, ctx) => {
  const normalized = normalizePhone(value);
  if (!normalized) {
    ctx.addIssue({ code: 'custom', message: 'Enter a 10-digit Indian mobile number.' });
    return z.NEVER;
  }
  return normalized;
});

/** Forms send "" for an empty box; treat that as "not given". */
const blankToUndefined = (value) =>
  value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value;

export const registerSchema = z
  .object({
    name: text('Name', { min: 2, max: 60 }),
    username: z
      .string({ error: 'Username is required.' })
      .trim()
      .toLowerCase()
      .regex(
        USERNAME_PATTERN,
        'Use 3 to 20 letters, numbers or underscores, starting with a letter.',
      ),
    email: z.preprocess(blankToUndefined, email.optional()),
    phone: z.preprocess(blankToUndefined, phone.optional()),
    password: z
      .string({ error: 'Password is required.' })
      .min(8, 'Use at least 8 characters.')
      .max(72, 'Use at most 72 characters.'),
  })
  .refine((data) => data.email || data.phone, {
    path: ['email'],
    message: 'Enter an email or a phone number.',
  });

export const loginSchema = z.object({
  identifier: text('Username, email or phone', { max: 120 }),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.')
    .max(72, 'That password is too long.'),
});

export const refreshSchema = z.object({
  refreshToken: text('Refresh token', { max: 2000 }),
});
