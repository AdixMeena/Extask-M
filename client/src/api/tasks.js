import { get, post, put } from './client.js';

export const listTasks = (params) => get('/tasks', { params });
export const listMyTasks = () => get('/tasks/mine');
export const fetchTask = (id) => get(`/tasks/${id}`);
export const createTask = (task) => post('/tasks', task);
export const cancelTask = (id) => put(`/tasks/${id}/cancel`);
export const completeTask = (id) => put(`/tasks/${id}/complete`);
export const selectBid = (taskId, bidId) => put(`/tasks/${taskId}/select/${bidId}`);
export const fetchStats = () => get('/stats');
