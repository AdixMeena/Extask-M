import { useCallback, useEffect, useEffectEvent, useState } from 'react';

/**
 * Loads data and tracks loading and errors.
 *
 * const { data, error, loading, reload, setData } = useAsync(() => fetchTask(id), [id]);
 *
 * It loads again whenever a value in `deps` changes. Old data stays visible
 * while the new data is on its way, and late replies to old requests are ignored.
 */
export function useAsync(load, deps) {
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([...deps, attempt]);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  const run = useEffectEvent(load);

  useEffect(() => {
    let current = true;
    run().then(
      (data) => current && setResult({ key, data, error: null }),
      // On failure the last good data is kept, so a network blip while
      // refreshing does not empty the page.
      (error) => current && setResult((previous) => ({ key, data: previous.data, error })),
    );
    return () => {
      current = false;
    };
  }, [key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback(
    (data) => setResult((previous) => ({ ...previous, data, error: null })),
    [],
  );

  const loading = result.key !== key;
  return { data: result.data, error: loading ? null : result.error, loading, reload, setData };
}
