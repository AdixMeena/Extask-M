/**
 * The only place that touches the saved login tokens. Storage can be blocked
 * (private windows, strict settings), so a copy is also kept in memory.
 */
const KEY = 'extask.session';
let memory = null;

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return memory;
  }
}

export function saveSession({ accessToken, refreshToken }) {
  memory = { accessToken, refreshToken };
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Staying logged in until the tab closes is good enough.
  }
}

export function clearSession() {
  memory = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing saved, nothing to clear.
  }
}

export const SESSION_KEY = KEY;
