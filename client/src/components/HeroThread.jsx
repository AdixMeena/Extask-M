import { motion, useReducedMotion } from 'framer-motion';
import { DURATION, EASE_OUT } from '../lib/motion.js';

const NOTES = [
  {
    title: 'A problem nearby',
    text: 'Kitchen tap leaking since Monday. Vijay Nagar, Indore.',
    className: 'thread__note--one',
    tilt: -2,
    delay: 0.35,
  },
  {
    title: 'An idle skill',
    text: 'Ramesh fixes taps and is free after 6 pm.',
    className: 'thread__note--two',
    tilt: 1.5,
    delay: 0.85,
  },
  {
    title: 'ExTask connects them',
    text: 'His bid of ₹350 is accepted. Done the same evening.',
    className: 'thread__note--three',
    tilt: -1,
    delay: 1.35,
  },
];

/**
 * Three pinned notes joined by a string that draws itself: the idea of ExTask in
 * one picture. The path points match the note positions in pages.css.
 */
export default function HeroThread() {
  const still = useReducedMotion();

  const line = (delay) => ({
    initial: still ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: DURATION.slow, delay, ease: 'easeOut' },
  });

  return (
    <div className="thread">
      <svg viewBox="0 0 400 420" aria-hidden="true">
        <motion.path d="M240 52C318 42 330 92 292 160" {...line(0.55)} />
        <motion.path d="M292 262C322 340 300 372 240 368" {...line(1.05)} />
        <circle cx="240" cy="52" r="7" />
        <circle cx="292" cy="160" r="7" />
        <circle cx="292" cy="262" r="7" />
        <circle cx="240" cy="368" r="7" className="thread__end" />
      </svg>
      <ol>
        {NOTES.map((note) => (
          <motion.li
            key={note.title}
            className={`thread__note ${note.className}`}
            initial={still ? false : { opacity: 0, y: 18, rotate: note.tilt * 3 }}
            animate={{ opacity: 1, y: 0, rotate: note.tilt }}
            transition={{ duration: DURATION.base, delay: note.delay, ease: EASE_OUT }}
          >
            <h2>{note.title}</h2>
            <p>{note.text}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
