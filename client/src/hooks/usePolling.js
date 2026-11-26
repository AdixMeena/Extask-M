import { useEffect, useEffectEvent } from 'react';

/** Runs `task` every `interval` ms while enabled and the tab is visible. */
export function usePolling(task, interval, enabled = true) {
  const tick = useEffectEvent(() => {
    if (!document.hidden) task();
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => tick(), interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
}
