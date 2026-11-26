import * as userService from '../services/userService.js';

export async function getProfile(req, res) {
  res.json({ user: await userService.getPublicProfile(req.valid.params.id) });
}

export async function updateMe(req, res) {
  res.json({ user: await userService.updateProfile(req.userId, req.valid.body) });
}
