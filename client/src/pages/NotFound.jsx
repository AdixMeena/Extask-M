import { Link } from 'react-router-dom';
import Pin from '../components/Pin.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <div className="container section">
      <div className="note note--center note--tilted">
        <Pin />
        <h1>This notice has been taken down</h1>
        <p>The page you asked for does not exist.</p>
        <Link to="/" className="btn btn--primary">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
