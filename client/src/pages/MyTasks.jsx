import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyTasks } from '../api/tasks.js';
import Reveal from '../components/Reveal.jsx';
import { EmptyState, ErrorState, ListSkeleton } from '../components/States.jsx';
import StatusTag from '../components/StatusTag.jsx';
import Tabs from '../components/Tabs.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatDate, plural, rupees, timeAgo } from '../lib/format.js';

const FILTERS = [
  ['all', 'All'],
  ['open', 'Open'],
  ['assigned', 'Hired'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
];

export default function MyTasks() {
  useDocumentTitle('My tasks');
  const { data, error, loading, reload } = useAsync(listMyTasks, []);
  const [filter, setFilter] = useState('all');

  const tasks = data?.tasks ?? [];
  const shown = tasks.filter((task) => filter === 'all' || task.status === filter);

  return (
    <div className="container container--narrow section">
      <div className="section__head">
        <h1>Tasks you posted</h1>
        <Link to="/post" className="btn btn--primary">
          Post a task
        </Link>
      </div>

      {loading && !data && <ListSkeleton />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && tasks.length === 0 && (
        <EmptyState
          title="You have not posted anything yet"
          action={
            <Link to="/post" className="btn btn--primary">
              Post your first task
            </Link>
          }
        >
          A leaking tap, a heavy cupboard, a child who needs tuition: start there.
        </EmptyState>
      )}

      {tasks.length > 0 && (
        <>
          <Tabs
            label="Filter by status"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            count={(key) => tasks.filter((task) => key === 'all' || task.status === key).length}
          />
          {shown.length === 0 && <p className="empty">No tasks in this list.</p>}
          <ul className="stack">
            {shown.map((task, index) => (
              <Reveal as="li" key={task.id} delay={Math.min(index, 5) * 0.05} className="item">
                <div className="item__main">
                  <h2>
                    <Link to={`/tasks/${task.id}`} className="card__link">
                      {task.title}
                    </Link>
                  </h2>
                  <p className="muted small">
                    Posted {timeAgo(task.created_at)}
                    {task.deadline && `. Needed by ${formatDate(task.deadline)}`}
                  </p>
                </div>
                <div className="item__side">
                  <strong className="item__amount">{rupees(task.budget)}</strong>
                  <StatusTag status={task.status} />
                  <span className="small">{plural(task.bidCount, 'bid')}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
