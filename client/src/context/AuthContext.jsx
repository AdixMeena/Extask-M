import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';
import { SESSION_EXPIRED } from '../api/client.js';
import { clearSession, getSession, saveSession, SESSION_KEY } from '../api/tokenStorage.js';
import { AuthContext } from './contexts.js';

/**
 * Knows who is logged in.
 * status: 'loading' | 'user' | 'guest' | 'offline' (saved login, server unreachable)
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState(() => ({
    user: null,
    status: getSession() ? 'loading' : 'guest',
  }));

  const loadUser = useCallback(async () => {
    try {
      const { user } = await authApi.fetchMe();
      setState({ user, status: 'user' });
    } catch (error) {
      const rejected = error.status === 401 || error.status === 404;
      if (rejected) clearSession();
      setState({ user: null, status: rejected ? 'guest' : 'offline' });
    }
  }, []);

  // Restore the saved login when the app opens.
  useEffect(() => {
    if (!getSession()) return;
    // State is only set after the server replies.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser();
  }, [loadUser]);

  // Stay in step with expired sessions and with logins in other tabs.
  useEffect(() => {
    const signOutHere = () => setState({ user: null, status: 'guest' });
    const onStorage = (event) => {
      if (event.key !== SESSION_KEY) return;
      if (!event.newValue) signOutHere();
      else loadUser();
    };
    window.addEventListener(SESSION_EXPIRED, signOutHere);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED, signOutHere);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadUser]);

  const value = useMemo(() => {
    const start = ({ user, ...session }) => {
      saveSession(session);
      setState({ user, status: 'user' });
    };

    return {
      ...state,
      login: async (credentials) => start(await authApi.login(credentials)),
      register: async (details) => start(await authApi.register(details)),
      logout: async () => {
        // Log out here even if the server cannot be reached.
        await authApi.logout().catch(() => {});
        clearSession();
        // A full reload guarantees no private data stays on screen.
        window.location.assign('/');
      },
      setUser: (user) => setState({ user, status: 'user' }),
      retry: () => {
        setState({ user: null, status: 'loading' });
        loadUser();
      },
    };
  }, [state, loadUser]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
