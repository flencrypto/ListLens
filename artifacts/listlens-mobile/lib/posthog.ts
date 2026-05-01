import PostHog from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const host =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

let _client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (!apiKey) return null;
  if (!_client) {
    _client = new PostHog(apiKey, { host });
  }
  return _client;
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  const client = getPostHogClient();
  if (!client) return;
  try {
    client.capture(event, properties as Record<string, string | number | boolean | null>);
  } catch {
    // non-fatal
  }
}

export function identifyMobileUser(userId: string): void {
  const client = getPostHogClient();
  if (!client) return;
  try {
    client.identify(userId, { source: "mobile" });
  } catch {
    // non-fatal
  }
}

export function resetMobileUser(): void {
  const client = getPostHogClient();
  if (!client) return;
  try {
    client.reset();
  } catch {
    // non-fatal
  }
}
