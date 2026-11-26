/**
 * The axios instance every API helper uses. It:
 *   - adds the access token to each request,
 *   - renews an expired token once and repeats the request,
 *   - turns every failure into an ApiError.
 */
import axios from 'axios';
import { toApiError } from './ApiError.js';
import { clearSession, getSession, saveSession } from './tokenStorage.js';

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/+$/, '');

export const SESSION_EXPIRED = 'extask:session-expired';

export const http = axios.create({ baseURL, timeout: 20_000 });

http.interceptors.request.use((config) => {
  const token = getSession()?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  config.sentToken = token;
  return config;
});

// Several requests can fail together; they must share one renewal.
let renewal = null;

async function renewSession() {
  const refreshToken = getSession()?.refreshToken;
  try {
    // Plain axios, so this call cannot trigger the interceptor again.
    const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    saveSession(data);
  } catch (error) {
    // Only a rejected token ends the session. A network blip must not.
    if ([400, 401].includes(error.response?.status)) {
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED));
    } else {
      throw error;
    }
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const canRetry =
      response?.status === 401 &&
      config.sentToken &&
      !config.retried &&
      !/^\/auth\/(login|register|refresh|logout)/.test(config.url);

    if (!canRetry) throw toApiError(error);

    config.retried = true;
    // Another request (or tab) may have renewed the token already.
    if (getSession()?.accessToken === config.sentToken) {
      try {
        renewal ??= renewSession().finally(() => {
          renewal = null;
        });
        await renewal;
      } catch (renewError) {
        throw toApiError(renewError);
      }
    }
    return http(config);
  },
);

/** Unwraps the response body: const { tasks } = await get('/tasks'). */
export const get = (url, config) => http.get(url, config).then((res) => res.data);
export const post = (url, body) => http.post(url, body).then((res) => res.data);
export const put = (url, body) => http.put(url, body).then((res) => res.data);
