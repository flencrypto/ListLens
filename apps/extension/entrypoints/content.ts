export default defineContentScript({
  matches: [
    "https://*.ebay.co.uk/itm/*",
    "https://*.ebay.com/itm/*",
    "https://www.vinted.co.uk/items/*",
    "https://www.vinted.com/items/*",
  ],
  main() {
    console.log("[ListLens] content script loaded on", window.location.href);

    function extractListingContext() {
      const url = window.location.href;
      const title =
        document.querySelector('h1[itemprop="name"]')?.textContent?.trim() ??
        document.querySelector(".x-item-title__mainTitle")?.textContent?.trim() ??
        document.title;
      const priceEl =
        document.querySelector('[itemprop="price"]') ??
        document.querySelector(".x-price-primary");
      const price = priceEl?.getAttribute("content") ?? priceEl?.textContent?.trim() ?? null;
      const description =
        document.querySelector('[itemprop="description"]')?.textContent?.trim() ??
        document.querySelector(".x-item-description-child")?.textContent?.trim() ??
        null;
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>('.ux-image-carousel-item img, [data-testid="photo-img"]')
      )
        .map((img) => img.src)
        .filter(Boolean)
        .slice(0, 8);

      return { url, title, price, description, images };
    }

    // Send to background on page load
    const context = extractListingContext();
    browser.runtime.sendMessage({ type: "LISTING_CONTEXT", payload: context });

    // Also expose globally for popup to trigger re-extraction
    (window as unknown as Record<string, unknown>).__listlens_extract = extractListingContext;
  },
});
