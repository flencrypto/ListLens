// @ts-nocheck
import Guard from '../utils/lens-registry.js';

const TRUSTED_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.replit\.(app|dev)$/i;

const STORAGE_KEYS = {
  reports: 'listLensGuardReportsNoMotors',
  settings: 'listLensGuardSettingsNoMotors'
};

const DEFAULT_SETTINGS = {
  apiBase: '',
  lens: Guard.DEFAULT_LENS_ID,
  singleCheckPrice: '£1.99'
};

const MAX_SAVED_REPORTS = 60;
const HIGH_RISK_LANGUAGE = /\b(replica|fake|counterfeit|unauthori[sz]ed|\bua\b|bootleg|knock[- ]?off|reprint|proxy|aftermarket|franken|not authentic|not original|overgraded|repro|reproduction)\b/i;
const ABSOLUTE_CLAIMS = /\b(100%\s*(authentic|genuine)|guaranteed\s*(authentic|genuine)|definitely\s*(authentic|genuine)|definitely\s*complete|original\s*first\s*pressing)\b/i;

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async () => {
    const existing = await chrome.storage.local.get(STORAGE_KEYS.settings);
    if (!existing[STORAGE_KEYS.settings]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.settings]: DEFAULT_SETTINGS });
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender)
      .then((payload) => sendResponse(payload))
      .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  });
});

async function handleMessage(message, sender) {
  switch (message?.type) {
    case 'LISTING_STATUS': {
      await updateBadge(sender.tab?.id, message.listing);
      return { ok: true };
    }

    case 'GUARD_PREVIEW': {
      const settings = await getSettings();
      const listing = cleanListing(message.listing);
      const lens = Guard.resolveLensForListing(listing, message.lens || settings.lens);
      if (lens.excluded) return { ok: true, excluded: true, report: buildMotorExclusion(listing, lens) };
      return { ok: true, report: buildLocalReport(listing, { mode: 'preview', lens: message.lens || settings.lens }) };
    }

    case 'GUARD_CHECK': {
      const settings = await getSettings();
      const listing = cleanListing(message.listing);
      const lens = Guard.resolveLensForListing(listing, message.lens || settings.lens);
      if (lens.excluded) {
        const report = buildMotorExclusion(listing, lens);
        await updateBadge(sender.tab?.id, listing, report);
        return { ok: true, excluded: true, report, saved: null };
      }
      const report = await runGuardCheck({ listing, settings, message });
      const saved = await saveReport(listing, report);
      await updateBadge(sender.tab?.id, listing, report);
      return { ok: true, report, saved };
    }

    case 'GET_SAVED_REPORTS': {
      return { ok: true, reports: await getReports() };
    }

    case 'CLEAR_SAVED_REPORTS': {
      await chrome.storage.local.set({ [STORAGE_KEYS.reports]: [] });
      return { ok: true, reports: [] };
    }

    case 'GET_SETTINGS': {
      return { ok: true, settings: await getSettings() };
    }

    case 'SAVE_SETTINGS': {
      const current = await getSettings();
      const next = { ...DEFAULT_SETTINGS, ...current, ...message.settings };
      next.apiBase = String(next.apiBase || '').trim().replace(/\/$/, '');
      const lens = Guard.getLens(next.lens);
      next.lens = lens?.id || Guard.DEFAULT_LENS_ID;
      await chrome.storage.local.set({ [STORAGE_KEYS.settings]: next });
      return { ok: true, settings: next };
    }

    case 'OPEN_CHECKOUT': {
      const settings = await getSettings();
      const listing = cleanListing(message.listing || { url: message.url });
      const lens = Guard.resolveLensForListing(listing, message.lens || settings.lens);
      if (lens.excluded) throw new Error('Motors are excluded from this List-LENS Guard build. Checkout was not opened.');
      if (lens.uncertain) throw new Error('Choose SoleLens, RecordLens, WatchLens, CardLens or ToyLens before checkout.');
      const apiBase = String(message.apiBase || settings.apiBase || '').trim().replace(/\/$/, '');
      if (!apiBase) throw new Error('Add a ListLens API base URL before opening checkout.');
      const returnUrl = encodeURIComponent(message.returnUrl || listing.url || '');
      const listingUrl = encodeURIComponent(listing.url || '');
      await chrome.tabs.create({ url: `${apiBase}/guard/checkout?lens=${encodeURIComponent(lens.id)}&url=${listingUrl}&returnUrl=${returnUrl}` });
      return { ok: true };
    }

    case 'VERIFY_API_ORIGIN': {
      const { origin } = message;
      if (!TRUSTED_ORIGIN_RE.test(origin)) return { ok: false };
      const candidateApi = `${origin}/api`;
      const valid = await verifyApiOrigin(candidateApi);
      if (valid) {
        await chrome.storage.local.set({ detectedApiBase: candidateApi });
      } else {
        const stored = await chrome.storage.local.get(['detectedApiBase']);
        if (stored['detectedApiBase'] === candidateApi) {
          await chrome.storage.local.remove('detectedApiBase');
        }
      }
      return { ok: true, valid };
    }

    default:
      return { ok: false, error: `Unknown message type: ${message?.type || 'none'}` };
  }
}

