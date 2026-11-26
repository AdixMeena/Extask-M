/**
 * Server entry point.
 *
 * Vercel looks for a file like this that imports express and exports the app.
 * Everywhere else (your laptop, Render, Railway) we also start listening.
 */
import 'express';
import { env, missingEnv } from './config/env.js';
import { createApp } from './createApp.js';

const app = createApp();

if (!process.env.VERCEL) {
  app.listen(env.port, (error) => {
    // Express 5 reports problems such as "port already in use" here.
    if (error) {
      console.error(`Could not start the server: ${error.message}`);
      process.exit(1);
    }
    console.log(`ExTask API running at http://localhost:${env.port}/api`);

    const missing = missingEnv();
    if (missing.length) {
      console.warn(`Warning: set ${missing.join(', ')} in server/.env, then restart.`);
    }
  });
}

export default app;
