import Underline from './Underline.jsx';

/** The two-column layout shared by the login and register pages. */
export default function AuthLayout({ title, children }) {
  return (
    <div className="container section auth">
      <div className="auth__intro">
        <h1>{title}</h1>
        <p>
          One account lets you <Underline>post tasks and bid</Underline> on them.
        </p>
      </div>
      {children}
    </div>
  );
}
