import { motion, useReducedMotion } from 'framer-motion';
import { rise } from '../lib/motion.js';

/**
 * Fades its content up when it scrolls into view. Give neighbours increasing
 * delays to stagger them.
 */
export default function Reveal({ children, delay = 0, as = 'div', ...props }) {
  const still = useReducedMotion();
  const Element = motion[as];

  return (
    <Element
      variants={rise}
      custom={delay}
      initial={still ? false : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      {...props}
    >
      {children}
    </Element>
  );
}
