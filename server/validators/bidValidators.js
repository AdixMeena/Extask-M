import { z } from 'zod';
import { optionalText, rupees } from './common.js';

export const placeBidSchema = z.object({
  amount: rupees('Your price'),
  message: optionalText('Message', 500),
  availability: optionalText('Availability', 120),
});
