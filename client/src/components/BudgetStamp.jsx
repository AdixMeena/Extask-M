import { motion, useReducedMotion } from 'framer-motion';
import { rupees } from '../lib/format.js';
import { stamp } from '../lib/motion.js';

/** The budget, shown as an orange rubber stamp. */
export default function BudgetStamp({ amount, large = false }) {
  const still = useReducedMotion();
  const text = amount > 0 ? rupees(amount) : '₹?';

  return (
    <motion.span
      className={`stamp ${large ? 'stamp--large' : ''} ${text.length > 7 ? 'stamp--long' : ''}`}
      variants={stamp(-8)}
      initial={still ? 'shown' : 'hidden'}
      whileInView="shown"
      viewport={{ once: true }}
    >
      <span className="visually-hidden">Budget </span>
      {text}
    </motion.span>
  );
}
