// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Sampling rates are env-driven so production volume/cost can be tuned without
// code changes. Defaults are conservative: 10% traces, 0% session replays
// (replays still capture 100% on errors so we never miss a real issue).
function rate(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
}

const tracesSampleRate = rate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.1);
const replaysOnErrorSampleRate = rate(
  process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
  1.0,
);
const replaysSessionSampleRate = rate(
  process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
  0,
);

Sentry.init({
  // Only NEXT_PUBLIC_* vars are inlined into client bundles by Next.js, so the
  // DSN must come from NEXT_PUBLIC_SENTRY_DSN. Server/edge runtimes use the
  // private SENTRY_DSN in their respective config files.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay sampling. Mask everything by default — listings/photos/prices are sensitive.
  replaysOnErrorSampleRate,
  replaysSessionSampleRate,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Required for Sentry to instrument client-side router transitions in Next.js App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