async function verifyApiOrigin(apiBase) {
  try {
    const res = await fetch(`${apiBase}/ping`, { method: 'GET', credentials: 'omit' });
    if (!res.ok) return false;
    const body = await res.json();
    return body.service === 'listlens-api';
  } catch {
    return false;
  }
}

async function runGuardCheck({ listing, settings, message }) {
  const apiBase = String(message.apiBase || settings.apiBase || '').trim().replace(/\/$/, '');
  const requestedLens = message.lens || settings.lens || Guard.DEFAULT_LENS_ID;
  const lens = Guard.resolveLensForListing(listing, requestedLens);

  if (lens.uncertain) return buildUncertainReport(listing, lens);

  if (!apiBase) {
    return buildLocalReport(listing, { mode: 'full', source: 'local-demo', lens: lens.id, requestedLens });
  }

  try {
    const create = await fetch(`${apiBase}/guard/checks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: listing.url,
        lens: lens.id,
        requestedLens,
        lensName: lens.name,
        portfolioVersion: Guard.VERSION,
        excludedMotors: true,
        supportedLenses: Guard.allLenses().map((item) => item.id),
        source: 'browser-extension',
        listing
      })
    });

    if (!create.ok) {
      const detail = await create.text().catch(() => create.statusText);
      throw new Error(`Guard check creation failed (${create.status}): ${detail}`);
    }

    const created = await create.json();
    const checkId = created.id || created.checkId;
    if (!checkId) throw new Error('Guard check was created but no check id was returned.');

    const analyse = await fetch(`${apiBase}/guard/checks/${encodeURIComponent(checkId)}/analyse`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing, lens: lens.id, requestedLens, portfolioVersion: Guard.VERSION, excludedMotors: true })
    });

    if (!analyse.ok) {
      const detail = await analyse.text().catch(() => analyse.statusText);
      throw new Error(`Guard analysis failed (${analyse.status}): ${detail}`);
    }

    const result = await analyse.json();
    return normaliseReport(result.report || result, listing, 'backend', lens.id);
  } catch (error) {
    const fallback = buildLocalReport(listing, { mode: 'full', source: 'local-fallback', lens: lens.id, requestedLens });
    fallback.backendError = error instanceof Error ? error.message : String(error);
    fallback.summary = `${fallback.summary} Backend analysis was unavailable, so this is a local evidence-readiness screen.`;
    return fallback;
  }
}

function buildLocalReport(listing, options = {}) {
  const mode = options.mode || 'preview';
  const source = options.source || 'local-preview';
  const requestedLens = options.requestedLens || options.lens || Guard.DEFAULT_LENS_ID;
  const lens = Guard.resolveLensForListing(listing, requestedLens);

  if (lens.excluded) return buildMotorExclusion(listing, lens);
  if (lens.uncertain) return buildUncertainReport(listing, lens);

  const checklist = Guard.checklistFor(listing, lens.id);
  const missingEvidence = checklist.filter((item) => !item.found).map((item) => item.label);
  const photoCount = Array.isArray(listing.photos) ? listing.photos.length : 0;
  const price = parsePrice(listing.priceText || listing.price || '');
  const evidenceText = Guard.buildEvidenceText(listing);
  const sellerVisible = Boolean(listing.sellerName || listing.sellerRating);
  const flags = [];

  if (photoCount < 3) flags.push('Very few listing photos are visible.');
  if (!listing.description) flags.push('Seller description is limited or not visible.');
  if (!sellerVisible) flags.push('Seller trust signals were not clearly visible.');
  if (missingEvidence.length >= 3) flags.push(`${missingEvidence.length} useful ${lens.shortName} evidence items are missing or unclear.`);
  if (HIGH_RISK_LANGUAGE.test(evidenceText)) flags.push(`${lens.shortName} detected risk-language signals that need extra caution.`);
  if (ABSOLUTE_CLAIMS.test(evidenceText)) flags.push('Strong absolute seller claims appear in the visible text; rely on evidence rather than wording.');

  const lensRiskTerms = (lens.riskTerms || []).filter((pattern) => pattern.test(evidenceText));
  if (lensRiskTerms.length >= 2) flags.push(`Multiple ${lens.shortName} specialist risk signals were found in the visible text.`);

  const priceWarning = buildPriceWarning({ price, lens, source });
  if (/unusually low|compare/i.test(priceWarning)) flags.push('Price needs comparison against recent sold listings before relying on the offer.');

  let risk = 'Low';
  if (!listing.supported && !listing.title && photoCount < 2) risk = 'Inconclusive';
  else if (missingEvidence.length >= 4 || photoCount < 3 || flags.length >= 3) risk = 'Medium';
  if ((HIGH_RISK_LANGUAGE.test(evidenceText) || lensRiskTerms.length >= 2) && missingEvidence.length >= 2) risk = 'High';
  if (photoCount < 2 && missingEvidence.length >= 4) risk = 'Inconclusive';

  const confidence = calculateConfidence({ listing, missingEvidence, photoCount, mode, lens });

  return {
    id: cryptoSafeId(),
    createdAt: new Date().toISOString(),
    source,
    mode,
    requestedLens,
    lensId: lens.id,
    lensName: lens.name,
    lensShortName: lens.shortName,
    lensCategory: lens.category,
    portfolioVersion: Guard.VERSION,
    motorsExcluded: true,
    risk,
    confidence,
    reason: buildReason({ lens, risk, missingEvidence, photoCount, sellerVisible, price, flags }),
    summary: buildSummary({ risk, missingEvidence, photoCount, lens }),
    checklist,
    missingEvidence,
    flags,
    priceWarning,
    platformNote: buildPlatformNote(listing.marketplace, lens),
    sellerQuestions: Guard.sellerQuestionsFor(lens.id, missingEvidence),
    nextAction: buildNextAction(risk, lens),
    safeLanguage: 'AI-assisted risk screen only. This is not formal authentication and does not prove an item is genuine, counterfeit, complete, correctly graded, or correctly described.'
  };
}

function buildMotorExclusion(listing, lens) {
  return {
    id: cryptoSafeId(),
    createdAt: new Date().toISOString(),
    excluded: true,
    exclusionType: 'motors',
    lensId: Guard.EXCLUDED_MOTOR_ID,
    lensName: 'Motor category detected',
    lensShortName: 'Motors not supported',
    risk: 'Not supported',
    confidence: 100,
    summary: 'This version of List-LENS Guard does not support cars, motorbikes, scooters, vehicle parts, fitment checks, MOT/service evidence, roadworthiness, or vehicle valuation confidence.',
    reason: lens?.reason || 'Motor-related listing signals were detected.',
    checklist: [],
    missingEvidence: [],
    flags: ['No Guard risk report was generated for this motor-related listing.'],
    priceWarning: 'No vehicle or vehicle-part valuation confidence is provided by this extension.',
    platformNote: 'Use the marketplace\'s own buyer protection and check service history, part numbers, compatibility, MOT details, seller feedback and professional advice where appropriate.',
    sellerQuestions: '',
    nextAction: 'Choose a non-motor Lens or use manual mode only for trainers, records, watches, cards or toys.',
    safeLanguage: 'Motors are excluded from this individual List-LENS Guard project.'
  };
}

function buildUncertainReport(listing, lens) {
  return {
    id: cryptoSafeId(),
    createdAt: new Date().toISOString(),
    lensId: 'uncertain',
    lensName: 'Choose a Lens',
    lensShortName: 'Uncertain',
    risk: 'Inconclusive',
    confidence: 35,
    summary: 'The extension could not confidently choose SoleLens, RecordLens, WatchLens, CardLens or ToyLens from the visible listing evidence.',
    reason: lens?.reason || 'Category signals were unclear.',
    checklist: [],
    missingEvidence: ['Manual Lens choice required'],
    flags: ['Choose a supported non-motor Lens before running a full Guard report.'],
    priceWarning: 'No price-risk signal was calculated because the category is uncertain.',
    platformNote: buildPlatformNote(listing.marketplace, { shortName: 'List-LENS Guard' }),
    sellerQuestions: 'Hi, could you please send clearer photos of the item, including front, back, close-up details, condition flaws, and any labels, serials, catalogue numbers, certificates, inserts, accessories, or proof relevant to the item? Thanks.',
    nextAction: 'Choose SoleLens, RecordLens, WatchLens, CardLens or ToyLens manually.',
    safeLanguage: 'AI-assisted risk screen only. Choose a supported non-motor category before relying on the output.'
  };
}

function normaliseReport(report, listing, source, fallbackLensId) {
  const fallback = buildLocalReport(listing, { mode: 'full', source: 'local-reference', lens: fallbackLensId || report?.lensId || report?.lens || Guard.DEFAULT_LENS_ID });
  const risk = normaliseRisk(report.risk || report.riskLevel || report.level || fallback.risk);
  const lens = Guard.getLens(report.lensId || report.lens || fallback.lensId) || Guard.getLens(fallback.lensId);
  return {
    ...fallback,
    ...report,
    id: report.id || cryptoSafeId(),
    createdAt: report.createdAt || new Date().toISOString(),
    source,
    risk,
    confidence: clamp(Number(report.confidence ?? fallback.confidence), 0, 100),
    lensId: lens?.id || fallback.lensId,
    lensName: report.lensName || lens?.name || fallback.lensName,
    lensShortName: report.lensShortName || lens?.shortName || fallback.lensShortName,
    checklist: Array.isArray(report.checklist) ? report.checklist : fallback.checklist,
    missingEvidence: Array.isArray(report.missingEvidence) ? report.missingEvidence : Array.isArray(report.missing_evidence) ? report.missing_evidence : fallback.missingEvidence,
    sellerQuestions: report.sellerQuestions || report.seller_questions || fallback.sellerQuestions,
    safeLanguage: report.safeLanguage || fallback.safeLanguage
  };
}

function buildSummary({ risk, missingEvidence, photoCount, lens }) {
  if (risk === 'Inconclusive') return `There is not enough visible evidence for a useful ${lens.shortName} screen. Ask for clearer photos before relying on this listing.`;
  if (risk === 'High') return `High risk indicators are present from the visible ${lens.shortName} evidence. Authenticity, grade, completeness or exact version cannot be confirmed from this listing.`;
  if (risk === 'Medium') return `Some uncertainty or missing ${lens.shortName} evidence is present. Do not rely on the visible listing alone.`;
  if (missingEvidence.length === 0 && photoCount >= 6) return `No major ${lens.shortName} evidence gaps were detected from the visible listing, but this is still not formal authentication.`;
  return `No major red flags were detected from the visible listing, but review the ${lens.shortName} evidence carefully before buying.`;
}

function buildReason({ lens, risk, missingEvidence, photoCount, sellerVisible, price, flags }) {
  const bits = [];
  if (photoCount) bits.push(`${photoCount} visible photo${photoCount === 1 ? '' : 's'}`);
  if (missingEvidence.length) bits.push(`${missingEvidence.length} ${lens.shortName} evidence gap${missingEvidence.length === 1 ? '' : 's'}`);
  if (!sellerVisible) bits.push('limited seller signals');
  if (price.amount) bits.push(`price captured as ${price.display}`);
  if (flags.length) bits.push(`${flags.length} caution signal${flags.length === 1 ? '' : 's'}`);
  if (!bits.length) bits.push('basic listing details visible');
  return `${risk} risk because ${bits.join(', ')}.`;
}

function buildNextAction(risk, lens) {
  if (risk === 'Low') return `Review the listing, seller terms and platform protection before deciding. ${lens.shortName} is a risk screen, not a certificate.`;
  if (risk === 'Inconclusive') return `Ask for clearer ${lens.shortName} evidence or use manual screenshot mode with more photos.`;
  if (lens.id === 'watchlens') return 'For high-value watches, ask for missing evidence and consider formal authentication or platform protection before buying.';
  return `Ask the seller for the missing ${lens.shortName} evidence before buying.`;
}

function buildPriceWarning({ price, lens, source }) {
  if (!price.amount) return 'Price was not clearly visible, so no price-risk signal was calculated.';
  if (source === 'backend') return 'Price was included in the backend Guard analysis where available.';
  const lowWatch = lens.id === 'watchlens' && price.amount < 300;
  const lowTrainer = lens.id === 'solelens' && price.amount < 70;
  const lowCard = lens.id === 'cardlens' && price.amount < 25;
  const lowRecord = lens.id === 'recordlens' && price.amount < 10;
  const lowToy = lens.id === 'toylens' && price.amount < 15;
  if (lowWatch || lowTrainer || lowCard || lowRecord || lowToy) {
    return `Asking price ${price.display} may be unusually low for some ${lens.category.toLowerCase()} listings. Compare against recent sold listings and request stronger evidence.`;
  }
  return `Asking price ${price.display} was captured. Local preview does not run a live market comparison.`;
}

function buildPlatformNote(marketplace, lens) {
  if (marketplace === 'ebay') return `This appears to be an eBay listing. Check eBay buyer protection, Authenticity Guarantee where applicable, and category-specific policies; this ${lens.shortName} screen is separate from eBay verification.`;
  if (marketplace === 'vinted') return `This appears to be a Vinted listing. Vinted verification may be available for selected categories; this ${lens.shortName} screen is separate from formal verification.`;
  if (marketplace === 'unsupported') return 'This marketplace is not directly supported by the content script. Use manual screenshot mode and platform protection.';
  return `For manual checks, use marketplace protection and ask for ${lens.shortName} evidence before paying.`;
}

function parsePrice(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const match = text.match(/(£|GBP|\$|USD|€|EUR)?\s*([0-9][0-9,.]*)/i);
  if (!match) return { amount: null, currency: '', display: text || 'Not visible' };
  const amount = Number(match[2].replace(/,/g, ''));
  const symbol = match[1] || '';
  const currency = /£|GBP/i.test(symbol) ? 'GBP' : /\$|USD/i.test(symbol) ? 'USD' : /€|EUR/i.test(symbol) ? 'EUR' : '';
  const display = `${currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : ''}${Number.isFinite(amount) ? amount.toFixed(amount % 1 ? 2 : 0) : match[2]}`;
  return { amount: Number.isFinite(amount) ? amount : null, currency, display };
}

function calculateConfidence({ listing, missingEvidence, photoCount, mode, lens }) {
  let confidence = mode === 'preview' ? 42 : 52;
  if (listing.title) confidence += 8;
  if (listing.priceText || listing.price) confidence += 6;
  if (listing.description) confidence += 8;
  if (listing.sellerName || listing.sellerRating) confidence += 6;
  if (lens.id !== 'auto' && lens.id !== 'uncertain') confidence += 6;
  confidence += Math.min(photoCount * 4, 24);
  confidence -= Math.min(missingEvidence.length * 4, 24);
  return clamp(confidence, 24, 88);
}

function cleanListing(listing = {}) {
  const inferredMarketplace = Guard.inferMarketplace(listing.url || '');
  const cleaned = {
    supported: Boolean(listing.supported || Guard.isDirectListingUrl(listing.url || '')),
    marketplace: String(listing.marketplace || inferredMarketplace || 'unknown').toLowerCase(),
    url: truncate(listing.url, 1200),
    title: truncate(listing.title, 260),
    priceText: truncate(listing.priceText || listing.price, 100),
    currency: truncate(listing.currency, 16),
    photos: Array.isArray(listing.photos) ? listing.photos.slice(0, 20).map((photo) => ({
      url: truncate(photo.url || photo.dataUrl, 2200),
      alt: truncate(photo.alt || photo.name, 260),
      caption: truncate(photo.caption, 260)
    })).filter((photo) => photo.url || photo.alt || photo.caption) : [],
    sellerName: truncate(listing.sellerName, 160),
    sellerRating: truncate(listing.sellerRating, 220),
    description: truncate(listing.description, 5000),
    condition: truncate(listing.condition, 160),
    size: truncate(listing.size, 100),
    brand: truncate(listing.brand, 120),
    category: truncate(listing.category, 220),
    shippingLocation: truncate(listing.shippingLocation, 180),
    rawVisibleText: truncate(listing.rawVisibleText, 12000),
    detectedLens: truncate(listing.detectedLens, 80),
    detectedLensName: truncate(listing.detectedLensName, 140),
    extractedAt: listing.extractedAt || new Date().toISOString()
  };
  const lens = Guard.resolveLensForListing(cleaned, cleaned.detectedLens || Guard.DEFAULT_LENS_ID);
  cleaned.detectedLens = lens.id;
  cleaned.detectedLensName = lens.name;
  cleaned.motorExcluded = Boolean(lens.excluded);
  cleaned.lensUncertain = Boolean(lens.uncertain);
  cleaned.routingReason = lens.reason || '';
  return cleaned;
}

function truncate(value, max = 500) {
  if (value === undefined || value === null) return '';
  const text = String(value).replace(/\u0000/g, '').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function normaliseRisk(risk) {
  const value = String(risk || '').toLowerCase();
  if (value.includes('not supported')) return 'Not supported';
  if (value.includes('high')) return 'High';
  if (value.includes('medium') || value.includes('moderate')) return 'Medium';
  if (value.includes('low')) return 'Low';
  return 'Inconclusive';
}

async function getSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.settings] || {}) };
}

async function getReports() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.reports);
  return Array.isArray(result[STORAGE_KEYS.reports]) ? result[STORAGE_KEYS.reports] : [];
}

async function saveReport(listing, report) {
  if (report.excluded) return null;
  const reports = await getReports();
  const record = {
    id: report.id || cryptoSafeId(),
    createdAt: report.createdAt || new Date().toISOString(),
    listing: cleanListing(listing),
    report: normaliseReport(report, listing, report.source || 'saved', report.lensId || report.lens)
  };
  const withoutDuplicate = reports.filter((item) => item.listing?.url !== record.listing.url || item.report?.lensId !== record.report.lensId);
  const next = [record, ...withoutDuplicate].slice(0, MAX_SAVED_REPORTS);
  await chrome.storage.local.set({ [STORAGE_KEYS.reports]: next });
  return record;
}

async function updateBadge(tabId, listing, report?) {
  if (!tabId) return;
  if (report?.excluded || listing?.motorExcluded || Guard.isMotorListing(listing || {})) {
    await chrome.action.setBadgeText({ tabId, text: 'NO' });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#64748b' });
    return;
  }
  const risk = report?.risk;
  if (risk) {
    const label = risk === 'High' ? 'HI' : risk === 'Medium' ? 'MED' : risk === 'Low' ? 'LOW' : '?';
    const color = risk === 'High' ? '#ef4444' : risk === 'Medium' ? '#f59e0b' : risk === 'Low' ? '#22c55e' : '#64748b';
    await chrome.action.setBadgeText({ tabId, text: label });
    await chrome.action.setBadgeBackgroundColor({ tabId, color });
    return;
  }
  if (listing?.supported) {
    const lens = Guard.resolveLensForListing(cleanListing(listing), listing.detectedLens || Guard.DEFAULT_LENS_ID);
    const text = lens.uncertain ? '?' : lens.badge.slice(0, 4);
    await chrome.action.setBadgeText({ tabId, text });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: lens.uncertain ? '#64748b' : '#2563eb' });
  } else {
    await chrome.action.setBadgeText({ tabId, text: '' });
  }
}

function cryptoSafeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `guard_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(Number(value) || min)));
}
