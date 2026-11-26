import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '../lib/motion.js';

/** A checkmark that draws itself, used when a task is completed. */
export default function Checkmark() {
  const still = useReducedMotion();
  const draw = (delay) => ({
    initial: still ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 0.4, delay, ease: EASE_OUT },
  });

  return (
    <svg className="checkmark" viewBox="0 0 64 64" aria-hidden="true">
      <motion.path
        d="M32 5c15.500-.500 27.500 11.500 27 27S47 59.500 31.500 59 4.500 47 5 31.500 17 5.500 36 5.500"
        {...draw(0)}
      />
      <motion.path d="M19 33.500l9 9L46 23" {...draw(0.3)} />
    </svg>
  );
}
