export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type !== "GUARD_CHECK") return;

    const { apiBase, url, lens } = msg as {
      apiBase: string;
      url: string;
      lens: string;
    };

    runGuardCheck(apiBase, url, lens)
      .then((result) => sendResponse({ result }))
      .catch((err) =>
        sendResponse({ error: String(err instanceof Error ? err.message : err) }),
      );

    return true;
  });
});

async function runGuardCheck(
  apiBase: string,
  url: string,
  lens: string,
): Promise<unknown> {
  const base = apiBase.replace(/\/$/, "");

  // credentials:"include" forwards the session cookie when the API origin is
  // listed in host_permissions and the server allows the extension origin via
  // CORS. The cookie is SameSite:Lax on the server side; chrome-extension://
  // origins are treated as cross-site, so the cookie will be sent only when
  // the server sets SameSite:None or the user's browser allows it. Guard
  // checks work unauthenticated; auth is best-effort for history persistence.
  const createRes = await fetch(`${base}/guard/checks`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, lens }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => createRes.statusText);
    throw new Error(`Guard check creation failed (${createRes.status}): ${text}`);
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
