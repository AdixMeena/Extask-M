import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="logo">
      <img src="/favicon.svg" alt="" width="32" height="32" />
      ExTask
    </Link>
  );
}
