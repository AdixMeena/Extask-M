import { Link } from 'react-router-dom';
import { initials, plural } from '../lib/format.js';
import Icon from './Icon.jsx';
import VerifiedBadge from './VerifiedBadge.jsx';

/** A person's initials, name, badge and rating in one line. */
export default function PersonLine({ person, link = true }) {
  const name = link ? <Link to={`/users/${person.id}`}>{person.name}</Link> : person.name;

  return (
    <div className="person">
      <span className="avatar" aria-hidden="true">
        {initials(person.name)}
      </span>
      <div>
        <p className="person__name">
          {name}
          {person.id_verified && <VerifiedBadge compact />}
        </p>
        <p className="person__rating">
          {person.rating_count ? (
            <>
              <Icon name="star" size={14} className="icon--filled" />
              {Number(person.rating_avg).toFixed(1)} from {plural(person.rating_count, 'review')}
            </>
          ) : (
            'No reviews yet'
          )}
        </p>
      </div>
    </div>
  );
}
