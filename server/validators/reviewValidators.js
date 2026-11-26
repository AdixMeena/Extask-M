import { z } from 'zod';
import { optionalText } from './common.js';

export const createReviewSchema = z.object({
  rating: z
    .number({ error: 'Choose a rating from 1 to 5.' })
    .int('Choose a rating from 1 to 5.')
    .min(1, 'Choose a rating from 1 to 5.')
    .max(5, 'Choose a rating from 1 to 5.'),
  comment: optionalText('Comment', 500),
});
