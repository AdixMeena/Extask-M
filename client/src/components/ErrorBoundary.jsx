import { Component } from 'react';

/**
 * Catches crashes while drawing a page, so one broken page does not blank the
 * whole site. (It also covers a page file that failed to download.)
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="container section">
        <div className="note note--center">
          <h1>This page did not load</h1>
          <p>Reload to try again. If it keeps happening, check your connection.</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
