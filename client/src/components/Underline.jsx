import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '../lib/motion.js';

/** Words with a hand-drawn orange stroke under them. */
export default function Underline({ children, delay = 0.2 }) {
  const still = useReducedMotion();

  return (
    <span className="underline">
      {children}
      <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
        <motion.path
          d="M3 10C40 5 82 3.5 120 5c28 1.2 52 2 76-2M30 12.500c42-3 88-3.500 128-1.500"
          initial={still ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay, ease: EASE_OUT }}
        />
      </svg>
    </span>
  );
}
