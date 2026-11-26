/**
 * Controllers translate between HTTP and the services: read the validated
 * request, call one service, choose the status code. No business rules here.
 * Express 5 passes errors from async functions to the error handler itself.
 */
import * as authService from '../services/authService.js';
import { getOwnProfile } from '../services/userService.js';

export async function register(req, res) {
  res.status(201).json(await authService.register(req.valid.body));
}

export async function login(req, res) {
  res.json(await authService.login(req.valid.body));
}

export async function refresh(req, res) {
  res.json(await authService.refresh(req.valid.body.refreshToken));
}

export async function logout(req, res) {
  await authService.logout(req.token);
  res.status(204).end();
}

export async function me(req, res) {
  res.json({ user: await getOwnProfile(req.userId) });
}
