// @ts-nocheck
import Guard from '../utils/lens-registry.js';

const ROOT_ID = 'list-lens-guard-root';
const BUTTON_ID = 'list-lens-guard-button';

export default defineContentScript({
  matches: [
    '*://*.ebay.co.uk/itm/*',
    '*://*.ebay.com/itm/*',
    '*://www.vinted.co.uk/catalog/*',
    '*://www.vinted.co.uk/items/*',
    '*://www.vinted.com/catalog/*',
    '*://www.vinted.com/items/*',
  ],
  runAt: 'document_idle',
  main() {
    let currentListing = null;
    let currentReport = null;
    let panelOpen = false;
    let selectedLensId = Guard.DEFAULT_LENS_ID;

    bootstrap();

    function bootstrap() {
      refreshListing();
      injectButton();
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message?.type === 'GET_LISTING_INFO') {
          refreshListing();
          sendResponse(currentListing);
          return true;
        }
        if (message?.type === 'SHOW_GUARD_PANEL') {
          panelOpen = true;
          renderPanel();
          sendResponse({ ok: true });
          return true;
        }
        return false;
      });

      const observer = new MutationObserver(debounce(() => {
        const before = JSON.stringify({ title: currentListing?.title, price: currentListing?.priceText, lens: currentListing?.detectedLens });
        refreshListing();
        const after = JSON.stringify({ title: currentListing?.title, price: currentListing?.priceText, lens: currentListing?.detectedLens });
        if (before !== after && panelOpen) renderPanel();
      }, 900));
      observer.observe(document.documentElement, { childList: true, subtree: true });

      let lastUrl = location.href;
      setInterval(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          currentReport = null;
          refreshListing();
          injectButton();
          if (panelOpen) renderPanel();
        }
      }, 1000);
    }

    function refreshListing() {
      currentListing = extractListing();
      const routed = Guard.resolveLensForListing(currentListing, selectedLensId);
      currentListing.detectedLens = routed.id;
      currentListing.detectedLensName = routed.name;
      currentListing.motorExcluded = Boolean(routed.excluded);
      currentListing.lensUncertain = Boolean(routed.uncertain);
      currentListing.routingReason = routed.reason || '';
      sendRuntimeSafe({ type: 'LISTING_STATUS', listing: currentListing });
      return currentListing;
    }

    function extractListing() {
      const url = location.href;
      const marketplace = Guard.inferMarketplace(url);
      const supported = Guard.isDirectListingUrl(url);
      const title = firstText([
        'h1[itemprop="name"]',
        'h1.x-item-title__mainTitle',
        'h1[data-testid="item-title"]',
        'h1',
        '[data-testid="item-page-title"]'
      ]) || meta('og:title') || document.title.replace(/\s+\|\s+eBay.*$/i, '').trim();

      const priceText = firstText([
        '[itemprop="price"]',
        '.x-price-primary span',
        '[data-testid="item-price"]',
        '[data-testid="price"]',
        '.web_ui__Text__subtitle',
        '.web_ui__Text__title'
      ]) || findPriceText(document.body.innerText);

      const description = firstText([
        '#viTabs_0_is',
        '.x-item-description-child',
        '[data-testid="item-description"]',
        '[itemprop="description"]',
        'section[aria-label*="description" i]'
      ]);

      const sellerName = firstText([
        '.x-sellercard-atf__info__about-seller a span',
        '.x-sellercard-atf__info__about-seller span',
        '[data-testid="profile-username"]',
        '[data-testid="seller-name"]',
        'a[href*="/member/"]'
      ]);

      const sellerRating = firstText([
        '.x-sellercard-atf__data-item',
        '.ux-seller-section__item--seller',
        '[data-testid="seller-feedback"]',
        '[data-testid="profile-rating"]'
      ]);

      const condition = firstText([
        '[itemprop="itemCondition"]',
        '.x-item-condition-text',
        '[data-testid="item-attribute-status"]',
        '[data-testid="item-condition"]'
      ]);

      const category = firstText([
        'nav[aria-label="Breadcrumb"]',
        '.breadcrumbs',
        '[data-testid="item-details"]',
        '[data-testid="breadcrumbs"]'
      ]);

      const brand = findFieldValue(['Brand', 'brand']);
      const size = findFieldValue(['Size', 'Shoe Size', 'UK Shoe Size', 'Clothing Size']);
      const shippingLocation = firstText(['[data-testid="item-location"]', '.ux-labels-values__values-content', '[itemprop="availableAtOrFrom"]']);
      const rawVisibleText = document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 12000);
      const photos = extractPhotos();

      const listing = {
        supported,
        marketplace,
        url,
        title,
        priceText,
        currency: currencyFromPrice(priceText),
        photos,
        sellerName,
        sellerRating,
        description,
        condition,
        size,
        brand,
        category,
        shippingLocation,
        rawVisibleText,
        extractedAt: new Date().toISOString()
      };

      const routed = Guard.resolveLensForListing(listing, selectedLensId);
      listing.detectedLens = routed.id;
      listing.detectedLensName = routed.name;
      listing.motorExcluded = Boolean(routed.excluded);
      listing.lensUncertain = Boolean(routed.uncertain);
      listing.routingReason = routed.reason || '';
      return listing;
    }

    function injectButton() {
      if (document.getElementById(BUTTON_ID)) return;
      const button = document.createElement('button');
      button.id = BUTTON_ID;
      button.type = 'button';
      button.addEventListener('click', () => {
        panelOpen = true;
        renderPanel();
      });
      document.documentElement.appendChild(button);
      updateButton();
    }

    function updateButton() {
      const button = document.getElementById(BUTTON_ID);
      if (!button || !currentListing?.supported) return;
      const lens = Guard.resolveLensForListing(currentListing, selectedLensId);
      button.textContent = lens.excluded ? 'Motors not supported' : lens.uncertain ? 'Choose Lens' : `${lens.shortName} Guard`;
      button.className = lens.excluded ? 'llg-motor' : lens.uncertain ? 'llg-uncertain' : '';
      injectBaseStyles();
    }

    function renderPanel() {
      updateButton();
      let root = document.getElementById(ROOT_ID);
      if (!root) {
        root = document.createElement('aside');
        root.id = ROOT_ID;
        document.documentElement.appendChild(root);
      }

      const lens = Guard.resolveLensForListing(currentListing, selectedLensId);
      const missing = Guard.estimateMissingEvidence(currentListing, lens.id).slice(0, 6);
      const checklist = Guard.checklistFor(currentListing, lens.id).slice(0, 9);

      root.innerHTML = `
        <div class="llg-panel">
          <div class="llg-header">
            <div>
              <p class="llg-eyebrow">List-LENS Guard</p>
              <h2>${escapeHtml(lens.excluded ? 'Motor category detected' : lens.uncertain ? 'Choose a Lens' : `${lens.shortName} listing detected`)}</h2>
            </div>
            <button class="llg-icon" data-action="close">×</button>
          </div>
          ${lens.excluded ? motorNotice(lens) : listingSummary(lens, missing, checklist)}
          ${currentReport ? reportView(currentReport) : safeLanguage(lens)}
        </div>
      `;

      root.querySelectorAll('[data-action]').forEach((node) => node.addEventListener('click', handlePanelAction));
      const select = root.querySelector('#llg-lens-select');
      if (select) select.addEventListener('change', (event) => {
        selectedLensId = event.target.value;
        currentReport = null;
        refreshListing();
        renderPanel();
      });
      injectBaseStyles();
    }

    function listingSummary(lens, missing, checklist) {
      return `
        <section class="llg-card">
          <label class="llg-label">Active Lens</label>
          <select id="llg-lens-select">${Guard.lensSelectOptions(selectedLensId, { includeAuto: true })}</select>
          <p class="llg-small">Auto-detected: ${escapeHtml(currentListing.detectedLensName || lens.name)}${currentListing.routingReason ? ` · ${escapeHtml(currentListing.routingReason)}` : ''}</p>
          <div class="llg-facts">
            <span>${escapeHtml(Guard.platformLabel(currentListing.marketplace))}</span>
            <span>${escapeHtml(currentListing.priceText || 'Price unclear')}</span>
            <span>${currentListing.photos.length} photo${currentListing.photos.length === 1 ? '' : 's'}</span>
          </div>
          <h3>${escapeHtml(currentListing.title || 'Untitled listing')}</h3>
          ${missing.length ? `<p class="llg-label">Possible missing evidence</p><ul>${missing.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p class="llg-small">Basic category evidence is visible. A full report can still flag uncertainty.</p>'}
          ${checklist.length ? `<p class="llg-label">Evidence checklist</p><div class="llg-checks">${checklist.map((item) => `<div><b>${item.found ? '✓' : '✗'}</b> ${escapeHtml(item.label)}</div>`).join('')}</div>` : ''}
          <div class="llg-actions">
            <button data-action="preview">Free preview</button>
            <button class="primary" data-action="full">Run Guard Check</button>
          </div>
          <p class="llg-small">£1.99 or 1 Guard credit when connected to the ListLens backend.</p>
        </section>
      `;
    }

    function motorNotice(lens) {
      return `
        <section class="llg-card llg-motor-card">
          <p><strong>This version of List-LENS Guard does not support cars, motorbikes, scooters, vehicle parts or fitment checks.</strong></p>
          <p class="llg-small">No Guard risk report will be generated for this listing.</p>
          <p class="llg-small">Neutral reminder: review the marketplace's own buyer protection, service history, part numbers, MOT details, fitment information and seller feedback.</p>
          ${lens.reason ? `<p class="llg-small">${escapeHtml(lens.reason)}</p>` : ''}
        </section>
      `;
    }

    function safeLanguage(lens) {
      if (lens.excluded) return '';
      return `
        <section class="llg-card llg-soft">
          <p class="llg-label">Safe-use note</p>
          <p class="llg-small">Guard is an AI-assisted risk screen. It does not formally authenticate items and should not be treated as proof that a listing is genuine, counterfeit, complete, correctly graded or correctly described.</p>
        </section>
      `;
    }

    function reportView(report) {
      if (report.excluded) return motorNotice({ reason: report.reason });
      const checklist = Array.isArray(report.checklist) ? report.checklist : [];
      const missing = Array.isArray(report.missingEvidence) ? report.missingEvidence : [];
      return `
        <section class="llg-card llg-result ${escapeHtml(String(report.risk || '').toLowerCase())}">
          <p class="llg-label">Guard result · ${escapeHtml(report.lensShortName || report.lensName || 'Lens')}</p>
          <div class="llg-result-row"><strong>${escapeHtml(report.risk || 'Inconclusive')} Risk</strong><span>${Math.round(Number(report.confidence) || 0)}% confidence</span></div>
          <p>${escapeHtml(report.summary || report.reason || '')}</p>
          ${report.backendError ? `<p class="llg-small">Backend unavailable: ${escapeHtml(report.backendError)}</p>` : ''}
        </section>
        ${checklist.length ? `<section class="llg-card"><p class="llg-label">Evidence checklist</p><div class="llg-checks">${checklist.map((item) => `<div><b>${item.found ? '✓' : '✗'}</b> ${escapeHtml(item.label)}</div>`).join('')}</div></section>` : ''}
        <section class="llg-card"><p class="llg-label">Missing evidence</p>${missing.length ? `<ul>${missing.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p class="llg-small">No major missing-evidence items detected from the visible listing.</p>'}</section>
        <section class="llg-card"><p class="llg-label">Message to seller</p><pre>${escapeHtml(report.sellerQuestions || '')}</pre><button data-action="copy">Copy seller questions</button></section>
        <section class="llg-card llg-soft"><p class="llg-label">Next action</p><p class="llg-small">${escapeHtml(report.nextAction || '')}</p><p class="llg-small">${escapeHtml(report.priceWarning || '')}</p><p class="llg-small">${escapeHtml(report.platformNote || '')}</p></section>
      `;
    }

    async function handlePanelAction(event) {
      const action = event.currentTarget.dataset.action;
      if (action === 'close') {
        panelOpen = false;
        document.getElementById(ROOT_ID)?.remove();
        return;
      }
      if (action === 'preview' || action === 'full') {
        await runGuard(action === 'preview' ? 'GUARD_PREVIEW' : 'GUARD_CHECK');
        return;
      }
      if (action === 'copy') {
        await navigator.clipboard.writeText(currentReport?.sellerQuestions || '');
      }
    }

    async function runGuard(type) {
      const root = document.getElementById(ROOT_ID);
      const button = root?.querySelector(`[data-action="${type === 'GUARD_PREVIEW' ? 'preview' : 'full'}"]`);
      if (button) button.textContent = 'Checking…';
      try {
        refreshListing();
        const response = await sendRuntime({ type, listing: currentListing, lens: selectedLensId });
        if (!response.ok) throw new Error(response.error || 'Guard check failed.');
        currentReport = response.report;
      } catch (error) {
        currentReport = {
          risk: 'Inconclusive',
          confidence: 0,
          lensShortName: 'Error',
          summary: error instanceof Error ? error.message : String(error),
          missingEvidence: [],
          sellerQuestions: ''
        };
      }
      renderPanel();
    }

    function sendRuntime(payload) {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(payload, (response) => {
            const error = chrome.runtime.lastError;
            if (error) reject(new Error(error.message));
            else resolve(response || {});
          });
        } catch (error) {
          reject(error);
        }
      });
    }

    function sendRuntimeSafe(payload) {
      try {
        chrome.runtime.sendMessage(payload, () => void chrome.runtime.lastError);
      } catch {
        // The page can outlive the extension context during reloads.
      }
    }

    function extractPhotos() {
      const urls = new Map();
      const add = (url, alt = '') => {
        const clean = normaliseImageUrl(url);
        if (!clean) return;
        if (!urls.has(clean)) urls.set(clean, { url: clean, alt: alt || '' });
      };
      add(meta('og:image'), 'Open Graph image');
      document.querySelectorAll('img').forEach((img) => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
        const rect = img.getBoundingClientRect();
        if (rect.width < 80 || rect.height < 80) return;
        add(src, img.alt || img.getAttribute('aria-label') || 'listing image');
      });
      return Array.from(urls.values()).slice(0, 16);
    }

    function normaliseImageUrl(url) {
      if (!url || typeof url !== 'string') return '';
      if (url.startsWith('//')) return `${location.protocol}${url}`;
      if (url.startsWith('/')) return `${location.origin}${url}`;
      if (!/^https?:/i.test(url)) return '';
      return url.replace(/\?.*$/, '');
    }

    function firstText(selectors) {
      for (const selector of selectors) {
        const node = document.querySelector(selector);
        const text = node?.textContent?.replace(/\s+/g, ' ').trim();
        if (text) return text;
      }
      return '';
    }

    function meta(name) {
      return document.querySelector(`meta[property="${name}"]`)?.content || document.querySelector(`meta[name="${name}"]`)?.content || '';
    }

    function findFieldValue(labels) {
      const text = document.body.innerText.replace(/\r/g, '');
      for (const label of labels) {
        const pattern = new RegExp(`${escapeRegExp(label)}\\s*[:\\n]\\s*([^\\n]{1,80})`, 'i');
        const match = text.match(pattern);
        if (match) return match[1].trim();
      }
      return '';
    }

    function findPriceText(text = '') {
      const match = String(text).match(/(?:£|GBP|\$|USD|€|EUR)\s?[0-9][0-9,.]*/i);
      return match ? match[0] : '';
    }

    function currencyFromPrice(value = '') {
      if (/£|GBP/i.test(value)) return 'GBP';
      if (/\$|USD/i.test(value)) return 'USD';
      if (/€|EUR/i.test(value)) return 'EUR';
      return '';
    }

    function injectBaseStyles() {
      if (document.getElementById('list-lens-guard-styles')) return;
      const style = document.createElement('style');
      style.id = 'list-lens-guard-styles';
      style.textContent = `
        #${BUTTON_ID} {
          all: initial; position: fixed; right: 18px; bottom: 18px; z-index: 2147483646;
          background: linear-gradient(135deg, #22d3ee, #3b82f6); color: #03111f;
          border-radius: 999px; padding: 11px 15px; font: 800 13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
          box-shadow: 0 18px 50px rgba(2, 6, 23, .35); cursor: pointer;
        }
        #${BUTTON_ID}.llg-motor { background: #64748b; color: #f8fafc; }
        #${BUTTON_ID}.llg-uncertain { background: #f59e0b; color: #111827; }
        #${ROOT_ID} { all: initial; position: fixed; top: 14px; right: 14px; width: min(410px, calc(100vw - 28px)); max-height: calc(100vh - 28px); z-index: 2147483647; }
        #${ROOT_ID} * { box-sizing: border-box; }
        .llg-panel { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Inter, sans-serif; background: #020617; color: #f8fafc; border: 1px solid rgba(56, 189, 248, .28); border-radius: 22px; padding: 14px; box-shadow: 0 30px 100px rgba(2, 6, 23, .55); overflow: auto; max-height: calc(100vh - 28px); display: grid; gap: 10px; }
        .llg-header { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
        .llg-header h2 { margin: 0; font-size: 18px; line-height: 1.2; }
        .llg-eyebrow, .llg-label { margin: 0 0 6px; color: #93c5fd; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .llg-card { background: rgba(15, 23, 42, .92); border: 1px solid rgba(148, 163, 184, .18); border-radius: 16px; padding: 13px; }
        .llg-soft { background: rgba(30, 41, 59, .7); }
        .llg-motor-card { border-color: rgba(148, 163, 184, .42); background: rgba(51, 65, 85, .9); }
        .llg-small { margin: 7px 0 0; color: #cbd5e1; font-size: 12px; line-height: 1.48; }
        .llg-facts, .llg-actions { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 10px; }
        .llg-facts span { border-radius: 999px; background: rgba(148, 163, 184, .15); color: #e2e8f0; padding: 5px 8px; font-size: 11px; }
        .llg-card h3 { margin: 10px 0 0; font-size: 14px; line-height: 1.35; }
        .llg-card p { font-size: 13px; line-height: 1.45; }
        .llg-card ul { margin: 8px 0 0 18px; padding: 0; color: #e2e8f0; font-size: 12px; }
        .llg-checks { display: grid; gap: 5px; font-size: 12px; color: #e2e8f0; }
        .llg-checks b { display: inline-block; width: 16px; color: #38bdf8; }
        .llg-icon { background: rgba(148, 163, 184, .16); color: #fff; width: 34px; height: 34px; border-radius: 12px; border: 1px solid rgba(148, 163, 184, .22); font-size: 24px; line-height: 1; cursor: pointer; }
        .llg-actions button, .llg-card button { border-radius: 12px; border: 1px solid rgba(148, 163, 184, .22); padding: 10px 12px; cursor: pointer; font-weight: 900; background: rgba(148, 163, 184, .16); color: #f8fafc; font: 800 12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; }
        .llg-actions .primary, .llg-card .primary { background: #38bdf8; color: #03111f; }
        .llg-result.high { border-color: rgba(239,68,68,.55); }
        .llg-result.medium { border-color: rgba(245,158,11,.55); }
        .llg-result.low { border-color: rgba(34,197,94,.55); }
        .llg-result-row { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; margin-bottom: 8px; }
        .llg-result-row strong { font-size: 17px; }
        .llg-result-row span { color: #cbd5e1; font-size: 12px; }
        .llg-card select { width: 100%; background: rgba(2, 6, 23, .9); color: #f8fafc; border: 1px solid rgba(148, 163, 184, .28); border-radius: 12px; padding: 10px; font: 13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; }
        .llg-card pre { white-space: pre-wrap; margin: 8px 0 0; color: #e2e8f0; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      `;
      document.documentElement.appendChild(style);
    }

    function escapeHtml(value) { return Guard.escapeHtml(value); }
    function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function debounce(fn, wait) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); }; }
  }
});
