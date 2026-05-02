import React, { useEffect, useState } from "react";

const BRAND = {
  navy: "#040a14",
  navy2: "#081325",
  card: "#0a1628",
  cyan: "#22d3ee",
  cyanSoft: "#67e8f9",
  blue: "#3ea8ff",
  green: "#4ade80",
  amber: "#fb923c",
  red: "#f87171",
  violet: "#8b5cf6",
  border: "rgba(34,211,238,0.2)",
  text: "#fafafa",
  muted: "#94a3b8",
};

type RiskLevel = "low" | "medium" | "medium_high" | "high" | "inconclusive";

interface RedFlag {
  severity: "low" | "medium" | "high";
  type: string;
  message: string;
}

interface GuardResult {
  risk: { level: RiskLevel; confidence: number };
  red_flags: RedFlag[];
  seller_questions: string[];
  missing_photos: string[];
  disclaimer: string;
}

const RISK_COLOURS: Record<RiskLevel, string> = {
  low: BRAND.green,
  medium: BRAND.amber,
  medium_high: "#f97316",
  high: BRAND.red,
  inconclusive: BRAND.muted,
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  medium_high: "Medium-High Risk",
  high: "High Risk",
  inconclusive: "Inconclusive",
};

const SEV_COLOUR: Record<string, string> = {
  low: BRAND.amber,
  medium: "#f97316",
  high: BRAND.red,
};

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

const DEFAULT_API = "https://listlens.replit.app/api";

const TRUSTED_API_RE = /^https:\/\/[a-z0-9-]+\.replit\.(app|dev)\/api$/i;

function isTrustedApiBase(url: string): boolean {
  return TRUSTED_API_RE.test(url);
}

type ApiSource = "user" | "detected" | "default";

