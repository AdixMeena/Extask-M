import { motion } from 'framer-motion';

/**
 * The push pin on top of a card. It wiggles when a parent motion element
 * enters its "hover" state.
 */
export default function Pin({ tone = 'orange' }) {
  return (
    <motion.svg
      className={`pin pin--${tone}`}
      viewBox="0 0 24 30"
      width="22"
      height="28"
      aria-hidden="true"
      style={{ originX: 0.5, originY: 1 }}
      variants={{
        rest: { rotate: 0 },
        hover: { rotate: [0, -16, 12, -6, 0], transition: { duration: 0.45 } },
      }}
    >
      <path className="pin__needle" d="M12 17v11" />
      <circle className="pin__head" cx="12" cy="10" r="8" />
      <circle className="pin__shine" cx="9.5" cy="7.5" r="2" />
    </motion.svg>
  );
}
