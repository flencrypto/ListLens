import { PostHog } from "posthog-node";

const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST ?? "https://app.posthog.com";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!apiKey) return null;
  if (!_client) {
    _client = new PostHog(apiKey, { host, flushAt: 20, flushInterval: 10000 });
  }
  return _client;
}

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  const client = getClient();
  if (!client) return;
  try {
    client.capture({ distinctId, event, properties });
  } catch {
    // non-fatal — analytics must never break request handling
  }
}

export async function shutdownPostHog(): Promise<void> {
  if (_client) {
    await _client.shutdown();
    _client = null;
  }
}
