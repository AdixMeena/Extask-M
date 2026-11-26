import { Link } from 'react-router-dom';
import { listTasks } from '../../api/tasks.js';
import { useAsync } from '../../hooks/useAsync.js';
import Reveal from '../Reveal.jsx';
import { CardSkeletons, EmptyState, ErrorState } from '../States.jsx';
import TaskBoard from '../TaskBoard.jsx';

export default function LatestTasks() {
  const { data, error, loading, reload } = useAsync(() => listTasks({ limit: 6 }), []);

  return (
    <section className="container section">
      <Reveal className="section__head">
        <h2>On the board right now</h2>
        <Link to="/tasks">See all open tasks</Link>
      </Reveal>

      {loading && !data && <CardSkeletons count={3} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data &&
        (data.tasks.length ? (
          <TaskBoard tasks={data.tasks} />
        ) : (
          <EmptyState
            title="The board is empty"
            action={
              <Link to="/post" className="btn btn--primary">
                Post the first task
              </Link>
            }
          >
            Nothing is open at the moment.
          </EmptyState>
        ))}
    </section>
  );
}
