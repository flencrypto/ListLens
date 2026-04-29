// This file configures the initialization of Sentry for edge features (middleware, edge routes, ...).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Env-driven sampling so production volume/cost can be tuned without redeploys.
// Default is a conservative 10% — override via SENTRY_TRACES_SAMPLE_RATE.
const parsed = Number(process.env.SENTRY_TRACES_SAMPLE_RATE);
const tracesSampleRate =
  Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0.1;

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
