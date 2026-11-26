import * as bidService from '../services/bidService.js';

export async function place(req, res) {
  const { bid, created } = await bidService.placeBid(
    req.valid.params.id,
    req.userId,
    req.valid.body,
  );
  res.status(created ? 201 : 200).json({ bid, created });
}

export async function listForTask(req, res) {
  res.json({ bids: await bidService.listBidsForTask(req.valid.params.id, req.userId) });
}

export async function listMine(req, res) {
  res.json({ bids: await bidService.listMyBids(req.userId) });
}
