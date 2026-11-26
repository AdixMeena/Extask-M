import { useParams } from 'react-router-dom';
import { fetchUser, fetchUserReviews } from '../api/users.js';
import Icon from '../components/Icon.jsx';
import Pin from '../components/Pin.jsx';
import ProfileForm from '../components/ProfileForm.jsx';
import { Stars } from '../components/RatingStars.jsx';
import ReviewList from '../components/ReviewList.jsx';
import { ErrorState, PageSkeleton } from '../components/States.jsx';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatMonth, initials, plural } from '../lib/format.js';

/** /users/:id shows anyone's public profile; /profile (own) adds the edit form. */
export default function Profile({ own = false }) {
  const params = useParams();
  const { user: me } = useAuth();
  const id = own ? me.id : params.id;
  const isMe = me?.id === id;

  const { data, error, reload } = useAsync(async () => {
    const [{ user }, { reviews }] = await Promise.all([fetchUser(id), fetchUserReviews(id)]);
    return { user, reviews };
  }, [id]);

  const user = data?.user;
  useDocumentTitle(user?.name);

  if (error && !data) {
    return (
      <div className="container section">
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />
      </div>
    );
  }
  if (!user) return <PageSkeleton />;

  return (
    <div className="container section profile">
      <section className="note profile__card">
        <Pin tone={user.id_verified ? 'teal' : 'orange'} />
        <span className="avatar avatar--large" aria-hidden="true">
          {initials(user.name)}
        </span>
        <h1>{user.name}</h1>
        <p className="muted">@{user.username}</p>
        {user.id_verified && <VerifiedBadge />}

        <div className="profile__rating">
          {user.rating_count ? (
            <>
              <Stars value={user.rating_avg} size={22} />
              <p>
                <strong>{Number(user.rating_avg).toFixed(1)}</strong> from{' '}
                {plural(user.rating_count, 'review')}
              </p>
            </>
          ) : (
            <p className="muted">No reviews yet</p>
          )}
        </div>

        {user.location && (
          <p className="contact">
            <Icon name="location" />
            {user.location}
          </p>
        )}
        {user.bio && <p>{user.bio}</p>}
        <p className="muted small">Member since {formatMonth(user.created_at)}</p>
      </section>

      <div className="stack-large">
        {isMe && <ProfileForm onSaved={reload} />}
        <section>
          <h2>Reviews</h2>
          {data.reviews.length ? (
            <ReviewList reviews={data.reviews} />
          ) : (
            <p className="empty">
              {isMe
                ? 'Complete a task and your first review will appear here.'
                : 'Nobody has reviewed this person yet.'}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
