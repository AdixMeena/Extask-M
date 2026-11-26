import { motion, useInView, useReducedMotion } from 'framer-motion';
import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import HeroThread from '../components/HeroThread.jsx';
import Reveal from '../components/Reveal.jsx';
import Underline from '../components/Underline.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { DURATION, EASE_OUT } from '../lib/motion.js';

// Sections below the first screen are downloaded only when they come close.
const LatestTasks = lazy(() => import('../components/home/LatestTasks.jsx'));
const HowItWorks = lazy(() => import('../components/home/HowItWorks.jsx'));
const Community = lazy(() => import('../components/home/Community.jsx'));

const HEADLINE = ['Somewhere', 'near', 'you,', 'someone', 'can', 'fix', 'it', 'in'];

function Word({ children, index }) {
  const still = useReducedMotion();
  return (
    <motion.span
      className="word"
      initial={still ? false : { opacity: 0, y: '0.45em' }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, delay: index * 0.06, ease: EASE_OUT }}
    >
      {children}
    </motion.span>
  );
}

function WhenNear({ children, minHeight }) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: '300px' });

  return (
    <div ref={ref} style={near ? undefined : { minHeight }}>
      {near && <Suspense fallback={<div style={{ minHeight }} />}>{children}</Suspense>}
    </div>
  );
}

export default function Home() {
  useDocumentTitle();

  return (
    <>
      <section className="container hero">
        <div className="hero__copy">
          <h1>
            {HEADLINE.map((word, index) => (
              <span key={word}>
                <Word index={index}>{word}</Word>{' '}
              </span>
            ))}
            <Word index={HEADLINE.length}>
              <Underline delay={0.85}>20 minutes.</Underline>
            </Word>
          </h1>
          <p className="hero__lead">
            Post any small job with your budget. People nearby bid with their price and time. You
            pick one, and it gets done.
          </p>
          <div className="row">
            <Link to="/post" className="btn btn--primary">
              Post a task
            </Link>
            <Link to="/tasks" className="btn">
              Browse open tasks
            </Link>
          </div>
          <p className="hero__note">
            Taps, tuition, shifting, typing, errands. There is no fixed list of services.
          </p>
        </div>
        <HeroThread />
      </section>

      <WhenNear minHeight={600}>
        <LatestTasks />
      </WhenNear>
      <WhenNear minHeight={500}>
        <HowItWorks />
      </WhenNear>
      <WhenNear minHeight={500}>
        <Community />
      </WhenNear>

      <section className="container section">
        <Reveal className="banner">
          <h2>Got a skill and a free evening?</h2>
          <p>Someone near you may be waiting for exactly that.</p>
          <Link to="/tasks" className="btn btn--primary">
            See open tasks
          </Link>
        </Reveal>
      </section>
    </>
  );
}
