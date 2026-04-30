import { db } from "@workspace/db";
import { ebayTokensTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const IS_SANDBOX = process.env["EBAY_SANDBOX"] !== "false";
const EBAY_API_URL = IS_SANDBOX
  ? "https://api.sandbox.ebay.com/ws/api.dll"
  : "https://api.ebay.com/ws/api.dll";
const EBAY_AUTH_URL = IS_SANDBOX
  ? "https://auth.sandbox.ebay.com/oauth2/authorize"
  : "https://auth.ebay.com/oauth2/authorize";
const EBAY_TOKEN_URL = IS_SANDBOX
  ? "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
  : "https://api.ebay.com/identity/v1/oauth2/token";

const EBAY_SCOPES = [
  "https://api.ebay.com/oauth/api_scope",
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.account",
].join(" ");

export function getEbayCredentials(): {
  clientId: string;
  clientSecret: string;
  ruName: string;
} | null {
  const clientId = process.env["EBAY_CLIENT_ID"];
  const clientSecret = process.env["EBAY_CLIENT_SECRET"];
  const ruName = process.env["EBAY_RU_NAME"];
  if (!clientId || !clientSecret || !ruName) return null;
  return { clientId, clientSecret, ruName };
}

export function buildEbayAuthUrl(state: string): string | null {
  const creds = getEbayCredentials();
  if (!creds) return null;
  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: creds.ruName,
    response_type: "code",
    scope: EBAY_SCOPES,
    state,
  });
  return `${EBAY_AUTH_URL}?${params.toString()}`;
}

export async function exchangeEbayCode(
  code: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const creds = getEbayCredentials();
  if (!creds) return null;

  const basicAuth = Buffer.from(
    `${creds.clientId}:${creds.clientSecret}`,
  ).toString("base64");

  const res = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: creds.ruName,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "eBay token exchange failed");
    return null;
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  };
}

export async function refreshEbayToken(
  userId: string,
): Promise<string | null> {
  const creds = getEbayCredentials();
  if (!creds) return null;

  const row = await db
    .select()
    .from(ebayTokensTable)
    .where(eq(ebayTokensTable.userId, userId))
    .then((r) => r[0] ?? null);

  if (!row) return null;

  if (row.expiresAt > new Date(Date.now() + 60_000)) {
    return row.accessToken;
  }

  const basicAuth = Buffer.from(
    `${creds.clientId}:${creds.clientSecret}`,
  ).toString("base64");

  const res = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refreshToken,
      scope: EBAY_SCOPES,
    }),
  });

  if (!res.ok) {
    logger.warn({ userId }, "eBay token refresh failed");
    return null;
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  const expiresAt = new Date(Date.now() + json.expires_in * 1000);

  await db
    .update(ebayTokensTable)
    .set({ accessToken: json.access_token, expiresAt, updatedAt: new Date() })
    .where(eq(ebayTokensTable.userId, userId));

  return json.access_token;
}

const LENS_CATEGORY_MAP: Record<string, string> = {
  ShoeLens: "93427",
  RecordLens: "306",
  LP: "306",
  Clothing: "11450",
  Watch: "14324",
  default: "1249",
};

const CONDITION_ID_MAP: Record<string, number> = {
  new: 1000,
  "like new": 3000,
  "very good": 4000,
  "good": 5000,
  "acceptable": 6000,
  used: 3000,
};

function conditionId(conditionStr?: string): number {
  if (!conditionStr) return 3000;
  return CONDITION_ID_MAP[conditionStr.toLowerCase()] ?? 3000;
}

export interface EbayListingInput {
  title: string;
  description: string;
  price: number;
  lens: string;
  condition?: string;
  attributes?: Record<string, unknown>;
}

export async function addEbayItem(
  userToken: string,
  input: EbayListingInput,
): Promise<{ itemId: string; viewItemURL: string } | null> {
  const categoryId = LENS_CATEGORY_MAP[input.lens] ?? LENS_CATEGORY_MAP.default;
  const condId = conditionId(input.condition);

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <ErrorLanguage>en_GB</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Item>
    <Title>${escXml(input.title.slice(0, 80))}</Title>
    <Description><![CDATA[${input.description}]]></Description>
    <PrimaryCategory><CategoryID>${categoryId}</CategoryID></PrimaryCategory>
    <StartPrice>${input.price.toFixed(2)}</StartPrice>
    <ConditionID>${condId}</ConditionID>
    <Country>GB</Country>
    <Currency>GBP</Currency>
    <DispatchTimeMax>3</DispatchTimeMax>
    <ListingDuration>Days_30</ListingDuration>
    <ListingType>FixedPriceItem</ListingType>
    <Location>United Kingdom</Location>
    <Quantity>1</Quantity>
    <PaymentMethods>PayPal</PaymentMethods>
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>
    <ShippingDetails>
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>UK_RoyalMailFirstClassStandard</ShippingService>
        <ShippingServiceCost>3.99</ShippingServiceCost>
      </ShippingServiceOptions>
    </ShippingDetails>
  </Item>
</AddItemRequest>`;

  const res = await fetch(EBAY_API_URL, {
    method: "POST",
    headers: {
      "X-EBAY-API-SITEID": "3",
      "X-EBAY-API-COMPATIBILITY-LEVEL": "1061",
      "X-EBAY-API-CALL-NAME": "AddItem",
      "X-EBAY-API-IAF-TOKEN": userToken,
      "Content-Type": "text/xml",
    },
    body: xml,
  });

  const text = await res.text();
  logger.info({ status: res.status, body: text.slice(0, 500) }, "eBay AddItem response");

  if (!res.ok) {
    logger.error({ status: res.status }, "eBay AddItem HTTP error");
    return null;
  }

  const itemIdMatch = /<ItemID>(\d+)<\/ItemID>/.exec(text);
  const urlMatch = /<ViewItemURL>([^<]+)<\/ViewItemURL>/.exec(text);

  if (!itemIdMatch) {
    const errMatch = /<LongMessage>([^<]+)<\/LongMessage>/.exec(text);
    logger.error({ err: errMatch?.[1] }, "eBay AddItem rejected");
    return null;
  }

  return {
    itemId: itemIdMatch[1],
    viewItemURL:
      urlMatch?.[1] ??
      `https://www.${IS_SANDBOX ? "sandbox." : ""}ebay.co.uk/itm/${itemIdMatch[1]}`,
  };
}

function escXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export { IS_SANDBOX };
