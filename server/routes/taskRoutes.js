import { Router } from 'express';
import * as tasks from '../controllers/taskController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams, selectParams } from '../validators/common.js';
import { createTaskSchema, listTasksSchema } from '../validators/taskValidators.js';

const router = Router();
const taskId = validate(idParams, 'params');

router.get('/', validate(listTasksSchema, 'query'), tasks.list);
router.post('/', requireAuth, validate(createTaskSchema), tasks.create);

// Must come before "/:id", otherwise "mine" would be read as a task id.
router.get('/mine', requireAuth, tasks.listMine);

router.get('/:id', optionalAuth, taskId, tasks.getOne);
router.put('/:id/cancel', requireAuth, taskId, tasks.cancel);
router.put('/:id/complete', requireAuth, taskId, tasks.complete);
router.put('/:id/select/:bidId', requireAuth, validate(selectParams, 'params'), tasks.select);

export default router;
