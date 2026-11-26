/** The single place where errors become HTTP responses. */
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function notFound(req, _res, next) {
  next(new AppError(404, `No such API route: ${req.method} ${req.path}`));
}

// Express recognises an error handler by its four arguments.
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let message = 'Something went wrong on our side. Please try again.';
  let details;

  if (err instanceof ZodError) {
    status = 400;
    details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    message = details[0]?.message ?? 'Check the form and try again.';
  } else if (err instanceof AppError) {
    status = err.status;
    if (err.expose) message = err.message;
    details = err.details;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body is not valid JSON.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'That request is too large.';
  }

  if (status >= 500 && env.nodeEnv !== 'test') console.error(err);

  res.status(status).json({ error: { message, details } });
}
