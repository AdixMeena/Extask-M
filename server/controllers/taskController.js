import * as taskService from '../services/taskService.js';
import { getStats } from '../services/statsService.js';

export async function create(req, res) {
  res.status(201).json({ task: await taskService.createTask(req.userId, req.valid.body) });
}

export async function list(req, res) {
  res.json(await taskService.listTasks(req.valid.query));
}

export async function listMine(req, res) {
  res.json({ tasks: await taskService.listTasksByPoster(req.userId) });
}

export async function getOne(req, res) {
  res.json(await taskService.getTaskDetail(req.valid.params.id, req.userId));
}

export async function cancel(req, res) {
  res.json(await taskService.cancelTask(req.valid.params.id, req.userId));
}

export async function complete(req, res) {
  res.json(await taskService.completeTask(req.valid.params.id, req.userId));
}

export async function select(req, res) {
  const { id, bidId } = req.valid.params;
  res.json(await taskService.selectBid(id, bidId, req.userId));
}

export async function stats(_req, res) {
  res.json({ stats: await getStats() });
}
