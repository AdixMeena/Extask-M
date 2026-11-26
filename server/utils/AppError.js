/**
 * An error we expect (bad input, not allowed, not found). Its message is shown
 * to the user. Anything that is not an AppError becomes a generic 500.
 */
export class AppError extends Error {
  /**
   * @param {number} status  HTTP status code
   * @param {string} message Friendly message
   * @param {{ details?: Array<{field: string, message: string}>, expose?: boolean }} [options]
   */
  constructor(status, message, { details, expose } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
    // 5xx messages are hidden unless we know they are safe to show.
    this.expose = expose ?? status < 500;
  }
}
