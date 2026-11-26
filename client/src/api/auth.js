import { get, post } from './client.js';

export const register = (details) => post('/auth/register', details);
export const login = (credentials) => post('/auth/login', credentials);
export const logout = () => post('/auth/logout');
export const fetchMe = () => get('/auth/me');
