import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listTasks } from '../api/tasks.js';
import CategoryOptions from '../components/CategoryOptions.jsx';
import FormField from '../components/FormField.jsx';
import Icon from '../components/Icon.jsx';
import MoneyField from '../components/MoneyField.jsx';
import { CardSkeletons, EmptyState, ErrorState } from '../components/States.jsx';
import TaskBoard from '../components/TaskBoard.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { TASK_STATUS } from '../lib/constants.js';
import { plural } from '../lib/format.js';

const EMPTY = { q: '', category: '', location: '', minBudget: '', maxBudget: '', status: 'open' };

/**
 * Search and filters live in the address bar (?q=tap&location=indore), so a
 * search can be shared and the back button works.
 */
export default function BrowseTasks() {
  useDocumentTitle('Browse tasks');
  const [params, setParams] = useSearchParams();
  const applied = Object.fromEntries(
    Object.keys(EMPTY).map((key) => [key, params.get(key) ?? EMPTY[key]]),
  );
  const page = Number(params.get('page')) || 1;

  const { data, error, loading, reload } = useAsync(
    () => listTasks({ ...applied, page }),
    [params.toString()],
  );

  const apply = (filters, nextPage = 1) => {
    const entries = Object.entries(filters).filter(([key, value]) => value && value !== EMPTY[key]);
    if (nextPage > 1) entries.push(['page', String(nextPage)]);
    setParams(Object.fromEntries(entries));
  };

  const goToPage = (next) => {
    apply(applied, next);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="container section">
      <h1>Tasks on the board</h1>

      {/* The key resets the boxes when the address changes (back button). */}
      <Filters
        key={params.toString()}
        initial={applied}
        onApply={apply}
        onClear={() => setParams({})}
        filtered={params.size > 0}
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading || !data ? (
        <CardSkeletons />
      ) : data.tasks.length === 0 ? (
        <EmptyState
          title="No tasks match"
          action={
            <Link to="/post" className="btn btn--primary">
              Post a task
            </Link>
          }
        >
          Try fewer filters or a wider budget.
        </EmptyState>
      ) : (
        <>
          <p className="results" role="status">
            {plural(data.pagination.total, 'task')} found, newest first
          </p>
          <TaskBoard tasks={data.tasks} />
          {data.pagination.totalPages > 1 && (
            <nav className="pager" aria-label="Pages">
              <button
                type="button"
                className="btn btn--small"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Newer
              </button>
              <span>
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn btn--small"
                disabled={page >= data.pagination.totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Older
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function Filters({ initial, onApply, onClear, filtered }) {
  const [values, setValues] = useState(initial);

  const field = (name) => ({
    name,
    value: values[name],
    onChange: (event) => setValues({ ...values, [name]: event.target.value }),
  });

  return (
    <form
      className="note filters"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(values);
      }}
    >
      <div className="filters__search">
        <FormField
          label="Search"
          type="search"
          maxLength={80}
          placeholder="tap, tuition, shifting"
          {...field('q')}
        />
        <button type="submit" className="btn btn--primary">
          <Icon name="search" />
          Search
        </button>
      </div>
      <div className="filters__grid">
        <FormField label="Category" list="categories" maxLength={40} {...field('category')} />
        <FormField label="Location" maxLength={80} placeholder="Indore" {...field('location')} />
        <MoneyField label="Min budget" {...field('minBudget')} />
        <MoneyField label="Max budget" {...field('maxBudget')} />
        <FormField
          as="select"
          label="Status"
          name="status"
          value={values.status}
          // A drop-down takes effect straight away.
          onChange={(event) => onApply({ ...values, status: event.target.value })}
        >
          {Object.entries(TASK_STATUS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          <option value="all">All tasks</option>
        </FormField>
      </div>
      <CategoryOptions id="categories" />
      {filtered && (
        <button type="button" className="link-button" onClick={onClear}>
          Clear all filters
        </button>
      )}
    </form>
  );
}
