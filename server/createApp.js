/**
 * Builds the Express app without starting it, so the same app can run locally,
 * on Vercel, and inside tests.
 */
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  // Hosting platforms sit behind a proxy; this gives the real visitor address.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      // Only the listed websites may call the API from a browser.
      origin: env.clientUrls,
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '20kb' }));
  if (env.nodeEnv === 'development') app.use(morgan('dev'));

  app.get('/', (_req, res) => res.json({ name: 'ExTask API', health: '/api/health' }));
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
