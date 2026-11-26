import { useEffect } from 'react';

/** Names the browser tab after the current page. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ExTask` : 'ExTask: post a task, get bids';
  }, [title]);
}
