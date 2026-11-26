/**
 * Shared animation settings. All durations stay between 150 and 500 ms.
 * Components check useReducedMotion() and skip movement when it is on.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1];

export const DURATION = { fast: 0.18, base: 0.3, slow: 0.5 };

/** Fade and rise; used for scroll reveals. */
export const rise = {
  hidden: { opacity: 0, y: 22 },
  shown: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT, delay },
  }),
};

/** A rubber stamp landing on paper. */
export const stamp = (angle) => ({
  hidden: { opacity: 0, scale: 1.7, rotate: angle - 22 },
  shown: {
    opacity: 1,
    scale: 1,
    rotate: angle,
    transition: { duration: DURATION.base, ease: EASE_OUT, delay: 0.15 },
  },
});
