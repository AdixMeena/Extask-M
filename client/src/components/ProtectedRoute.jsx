import { useIsPresent } from 'framer-motion';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ErrorState, PageSkeleton } from './States.jsx';

/** Shows the page only to logged-in users; others are sent to the login page. */
export default function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();
  // A page that is animating away must not redirect anyone.
  const present = useIsPresent();

  if (status === 'loading') return <PageSkeleton />;
  if (status === 'offline') {
    return (
      <div className="container section">
        <ErrorState error={{ message: 'Cannot reach the ExTask server.' }} onRetry={retry} />
      </div>
    );
  }
  if (status !== 'user') {
    return present ? <Navigate to="/login" replace state={{ from: location }} /> : null;
  }
  return <Outlet />;
}
