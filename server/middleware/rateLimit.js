import rateLimit from 'express-rate-limit';

/**
 * Slows down password guessing and bulk sign-ups. Counts are kept in memory,
 * so on serverless hosting each instance counts separately.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Wait a few minutes and try again.' } },
});
