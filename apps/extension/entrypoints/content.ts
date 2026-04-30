export default defineContentScript({
  matches: [
    "*://*.ebay.co.uk/itm/*",
    "*://*.ebay.com/itm/*",
    "*://www.vinted.co.uk/items/*",
    "*://www.vinted.com/items/*",
    "*://www.vinted.co.uk/catalog/*",
    "*://www.vinted.com/catalog/*",
  ],
  main() {
    function detectListing(): {
      supported: boolean;
      marketplace: string;
      url: string;
    } {
      const href = window.location.href;

      const isEbay =
        /^https?:\/\/[^/]*ebay\.(co\.uk|com)\/itm\//.test(href);
      const isVinted =
        /^https?:\/\/www\.vinted\.(co\.uk|com)\/(items|catalog)\//.test(href);

      return {
        supported: isEbay || isVinted,
        marketplace: isEbay ? "ebay" : "vinted",
        url: href,
      };
    }

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.type === "GET_LISTING_INFO") {
        sendResponse(detectListing());
      }
    });
  },
});
