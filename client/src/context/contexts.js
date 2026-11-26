// The context objects live apart from their providers so that hot reload works.
import { createContext } from 'react';

export const AuthContext = createContext(null);
export const ToastContext = createContext(null);
