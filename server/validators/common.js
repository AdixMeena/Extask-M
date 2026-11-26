/** Building blocks shared by the request validators. */
import { z } from 'zod';

/** Required text, trimmed, with readable messages. */
export function text(label, { min = 1, max }) {
  return z
    .string({ error: `${label} is required.` })
    .trim()
    .min(min, min === 1 ? `${label} is required.` : `${label} needs at least ${min} characters.`)
    .max(max, `${label} can be at most ${max} characters.`);
}

/** Optional text. An empty box in a form is stored as null. */
export function optionalText(label, max) {
  return z
    .string({ error: `${label} must be text.` })
    .trim()
    .max(max, `${label} can be at most ${max} characters.`)
    .nullish()
    .transform((value) => value || null);
}

/** Money in rupees: positive, up to 2 decimal places. Accepts "400" or 400. */
export function rupees(label) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
    z
      .number({ error: `${label} must be a number.` })
      .positive(`${label} must be more than 0.`)
      .max(10_000_000, `${label} is too large.`)
      .multipleOf(0.01, `${label} can have at most 2 decimal places.`),
  );
}

const id = z.uuid('That link is not valid.');

export const idParams = z.object({ id });
export const selectParams = z.object({ id, bidId: id });
