'use strict';

const Guard = globalThis.ListLensGuardRegistry;
const app = document.getElementById('app');

const state = {
  loading: false,
  settings: null,
  tab: null,
  listing: null,
  report: null,
  reports: [],
  error: '',
  notice: '',
  manualFiles: []
};

document.addEventListener('DOMContentLoaded', init);
app.addEventListener('click', handleClick);
app.addEventListener('change', handleChange);

async function init() {
  state.loading = true;
  render();
  try {
    const [settingsResponse, tab] = await Promise.all([sendRuntime({ type: 'GET_SETTINGS' }), getActiveTab()]);
    state.settings = settingsResponse.settings;
    state.tab = tab;
    state.listing = await getListingFromTab(tab);
    const reportsResponse = await sendRuntime({ type: 'GET_SAVED_REPORTS' });
    state.reports = reportsResponse.reports || [];
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
  } finally {
    state.loading = false;
    render();
  }
}

async function handleClick(event) {
  const action = event.target?.dataset?.action;
  if (!action) return;

  if (action === 'preview') return runGuard('GUARD_PREVIEW', currentListing());
  if (action === 'full') return runGuard('GUARD_CHECK', currentListing());
  if (action === 'manual-preview') return runGuard('GUARD_PREVIEW', await manualListing());
  if (action === 'manual-full') return runGuard('GUARD_CHECK', await manualListing());
  if (action === 'show-panel') return showPanel();
  if (action === 'save-settings') return saveSettings();
  if (action === 'copy-questions') return copyQuestions();
  if (action === 'clear-reports') return clearReports();
  if (action === 'open-checkout') return openCheckout();

  if (action === 'load-report') {
    const report = state.reports.find((item) => item.id === event.target.dataset.id);
    if (report) {
      state.report = report.report;
      state.listing = report.listing;
      state.notice = 'Loaded saved report.';
      state.error = '';
      render();
    }
  }
}

function handleChange(event) {
  if (event.target?.id === 'manual-files') {
    state.manualFiles = Array.from(event.target.files || []).slice(0, 8);
    render();
    return;
  }

  if (event.target?.id === 'active-lens') {
    state.report = null;
    saveLensOnly(event.target.value).catch(() => {});
    return;
  }
}

async function runGuard(type, listing) {
  state.loading = true;
  state.error = '';
  state.notice = '';
  render();

  try {
    const lens = getSelectedLensId();
    const response = await sendRuntime({ type, listing, lens });
    if (!response.ok) throw new Error(response.error || 'Guard check failed.');
    state.report = response.report;
    if (response.excluded) state.notice = 'Motors are excluded from this extension build. No Guard risk report was generated.';
    const reportsResponse = await sendRuntime({ type: 'GET_SAVED_REPORTS' });
    state.reports = reportsResponse.reports || [];
    if (response.report?.backendError) state.notice = 'Backend unavailable; showing local evidence-readiness screen.';
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
  } finally {
    state.loading = false;
    render();
  }
}

async function showPanel() {
  if (!state.tab?.id) return;
  try {
    await sendTab(state.tab.id, { type: 'SHOW_GUARD_PANEL' });
    window.close();
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
    render();
  }
}

async function saveSettings() {
  const apiBase = document.getElementById('api-base')?.value || '';
  const lens = document.getElementById('settings-lens')?.value || Guard.DEFAULT_LENS_ID;
  const response = await sendRuntime({ type: 'SAVE_SETTINGS', settings: { apiBase, lens } });
  state.settings = response.settings;
  state.notice = 'Settings saved.';
  render();
}

async function saveLensOnly(lens) {
  const response = await sendRuntime({ type: 'SAVE_SETTINGS', settings: { ...(state.settings || {}), lens } });
  state.settings = response.settings;
}

async function clearReports() {
  const response = await sendRuntime({ type: 'CLEAR_SAVED_REPORTS' });
  state.reports = response.reports || [];
  state.notice = 'Saved reports cleared.';
  render();
}

async function openCheckout() {
  try {
    const listing = currentListing();
    const response = await sendRuntime({ type: 'OPEN_CHECKOUT', listing, lens: getSelectedLensId(), returnUrl: listing.url });
    if (!response.ok) throw new Error(response.error || 'Could not open checkout.');
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
    render();
  }
}

