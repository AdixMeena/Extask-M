import { motion, useReducedMotion } from 'framer-motion';
import { DURATION, EASE_OUT } from '../lib/motion.js';

/** Soft fade and slide between routes. */
export default function PageTransition({ children }) {
  const still = useReducedMotion();

  return (
    <motion.div
      className="page"
      initial={still ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={still ? undefined : { opacity: 0, y: -8, transition: { duration: DURATION.fast } }}
      transition={{ duration: DURATION.base, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