export default function App() {
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [apiSource, setApiSource] = useState<ApiSource>("default");
  const [editingApi, setEditingApi] = useState(false);
  const [apiInput, setApiInput] = useState(DEFAULT_API);

  const [listingUrl, setListingUrl] = useState<string | null>(null);
  const [marketplace, setMarketplace] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuardResult | null>(null);

  useEffect(() => {
    chrome.storage.local.get(["apiBase", "detectedApiBase"], (v) => {
      const userSaved = v["apiBase"] as string | undefined;
      const detected = v["detectedApiBase"] as string | undefined;

      if (userSaved) {
        setApiBase(userSaved);
        setApiInput(userSaved);
        setApiSource("user");
      } else if (detected && isTrustedApiBase(detected)) {
        setApiBase(detected);
        setApiInput(detected);
        setApiSource("detected");
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_LISTING_INFO" },
        (response) => {
          if (chrome.runtime.lastError) {
            setSupported(false);
            return;
          }
          if (response && response.supported) {
            setSupported(true);
            setListingUrl(response.url as string);
            setMarketplace(response.marketplace as string);
          } else {
            setSupported(false);
          }
        },
      );
    });
  }, []);

  function saveApiBase() {
    const trimmed = apiInput.trim().replace(/\/$/, "");
    setApiBase(trimmed);
    setApiInput(trimmed);
    setApiSource("user");
    chrome.storage.local.set({ apiBase: trimmed });
    setEditingApi(false);
  }

  function resetApiBase() {
    chrome.storage.local.get(["detectedApiBase"], (v) => {
      const fallback = (v["detectedApiBase"] as string | undefined) ?? DEFAULT_API;
      const src: ApiSource = v["detectedApiBase"] ? "detected" : "default";
      setApiBase(fallback);
      setApiInput(fallback);
      setApiSource(src);
      chrome.storage.local.remove("apiBase");
      setEditingApi(false);
    });
  }

  async function runCheck() {
    if (!listingUrl) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await chrome.runtime.sendMessage({
        type: "GUARD_CHECK",
        apiBase,
        url: listingUrl,
        lens: "ShoeLens",
      });

      if (resp.error) {
        setError(resp.error as string);
      } else {
        setResult(resp.result as GuardResult);
      }
    } catch (e) {
      setError("Extension error: " + String(e));
    } finally {
      setLoading(false);
    }
  }

  const s: Record<string, React.CSSProperties> = {
    wrap: {
      padding: "14px 14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      background: BRAND.navy,
      minHeight: 200,
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: {
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: 0.5,
      color: BRAND.cyan,
    },
    gearBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: BRAND.muted,
      fontSize: 15,
      lineHeight: 1,
      padding: "2px 4px",
    },
    divider: {
      height: 1,
      background: BRAND.border,
    },
    urlBox: {
      background: BRAND.navy2,
      borderRadius: 6,
      border: `1px solid ${BRAND.border}`,
      padding: "6px 10px",
      fontSize: 11,
      color: BRAND.muted,
      wordBreak: "break-all" as const,
      lineHeight: 1.4,
    },
    tag: (color: string) => ({
      display: "inline-block",
      background: color + "22",
      color,
      border: `1px solid ${color}55`,
      borderRadius: 4,
      padding: "2px 7px",
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    }),
    btn: {
      background: `linear-gradient(135deg, ${BRAND.cyan}, ${BRAND.blue})`,
      color: "#040a14",
      border: "none",
      borderRadius: 8,
      padding: "9px 14px",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      width: "100%",
      letterSpacing: 0.3,
    },
    btnDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    errorBox: {
      background: BRAND.red + "18",
      border: `1px solid ${BRAND.red}55`,
      borderRadius: 6,
      padding: "8px 10px",
      color: BRAND.red,
      fontSize: 11,
      lineHeight: 1.5,
    },
    resultCard: {
      background: BRAND.card,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 8,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 8,
    },
    riskBadge: (level: RiskLevel) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: RISK_COLOURS[level] + "22",
      color: RISK_COLOURS[level],
      border: `1px solid ${RISK_COLOURS[level]}55`,
      borderRadius: 6,
      padding: "4px 10px",
      fontWeight: 700,
      fontSize: 12,
    }),
    sectionLabel: {
      fontSize: 10,
      fontWeight: 700,
      color: BRAND.muted,
      textTransform: "uppercase" as const,
      letterSpacing: 0.8,
      marginBottom: 3,
    },
    flagItem: (sev: string) => ({
      display: "flex",
      gap: 6,
      fontSize: 11,
      lineHeight: 1.4,
      color: BRAND.text,
      paddingBottom: 4,
    }),
    flagDot: (sev: string) => ({
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: SEV_COLOUR[sev] ?? BRAND.muted,
      flexShrink: 0,
      marginTop: 4,
    }),
    disclaimer: {
      fontSize: 10,
      color: BRAND.muted,
      fontStyle: "italic",
      lineHeight: 1.4,
    },
    apiRow: {
      display: "flex",
      gap: 6,
      alignItems: "center",
    },
    apiInput: {
      flex: 1,
      background: BRAND.navy2,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 5,
      color: BRAND.text,
      fontSize: 11,
      padding: "4px 7px",
      outline: "none",
    },
    saveBtn: {
      background: BRAND.cyan,
      color: "#040a14",
      border: "none",
      borderRadius: 5,
      padding: "4px 8px",
      fontWeight: 700,
      fontSize: 11,
      cursor: "pointer",
    },
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.logo}>🛡 List-LENS Guard</span>
        <button
          style={s.gearBtn}
          onClick={() => setEditingApi((v) => !v)}
          title="Settings"
        >
          ⚙
        </button>
      </div>

      {editingApi && (
        <div>
          <div style={{ ...s.sectionLabel, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>API Base URL</span>
            {apiSource === "detected" && (
              <span style={{ color: BRAND.green, fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                ✓ AUTO-DETECTED
              </span>
            )}
            {apiSource === "user" && (
              <span style={{ color: BRAND.cyan, fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                CUSTOM
              </span>
            )}
            {apiSource === "default" && (
              <span style={{ color: BRAND.muted, fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                DEFAULT
              </span>
            )}
          </div>
          <div style={s.apiRow}>
            <input
              style={s.apiInput}
              value={apiInput}
              onChange={(e) => setApiInput(e.currentTarget.value)}
              placeholder="https://your-app.replit.app/api"
            />
            <button style={s.saveBtn} onClick={saveApiBase}>
              Save
            </button>
          </div>
          {apiSource === "user" && (
            <div
              style={{ fontSize: 10, color: BRAND.muted, marginTop: 4, cursor: "pointer", textDecoration: "underline" }}
              onClick={resetApiBase}
            >
              Reset to auto-detected
            </div>
          )}
        </div>
      )}

      <div style={s.divider} />

      {supported === null && (
        <div style={{ color: BRAND.muted, fontSize: 12, textAlign: "center" }}>
          Detecting page…
        </div>
      )}

      {supported === false && (
        <div style={s.errorBox}>
          Navigate to an eBay or Vinted listing page to use Guard.
        </div>
      )}

      {supported === true && (
        <>
          {marketplace && (
            <span style={s.tag(BRAND.cyan)}>
              {marketplace === "ebay" ? "eBay" : "Vinted"}
            </span>
          )}
          <div style={s.urlBox}>{listingUrl}</div>

          <button
            style={{
              ...s.btn,
              ...(loading || !listingUrl ? s.btnDisabled : {}),
            }}
            disabled={loading || !listingUrl}
            onClick={runCheck}
          >
            {loading ? "Running Guard check…" : "Run Guard check"}
          </button>
        </>
      )}

      {error && <div style={s.errorBox}>{error}</div>}

      {result && (
        <div style={s.resultCard}>
          <div style={s.riskBadge(result.risk.level)}>
            {RISK_LABELS[result.risk.level]}
            <span style={{ opacity: 0.7, fontWeight: 400 }}>
              ({pct(result.risk.confidence)} confidence)
            </span>
          </div>

          {result.red_flags.length > 0 && (
            <div>
              <div style={s.sectionLabel}>Red Flags</div>
              {result.red_flags.map((f, i) => (
                <div key={i} style={s.flagItem(f.severity)}>
                  <div style={s.flagDot(f.severity)} />
                  <span>{f.message}</span>
                </div>
              ))}
            </div>
          )}

          {result.seller_questions.length > 0 && (
            <div>
              <div style={s.sectionLabel}>Ask the Seller</div>
              {result.seller_questions.map((q, i) => (
                <div
                  key={i}
                  style={{ fontSize: 11, color: BRAND.muted, marginBottom: 3 }}
                >
                  • {q}
                </div>
              ))}
            </div>
          )}

          <div style={s.disclaimer}>{result.disclaimer}</div>
        </div>
      )}
    </div>
  );
}
