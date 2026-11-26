import { AnimatePresence, MotionConfig } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import PageTransition from './components/PageTransition.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { PageSkeleton } from './components/States.jsx';
import Home from './pages/Home.jsx';

// Each page is downloaded the first time someone opens it.
const Register = lazy(() => import('./pages/Register.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const BrowseTasks = lazy(() => import('./pages/BrowseTasks.jsx'));
const TaskDetail = lazy(() => import('./pages/TaskDetail.jsx'));
const PostTask = lazy(() => import('./pages/PostTask.jsx'));
const MyTasks = lazy(() => import('./pages/MyTasks.jsx'));
const MyBids = lazy(() => import('./pages/MyBids.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const location = useLocation();

  return (
    // reducedMotion="user" follows the system "reduce motion" setting.
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
          <PageTransition key={location.pathname}>
            <ErrorBoundary>
              <Suspense fallback={<PageSkeleton />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/tasks" element={<BrowseTasks />} />
                  <Route path="/tasks/:id" element={<TaskDetail />} />
                  <Route path="/users/:id" element={<Profile />} />

                  {/* Pages that need a logged-in user */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/post" element={<PostTask />} />
                    <Route path="/my-tasks" element={<MyTasks />} />
                    <Route path="/my-bids" element={<MyBids />} />
                    <Route path="/profile" element={<Profile own />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </MotionConfig>
  );
}
