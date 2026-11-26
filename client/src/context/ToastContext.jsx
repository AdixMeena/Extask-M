import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { DURATION, EASE_OUT } from '../lib/motion.js';
import { ToastContext } from './contexts.js';

/** Short confirmation messages ("Bid sent") shown at the bottom of the screen. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((text) => setToast({ text, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext value={show}>
      {children}
      <div className="toast-area" role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: DURATION.base, ease: EASE_OUT }}
            >
              <Icon name="check" />
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}
