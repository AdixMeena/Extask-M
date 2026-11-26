import * as reviewService from '../services/reviewService.js';

export async function create(req, res) {
  const review = await reviewService.createReview(req.valid.params.id, req.userId, req.valid.body);
  res.status(201).json({ review });
}

export async function listForUser(req, res) {
  res.json({ reviews: await reviewService.listReviewsForUser(req.valid.params.id) });
}
