import { Link } from 'react-router-dom';
import { timeAgo } from '../lib/format.js';
import { Stars } from './RatingStars.jsx';
import Reveal from './Reveal.jsx';

export default function ReviewList({ reviews }) {
  return (
    <ul className="stack">
      {reviews.map((review, index) => (
        <Reveal as="li" key={review.id} delay={Math.min(index, 4) * 0.06} className="review">
          <Stars value={review.rating} size={16} />
          {review.comment && <p className="review__comment">{review.comment}</p>}
          <p className="muted small">
            From <Link to={`/users/${review.reviewer.id}`}>{review.reviewer.name}</Link>,{' '}
            {timeAgo(review.created_at)}
            {review.task && (
              <>
                , for <Link to={`/tasks/${review.task.id}`}>{review.task.title}</Link>
              </>
            )}
          </p>
        </Reveal>
      ))}
    </ul>
  );
}
