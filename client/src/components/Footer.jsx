import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <Logo />
          <p>India&apos;s First Open Task-Bidding Marketplace</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/tasks">Browse tasks</Link>
          <Link to="/post">Post a task</Link>
          <Link to="/register">Join</Link>
        </nav>
        <p className="muted small">
          A Minor Project by third year CSE and IT students, Jawaharlal Institute of Technology,
          Borawan.
        </p>
      </div>
    </footer>
  );
}
