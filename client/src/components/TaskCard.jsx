import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, plural, tiltFor, timeAgo } from '../lib/format.js';
import { DURATION, EASE_OUT } from '../lib/motion.js';
import BudgetStamp from './BudgetStamp.jsx';
import Icon from './Icon.jsx';
import Pin from './Pin.jsx';
import StatusTag from './StatusTag.jsx';
import VerifiedBadge from './VerifiedBadge.jsx';

/**
 * A task as a pinned piece of paper. It sits slightly tilted and straightens
 * when pointed at or focused. `preview` draws it without a link (post form).
 */
export default function TaskCard({ task, preview = false }) {
  const still = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const tilt = tiltFor(task.id);

  return (
    <motion.article
      className="card"
      initial="rest"
      animate={focused ? 'hover' : 'rest'}
      whileHover={still ? undefined : 'hover'}
      variants={{
        rest: { rotate: tilt, y: 0 },
        hover: { rotate: 0, y: still ? 0 : -6 },
      }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <Pin tone={task.status === 'completed' ? 'teal' : 'orange'} />

      <div className="card__top">
        <h3>
          {preview ? (
            task.title
          ) : (
            // The link is stretched over the whole card with CSS.
            <Link to={`/tasks/${task.id}`} className="card__link">
              {task.title}
            </Link>
          )}
        </h3>
        <BudgetStamp amount={Number(task.budget)} />
      </div>

      <p className="card__text">{task.description}</p>

      <ul className="meta">
        {task.location && (
          <li>
            <Icon name="location" size={15} />
            {task.location}
          </li>
        )}
        {task.category && (
          <li>
            <Icon name="tag" size={15} />
            {task.category}
          </li>
        )}
        {task.deadline && (
          <li>
            <Icon name="calendar" size={15} />
            By {formatDate(task.deadline)}
          </li>
        )}
      </ul>

      <footer className="card__footer">
        <span className="card__poster">
          {task.poster?.name}
          {task.poster?.id_verified && <VerifiedBadge compact />}
          {task.created_at && <small>{timeAgo(task.created_at)}</small>}
        </span>
        {task.status === 'open' ? (
          <span className="card__bids">
            {task.bidCount ? plural(task.bidCount, 'bid') : 'No bids yet'}
          </span>
        ) : (
          <StatusTag status={task.status} />
        )}
      </footer>
    </motion.article>
  );
}
