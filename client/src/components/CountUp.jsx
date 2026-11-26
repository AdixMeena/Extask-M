import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { EASE_OUT } from '../lib/motion.js';

/** Counts from 0 to `value` the first time it is scrolled into view. */
export default function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const still = useReducedMotion();

  useEffect(() => {
    if (!inView || still) return undefined;
    const controls = animate(0, value, {
      duration: 0.5,
      ease: EASE_OUT,
      // Writing to the element directly avoids redrawing React on every frame.
      onUpdate: (latest) => {
        ref.current.textContent = Math.round(latest).toLocaleString('en-IN');
      },
    });
    return () => controls.stop();
  }, [inView, still, value]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {still ? value.toLocaleString('en-IN') : 0}
      </span>
      <span className="visually-hidden">{value}</span>
    </>
  );
}
