import { useContext } from 'react';
import { ToastContext } from '../context/contexts.js';

/** const toast = useToast(); toast('Bid sent'); */
export const useToast = () => useContext(ToastContext);
