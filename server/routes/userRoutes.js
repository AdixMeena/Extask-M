import { Router } from 'express';
import * as users from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { updateProfileSchema } from '../validators/userValidators.js';

const router = Router();

router.put('/me', requireAuth, validate(updateProfileSchema), users.updateMe);
router.get('/:id', validate(idParams, 'params'), users.getProfile);

export default router;
