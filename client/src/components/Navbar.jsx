import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { initials } from '../lib/format.js';
import { DURATION, EASE_OUT } from '../lib/motion.js';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

/** Hides while scrolling down and returns as soon as you scroll up. */
export default function Navbar() {
  const { user, status, logout } = useAuth();
  const { pathname } = useLocation();
  const still = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [focused, setFocused] = useState(false);
  // Remembering the page the menu was opened on closes it after navigating.
  const [menuPath, setMenuPath] = useState(null);
  const menuOpen = menuPath === pathname;

  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (Math.abs(current - previous) < 4) return;
    setHidden(current > previous && current > 120);
  });

  return (
    <motion.header
      className="nav"
      // Never hide while someone is using it.
      animate={{ y: hidden && !menuOpen && !focused && !still ? '-105%' : '0%' }}
      transition={{ duration: DURATION.base, ease: EASE_OUT }}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => event.key === 'Escape' && setMenuPath(null)}
    >
      <div className="container nav__inner">
        <Logo />

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuPath(menuOpen ? null : pathname)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
          <span className="visually-hidden">Menu</span>
        </button>

        <nav
          id="nav-menu"
          className={`nav__menu ${menuOpen ? 'nav__menu--open' : ''}`}
          aria-label="Main"
          // Closes the menu even when the link points to the current page.
          onClick={(event) => event.target.closest('a') && setMenuPath(null)}
        >
          <NavLink to="/tasks" end>
            Browse tasks
          </NavLink>

          {status === 'user' && (
            <>
              <NavLink to="/my-tasks">My tasks</NavLink>
              <NavLink to="/my-bids">My bids</NavLink>
              <NavLink to="/profile" className="nav__profile">
                <span className="avatar avatar--small" aria-hidden="true">
                  {initials(user.name)}
                </span>
                Profile
              </NavLink>
              <button type="button" className="nav__logout" onClick={logout}>
                Log out
              </button>
              <Link to="/post" className="btn btn--primary btn--small">
                <Icon name="plus" size={16} />
                Post a task
              </Link>
            </>
          )}

          {status === 'guest' && (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn--primary btn--small">
                Join ExTask
              </Link>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
