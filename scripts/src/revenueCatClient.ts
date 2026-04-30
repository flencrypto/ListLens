import { createClient } from "@replit/revenuecat-sdk/client";

let connectionSettings: { settings?: { expires_at?: string; access_token?: string; oauth?: { credentials?: { access_token?: string } } } } | undefined;

async function getApiKey(): Promise<string> {
  if (
    connectionSettings?.settings?.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now() &&
    connectionSettings.settings.access_token
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  const res = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=revenuecat",
    {
      headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
    },
  );
  const data = (await res.json()) as { items?: typeof connectionSettings[] };
  connectionSettings = data.items?.[0];

  const accessToken =
    connectionSettings?.settings?.access_token ??
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("RevenueCat not connected");
  }
  return accessToken;
}

export async function getUncachableRevenueCatClient() {
  const apiKey = await getApiKey();
  return createClient({
    baseUrl: "https://api.revenuecat.com/v2",
    headers: { Authorization: "Bearer " + apiKey },
  });
}
