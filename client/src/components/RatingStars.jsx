import { motion } from 'framer-motion';
import { useId, useState } from 'react';
import { DURATION } from '../lib/motion.js';
import Icon from './Icon.jsx';

const STARS = [1, 2, 3, 4, 5];

/** Read-only stars; part of a star is filled for averages such as 4.5. */
export function Stars({ value, size = 18 }) {
  return (
    <span className="stars" role="img" aria-label={`${Number(value).toFixed(1)} out of 5`}>
      {STARS.map((star) => (
        <span key={star} className="stars__item">
          <Icon name="star" size={size} />
          <span
            className="stars__fill"
            style={{ width: `${Math.max(0, Math.min(1, value - star + 1)) * 100}%` }}
          >
            <Icon name="star" size={size} className="icon--filled" />
          </span>
        </span>
      ))}
    </span>
  );
}

const WORDS = ['', 'Poor', 'Below average', 'Okay', 'Good', 'Excellent'];

/** Clickable stars. Built on radio buttons, so arrow keys work too. */
export function StarPicker({ value, onChange, error }) {
  const [hovered, setHovered] = useState(0);
  const name = useId();
  const shown = hovered || value;

  return (
    <fieldset className="picker">
      <legend>Your rating</legend>
      <div className="picker__row" onMouseLeave={() => setHovered(0)}>
        {STARS.map((star) => (
          <label key={star} onMouseEnter={() => setHovered(star)}>
            <input
              type="radio"
              name={name}
              className="visually-hidden"
              checked={value === star}
              onChange={() => onChange(star)}
            />
            <span className="picker__star">
              <Icon name="star" size={34} />
              <motion.span
                className="picker__fill"
                initial={false}
                animate={{ scale: star <= shown ? 1 : 0.3, opacity: star <= shown ? 1 : 0 }}
                transition={{ duration: DURATION.fast, delay: star <= shown ? star * 0.03 : 0 }}
              >
                <Icon name="star" size={34} className="icon--filled" />
              </motion.span>
            </span>
            <span className="visually-hidden">
              {star} out of 5, {WORDS[star]}
            </span>
          </label>
        ))}
        <span className="picker__word" aria-hidden="true">
          {WORDS[shown]}
        </span>
      </div>
      {error && <p className="field__note field__note--error">{error}</p>}
    </fieldset>
  );
}
