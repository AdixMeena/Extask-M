import { Link, useLocation, useParams } from 'react-router-dom';
import { listTaskBids } from '../api/bids.js';
import { cancelTask, completeTask, fetchTask, selectBid } from '../api/tasks.js';
import BidForm from '../components/BidForm.jsx';
import BidList from '../components/BidList.jsx';
import BudgetStamp from '../components/BudgetStamp.jsx';
import Checkmark from '../components/Checkmark.jsx';
import ConfirmButton from '../components/ConfirmButton.jsx';
import ContactCard from '../components/ContactCard.jsx';
import Icon from '../components/Icon.jsx';
import PersonLine from '../components/PersonLine.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import ReviewList from '../components/ReviewList.jsx';
import { ErrorState, ListSkeleton, PageSkeleton } from '../components/States.jsx';
import StatusTag from '../components/StatusTag.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { usePolling } from '../hooks/usePolling.js';
import { useToast } from '../hooks/useToast.js';
import { BID_STATUS } from '../lib/constants.js';
import { formatDate, plural, rupees, timeAgo } from '../lib/format.js';

/** How often the poster's page looks for new bids. */
const BID_REFRESH_MS = 10_000;

export default function TaskDetail() {
  const { id } = useParams();
  const { user, status } = useAuth();
  const toast = useToast();

  const { data, error, loading, reload, setData } = useAsync(
    // Wait until we know who is looking: the answer depends on it.
    () => (status === 'loading' ? new Promise(() => {}) : fetchTask(id)),
    [id, user?.id, status === 'loading'],
  );
  useDocumentTitle(data?.task.title);

  if (error && !data) {
    return (
      <div className="container section">
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />
        <p className="center">
          <Link to="/tasks">Back to all tasks</Link>
        </p>
      </div>
    );
  }
  if (!data) return <PageSkeleton />;

  const { task, reviews, viewer } = data;

  // Each action returns the fresh task, which replaces what is on screen.
  const act = async (action, message) => {
    try {
      setData(await action());
      toast(message);
    } catch (actionError) {
      toast(actionError.message);
      reload();
    }
  };

  return (
    <div className="container section detail" aria-busy={loading}>
      <header className="detail__head">
        <div>
          <StatusTag status={task.status} />
          <h1>{task.title}</h1>
          <ul className="meta">
            {task.location && (
              <li>
                <Icon name="location" />
                {task.location}
              </li>
            )}
            {task.category && (
              <li>
                <Icon name="tag" />
                {task.category}
              </li>
            )}
            {task.deadline && (
              <li>
                <Icon name="calendar" />
                Needed by {formatDate(task.deadline)}
              </li>
            )}
            <li>
              <Icon name="bids" />
              {plural(task.bidCount, 'bid')}
            </li>
          </ul>
        </div>
        <BudgetStamp amount={task.budget} large />
      </header>

      <div className="detail__main stack-large">
        <section>
          <h2>Details</h2>
          <p className="description">{task.description}</p>
        </section>

        {task.status === 'completed' && (
          <section className="done">
            <Checkmark />
            <div>
              <h2>Job done</h2>
              <p>This task has been completed.</p>
            </div>
          </section>
        )}

        {viewer?.isOwner ? (
          <OwnerPanel task={task} act={act} reload={reload} />
        ) : (
          <VisitorPanel task={task} viewer={viewer} reload={reload} />
        )}

        {task.status === 'completed' &&
          viewer &&
          (viewer.isOwner || viewer.isHired) &&
          viewer.contact &&
          !viewer.hasReviewed && (
            <ReviewForm taskId={task.id} personName={viewer.contact.name} onSaved={reload} />
          )}

        {reviews.length > 0 && (
          <section>
            <h2>Ratings for this job</h2>
            <ReviewList reviews={reviews} />
          </section>
        )}
      </div>

      <aside className="detail__side stack">
        <div className="note">
          <h2>Posted by</h2>
          <PersonLine person={task.poster} />
          <p className="muted small">Posted {timeAgo(task.created_at)}</p>
        </div>
        {viewer?.contact && (
          <ContactCard contact={viewer.contact} hired={viewer.hired} isOwner={viewer.isOwner} />
        )}
      </aside>
    </div>
  );
}

/** What the person who posted the task can do. */
function OwnerPanel({ task, act, reload }) {
  const open = task.status === 'open';
  const bids = useAsync(() => listTaskBids(task.id), [task.id, task.status]);

  usePolling(
    () => {
      bids.reload();
      reload();
    },
    BID_REFRESH_MS,
    open,
  );

  const list = bids.data?.bids;

  return (
    <>
      {task.status === 'assigned' && (
        <section className="note">
          <h2>Has the work been done?</h2>
          <p>Mark it completed so that both of you can rate each other.</p>
          <ConfirmButton
            className="btn btn--teal"
            question="Mark this task as completed? This cannot be undone."
            confirmLabel="Yes, it is done"
            onConfirm={() => act(() => completeTask(task.id), 'Task completed')}
          >
            Mark as completed
          </ConfirmButton>
        </section>
      )}

      <section>
        <h2>Bids on your task</h2>
        {open && <p className="muted">New bids appear here on their own.</p>}
        {!list && bids.loading && <ListSkeleton />}
        {!list && bids.error && <ErrorState error={bids.error} onRetry={bids.reload} />}
        {list?.length === 0 && (
          <p className="empty">
            {open ? 'No bids yet. They usually take a little while.' : 'Nobody bid on this task.'}
          </p>
        )}
        {list?.length > 0 && (
          <BidList
            bids={list}
            taskOpen={open}
            onSelect={(bid) =>
              act(() => selectBid(task.id, bid.id), `You hired ${bid.bidder.name}`)
            }
          />
        )}
      </section>

      {open && (
        <ConfirmButton
          className="link-button link-button--danger"
          question="Cancel this task? Waiting bids will be declined."
          confirmLabel="Yes, cancel task"
          onConfirm={() => act(() => cancelTask(task.id), 'Task cancelled')}
        >
          Cancel this task
        </ConfirmButton>
      )}
    </>
  );
}

/** What everyone else sees: a way to bid, or where their bid stands. */
function VisitorPanel({ task, viewer, reload }) {
  const location = useLocation();
  const myBid = viewer?.myBid;

  if (task.status === 'open') {
    if (!viewer) {
      return (
        <section className="note">
          <h2>Can you do this?</h2>
          <p>Log in to send your price and free time.</p>
          <Link to="/login" state={{ from: location }} className="btn btn--primary">
            Log in to bid
          </Link>
        </section>
      );
    }
    return <BidForm key={myBid?.updated_at ?? 'new'} task={task} myBid={myBid} onSaved={reload} />;
  }

  if (myBid) {
    return (
      <section className="note">
        <h2>Your bid</h2>
        <p>
          You offered <strong>{rupees(myBid.amount)}</strong>.{' '}
          <StatusTag status={myBid.status} map={BID_STATUS} />
        </p>
      </section>
    );
  }

  return task.status === 'completed' ? null : (
    <p className="empty">This task is no longer taking bids.</p>
  );
}
