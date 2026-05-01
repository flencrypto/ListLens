import posthog from "posthog-js";

const apiKey = import.meta.env.VITE_POSTHOG_API_KEY as string | undefined;
const apiHost =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
  "https://app.posthog.com";

let initialised = false;

export function initPostHog(): void {
  if (initialised || !apiKey) return;
  posthog.init(apiKey, {
    api_host: apiHost,
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: { recordCrossOriginIframes: false },
    disable_session_recording: true,
  });
  initialised = true;
}

export function identifyUser(userId: string): void {
  if (!initialised) return;
  posthog.identify(userId, { source: "web" });
}

export function resetUser(): void {
  if (!initialised) return;
  posthog.reset();
}

export function capture(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (!initialised) return;
  posthog.capture(event, properties);
}
