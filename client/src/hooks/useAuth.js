import { useContext } from 'react';
import { AuthContext } from '../context/contexts.js';

/** The signed-in user and the actions to log in, register and log out. */
export const useAuth = () => useContext(AuthContext);
