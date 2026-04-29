// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Only NEXT_PUBLIC_* vars are inlined into client bundles by Next.js, so the
  // DSN must come from NEXT_PUBLIC_SENTRY_DSN. Server/edge runtimes use the
  // private SENTRY_DSN in their respective config files.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay sampling. Mask everything by default — listings/photos/prices are sensitive.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Required for Sentry to instrument client-side router transitions in Next.js App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
