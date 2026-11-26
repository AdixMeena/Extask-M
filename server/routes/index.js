/** Every API route, mounted under /api in createApp.js. */
import { Router } from 'express';
import { stats } from '../controllers/taskController.js';
import authRoutes from './authRoutes.js';
import bidRoutes from './bidRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import taskRoutes from './taskRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

/** Quick "is the server up?" check that does not touch the database. */
router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.get('/stats', stats);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use(bidRoutes);
router.use(reviewRoutes);

export default router;
