import { Router } from 'express';
import * as bids from '../controllers/bidController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { placeBidSchema } from '../validators/bidValidators.js';
import { idParams } from '../validators/common.js';

const router = Router();
const taskId = validate(idParams, 'params');

router.get('/bids/mine', requireAuth, bids.listMine);
router.get('/tasks/:id/bids', requireAuth, taskId, bids.listForTask);
router.post('/tasks/:id/bids', requireAuth, taskId, validate(placeBidSchema), bids.place);

export default router;
