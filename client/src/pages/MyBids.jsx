import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyBids } from '../api/bids.js';
import Reveal from '../components/Reveal.jsx';
import { EmptyState, ErrorState, ListSkeleton } from '../components/States.jsx';
import StatusTag from '../components/StatusTag.jsx';
import Tabs from '../components/Tabs.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { usePolling } from '../hooks/usePolling.js';
import { BID_STATUS, TASK_STATUS } from '../lib/constants.js';
import { rupees, timeAgo } from '../lib/format.js';

const FILTERS = [
  ['all', 'All'],
  ['pending', 'Waiting'],
  ['accepted', 'Hired'],
  ['rejected', 'Not selected'],
];

export default function MyBids() {
  useDocumentTitle('My bids');
  const { data, error, loading, reload } = useAsync(listMyBids, []);
  const [filter, setFilter] = useState('all');
  usePolling(reload, 15_000);

  const bids = data?.bids ?? [];
  const shown = bids.filter((bid) => filter === 'all' || bid.status === filter);

  return (
    <div className="container container--narrow section">
      <h1>Your bids</h1>

      {loading && !data && <ListSkeleton />}
      {error && !data && <ErrorState error={error} onRetry={reload} />}

      {data && bids.length === 0 && (
        <EmptyState
          title="You have not bid on anything yet"
          action={
            <Link to="/tasks" className="btn btn--primary">
              Find a task
            </Link>
          }
        >
          Pick a task you can do and name your price.
        </EmptyState>
      )}

      {bids.length > 0 && (
        <>
          <Tabs
            label="Filter by bid status"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            count={(key) => bids.filter((bid) => key === 'all' || bid.status === key).length}
          />
          {shown.length === 0 && <p className="empty">No bids in this list.</p>}
          <ul className="stack">
            {shown.map((bid, index) => (
              <Reveal as="li" key={bid.id} delay={Math.min(index, 5) * 0.05} className="item">
                <div className="item__main">
                  <h2>
                    <Link to={`/tasks/${bid.task.id}`} className="card__link">
                      {bid.task.title}
                    </Link>
                  </h2>
                  <p className="muted small">
                    For {bid.task.poster.name}. Budget {rupees(bid.task.budget)}. Task:{' '}
                    {TASK_STATUS[bid.task.status].label.toLowerCase()}. Bid updated{' '}
                    {timeAgo(bid.updated_at)}.
                  </p>
                </div>
                <div className="item__side">
                  <strong className="item__amount">{rupees(bid.amount)}</strong>
                  <StatusTag status={bid.status} map={BID_STATUS} />
                </div>
              </Reveal>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