async function copyQuestions() {
  const text = state.report?.sellerQuestions || Guard.sellerQuestionsFor(currentLens().id, []);
  try {
    await navigator.clipboard.writeText(text);
    state.notice = 'Seller questions copied.';
  } catch {
    state.error = 'Could not copy automatically. Select the text and copy it manually.';
  }
  render();
}

function render() {
  if (state.loading && !state.settings) {
    app.innerHTML = '<div class="notice">Loading current tab…</div>';
    return;
  }

  const listing = currentListing(false);
  const lens = currentLens(listing);

  app.innerHTML = `
    ${state.error ? `<div class="error">${escapeHtml(state.error)}</div>` : ''}
    ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ''}
    ${routerCard(listing, lens)}
    ${lens.excluded ? motorCard(lens) : listing?.supported ? listingCard(listing, lens) : unsupportedCard()}
    ${state.report ? reportCard(state.report) : safeLanguageCard(lens)}
    ${manualCard()}
    ${settingsCard()}
    ${savedReportsCard()}
  `;
}

function routerCard(listing, lens) {
  const selectedId = getSelectedLensId(false);
  return `
    <section class="card">
      <p class="label">Category Lens Router</p>
      <h2>${escapeHtml(lens.name)}</h2>
      <p class="muted">This build supports SoleLens, RecordLens, WatchLens, CardLens and ToyLens only. Motor listings are actively excluded.</p>
      ${lens.reason ? `<p class="tiny">${escapeHtml(lens.reason)}</p>` : ''}
      <label>Active Lens
        <select id="active-lens">${Guard.lensSelectOptions(selectedId, { includeAuto: true })}</select>
      </label>
      <div class="lens-grid">${Guard.allLenses().map((item) => `<span>${escapeHtml(item.badge)} · ${escapeHtml(item.shortName)}</span>`).join('')}</div>
    </section>
  `;
}

function listingCard(listing, lens) {
  const missing = Guard.estimateMissingEvidence(listing, lens.id).slice(0, 5);
  const checklist = Guard.checklistFor(listing, lens.id).slice(0, 7);
  return `
    <section class="card">
      <p class="label">Current page · ${escapeHtml(lens.shortName)}</p>
      <h3>${escapeHtml(Guard.platformLabel(listing.marketplace))} listing detected</h3>
      <p class="muted">${escapeHtml(listing.title || 'Untitled listing')}</p>
      <div class="row">
        <span class="pill">${escapeHtml(listing.priceText || 'Price not visible')}</span>
        <span class="pill">${listing.photos?.length || 0} photo${(listing.photos?.length || 0) === 1 ? '' : 's'}</span>
        <span class="pill">${escapeHtml(listing.sellerName || 'Seller unclear')}</span>
      </div>
      ${missing.length ? `<ul>${missing.map((item) => `<li>${escapeHtml(item)} not obvious</li>`).join('')}</ul>` : '<p class="tiny">Basic Lens evidence is visible. A full report can still flag uncertainty.</p>'}
      ${checklist.length ? `<div class="checks">${checklist.map((item) => `<div><b>${item.found ? '✓' : '✗'}</b> ${escapeHtml(item.label)}</div>`).join('')}</div>` : ''}
      <div class="actions">
        <button class="secondary" data-action="preview" ${state.loading ? 'disabled' : ''}>Free preview</button>
        <button class="primary" data-action="full" ${state.loading ? 'disabled' : ''}>Run Guard Check</button>
        <button class="secondary" data-action="show-panel">Open page panel</button>
        <button class="secondary" data-action="open-checkout">Checkout</button>
      </div>
    </section>
  `;
}

function motorCard(lens) {
  return `
    <section class="card motor">
      <p class="label">Motor category detected</p>
      <h3>This version does not support motors.</h3>
      <p class="muted">No Guard risk report will be generated for cars, motorbikes, scooters, vehicle parts, fitment checks, MOT/service evidence, roadworthiness, mechanical safety or vehicle valuation confidence.</p>
      <p class="tiny">You can still review the marketplace’s own buyer protection, part numbers, service history, MOT details and seller feedback.</p>
      ${lens.reason ? `<p class="tiny">${escapeHtml(lens.reason)}</p>` : ''}
    </section>
  `;
}

function unsupportedCard() {
  return `
    <section class="card soft">
      <p class="label">Current page</p>
      <h3>No supported listing detected</h3>
      <p class="muted">Direct page extraction is limited to eBay and Vinted listing pages. Use manual mode for screenshots, pasted URLs, Facebook Marketplace, Depop, Instagram, Discogs, WhatsApp, auctions, or private-seller screenshots.</p>
    </section>
  `;
}

