import { z } from 'zod';
import { optionalText, text } from './common.js';

/**
 * Only these fields can be edited. Anything else sent by the client (such as
 * id_verified or rating_avg) is dropped by zod before it reaches the database.
 */
export const updateProfileSchema = z.object({
  name: text('Name', { min: 2, max: 60 }),
  bio: optionalText('About you', 400),
  location: optionalText('Location', 80),
  idDetails: optionalText('ID details', 120),
});
