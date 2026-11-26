import { get, post, put } from './client.js';

export const fetchUser = (id) => get(`/users/${id}`);
export const fetchUserReviews = (id) => get(`/users/${id}/reviews`);
export const updateMyProfile = (changes) => put('/users/me', changes);
export const createReview = (taskId, review) => post(`/tasks/${taskId}/reviews`, review);
