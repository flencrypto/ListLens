import { db } from "@workspace/db";
import { ebayTokensTable, ebaySettingsTable, type EbaySettings } from "@workspace/db/schema";
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

export async function getEbaySettings(userId: string): Promise<EbaySettings> {
  const row = await db
    .select()
    .from(ebaySettingsTable)
    .where(eq(ebaySettingsTable.userId, userId))
    .then((r) => r[0] ?? null);

  return row ?? {
    userId,
    shippingCost: "3.99",
    returnsAccepted: true,
    returnPeriod: "Days_30",
    paymentMethod: "PayPal",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function saveEbaySettings(
  userId: string,
  settings: {
    shippingCost: string;
    returnsAccepted: boolean;
    returnPeriod: string;
    paymentMethod: string;
  },
): Promise<void> {
  await db
    .insert(ebaySettingsTable)
    .values({ userId, ...settings })
    .onConflictDoUpdate({
      target: ebaySettingsTable.userId,
      set: { ...settings, updatedAt: new Date() },
    });
}

const LENS_CATEGORY_MAP: Record<string, string> = {
  ShoeLens: "93427",
  RecordLens: "306",
  LP: "306",
  Clothing: "11450",
  Watch: "14324",
  default: "1249",
};

/**
 * Per-lens condition ID maps.
 * Keys are lowercased condition strings the AI may produce.
 * Values are eBay ConditionID integers for the relevant category set.
 *
 * Records (category 306) use the specialist vinyl grade scale.
 * Clothing (category 11450) uses the fashion-specific set that eBay requires.
 * Everything else (shoes, watches, general) uses the standard buyer-grade set.
 */
const CONDITION_ID_BY_LENS: Record<string, Record<string, number>> = {
  RecordLens: {
    mint: 1000,
    m: 1000,
    "near mint": 2000,
    "nm": 2000,
    "nm-": 2000,
    "near mint (nm)": 2000,
    "near mint (nm-)": 2000,
    "very good plus": 3000,
    "vg+": 3000,
    "very good+": 3000,
    "very good": 4000,
    "vg": 4000,
    "good plus": 5000,
    "g+": 5000,
    good: 6000,
    "g": 6000,
    fair: 7000,
    poor: 8000,
    used: 4000,
    new: 1000,
  },
  LP: {
    mint: 1000,
    m: 1000,
    "near mint": 2000,
    "nm": 2000,
    "nm-": 2000,
    "very good plus": 3000,
    "vg+": 3000,
    "very good": 4000,
    "vg": 4000,
    "good plus": 5000,
    "g+": 5000,
    good: 6000,
    fair: 7000,
    poor: 8000,
    used: 4000,
    new: 1000,
  },
  Clothing: {
    new: 1000,
    "new with tags": 1000,
    "new with box": 1000,
    "new without tags": 1500,
    "new without box": 1500,
    "new with defects": 2750,
    "very good": 4000,
    "like new": 4000,
    good: 5000,
    acceptable: 6000,
    used: 4000,
  },
};

/** Fallback condition map used when no lens-specific map exists. */
const CONDITION_ID_GENERIC: Record<string, number> = {
  new: 1000,
  "like new": 3000,
  "very good": 4000,
  good: 5000,
  acceptable: 6000,
  used: 3000,
};

/**
 * Category-safe fallback ConditionIDs used when the AI produces an
 * unrecognised condition string. Each value is a valid, uncontroversial
 * condition for the lens's eBay category.
 *
 * - Records/LP (category 306): 4000 = Very Good — the accepted default
 *   grade for used vinyl on Discogs/eBay
 * - Clothing (category 11450): 4000 = Very Good — lowest common
 *   denominator for lightly-worn items in the fashion category set
 * - ShoeLens (category 93427) / Watch (category 14324) / generic: 3000
 *   which maps to "Used" in the standard eBay condition set
 */
const CONDITION_FALLBACK_BY_LENS: Record<string, number> = {
  RecordLens: 4000,
  LP: 4000,
  Clothing: 4000,
};

/**
 * Resolve an eBay ConditionID from a human-readable condition string.
 * Uses a lens-specific map when available, otherwise falls back to the
 * generic map. Unknown values use the lens's category-safe fallback
 * rather than a single global default.
 */
function conditionId(conditionStr: string | undefined, lens?: string): number {
  const fallback = (lens ? CONDITION_FALLBACK_BY_LENS[lens] : undefined) ?? 3000;
  if (!conditionStr) return fallback;
  const key = conditionStr.toLowerCase().trim();
  const lensMap = lens ? (CONDITION_ID_BY_LENS[lens] ?? null) : null;
  if (lensMap) return lensMap[key] ?? CONDITION_ID_GENERIC[key] ?? fallback;
  return CONDITION_ID_GENERIC[key] ?? fallback;
}

const LENS_SPECIFIC_MAP: Record<string, Record<string, string>> = {
  ShoeLens: {
    size: "UK Shoe Size",
    uk_size: "UK Shoe Size",
    shoe_size: "UK Shoe Size",
    us_size: "US Shoe Size",
    eu_size: "EU Shoe Size",
    colour: "Colour",
    color: "Colour",
    brand: "Brand",
    model: "Model",
    material: "Upper Material",
    style: "Style",
    gender: "Department",
    type: "Shoe Type",
    width: "Width",
  },
  Clothing: {
    size: "Size",
    uk_size: "Size",
    eu_size: "EU Size",
    us_size: "US Size",
    colour: "Colour",
    color: "Colour",
    brand: "Brand",
    model: "Style",
    material: "Material",
    gender: "Department",
    type: "Type",
    pattern: "Pattern",
    neckline: "Neckline",
    sleeve: "Sleeve Length",
    fit: "Fit",
  },
  RecordLens: {
    artist: "Artist",
    label: "Record Label",
    format: "Format",
    genre: "Genre",
    speed: "Speed",
    country: "Country/Region of Manufacture",
    year: "Release Year",
    catalogue_number: "Catalogue Number",
    colour: "Colour",
    color: "Colour",
    edition: "Edition",
    pressing: "Country/Region of Manufacture",
  },
  LP: {
    artist: "Artist",
    label: "Record Label",
    format: "Format",
    genre: "Genre",
    speed: "Speed",
    country: "Country/Region of Manufacture",
    year: "Release Year",
    catalogue_number: "Catalogue Number",
    edition: "Edition",
  },
  Watch: {
    brand: "Brand",
    model: "Model",
    colour: "Colour",
    color: "Colour",
    case_material: "Case Material",
    material: "Case Material",
    dial_colour: "Dial Colour",
    strap_material: "Strap Material",
    movement: "Movement",
    size: "Case Size",
    gender: "Department",
    water_resistance: "Water Resistance",
  },
};

const GENERIC_SPECIFIC_MAP: Record<string, string> = {
  brand: "Brand",
  model: "Model",
  colour: "Colour",
  color: "Colour",
  material: "Material",
  size: "Size",
  gender: "Department",
  type: "Type",
};

function buildItemSpecifics(
  lens: string,
  attributes: Record<string, unknown>,
  identity?: { brand?: string | null; model?: string | null },
): string {
  const lensMap = LENS_SPECIFIC_MAP[lens] ?? {};
  const nameValues: { name: string; value: string }[] = [];
  const seen = new Set<string>();

  const addSpec = (name: string, rawVal: unknown) => {
    if (seen.has(name)) return;
    const value =
      rawVal == null || rawVal === "null" || rawVal === "undefined"
        ? ""
        : typeof rawVal === "string"
          ? rawVal.trim()
          : String(rawVal).trim();
    if (!value) return;
    nameValues.push({ name, value: value.slice(0, 65) });
    seen.add(name);
  };

  if (identity?.brand) {
    addSpec(lensMap["brand"] ?? GENERIC_SPECIFIC_MAP["brand"] ?? "Brand", identity.brand);
  }
  if (identity?.model) {
    addSpec(lensMap["model"] ?? GENERIC_SPECIFIC_MAP["model"] ?? "Model", identity.model);
  }

  for (const [key, rawVal] of Object.entries(attributes)) {
    const normalKey = key.toLowerCase().replace(/\s+/g, "_");
    const name = lensMap[normalKey] ?? GENERIC_SPECIFIC_MAP[normalKey];
    if (!name) continue;
    addSpec(name, rawVal);
  }

  if (nameValues.length === 0) return "";

  const inner = nameValues
    .map(
      ({ name, value }) =>
        `      <NameValueList><Name>${escXml(name)}</Name><Value>${escXml(value)}</Value></NameValueList>`,
    )
    .join("\n");

  return `<ItemSpecifics>\n${inner}\n    </ItemSpecifics>`;
}

export interface EbayListingInput {
  title: string;
  description: string;
  price: number;
  lens: string;
  condition?: string;
  attributes?: Record<string, unknown>;
  identity?: { brand?: string | null; model?: string | null };
  photoUrls?: string[];
  settings?: {
    shippingCost: string;
    returnsAccepted: boolean;
    returnPeriod: string;
    paymentMethod: string;
  };
}

export async function addEbayItem(
  userToken: string,
  input: EbayListingInput,
): Promise<{ itemId: string; viewItemURL: string } | null> {
  const categoryId = LENS_CATEGORY_MAP[input.lens] ?? LENS_CATEGORY_MAP.default;
  const condId = conditionId(input.condition, input.lens);

  const settings = input.settings ?? {
    shippingCost: "3.99",
    returnsAccepted: true,
    returnPeriod: "Days_30",
    paymentMethod: "PayPal",
  };

  const photos = (input.photoUrls ?? []).slice(0, 12);
  const pictureDetails =
    photos.length > 0
      ? `<PictureDetails>
      ${photos.map((u) => `<PictureURL>${escXml(u)}</PictureURL>`).join("\n      ")}
    </PictureDetails>`
      : "";

  const itemSpecifics = buildItemSpecifics(
    input.lens,
    input.attributes ?? {},
    input.identity,
  );

  const returnsAcceptedOption = settings.returnsAccepted
    ? "ReturnsAccepted"
    : "ReturnsNotAccepted";

  const returnPolicyBlock = settings.returnsAccepted
    ? `<ReturnPolicy>
      <ReturnsAcceptedOption>${returnsAcceptedOption}</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>${escXml(settings.returnPeriod)}</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>`
    : `<ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsNotAccepted</ReturnsAcceptedOption>
    </ReturnPolicy>`;

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
    <PaymentMethods>${escXml(settings.paymentMethod)}</PaymentMethods>
    ${pictureDetails}
    ${itemSpecifics}
    ${returnPolicyBlock}
    <ShippingDetails>
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>UK_RoyalMailFirstClassStandard</ShippingService>
        <ShippingServiceCost>${escXml(settings.shippingCost)}</ShippingServiceCost>
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
