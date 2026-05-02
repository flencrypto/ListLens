const LISTLENS_API_TOKEN = "listlens-api";

const TRUSTED_ORIGIN_RE =
  /^https:\/\/[a-z0-9-]+\.replit\.(app|dev)$/i;

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "GUARD_CHECK") {
      const { apiBase, url, lens } = msg as {
        apiBase: string;
        url: string;
        lens: string;
      };

      runGuardCheck(apiBase, url, lens)
        .then((result) => sendResponse({ result }))
        .catch((err) =>
          sendResponse({
            error: String(err instanceof Error ? err.message : err),
          }),
        );

      return true;
    }

    if (msg.type === "VERIFY_API_ORIGIN") {
      const { origin } = msg as { origin: string };

      if (!TRUSTED_ORIGIN_RE.test(origin)) {
        return;
      }

      const candidateApi = `${origin}/api`;

      verifyApiOrigin(candidateApi)
        .then((valid) => {
          if (valid) {
            chrome.storage.local.set({ detectedApiBase: candidateApi });
          } else {
            chrome.storage.local.get(["detectedApiBase"], (stored) => {
              if (stored["detectedApiBase"] === candidateApi) {
                chrome.storage.local.remove("detectedApiBase");
              }
            });
          }
        })
        .catch(() => {
          chrome.storage.local.get(["detectedApiBase"], (stored) => {
            if (stored["detectedApiBase"] === candidateApi) {
              chrome.storage.local.remove("detectedApiBase");
            }
          });
        });

      return false;
    }
  });
});

async function verifyApiOrigin(apiBase: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase}/ping`, {
      method: "GET",
      credentials: "omit",
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { service?: string };
    return body.service === LISTLENS_API_TOKEN;
  } catch {
    return false;
  }
}

async function runGuardCheck(
  apiBase: string,
  url: string,
  lens: string,
): Promise<unknown> {
  const base = apiBase.replace(/\/$/, "");

  const createRes = await fetch(`${base}/guard/checks`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, lens }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => createRes.statusText);
    throw new Error(
      `Guard check creation failed (${createRes.status}): ${text}`,
    );
  }

  const { id } = (await createRes.json()) as { id: string };

  const analyseRes = await fetch(`${base}/guard/checks/${id}/analyse`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!analyseRes.ok) {
    const text = await analyseRes.text().catch(() => analyseRes.statusText);
    throw new Error(`Guard analysis failed (${analyseRes.status}): ${text}`);
  }

  const { report } = (await analyseRes.json()) as { report: unknown };
  return report;
}
