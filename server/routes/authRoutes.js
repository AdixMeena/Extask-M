import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, refreshSchema, registerSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), auth.register);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/refresh', validate(refreshSchema), auth.refresh);
router.post('/logout', requireAuth, auth.logout);
router.get('/me', requireAuth, auth.me);

export default router;