function safeLanguageCard(lens) {
  if (lens.excluded) return '';
  return `
    <section class="card soft">
      <p class="label">Safe wording</p>
      <p class="muted">Guard is an AI-assisted ${escapeHtml(lens.shortName || 'category')} risk screen. It does not formally authenticate items and should not be treated as proof that a listing is genuine, counterfeit, complete, correctly graded or correctly described.</p>
    </section>
  `;
}

function reportCard(report) {
  if (report.excluded) return motorCard({ reason: report.reason });
  const riskClass = String(report.risk || 'Inconclusive').toLowerCase();
  const missing = Array.isArray(report.missingEvidence) ? report.missingEvidence : [];
  const checklist = Array.isArray(report.checklist) ? report.checklist : [];
  return `
    <section class="card result ${escapeHtml(riskClass)}">
      <p class="label">Guard result · ${escapeHtml(report.lensShortName || report.lensName || 'Lens')}</p>
      <div class="result-row"><strong>${escapeHtml(report.risk || 'Inconclusive')} Risk</strong><span>${Math.round(Number(report.confidence) || 0)}% confidence</span></div>
      <p class="muted">${escapeHtml(report.summary || report.reason || 'Risk screen completed.')}</p>
      ${report.backendError ? `<p class="tiny">Backend note: ${escapeHtml(report.backendError)}</p>` : ''}
    </section>

    ${checklist.length ? `<section class="card"><p class="label">Evidence checklist</p><div class="checks">${checklist.map((item) => `<div><b>${item.found ? '✓' : '✗'}</b> ${escapeHtml(item.label)}</div>`).join('')}</div></section>` : ''}

    <section class="card">
      <p class="label">Missing evidence</p>
      ${missing.length ? `<ul>${missing.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p class="muted">No major missing-evidence items detected from the visible listing.</p>'}
    </section>

    <section class="card">
      <p class="label">Next action</p>
      <p class="muted">${escapeHtml(report.nextAction || '')}</p>
      <p class="tiny">${escapeHtml(report.priceWarning || '')}</p>
      <p class="tiny">${escapeHtml(report.platformNote || '')}</p>
    </section>

    <section class="card">
      <p class="label">Seller-question generator</p>
      <pre>${escapeHtml(report.sellerQuestions || '')}</pre>
      <button class="secondary" data-action="copy-questions">Copy seller questions</button>
    </section>
  `;
}

function manualCard() {
  const lens = currentLens();
  const fileText = state.manualFiles.length ? `${state.manualFiles.length} screenshot${state.manualFiles.length === 1 ? '' : 's'} selected.` : 'Upload listing screenshots or item photos where direct extraction fails.';
  return `
    <section class="card">
      <h2>Manual screenshot / URL mode</h2>
      <p class="tiny">Choose SoleLens, RecordLens, WatchLens, CardLens or ToyLens. MotorLens does not appear in this build.</p>
      <label>Manual Lens
        <select id="manual-lens">${Guard.lensSelectOptions(getSelectedLensId(false), { includeAuto: false })}</select>
      </label>
      <label>Listing URL
        <input id="manual-url" placeholder="https://…" />
      </label>
      <label>Title
        <input id="manual-title" placeholder="Nike trainers, Pink Floyd LP, Omega watch, Charizard card, LEGO set…" />
      </label>
      <label>Price
        <input id="manual-price" placeholder="£85" />
      </label>
      <label>Description / seller claims
        <textarea id="manual-description" placeholder="Paste the seller description or any visible listing text…"></textarea>
      </label>
      <label>Screenshots / photos
        <input id="manual-files" type="file" accept="image/*" multiple />
      </label>
      <p class="tiny">${escapeHtml(fileText)}</p>
      <div class="actions">
        <button class="secondary" data-action="manual-preview" ${state.loading ? 'disabled' : ''}>Manual preview</button>
        <button class="primary" data-action="manual-full" ${state.loading ? 'disabled' : ''}>Manual report</button>
      </div>
    </section>
  `;
}

function settingsCard() {
  const settings = state.settings || {};
  return `
    <section class="card soft">
      <details>
        <summary>Backend settings</summary>
        <p class="tiny">Leave API base empty to use local demo scoring. Add your ListLens backend to call <code>/guard/checks</code> and <code>/analyse</code>.</p>
        <label>API base URL
          <input id="api-base" value="${escapeHtml(settings.apiBase || '')}" placeholder="https://your-listlens-api.replit.app" />
        </label>
        <label>Default Lens
          <select id="settings-lens">${Guard.lensSelectOptions(settings.lens || Guard.DEFAULT_LENS_ID, { includeAuto: true })}</select>
        </label>
        <button class="secondary" data-action="save-settings">Save settings</button>
      </details>
    </section>
  `;
}

function savedReportsCard() {
  const reports = state.reports || [];
  return `
    <section class="card">
      <h2>Saved reports</h2>
      ${reports.length ? `
        ${reports.slice(0, 8).map((item) => `
          <button class="report-item" data-action="load-report" data-id="${escapeHtml(item.id)}">
            <strong>${escapeHtml(item.report?.risk || 'Risk')} · ${escapeHtml(item.report?.lensShortName || item.report?.lensName || 'Lens')}</strong>
            <div class="tiny">${escapeHtml(item.listing?.title || 'Untitled')}</div>
            <div class="tiny">${escapeHtml(formatDate(item.createdAt))} · ${escapeHtml(Guard.platformLabel(item.listing?.marketplace || 'marketplace'))}</div>
          </button>
        `).join('')}
        <button class="danger" data-action="clear-reports">Clear saved reports</button>
      ` : '<p class="muted">Reports you run will be saved here by Lens and listing URL. Motor exclusions are not saved as Guard reports.</p>'}
    </section>
  `;
}

function currentListing(allowManualFallback = true) {
  if (state.listing?.supported || !allowManualFallback) return state.listing;
  return null;
}

async function manualListing() {
  const url = document.getElementById('manual-url')?.value || '';
  const description = document.getElementById('manual-description')?.value || '';
  const title = document.getElementById('manual-title')?.value || 'Manual listing check';
  const manualLens = document.getElementById('manual-lens')?.value || getSelectedLensId(false);
  const photos = await readManualFilePhotos(state.manualFiles);
  const listing = {
    supported: Boolean(url || description || title || photos.length),
    marketplace: Guard.inferMarketplace(url),
    url,
    title,
    priceText: document.getElementById('manual-price')?.value || '',
    photos,
    sellerName: '',
    sellerRating: '',
    description,
    rawVisibleText: description,
    detectedLens: manualLens,
    extractedAt: new Date().toISOString()
  };
  const lens = Guard.resolveLensForListing(listing, manualLens);
  listing.detectedLens = lens.id;
  listing.detectedLensName = lens.name;
  listing.motorExcluded = Boolean(lens.excluded);
  return listing;
}

async function readManualFilePhotos(files) {
  const selected = Array.from(files || []).slice(0, 8);
  const outputs = [];
  for (const file of selected) {
    outputs.push({ name: file.name, alt: file.name, size: file.size, dataUrl: await readFileAsDataUrl(file) });
  }
  return outputs;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

async function getListingFromTab(tab) {
  if (!tab?.id) return null;
  try {
    const listing = await sendTab(tab.id, { type: 'GET_LISTING_INFO' });
    if (listing?.supported) return listing;
  } catch {
    // Expected on unsupported pages without the content script.
  }
  const listing = {
    supported: false,
    marketplace: Guard.inferMarketplace(tab?.url || ''),
    url: tab?.url || '',
    title: tab?.title || '',
    photos: [],
    extractedAt: new Date().toISOString()
  };
  const lens = Guard.resolveLensForListing(listing, getSelectedLensId(false));
  listing.detectedLens = lens.id;
  listing.detectedLensName = lens.name;
  listing.motorExcluded = Boolean(lens.excluded);
  return listing;
}

function currentLens(listing = currentListing(false)) {
  return Guard.resolveLensForListing(listing || {}, getSelectedLensId(false));
}

function getSelectedLensId(fromDom = true) {
  if (fromDom) {
    const active = document.getElementById('active-lens')?.value;
    if (active) return active;
    const manual = document.getElementById('manual-lens')?.value;
    if (manual) return manual;
    const settings = document.getElementById('settings-lens')?.value;
    if (settings) return settings;
  }
  return state.settings?.lens || Guard.DEFAULT_LENS_ID;
}

function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(tabs[0] || null);
    });
  });
}

function sendRuntime(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(payload, (response) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(response || {});
    });
  });
}

function sendTab(tabId, payload) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, payload, (response) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(response || {});
    });
  });
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  try { return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)); }
  catch { return String(value); }
}

function escapeHtml(value) {
  return Guard.escapeHtml(value);
}
