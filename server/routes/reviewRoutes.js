import { Router } from 'express';
import * as reviews from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { createReviewSchema } from '../validators/reviewValidators.js';

const router = Router();
const id = validate(idParams, 'params');

router.post('/tasks/:id/reviews', requireAuth, id, validate(createReviewSchema), reviews.create);
router.get('/users/:id/reviews', id, reviews.listForUser);

export default router;
