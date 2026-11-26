import { get, post } from './client.js';

export const placeBid = (taskId, bid) => post(`/tasks/${taskId}/bids`, bid);
export const listTaskBids = (taskId) => get(`/tasks/${taskId}/bids`);
export const listMyBids = () => get('/bids/mine');
