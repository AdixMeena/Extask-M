import { z } from 'zod';
import { todayInIndia } from '../utils/text.js';
import { optionalText, rupees, text } from './common.js';

export const TASK_STATUSES = ['open', 'assigned', 'completed', 'cancelled'];

export const createTaskSchema = z.object({
  title: text('Title', { min: 5, max: 120 }),
  description: text('Description', { min: 10, max: 2000 }),
  category: optionalText('Category', 40),
  budget: rupees('Budget'),
  location: optionalText('Location', 80),
  deadline: z.preprocess(
    (value) => value || null,
    z.iso
      .date('Enter a valid date.')
      .refine((date) => date >= todayInIndia(), 'The deadline cannot be in the past.')
      .nullable(),
  ),
});

/** Query strings arrive as text, and an empty filter means "no filter". */
const filter = (schema) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

export const listTasksSchema = z
  .object({
    q: filter(z.string().trim().max(80)),
    category: filter(z.string().trim().max(40)),
    location: filter(z.string().trim().max(80)),
    minBudget: filter(z.coerce.number('Minimum budget must be a number.').min(0)),
    maxBudget: filter(z.coerce.number('Maximum budget must be a number.').min(0)),
    status: z.preprocess(
      (value) => value || 'open',
      z.enum([...TASK_STATUSES, 'all'], 'Unknown status.'),
    ),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine(
    (data) =>
      data.minBudget === undefined ||
      data.maxBudget === undefined ||
      data.minBudget <= data.maxBudget,
    { path: ['minBudget'], message: 'Minimum budget is higher than maximum budget.' },
  );
