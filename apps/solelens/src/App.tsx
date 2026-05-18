import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Database,
  Download,
  Eye,
  FileText,
  Gauge,
  Grid2X2,
  History,
  ImagePlus,
  Link2,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  PackageCheck,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Sparkles,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  WandSparkles,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { aiProviders } from "./data/aiProviders";
import {
  evaluateMarketplaceRecommendations,
  marketplaceRecommendations,
  type MarketplaceAgentResult,
} from "./data/marketplaceAgent";
import {
  requestCatalog,
  requestDataReadiness,
  requestListingDraft,
  requestScanAnalysis,
  type ApiResponseMeta,
  type CatalogSummary,
  type DataReadiness,
  type ListingDraft,
  type RealCatalogProfile,
  type ScanAnalysisResult,
} from "./apiClient";
import {
  conditionFindings,
  modelCoverage,
  productCandidates,
  reviewQueue,
  riskChecks,
  scanSlots,
  type ProductCandidate,
  type ScanSlot,
} from "./data/soleLensData";

type AnalysisState = "ready" | "processing" | "complete";

type SlotState = ScanSlot & {
  preview?: string;
};

type PageId =
  | "scan-intake"
  | "dashboard"
  | "inventory"
  | "scans"
  | "listings"
  | "orders"
  | "returns"
  | "analytics"
  | "reports"
  | "bulk-intake"
  | "expert-review"
  | "price-monitor"
  | "marketplace-agent"
  | "market-insights"
  | "integrations"
  | "team"
  | "settings";

type ConsumerTab = "home" | "scan" | "sell" | "closet" | "activity";
type MembershipTier = "consumer" | "reseller" | "shop";

type NavItem = {
  id: PageId;
  label: string;
  icon: LucideIcon;
};

type PageSpec = {
  title: string;
  description: string;
  kpis: Array<{ label: string; value: string; detail: string; trend: string; icon: LucideIcon }>;
  cards: Array<{ title: string; body: string; meta: string; icon: LucideIcon; tone?: "blue" | "green" | "amber" | "purple" }>;
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: string[][];
};

const workflow = ["Scan", "Identify", "Authenticate", "Grade", "Price", "List"];
const membershipTierStorageKey = "solelens-membership-tier";

const membershipTierOptions: Array<{ id: MembershipTier; label: string; detail: string }> = [
  { id: "consumer", label: "Consumer", detail: "Simple shoe scan app" },
  { id: "reseller", label: "Reseller", detail: "Listing and resale tools" },
  { id: "shop", label: "Shop", detail: "Full intake workspace" },
];

const navPrimary: NavItem[] = [
  { id: "scan-intake", label: "Scan Intake", icon: Camera },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Grid2X2 },
  { id: "scans", label: "Scans", icon: ClipboardCheck },
  { id: "listings", label: "Listings", icon: FileText },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "returns", label: "Returns", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: Download },
];

const navWorkflow: NavItem[] = [
  { id: "bulk-intake", label: "Bulk Intake", icon: PackageCheck },
  { id: "expert-review", label: "Expert Review", icon: ShieldCheck },
  { id: "price-monitor", label: "Price Monitor", icon: Gauge },
  { id: "marketplace-agent", label: "Marketplace Agent", icon: Store },
  { id: "market-insights", label: "Market Insights", icon: SlidersHorizontal },
];

const navSystem: NavItem[] = [
  { id: "integrations", label: "Integrations", icon: Box },
  { id: "team", label: "Team", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const allNavItems = [...navPrimary, ...navWorkflow, ...navSystem];

function normalizeMembershipTier(value: string | null): MembershipTier | null {
  return value === "consumer" || value === "reseller" || value === "shop" ? value : null;
}

function isConsumerStandaloneRoute() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "");
  return normalizedPath === "/consumer" || window.location.hash === "#consumer-mobile";
}

function consumerTabFromHash(): ConsumerTab {
  const hash = window.location.hash.replace("#", "");
  return ["home", "scan", "sell", "closet", "activity"].includes(hash) ? (hash as ConsumerTab) : "scan";
}

function pageFromHash(): PageId {
  const hash = window.location.hash.replace("#", "");
  return allNavItems.some((item) => item.id === hash) ? (hash as PageId) : "scan-intake";
}

function getInitialMembershipTier(): MembershipTier {
  const tierFromUrl = normalizeMembershipTier(new URLSearchParams(window.location.search).get("tier"));
  if (tierFromUrl) return tierFromUrl;
  if (isConsumerStandaloneRoute()) return "consumer";
  try {
    return normalizeMembershipTier(window.localStorage.getItem(membershipTierStorageKey)) ?? "consumer";
  } catch {
    return "consumer";
  }
}

function persistMembershipTier(tier: MembershipTier) {
  try {
    window.localStorage.setItem(membershipTierStorageKey, tier);
  } catch {
    // Local storage can be blocked in private or embedded browser sessions.
  }
}

function pageLabel(pageId: PageId) {
  return allNavItems.find((item) => item.id === pageId)?.label ?? "Scan Intake";
}

function formatCurrency(value: number) {
  return `GBP ${value.toLocaleString("en-GB")}`;
}

function formatCurrencyRange(low: number, high: number) {
  return `GBP ${low.toLocaleString("en-GB")}-${high.toLocaleString("en-GB")}`;
}

function getRiskCopy(risk: ProductCandidate["risk"]) {
  if (risk === "low") return { label: "Likely authentic", tone: "success", confidence: 92 };
  if (risk === "medium-low") return { label: "Likely authentic", tone: "success", confidence: 88 };
  if (risk === "medium") return { label: "Needs review", tone: "warning", confidence: 76 };
  return { label: "High risk", tone: "danger", confidence: 59 };
}

function createFreshScanSlots(): SlotState[] {
  return scanSlots.map((slot) => ({ ...slot, captured: false, preview: undefined }));
}

function getEditionStory(product: Pick<ProductCandidate, "id" | "brand" | "model" | "colorway">) {
  const signature = `${product.id} ${product.brand} ${product.model} ${product.colorway}`.toLowerCase();
  if (signature.includes("dunk")) {
    return "The Dunk started as a basketball silhouette and became a streetwear staple because of its clean panelled upper, padded collar, and strong colour-blocking potential. This edition has the familiar retro shape buyers look for in an everyday Nike rotation pair.";
  }
  if (signature.includes("jordan 4")) {
    return "The Air Jordan 4 is one of Jordan Brand's most recognisable retro silhouettes, known for wing eyelets, mesh panels, visible Air cushioning, and a chunky court profile.";
  }
  if (signature.includes("yeezy") || signature.includes("boost 350")) {
    return "The Yeezy Boost 350 V2 line is known for its low Primeknit-style shape, cushioned Boost feel, and strong resale demand. Buyers usually inspect labels, knit pattern, sole wear, and box details closely.";
  }
  if (signature.includes("air force 1")) {
    return "The Nike Air Force 1 is one of sneaker culture's durable staples, recognised for its clean cupsole build and versatile court profile. Leather creasing, outsole wear, and colour freshness drive buyer confidence.";
  }
  if (signature.includes("air max")) {
    return "Nike Air Max models are known for visible-Air cushioning, layered uppers, and broad lifestyle appeal. Clean midsoles, air-unit clarity, and toe-box condition matter most to buyers.";
  }
  return `${product.brand} ${product.model} has buyer appeal when the exact identity, edition context, size, condition, and photo evidence are presented clearly.`;
}

function catalogProfileToProductCandidate(profile: RealCatalogProfile): ProductCandidate {
  const baseProduct = {
    id: profile.id,
    brand: profile.brand,
    model: profile.model,
    colorway: "Reference catalog match",
  };
  return {
    ...baseProduct,
    sku: profile.referenceId,
    release: "Catalog profile",
    size: "Size pending",
    image: profile.sampleImages[0] ?? "/assets/sneakers/candidate-dunk.jpg",
    confidence: Math.min(0.94, 0.78 + profile.imageCount / 1200),
    grade: "R",
    gradeLabel: "Ungraded",
    conditionScore: 70,
    valueLow: 0,
    valueHigh: 0,
    suggestedPrice: 0,
    fastSalePrice: 0,
    risk: "medium",
    nextAction: "Capture all required views for grading and pricing",
    careImpact: `Matched against ${profile.imageCount.toLocaleString("en-GB")} real catalog reference images. Live marketplace comps are required for resale pricing.`,
    dataSource: "catalog",
    catalogImageCount: profile.imageCount,
    priceStatus: "pending",
    editionStory: getEditionStory(baseProduct),
  };
}

export default function App() {
  const initialMembershipTier = getInitialMembershipTier();
  const initialConsumerRoute = initialMembershipTier === "consumer";
  const [slots, setSlots] = useState<SlotState[]>(initialConsumerRoute ? createFreshScanSlots : () => scanSlots.map((slot) => ({ ...slot })));
  const [activeSlotId, setActiveSlotId] = useState("upper-lateral");
  const [selectedProductId, setSelectedProductId] = useState(productCandidates[0].id);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("ready");
  const [showListing, setShowListing] = useState(false);
  const [activePage, setActivePage] = useState<PageId>(pageFromHash);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(initialMembershipTier);
  const [consumerStandalone, setConsumerStandalone] = useState(initialConsumerRoute);
  const [consumerTab, setConsumerTab] = useState<ConsumerTab>(consumerTabFromHash);
  const [consumerFreshSession, setConsumerFreshSession] = useState(initialConsumerRoute);
  const [vendorScanStarted, setVendorScanStarted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scanAnalysis, setScanAnalysis] = useState<ScanAnalysisResult | null>(null);
  const [apiMeta, setApiMeta] = useState<ApiResponseMeta | null>(null);
  const [dataReadiness, setDataReadiness] = useState<DataReadiness | null>(null);
  const [catalogSummary, setCatalogSummary] = useState<CatalogSummary | null>(null);
  const [catalogCandidates, setCatalogCandidates] = useState<ProductCandidate[]>([]);
  const [remoteListingDraft, setRemoteListingDraft] = useState<ListingDraft | null>(null);
  const [listingLoading, setListingLoading] = useState(false);

  const selectedProduct = useMemo(() => {
    const candidates = [...catalogCandidates, ...productCandidates];
    const product = candidates.find((candidate) => candidate.id === selectedProductId) ?? candidates[0] ?? productCandidates[0];
    return { ...product, editionStory: product.editionStory ?? getEditionStory(product) };
  }, [catalogCandidates, selectedProductId]);

  const requiredSlots = slots.filter((slot) => slot.required);
  const capturedRequired = requiredSlots.filter((slot) => slot.captured).length;
  const capturedTotal = slots.filter((slot) => slot.captured).length;
  const requiredPercent = Math.round((capturedRequired / Math.max(1, requiredSlots.length)) * 100);
  const confidenceBoost = Math.min(0.05, Math.max(0, capturedTotal - 6) * 0.01);
  const displayConfidence = Math.min(0.97, selectedProduct.confidence + confidenceBoost + (scanAnalysis?.identityConfidenceDelta ?? 0));
  const allMarketplaceResults = useMemo(() => evaluateMarketplaceRecommendations(marketplaceRecommendations), []);
  const marketplaceFeedsLive = dataReadiness?.marketplaceFeeds.enabled ?? false;
  const liveMarketplaceAgentResults = marketplaceFeedsLive ? allMarketplaceResults : [];
  const isConsumerSurface = consumerStandalone || membershipTier === "consumer";

  const baseListingDraft = useMemo<ListingDraft>(() => {
    if (selectedProduct.dataSource === "catalog") {
      return {
        title: `${selectedProduct.brand} ${selectedProduct.model} - Reference catalog match - Size pending`,
        description: `A strong candidate for buyers searching for the ${selectedProduct.brand} ${selectedProduct.model} look.\n\nEdition background: ${selectedProduct.editionStory}\n\nCondition and listing notes: this pair has matched a SoleLens reference catalog profile, but size, condition grade, authenticity-risk evidence, and resale pricing are pending until the full scan set and live marketplace sold-comps are available.`,
        checklist: [
          "Capture lateral, medial, heel, outsole, tongue label, and insole photos.",
          "Confirm exact size, box/accessory status, and any visible defects.",
          "Connect live marketplace sold-comps before publishing price or sale-speed claims.",
        ],
        priceRationale: "Live marketplace sold-comps are required before publishing price or sale-speed claims.",
      };
    }
    return {
      title: `${selectedProduct.brand} ${selectedProduct.model} - ${selectedProduct.colorway} - ${selectedProduct.size} - ${selectedProduct.gradeLabel} Condition`,
      description: `A clean opportunity for anyone after the ${selectedProduct.brand} ${selectedProduct.model} ${selectedProduct.colorway}.\n\nEdition background: ${selectedProduct.editionStory}\n\nCondition and listing notes: ${selectedProduct.gradeLabel} condition. SoleLens detected ${conditionFindings[0].value.toLowerCase()} outsole wear, ${conditionFindings[1].value.toLowerCase()} upper creasing, and ${conditionFindings[3].value.toLowerCase()} staining. Authenticity risk check: ${getRiskCopy(selectedProduct.risk).label.toLowerCase()} based on the current image set. ${selectedProduct.nextAction}.`,
      checklist: [
        "Include lateral, medial, heel, outsole, tongue label, and insole photos.",
        "Show close-ups of sole wear, toe-box creasing, and any visible marks.",
        "Mention box/accessory status and whether expert review is complete.",
      ],
      priceRationale: marketplaceFeedsLive
        ? "Use exact-item marketplace intelligence for final price."
        : "Live marketplace feeds are required before naming a best marketplace or publishing exact sale-speed claims.",
    };
  }, [marketplaceFeedsLive, selectedProduct]);

  const listingDraft = remoteListingDraft ?? baseListingDraft;

  function setFreshScanState() {
    setSlots(createFreshScanSlots());
    setActiveSlotId("upper-lateral");
    setAnalysisState("ready");
    setScanAnalysis(null);
    setApiMeta(null);
    setRemoteListingDraft(null);
  }

  function handleCapture(slotId: string, file?: File) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId
          ? { ...slot, captured: true, preview: file ? URL.createObjectURL(file) : slot.preview }
          : slot,
      ),
    );
    setActiveSlotId(slotId);
    setAnalysisState("ready");
    setScanAnalysis(null);
    setRemoteListingDraft(null);
  }

  function handleConsumerPhoto(file: File) {
    const target = slots.find((slot) => slot.required && !slot.captured) ?? slots.find((slot) => !slot.captured) ?? slots[0];
    handleCapture(target.id, file);
  }

  function handleRetake(slotId: string) {
    setSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, captured: false, preview: undefined } : slot)));
    setActiveSlotId(slotId);
    setAnalysisState("ready");
    setScanAnalysis(null);
  }

  function handleClear() {
    setFreshScanState();
    setConsumerFreshSession(true);
  }

  function handleStartVendorScan() {
    setFreshScanState();
    setVendorScanStarted(true);
  }

  function handleStartNewListing() {
    setFreshScanState();
    setConsumerFreshSession(true);
    setShowListing(false);
    setListingLoading(false);
    if (isConsumerSurface) {
      setConsumerTab("scan");
      window.history.replaceState(null, "", "/consumer#scan");
    }
  }

  async function handleAnalyze() {
    setAnalysisState("processing");
    setRemoteListingDraft(null);
    try {
      const result = await requestScanAnalysis({
        product: selectedProduct,
        slots,
        capturedRequired,
        requiredTotal: requiredSlots.length,
      });
      setScanAnalysis(result.analysis);
      setApiMeta(result);
    } catch (error) {
      setApiMeta(null);
      setScanAnalysis({
        summary: error instanceof Error ? `AI API unavailable: ${error.message}` : "AI API unavailable.",
        identityConfidenceDelta: -0.03,
        authenticityRisk: "inconclusive",
        recommendedAction: "Retry analysis or continue with structured fallback data",
        evidence: [`${capturedRequired} of ${requiredSlots.length} required views captured`],
        missingEvidence: capturedRequired < requiredSlots.length ? ["Some required views are missing"] : [],
      });
    } finally {
      setAnalysisState("complete");
      if (isConsumerSurface) {
        setConsumerFreshSession(false);
        setConsumerTab("home");
        window.history.replaceState(null, "", "/consumer");
      }
    }
  }

  function handleNavigate(pageId: PageId) {
    setActivePage(pageId);
    setMobileNavOpen(false);
    setConsumerStandalone(false);
    window.history.replaceState(null, "", `/#${pageId}`);
  }

  function handleConsumerTab(tab: ConsumerTab) {
    setConsumerTab(tab);
    const hash = tab === "home" ? "" : `#${tab}`;
    window.history.replaceState(null, "", `/consumer${hash}`);
  }

  function handleMembershipTierChange(tier: MembershipTier) {
    setMembershipTier(tier);
    persistMembershipTier(tier);
    if (tier === "consumer") {
      setConsumerStandalone(true);
      setConsumerTab("scan");
      window.history.replaceState(null, "", "/consumer#scan");
      return;
    }
    setConsumerStandalone(false);
    setActivePage("scan-intake");
    setVendorScanStarted(false);
    window.history.replaceState(null, "", "/#scan-intake");
  }

  async function handleShowListing() {
    setShowListing(true);
    setListingLoading(true);
    try {
      const result = await requestListingDraft({
        product: selectedProduct,
        marketplaceAgentResults: liveMarketplaceAgentResults,
        conditionFindings,
        marketplaceFeedStatus: dataReadiness?.marketplaceFeeds,
      });
      setRemoteListingDraft(result.listing);
      setApiMeta(result);
    } catch {
      setRemoteListingDraft(baseListingDraft);
    } finally {
      setListingLoading(false);
    }
  }

  useEffect(() => {
    function handleRouteChange() {
      const consumerRoute = isConsumerStandaloneRoute();
      setConsumerStandalone(consumerRoute);
      if (consumerRoute || membershipTier === "consumer") {
        setConsumerTab(consumerTabFromHash());
        return;
      }
      setActivePage(pageFromHash());
    }

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [membershipTier]);

  useEffect(() => {
    let cancelled = false;
    async function loadProductionData() {
      try {
        const [readiness, catalog] = await Promise.all([requestDataReadiness(), requestCatalog()]);
        if (cancelled) return;
        setDataReadiness(readiness);
        setCatalogSummary(catalog.summary);
        setCatalogCandidates(catalog.profiles.slice(0, 50).map(catalogProfileToProductCandidate));
      } catch {
        if (!cancelled) {
          setDataReadiness(null);
          setCatalogSummary(null);
          setCatalogCandidates([]);
        }
      }
    }
    loadProductionData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`app-shell ${isConsumerSurface ? "consumer-mode" : ""}`}>
      {isConsumerSurface ? null : <Sidebar activePage={activePage} onNavigate={handleNavigate} />}

      <main className="workspace">
        {isConsumerSurface ? (
          <ConsumerMobilePage
            product={selectedProduct}
            slots={slots}
            confidence={displayConfidence}
            capturedRequired={capturedRequired}
            requiredTotal={requiredSlots.length}
            requiredPercent={requiredPercent}
            analysisState={analysisState}
            marketplaceAgentResults={liveMarketplaceAgentResults}
            activeTab={consumerTab}
            isFreshSession={consumerFreshSession}
            scanAnalysis={scanAnalysis}
            apiMeta={apiMeta}
            dataReadiness={dataReadiness}
            catalogSummary={catalogSummary}
            catalogCandidates={catalogCandidates}
            selectedProductId={selectedProductId}
            onAnalyze={handleAnalyze}
            onShowListing={handleShowListing}
            onAddPhoto={handleConsumerPhoto}
            onStartNewListing={handleStartNewListing}
            onSelectProduct={setSelectedProductId}
            membershipTier={membershipTier}
            onMembershipTierChange={handleMembershipTierChange}
            onTabChange={handleConsumerTab}
          />
        ) : (
          <>
            <Topbar
              activePage={activePage}
              membershipTier={membershipTier}
              onOpenMobileNav={() => setMobileNavOpen(true)}
              onMembershipTierChange={handleMembershipTierChange}
            />
            <WorkflowBar activeIndex={activePage === "scan-intake" && analysisState === "complete" ? 5 : 0} />
            <VendorWorkspace
              activePage={activePage}
              product={selectedProduct}
              slots={slots}
              activeSlotId={activeSlotId}
              confidence={displayConfidence}
              capturedRequired={capturedRequired}
              requiredTotal={requiredSlots.length}
              requiredPercent={requiredPercent}
              analysisState={analysisState}
              showIntro={!vendorScanStarted}
              scanAnalysis={scanAnalysis}
              apiMeta={apiMeta}
              dataReadiness={dataReadiness}
              catalogSummary={catalogSummary}
              catalogCandidates={catalogCandidates}
              selectedProductId={selectedProductId}
              marketplaceAgentResults={liveMarketplaceAgentResults}
              marketplaceFeedsLive={marketplaceFeedsLive}
              onStartScan={handleStartVendorScan}
              onCapture={handleCapture}
              onRetake={handleRetake}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              onActivate={setActiveSlotId}
              onNavigate={handleNavigate}
              onSelectProduct={setSelectedProductId}
              onShowListing={handleShowListing}
            />
          </>
        )}
      </main>

      {isConsumerSurface ? (
        <ConsumerBottomNav activeTab={consumerTab} onTabChange={handleConsumerTab} />
      ) : (
        <>
          <MobileBottomNav activePage={activePage} onNavigate={handleNavigate} onMore={() => setMobileNavOpen(true)} />
          <MobileNavDrawer activePage={activePage} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onNavigate={handleNavigate} />
        </>
      )}

      {showListing ? (
        <ListingDrawer
          product={selectedProduct}
          listing={listingDraft}
          marketplaceAgentResults={liveMarketplaceAgentResults}
          loading={listingLoading}
          apiMeta={apiMeta}
          onClose={() => setShowListing(false)}
        />
      ) : null}
    </div>
  );
}

function Sidebar({ activePage, onNavigate }: { activePage: PageId; onNavigate: (pageId: PageId) => void }) {
  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => onNavigate("scan-intake")}>
        <img src="/assets/brand/solelens-logo.png" alt="SoleLens" />
        <span>SoleLens</span>
        <span>AI footwear intelligence</span>
      </button>
      <NavGroup label="Workspace" items={navPrimary} activePage={activePage} onNavigate={onNavigate} />
      <NavGroup label="Workflow" items={navWorkflow} activePage={activePage} onNavigate={onNavigate} />
      <NavGroup label="System" items={navSystem} activePage={activePage} onNavigate={onNavigate} />
      <div className="system-card">
        <span>AI providers</span>
        <strong>xAI + OpenAI ready</strong>
        <small>Server-side keys only</small>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  activePage,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  activePage: PageId;
  onNavigate: (pageId: PageId) => void;
}) {
  return (
    <nav className="nav-section" aria-label={label}>
      <span className="nav-kicker">{label}</span>
      {items.map((item) => (
        <button className={`nav-item ${item.id === activePage ? "active" : ""}`} key={item.id} type="button" onClick={() => onNavigate(item.id)}>
          <item.icon size={18} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function Topbar({
  activePage,
  membershipTier,
  onOpenMobileNav,
  onMembershipTierChange,
}: {
  activePage: PageId;
  membershipTier: MembershipTier;
  onOpenMobileNav: () => void;
  onMembershipTierChange: (tier: MembershipTier) => void;
}) {
  return (
    <header className="topbar">
      <button className="mobile-menu-button" type="button" onClick={onOpenMobileNav} aria-label="Open navigation">
        <ListChecks size={20} />
      </button>
      <div className="mobile-page-title">{pageLabel(activePage)}</div>
      <label className="search-field">
        <Search size={17} />
        <input placeholder="Search scans, SKUs, listings, stores" />
      </label>
      <MembershipTierControl tier={membershipTier} onTierChange={onMembershipTierChange} compact />
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="user-chip" type="button">
          <span>SL</span>
          <div>
            <strong>SoleLens Ops</strong>
            <small>Production workspace</small>
          </div>
        </button>
      </div>
    </header>
  );
}

function MembershipTierControl({
  tier,
  onTierChange,
  compact = false,
}: {
  tier: MembershipTier;
  onTierChange: (tier: MembershipTier) => void;
  compact?: boolean;
}) {
  return (
    <div className={`tier-switcher ${compact ? "compact" : ""}`} aria-label="Membership tier">
      <span>Tier</span>
      {membershipTierOptions.map((option) => (
        <button className={tier === option.id ? "active" : ""} key={option.id} type="button" title={option.detail} onClick={() => onTierChange(option.id)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function WorkflowBar({ activeIndex }: { activeIndex: number }) {
  return (
    <section className="workflow-bar" aria-label="SoleLens inspection workflow">
      <div className="workflow-copy">
        <Workflow size={18} />
        <span>Scan to list workflow</span>
      </div>
      <div className="workflow-steps">
        {workflow.map((step, index) => (
          <span className={index <= activeIndex ? "active" : ""} key={step}>
            <i>{index + 1}</i>
            {step}
          </span>
        ))}
      </div>
    </section>
  );
}

function VendorWorkspace({
  activePage,
  product,
  slots,
  activeSlotId,
  confidence,
  capturedRequired,
  requiredTotal,
  requiredPercent,
  analysisState,
  showIntro,
  scanAnalysis,
  apiMeta,
  dataReadiness,
  catalogSummary,
  catalogCandidates,
  selectedProductId,
  marketplaceAgentResults,
  marketplaceFeedsLive,
  onStartScan,
  onCapture,
  onRetake,
  onAnalyze,
  onClear,
  onActivate,
  onNavigate,
  onSelectProduct,
  onShowListing,
}: {
  activePage: PageId;
  product: ProductCandidate;
  slots: SlotState[];
  activeSlotId: string;
  confidence: number;
  capturedRequired: number;
  requiredTotal: number;
  requiredPercent: number;
  analysisState: AnalysisState;
  showIntro: boolean;
  scanAnalysis: ScanAnalysisResult | null;
  apiMeta: ApiResponseMeta | null;
  dataReadiness: DataReadiness | null;
  catalogSummary: CatalogSummary | null;
  catalogCandidates: ProductCandidate[];
  selectedProductId: string;
  marketplaceAgentResults: MarketplaceAgentResult[];
  marketplaceFeedsLive: boolean;
  onStartScan: () => void;
  onCapture: (slotId: string, file?: File) => void;
  onRetake: (slotId: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onActivate: (slotId: string) => void;
  onNavigate: (pageId: PageId) => void;
  onSelectProduct: (productId: string) => void;
  onShowListing: () => void;
}) {
  if (activePage !== "scan-intake") {
    return (
      <OperationsPage
        pageId={activePage}
        product={product}
        dataReadiness={dataReadiness}
        marketplaceAgentResults={marketplaceAgentResults}
        marketplaceFeedsLive={marketplaceFeedsLive}
        onNavigate={onNavigate}
        onShowListing={onShowListing}
      />
    );
  }

  if (showIntro) {
    return <ScanIntro onStartScan={onStartScan} />;
  }

  return (
    <section className="dashboard-grid" aria-label="SoleLens scan dashboard">
      <ScanPanel
        slots={slots}
        activeSlotId={activeSlotId}
        capturedRequired={capturedRequired}
        requiredTotal={requiredTotal}
        requiredPercent={requiredPercent}
        analysisState={analysisState}
        onCapture={onCapture}
        onRetake={onRetake}
        onAnalyze={onAnalyze}
        onClear={onClear}
        onActivate={onActivate}
      />
      {analysisState === "complete" ? (
        <ResultColumn
          product={product}
          confidence={confidence}
          analysisState={analysisState}
          scanAnalysis={scanAnalysis}
          apiMeta={apiMeta}
          marketplaceAgentResults={marketplaceAgentResults}
          marketplaceFeedsLive={marketplaceFeedsLive}
          onShowListing={onShowListing}
        />
      ) : (
        <PendingResult capturedRequired={capturedRequired} requiredTotal={requiredTotal} marketplaceFeedsLive={marketplaceFeedsLive} />
      )}
      <IntelligenceRail
        selectedProductId={selectedProductId}
        onSelectProduct={onSelectProduct}
        catalogCandidates={catalogCandidates}
        catalogSummary={catalogSummary}
        dataReadiness={dataReadiness}
      />
      <ReviewQueuePanel onNavigate={onNavigate} />
    </section>
  );
}

function ScanIntro({ onStartScan }: { onStartScan: () => void }) {
  return (
    <section className="panel scan-panel scan-intro-panel" aria-label="How to use SoleLens scan intake">
      <div className="scan-intro-hero">
        <div>
          <span className="page-route">SoleLens / Guided intake</span>
          <h1>Start with a clean scan.</h1>
          <p>Capture the evidence SoleLens needs before it identifies, checks risk, grades condition, estimates value, or creates listing copy.</p>
        </div>
        <img src="/assets/brand/solelens-logo.png" alt="SoleLens logo" />
      </div>
      <div className="scan-instruction-grid">
        {[
          ["Capture required angles", "Take lateral, medial, heel, outsole, tongue label, and insole photos."],
          ["Use camera, upload, or drag and drop", "Tap a slot or drag an image onto the correct view."],
          ["Check evidence quality", "Keep labels sharp, soles flat, logos visible, and lighting even."],
          ["Analyze and review", "Run the AI inspection to unlock identity, risk, grading, and listing support."],
        ].map(([title, body], index) => (
          <article key={title}>
            <Camera size={22} />
            <span>{index + 1}</span>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <div className="scan-intro-actions">
        <div>
          <strong>No demo shoe data will be loaded.</strong>
          <span>The next screen starts empty and ready for real photos.</span>
        </div>
        <button className="primary-button" type="button" onClick={onStartScan}>
          <Camera size={18} />
          Start new scan
        </button>
      </div>
    </section>
  );
}

function ScanPanel({
  slots,
  activeSlotId,
  capturedRequired,
  requiredTotal,
  requiredPercent,
  analysisState,
  onCapture,
  onRetake,
  onAnalyze,
  onClear,
  onActivate,
}: {
  slots: SlotState[];
  activeSlotId: string;
  capturedRequired: number;
  requiredTotal: number;
  requiredPercent: number;
  analysisState: AnalysisState;
  onCapture: (slotId: string, file?: File) => void;
  onRetake: (slotId: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onActivate: (slotId: string) => void;
}) {
  const ready = capturedRequired >= Math.max(1, requiredTotal - 1);
  return (
    <section className="panel scan-panel">
      <div className="panel-header">
        <div>
          <h1>Guided intake</h1>
          <p>Capture required shoe views for identification, risk checks, grading, pricing, and listing automation.</p>
        </div>
        <span className="scan-id">
          Scan ID: SCAN-2026-0510-0017
          <Copy size={14} />
        </span>
      </div>
      <BrandProofStrip />
      <div className="capture-timeline" aria-label="Capture progress">
        {workflow.map((step, index) => (
          <div className={`timeline-node ${index === 0 ? "active" : ""}`} key={step}>
            <span>{index + 1}</span>
            <small>{step}</small>
          </div>
        ))}
      </div>
      <div className="scan-grid">
        {slots.map((slot) => (
          <ScanSlotCard
            slot={slot}
            active={slot.id === activeSlotId}
            key={slot.id}
            onActivate={() => onActivate(slot.id)}
            onCapture={(file) => onCapture(slot.id, file)}
            onRetake={() => onRetake(slot.id)}
          />
        ))}
      </div>
      <div className="scan-actions">
        <button className="ghost-button" type="button">
          <AlertTriangle size={17} />
          Scan tips
        </button>
        <div className="progress-readout">
          <span>{capturedRequired} of {requiredTotal} required</span>
          <div className="progress-track" aria-label={`${requiredPercent}% required captures complete`}>
            <span style={{ width: `${requiredPercent}%` }} />
          </div>
        </div>
        <div className="action-group">
          <button className="secondary-button" type="button" onClick={onClear}>Clear scan</button>
          <button className="primary-button" type="button" onClick={onAnalyze} disabled={!ready}>
            {analysisState === "processing" ? <Loader2 className="spin" size={18} /> : <WandSparkles size={18} />}
            {analysisState === "processing" ? "Analyzing..." : "Analyze scan"}
          </button>
        </div>
      </div>
    </section>
  );
}

function BrandProofStrip() {
  return (
    <section className="brand-proof-strip" aria-label="SoleLens brand positioning">
      <div className="brand-proof-copy">
        <span>SOLELENS</span>
        <strong>A List-Lens category lens</strong>
        <p>Sneakers. Authentication. Verified.</p>
      </div>
      <img className="brand-proof-logo" src="/assets/brand/solelens-logo.png" alt="SoleLens logo" />
      <div className="brand-proof-points" aria-label="SoleLens value proposition">
        <span>Sneaker identification</span>
        <span>Authentication assist</span>
        <span>Verified resale intelligence</span>
      </div>
    </section>
  );
}

function ScanSlotCard({
  slot,
  active,
  onActivate,
  onCapture,
  onRetake,
}: {
  slot: SlotState;
  active: boolean;
  onActivate: () => void;
  onCapture: (file?: File) => void;
  onRetake: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dropInvalid, setDropInvalid] = useState(false);
  const image = slot.preview ?? slot.image;

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.types.includes("Files")) {
      event.dataTransfer.dropEffect = "copy";
      setDragOver(true);
      setDropInvalid(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const file = Array.from(event.dataTransfer.files).find((candidate) => candidate.type.startsWith("image/"));
    if (!file) {
      setDropInvalid(true);
      window.setTimeout(() => setDropInvalid(false), 1800);
      return;
    }
    onActivate();
    onCapture(file);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) onCapture(file);
    event.currentTarget.value = "";
  }

  return (
    <article
      className={`scan-slot ${active ? "active" : ""} ${slot.captured ? "captured" : ""} ${dragOver ? "drag-over" : ""} ${dropInvalid ? "drop-invalid" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <button className="slot-hitbox" type="button" onClick={onActivate} aria-label={`Select ${slot.title}`} />
      <div className="slot-title">
        <div>
          <strong>{slot.title}</strong>
          <small>{slot.required ? "Required" : "Recommended"}</small>
        </div>
        <span className={`slot-status ${slot.captured ? "done" : "empty"}`}>
          {slot.captured ? <Check size={15} /> : <Upload size={15} />}
        </span>
      </div>
      <button className="image-frame" type="button" onClick={() => inputRef.current?.click()} aria-label={`Upload ${slot.title}`}>
        {slot.captured ? <img src={image} alt={`${slot.title} capture`} /> : <span className="empty-capture"><ImagePlus size={28} />Add photo</span>}
        {dragOver ? <span className="drop-hint"><Upload size={24} />Drop image here</span> : null}
        {dropInvalid ? <span className="drop-error"><AlertTriangle size={22} />Image files only</span> : null}
      </button>
      <div className="slot-footer">
        <span>{slot.metric}</span>
        {slot.captured ? (
          <button type="button" onClick={onRetake}><RefreshCw size={14} />Retake</button>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}><Camera size={14} />Camera / upload</button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleInput} />
    </article>
  );
}

function PendingResult({
  capturedRequired,
  requiredTotal,
  marketplaceFeedsLive,
}: {
  capturedRequired: number;
  requiredTotal: number;
  marketplaceFeedsLive: boolean;
}) {
  const left = Math.max(0, requiredTotal - capturedRequired);
  return (
    <section className="result-column" aria-label="Scan status">
      <div className="panel pending-result-panel">
        <div className="pending-result-icon"><Camera size={30} /></div>
        <span>Waiting for scan evidence</span>
        <h2>No identification yet</h2>
        <p>Add real shoe photos with the camera, upload control, or drag and drop. SoleLens keeps the result area empty until you run analysis.</p>
        <div className="pending-result-steps">
          <article><strong>{capturedRequired} of {requiredTotal}</strong><span>Required views captured</span></article>
          <article><strong>{left ? `${left} left` : "Ready"}</strong><span>{left ? "Capture more evidence" : "Analysis can run now"}</span></article>
          <article><strong>{marketplaceFeedsLive ? "Live" : "Locked"}</strong><span>Marketplace sold-comps</span></article>
        </div>
      </div>
      <MarketplaceAgentPanel results={[]} compact marketplaceFeedsLive={marketplaceFeedsLive} />
    </section>
  );
}

function ResultColumn({
  product,
  confidence,
  analysisState,
  scanAnalysis,
  apiMeta,
  marketplaceAgentResults,
  marketplaceFeedsLive,
  onShowListing,
}: {
  product: ProductCandidate;
  confidence: number;
  analysisState: AnalysisState;
  scanAnalysis: ScanAnalysisResult | null;
  apiMeta: ApiResponseMeta | null;
  marketplaceAgentResults: MarketplaceAgentResult[];
  marketplaceFeedsLive: boolean;
  onShowListing: () => void;
}) {
  const risk = getRiskCopy(product.risk);
  const confidencePercent = Math.round(confidence * 100);
  return (
    <section className="result-column" aria-label="Scan results">
      <div className="panel identified-panel">
        <div className="panel-header compact">
          <h2>SoleLens result</h2>
          <div className="header-chip-row">
            <span className="provider-chip">{apiMeta?.provider === "xai" ? "xAI" : apiMeta?.provider === "openai" ? "OpenAI" : "xAI + OpenAI ready"}</span>
            <span className="confidence-chip"><span className="status-dot" />{confidencePercent}% confidence</span>
          </div>
        </div>
        <div className="identity-layout">
          <div className="hero-shoe"><img src={product.image} alt={`${product.brand} ${product.model}`} /></div>
          <div className="identity-copy">
            <h3>{product.brand} {product.model}</h3>
            <p>{product.colorway}</p>
            <dl>
              <div><dt>SKU</dt><dd>{product.sku}</dd></div>
              <div><dt>Release</dt><dd>{product.release}</dd></div>
              <div><dt>Size</dt><dd>{product.size}</dd></div>
            </dl>
          </div>
        </div>
      </div>
      <div className="panel evidence-panel">
        <div className="risk-card">
          <ShieldCheck size={24} />
          <div>
            <h3>Authenticity risk</h3>
            <span className={`risk-pill ${risk.tone}`}>{risk.label}</span>
            <label>Confidence <span>{risk.confidence}%</span></label>
            <div className="confidence-meter"><span style={{ width: `${risk.confidence}%` }} /></div>
          </div>
        </div>
        <div className="check-list">
          <strong>Key checks</strong>
          {riskChecks.map((check) => (
            <span className={check.status} key={check.label}>
              {check.status === "pass" ? <Check size={14} /> : <AlertTriangle size={14} />}
              {check.label}
            </span>
          ))}
        </div>
        <div className="risk-flags">
          <strong>Risk flags</strong>
          <span><i /> 1 minor</span>
          <p>{scanAnalysis?.summary ?? "Slight blur on tongue label. Upload a clearer label image for stronger verification."}</p>
        </div>
      </div>
      <div className="panel grading-panel">
        <div className="grade-dial" style={{ "--score": product.conditionScore } as React.CSSProperties}>
          <span>{product.grade}</span>
          <small>{product.gradeLabel}</small>
        </div>
        <div className="condition-list">
          <h3>Condition grade</h3>
          {conditionFindings.map((finding) => (
            <span key={finding.label}>
              <i className={finding.state} />
              <strong>{finding.label}</strong>
              <em>{finding.value}</em>
            </span>
          ))}
        </div>
        <div className="value-card">
          <h3>{marketplaceFeedsLive ? "Estimated value" : "Pricing status"}</h3>
          <strong>{marketplaceFeedsLive ? formatCurrencyRange(product.valueLow, product.valueHigh) : "Needs comps"}</strong>
          <span>{marketplaceFeedsLive ? "Market range (GBP)" : "Connect live sold-data feeds"}</span>
          <div><small>Suggested list price</small><b>{marketplaceFeedsLive ? formatCurrency(product.suggestedPrice) : "Pending"}</b></div>
          <div><small>Fast-sale price</small><b>{marketplaceFeedsLive ? formatCurrency(product.fastSalePrice) : "Pending"}</b></div>
        </div>
      </div>
      <div className="quick-actions">
        <article className="next-action-card">
          <Sparkles size={22} />
          <div>
            <h3>Next best action</h3>
            <strong>{product.nextAction}</strong>
            <p>{product.careImpact}</p>
          </div>
          <button type="button">View care guide</button>
        </article>
        <article className="listing-card">
          <ClipboardList size={22} />
          <div>
            <h3>Listing draft</h3>
            <strong>{analysisState === "complete" ? "AI-generated draft ready" : "Ready after scan analysis"}</strong>
            <p>Title, description, edition story, condition notes, pricing guardrails, and photo checklist.</p>
          </div>
          <button type="button" onClick={onShowListing}>Preview listing</button>
        </article>
      </div>
      <MarketplaceAgentPanel results={marketplaceAgentResults} compact marketplaceFeedsLive={marketplaceFeedsLive} />
    </section>
  );
}

function MarketplaceAgentPanel({
  results,
  compact = false,
  marketplaceFeedsLive = true,
}: {
  results: MarketplaceAgentResult[];
  compact?: boolean;
  marketplaceFeedsLive?: boolean;
}) {
  if (!marketplaceFeedsLive || !results.length) {
    return (
      <section className={`panel marketplace-agent-panel pending-agent ${compact ? "compact-agent" : ""}`}>
        <div className="marketplace-agent-header">
          <div>
            <span>Marketplace Intelligence Agent</span>
            <h2>Live sold-comps required</h2>
            <p>The agent is ready, but marketplace rankings stay locked until sold prices, sale dates, fees, shipping, region, size, and condition feeds are connected.</p>
          </div>
          <strong>Feed setup</strong>
        </div>
        <div className="marketplace-formula">
          <span>Production guardrail</span>
          <p>No eBay, StockX, GOAT, Vinted, Depop, sale-speed, or exact-comp claim is shown without live sold-data feeds.</p>
        </div>
        <div className="marketplace-list pending-marketplace-list">
          {["Sold price feed", "Fee and shipping model", "Time-to-sell data"].map((item) => (
            <article key={item}>
              <div><strong>{item}</strong><small>Required for production ranking</small></div>
              <span>Missing</span>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const top = results[0];
  const alternatives = results.slice(1, compact ? 3 : 6);
  return (
    <section className={`panel marketplace-agent-panel ${compact ? "compact-agent" : ""}`}>
      <div className="marketplace-agent-header">
        <div>
          <span>Marketplace Intelligence Agent</span>
          <h2>Best marketplace for this exact item</h2>
          <p>Ranks expected net value against comparable-sales volume, sale speed, exact-match strength, and channel fees.</p>
        </div>
        <strong>{Math.round(top.agentScore * 100)} agent score</strong>
      </div>
      <div className="marketplace-winner">
        <div>
          <span>{top.rankLabel}</span>
          <h3>{top.marketplace}</h3>
          <p>{top.channelType}</p>
        </div>
        <dl>
          <div><dt>Sale value</dt><dd>{formatCurrencyRange(top.saleValueRange[0], top.saleValueRange[1])}</dd></div>
          <div><dt>Sale speed</dt><dd>{top.saleSpeedDays[0]}-{top.saleSpeedDays[1]} days</dd></div>
          <div><dt>Volume</dt><dd>{top.weeklyComps} exact comps / week</dd></div>
          <div><dt>Exact match</dt><dd>{Math.round(top.exactMatch * 100)}%</dd></div>
        </dl>
      </div>
      <div className="marketplace-formula">
        <span>Agent formula</span>
        <p>Expected net value + sale velocity + exact-item volume + match confidence. Single high outlier sales are downweighted.</p>
      </div>
      <div className="marketplace-list">
        {alternatives.map((item) => (
          <article key={item.marketplace}>
            <div><strong>{item.marketplace}</strong><small>{item.rankLabel}</small></div>
            <span>{formatCurrencyRange(item.saleValueRange[0], item.saleValueRange[1])}</span>
            <span>{item.saleSpeedDays[0]}-{item.saleSpeedDays[1]}d</span>
            <span>{item.weeklyComps} comps</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function IntelligenceRail({
  selectedProductId,
  onSelectProduct,
  catalogCandidates,
  catalogSummary,
  dataReadiness,
}: {
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
  catalogCandidates: ProductCandidate[];
  catalogSummary: CatalogSummary | null;
  dataReadiness: DataReadiness | null;
}) {
  const totalImages = catalogSummary?.imageCount ?? modelCoverage.reduce((sum, row) => sum + row.count, 0);
  const candidates = catalogCandidates.length ? catalogCandidates.slice(0, 4) : productCandidates;
  return (
    <section className="panel intelligence-rail" aria-label="Model library and recommendations">
      <div className="panel-header compact">
        <div>
          <h2>SoleLens intelligence layer</h2>
          <p>OpenAI and xAI-ready API routes sit on top of a real sneaker reference catalog and evidence-bound reports.</p>
        </div>
        <span className="dataset-chip"><Database size={15} /> {totalImages.toLocaleString("en-GB")} reference images</span>
      </div>
      <div className="candidate-row">
        {candidates.map((candidate) => (
          <button className={`candidate-card ${candidate.id === selectedProductId ? "active" : ""}`} type="button" key={candidate.id} onClick={() => onSelectProduct(candidate.id)}>
            <img src={candidate.image} alt={`${candidate.brand} ${candidate.model}`} />
            <span>
              <strong>{candidate.model}</strong>
              <small>{candidate.catalogImageCount ? `${candidate.catalogImageCount.toLocaleString("en-GB")} refs` : `${Math.round(candidate.confidence * 100)}% match`}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="real-catalog-panel">
        <div>
          <span>Real reference catalog</span>
          <strong>{catalogSummary ? `${catalogSummary.profileCount} sneaker models across ${catalogSummary.brands.length} brands` : "Catalog loading from API"}</strong>
          <p>{dataReadiness?.catalog.sourceArchive ? "Generated from the local sneaker archive with extracted browser-safe sample assets." : "Run the catalog builder to expose reference profiles to the app."}</p>
        </div>
      </div>
      <div className="metric-strip">
        <MetricCard label="Reference catalog" value={catalogSummary ? `${catalogSummary.profileCount}` : "Loading"} subcopy="Real local classes" />
        <MetricCard label="Extracted samples" value={catalogSummary ? `${catalogSummary.sampleImageCount}` : "Loading"} subcopy="Browser-ready assets" />
        <MetricCard label="AI providers" value={dataReadiness?.productionStatus.liveAi ? "Live" : "Pending"} subcopy="xAI / OpenAI routes" />
        <MetricCard label="Marketplace feeds" value={dataReadiness?.productionStatus.liveMarketplaceComps ? "Live" : "Needed"} subcopy="Sold comps required" />
      </div>
    </section>
  );
}

function MetricCard({ label, value, subcopy }: { label: string; value: string; subcopy: string }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong><small>{subcopy}</small></article>;
}

function ReviewQueuePanel({ onNavigate }: { onNavigate: (pageId: PageId) => void }) {
  return (
    <section className="panel review-panel" aria-label="Expert review queue">
      <div className="review-title">
        <div>
          <h2>Expert review queue</h2>
          <span>{reviewQueue.length} scans awaiting expert review or override.</span>
        </div>
        <button type="button" onClick={() => onNavigate("expert-review")}>View all reviews <ArrowRight size={15} /></button>
      </div>
      <div className="review-table">
        <div className="review-head">
          {["Priority", "Scan ID", "Item", "Reason", "Risk", "Est. value", "Submitted", "Status", "Assigned to", "Actions"].map((column) => <span key={column}>{column}</span>)}
        </div>
        {reviewQueue.map((row) => (
          <div className="review-row" key={row.scanId}>
            <span><b className={`priority ${row.priority.toLowerCase()}`}>{row.priority}</b></span>
            <span>{row.scanId}</span>
            <span><strong>{row.item}</strong><small>{row.size}</small></span>
            <span>{row.reason}</span>
            <span><i className={`risk-dot ${row.risk.toLowerCase()}`} /> {row.risk}</span>
            <span>{row.value}</span>
            <span>{row.submitted}</span>
            <span><b className="status-pill">{row.status}</b></span>
            <span><b className="avatar">{row.assignee.split(" ").map((part) => part[0]).join("")}</b>{row.assignee}</span>
            <span className="row-actions">
              <button type="button" aria-label={`View ${row.scanId}`} onClick={() => onNavigate("expert-review")}><Eye size={15} /></button>
              <button type="button" aria-label={`Open ${row.scanId}`} onClick={() => onNavigate("expert-review")}><LogOut size={15} /></button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function OperationsPage({
  pageId,
  product,
  dataReadiness,
  marketplaceAgentResults,
  marketplaceFeedsLive,
  onNavigate,
  onShowListing,
}: {
  pageId: PageId;
  product: ProductCandidate;
  dataReadiness: DataReadiness | null;
  marketplaceAgentResults: MarketplaceAgentResult[];
  marketplaceFeedsLive: boolean;
  onNavigate: (pageId: PageId) => void;
  onShowListing: () => void;
}) {
  const spec = getPageSpec(pageId, dataReadiness, marketplaceAgentResults, marketplaceFeedsLive);
  return (
    <section className="operations-page" aria-label={spec.title}>
      <div className="page-hero">
        <div>
          <span className="page-route">SoleLens / {pageLabel(pageId)}</span>
          <h1>{spec.title}</h1>
          <p>{spec.description}</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onNavigate("scan-intake")}>
          <Camera size={18} />
          New scan
        </button>
      </div>
      <div className="page-kpis">
        {spec.kpis.map((kpi) => (
          <article className="page-kpi" key={kpi.label}>
            <kpi.icon size={18} />
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.detail} / {kpi.trend}</small>
          </article>
        ))}
      </div>
      <div className="page-card-grid">
        {spec.cards.map((card) => (
          <article className={`page-card ${card.tone ?? "blue"}`} key={card.title}>
            <card.icon size={22} />
            <span>{card.meta}</span>
            <strong>{card.title}</strong>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
      {pageId === "marketplace-agent" ? <MarketplaceAgentPanel results={marketplaceAgentResults} marketplaceFeedsLive={marketplaceFeedsLive} /> : null}
      <div className="page-grid">
        <section className="panel page-table-panel">
          <div className="panel-header">
            <div>
              <h2>{spec.tableTitle}</h2>
              <p>{spec.tableDescription}</p>
            </div>
            {pageId === "listings" ? <button className="secondary-button" type="button" onClick={onShowListing}>Preview listing</button> : null}
          </div>
          <div className="page-table">
            <div className="page-table-head" style={{ gridTemplateColumns: `repeat(${spec.columns.length}, minmax(130px, 1fr))` }}>
              {spec.columns.map((column) => <span key={column}>{column}</span>)}
            </div>
            {spec.rows.map((row) => (
              <div className="page-table-row" style={{ gridTemplateColumns: `repeat(${spec.columns.length}, minmax(130px, 1fr))` }} key={row.join("-")}>
                {row.map((cell) => <span key={cell}>{cell}</span>)}
              </div>
            ))}
          </div>
        </section>
        <aside className="panel page-side-panel">
          <div className="panel-header compact">
            <h2>Current scan</h2>
            <span className="confidence-chip">{product.gradeLabel}</span>
          </div>
          <div className="side-product">
            <img src={product.image} alt={`${product.brand} ${product.model}`} />
            <strong>{product.brand} {product.model}</strong>
            <span>{product.sku} / {product.size}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function getPageSpec(
  pageId: PageId,
  dataReadiness: DataReadiness | null,
  marketplaceAgentResults: MarketplaceAgentResult[],
  marketplaceFeedsLive: boolean,
): PageSpec {
  const topMarket = marketplaceAgentResults[0];
  const base: PageSpec = {
    title: pageLabel(pageId),
    description: "Operational workspace for footwear inspection, authentication assist, grading, resale, and analytics workflows.",
    kpis: [
      { label: "Scans today", value: "128", detail: "42 pending review", trend: "+18%", icon: Camera },
      { label: "Avg confidence", value: "89%", detail: "Identity model", trend: "+4%", icon: Gauge },
      { label: "Review queue", value: `${reviewQueue.length}`, detail: "Expert cases", trend: "Stable", icon: ShieldAlert },
      { label: "AI mode", value: dataReadiness?.productionStatus.liveAi ? "Live" : "Fallback", detail: "xAI / OpenAI", trend: "Ready", icon: Zap },
    ],
    cards: [
      { title: "Evidence-bound results", body: "Identity, risk, and condition language stays attached to captured scan evidence.", meta: "Trust layer", icon: ShieldCheck, tone: "green" },
      { title: "Listing generation", body: "Buyer-ready drafts lead with edition context, then condition and authenticity-risk evidence.", meta: "Resale", icon: ClipboardList },
      { title: "Human review", body: "High-value, low-confidence, or disputed scans route to expert review before strong trust claims.", meta: "Controls", icon: Users, tone: "amber" },
    ],
    tableTitle: "Workflow status",
    tableDescription: "Production-readiness items for this workspace.",
    columns: ["Area", "Status", "Owner", "Next step"],
    rows: [
      ["Guided capture", "Active", "Product", "Monitor image quality"],
      ["AI providers", dataReadiness?.productionStatus.liveAi ? "Connected" : "Needs key", "Platform", "Verify routing"],
      ["Marketplace comps", marketplaceFeedsLive ? "Live" : "Locked", "Data", "Connect sold feeds"],
      ["Expert review", "Available", "Operations", "Define SLAs"],
    ],
  };

  if (pageId === "marketplace-agent") {
    return {
      ...base,
      title: "Marketplace Agent",
      description: "Choose the best marketplace using exact-item sale volume, net price, fee drag, match confidence, and expected sale speed.",
      kpis: [
        { label: "Agent status", value: marketplaceFeedsLive ? "Live" : "Locked", detail: "Sold-data feeds", trend: "Required", icon: Store },
        { label: "Best route", value: topMarket?.marketplace ?? "Pending", detail: topMarket ? `${topMarket.weeklyComps} comps/week` : "No live comps", trend: topMarket ? `${topMarket.saleSpeedDays[0]}-${topMarket.saleSpeedDays[1]}d` : "Connect", icon: TrendingUp },
        { label: "Method", value: "4-factor", detail: "Value, speed, volume, match", trend: "Weighted", icon: Workflow },
        { label: "Guardrail", value: "No fake comps", detail: "Production policy", trend: "Active", icon: ShieldCheck },
      ],
    };
  }

  if (pageId === "settings") {
    return {
      ...base,
      title: "Settings",
      description: "Provider routing, environment readiness, and production integration controls.",
      rows: [
        ["xAI API", dataReadiness?.aiProviders.xai ? "Connected" : "Needs XAI_API", "AI provider", dataReadiness?.aiProviders.xaiModel ?? "grok"],
        ["OpenAI API", dataReadiness?.aiProviders.openai ? "Connected" : "Needs OPENAI_API", "AI provider", dataReadiness?.aiProviders.openaiModel ?? "gpt"],
        ["Reference catalog", dataReadiness?.catalog.available ? "Available" : "Missing", "Data", `${dataReadiness?.catalog.profiles ?? 0} profiles`],
        ["Marketplace feeds", marketplaceFeedsLive ? "Live" : "Missing", "Data", "Connect sold comps"],
      ],
    };
  }

  return base;
}

function ConsumerMobilePage({
  product,
  slots,
  confidence,
  capturedRequired,
  requiredTotal,
  requiredPercent,
  analysisState,
  marketplaceAgentResults,
  activeTab,
  isFreshSession,
  scanAnalysis,
  apiMeta,
  dataReadiness,
  catalogSummary,
  catalogCandidates,
  selectedProductId,
  onAnalyze,
  onShowListing,
  onAddPhoto,
  onStartNewListing,
  onSelectProduct,
  membershipTier,
  onMembershipTierChange,
  onTabChange,
}: {
  product: ProductCandidate;
  slots: SlotState[];
  confidence: number;
  capturedRequired: number;
  requiredTotal: number;
  requiredPercent: number;
  analysisState: AnalysisState;
  marketplaceAgentResults: MarketplaceAgentResult[];
  activeTab: ConsumerTab;
  isFreshSession: boolean;
  scanAnalysis: ScanAnalysisResult | null;
  apiMeta: ApiResponseMeta | null;
  dataReadiness: DataReadiness | null;
  catalogSummary: CatalogSummary | null;
  catalogCandidates: ProductCandidate[];
  selectedProductId: string;
  onAnalyze: () => void;
  onShowListing: () => void;
  onAddPhoto: (file: File) => void;
  onStartNewListing: () => void;
  onSelectProduct: (productId: string) => void;
  membershipTier: MembershipTier;
  onMembershipTierChange: (tier: MembershipTier) => void;
  onTabChange: (tab: ConsumerTab) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const risk = getRiskCopy(product.risk);
  const confidencePercent = Math.round(confidence * 100);
  const topMarketplace = marketplaceAgentResults[0];
  const marketplaceShortlist = marketplaceAgentResults.slice(0, 3);
  const captureChecklist = slots.filter((slot) => slot.required).slice(0, 6);
  const referenceProfiles = catalogSummary?.profileCount ?? dataReadiness?.catalog.profiles ?? 0;
  const referenceImages = catalogSummary?.imageCount ?? dataReadiness?.catalog.referenceImages ?? 0;
  const hasLiveMarketplaceFeeds = dataReadiness?.marketplaceFeeds.enabled ?? false;
  const isCatalogProduct = product.dataSource === "catalog";
  const visibleCatalogCandidates = catalogCandidates.slice(0, 4);
  const isProcessing = analysisState === "processing";
  const isComplete = analysisState === "complete";
  const hasIdentification = !isFreshSession;
  const scanPreview = slots.find((slot) => slot.preview)?.preview ?? (hasIdentification ? product.image : "");
  const showScan = activeTab === "scan";
  const showResult = hasIdentification && activeTab === "home";
  const showMarket = hasIdentification && activeTab === "sell";
  const showActions = hasIdentification && activeTab === "home";
  const showCare = hasIdentification && (activeTab === "home" || activeTab === "closet");
  const showSellPlanner = hasIdentification && activeTab === "sell";
  const showClosetPlanner = hasIdentification && activeTab === "closet";
  const minimumViewsForAnalysis = Math.max(1, requiredTotal - 1);
  const needsMoreEvidence = !hasIdentification && capturedRequired < minimumViewsForAnalysis;
  const nextRequiredSlot = captureChecklist.find((slot) => !slot.captured);
  const nextPhotoTitle = (nextRequiredSlot?.title ?? "photo").replace(" - ", " ");
  const workflowStep = hasIdentification ? 3 : needsMoreEvidence ? 1 : 2;
  const scanActionCopy = hasIdentification ? "Result ready" : needsMoreEvidence ? `Next photo: ${nextPhotoTitle}` : "Ready to identify";

  const tabTitles: Record<ConsumerTab, { title: string; body: string }> = {
    home: {
      title: "Your shoe result.",
      body: "Review the exact identity, condition grade, authenticity-risk evidence, and recommended next action.",
    },
    scan: {
      title: "Capture the proof.",
      body: "Add the required angles for stronger ID, condition grading, and authenticity-risk confidence.",
    },
    sell: {
      title: "Sell for more.",
      body: "Compare net payout, exact-item volume, and sale speed before choosing a marketplace.",
    },
    closet: {
      title: "Track your pair.",
      body: "Keep the scan, condition history, current value, and care recommendations together.",
    },
    activity: {
      title: "Your AI report.",
      body: "See the latest scan state, provider routing, and evidence-bound inspection status.",
    },
  };

  const emptyTabStates: Partial<Record<ConsumerTab, { eyebrow: string; title: string; body: string; action: string; icon: LucideIcon }>> = {
    home: {
      eyebrow: "No result yet",
      title: "Scan first to unlock the shoe report.",
      body: "SoleLens needs photos of the pair before it can identify the edition, grade condition, and explain authenticity risk.",
      action: "Go to scan",
      icon: Sparkles,
    },
    sell: {
      eyebrow: "Listing not ready",
      title: "Identify the pair before selling.",
      body: "The resale agent needs exact model, size, condition, and evidence photos before it can create a buyer-ready listing.",
      action: "Scan for sale",
      icon: Store,
    },
    closet: {
      eyebrow: "Closet empty",
      title: "Scan a pair before saving it.",
      body: "Your closet entry will keep the identity, proof photos, condition notes, value status, and care reminder together.",
      action: "Add first pair",
      icon: Grid2X2,
    },
    activity: {
      eyebrow: "No report yet",
      title: "Activity starts after a scan.",
      body: "Provider routing, catalog matches, and missing-evidence notes will appear once you add photos or run identification.",
      action: "Start scan",
      icon: ListChecks,
    },
  };

  const emptyTabState = !hasIdentification && activeTab !== "scan" ? emptyTabStates[activeTab] : null;
  const EmptyTabIcon = emptyTabState?.icon;
  const primaryScanLabel = isProcessing
    ? "Analyzing..."
    : hasIdentification && isComplete
    ? "Scan another pair"
    : capturedRequired === 0
    ? "Start scan"
    : needsMoreEvidence
    ? `Add ${nextPhotoTitle}`
    : "Identify shoe";

  function handlePhotoInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) onAddPhoto(file);
    event.currentTarget.value = "";
  }

  function handlePrimaryScanAction() {
    if (hasIdentification && isComplete) {
      onStartNewListing();
      return;
    }
    if (needsMoreEvidence) {
      fileInputRef.current?.click();
      return;
    }
    onAnalyze();
  }

  return (
    <section className="consumer-mobile-page" aria-label="SoleLens end user mobile app">
      <input className="consumer-file-input" ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoInputChange} />

      <header className="consumer-app-header">
        <div className="consumer-brand-lockup">
          <img src="/assets/brand/solelens-logo.png" alt="SoleLens" />
          <div><strong>SoleLens</strong><span>Sneakers. Authentication. Verified.</span></div>
        </div>
        <button className="consumer-icon-button" type="button" onClick={() => onTabChange("activity")} aria-label="Open activity">
          <ListChecks size={18} />
        </button>
      </header>

      <section className="consumer-status-strip" aria-label="AI provider status">
        <span><Sparkles size={13} /> {scanActionCopy}</span>
        <span><Database size={13} /> {referenceProfiles ? `${referenceProfiles} profiles` : "Catalog loading"}</span>
      </section>

      <MembershipTierControl tier={membershipTier} onTierChange={onMembershipTierChange} compact />

      <section className="consumer-flow-card" aria-label="SoleLens workflow">
        {[
          { step: 1, label: "Scan", detail: `${capturedRequired}/${requiredTotal} views` },
          { step: 2, label: "Identify", detail: needsMoreEvidence ? "Needs photos" : hasIdentification ? "Complete" : "Ready" },
          { step: 3, label: "Sell or save", detail: hasIdentification ? "Unlocked" : "After ID" },
        ].map((item) => (
          <article className={workflowStep === item.step ? "active" : workflowStep > item.step ? "done" : ""} key={item.step}>
            <span>{item.step}</span>
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      {activeTab !== "scan" ? (
        <section className="consumer-tab-summary">
          <span>{hasIdentification ? "Standalone consumer app" : "Fresh listing"}</span>
          <h1>{tabTitles[activeTab].title}</h1>
          <p>{tabTitles[activeTab].body}</p>
        </section>
      ) : null}

      {showScan ? (
        <section className="consumer-hero">
          <div className="consumer-hero-copy">
            <h1>{tabTitles.scan.title}</h1>
            <p>{tabTitles.scan.body}</p>
          </div>
          <div className="consumer-scan-preview">
            <div className="consumer-scan-frame"><span /><span /><span /><span /></div>
            {scanPreview ? (
              <img src={scanPreview} alt={hasIdentification ? `${product.model} scan preview` : "New listing photo preview"} />
            ) : (
              <div className="consumer-scan-empty">
                <ImagePlus size={34} />
                <span>No shoe photos yet</span>
                <small>Start with lateral, sole, tongue label, heel, and insole views.</small>
              </div>
            )}
            <strong>{isComplete && hasIdentification ? "Analysis ready" : `${capturedRequired} of ${requiredTotal} views`}</strong>
          </div>
          <div className="consumer-progress"><span style={{ width: `${requiredPercent}%` }} /></div>
          <div className="consumer-next-step">
            <span>{scanActionCopy}</span>
            <strong>{needsMoreEvidence ? "Add the next required view" : hasIdentification ? "Review, list, or save this pair" : "Run identification now"}</strong>
          </div>
          <div className="consumer-capture-checklist" aria-label="Required scan views">
            {captureChecklist.map((slot) => (
              <span key={slot.id} className={slot.captured ? "done" : ""}>
                {slot.captured ? <Check size={13} /> : <Camera size={13} />}
                {slot.title.replace(" - ", " ")}
              </span>
            ))}
          </div>
          <div className="consumer-hero-actions">
            <button className="consumer-primary" type="button" onClick={handlePrimaryScanAction}>
              {isProcessing ? <Loader2 className="spin" size={18} /> : needsMoreEvidence ? <ImagePlus size={18} /> : <Camera size={18} />}
              {primaryScanLabel}
            </button>
            <button className="consumer-secondary" type="button" onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} />
              Add photos
            </button>
          </div>
        </section>
      ) : null}

      {activeTab === "activity" && visibleCatalogCandidates.length ? (
        <section className="consumer-catalog-card" aria-label="Real catalog match candidates">
          <div className="consumer-section-title"><span>Real catalog matches</span><strong>{referenceImages.toLocaleString("en-GB")} images indexed</strong></div>
          <div className="consumer-catalog-list">
            {visibleCatalogCandidates.map((candidate) => (
              <button className={candidate.id === selectedProductId ? "active" : ""} key={candidate.id} type="button" onClick={() => onSelectProduct(candidate.id)}>
                <img src={candidate.image} alt={`${candidate.brand} ${candidate.model}`} />
                <span><strong>{candidate.brand} {candidate.model}</strong><small>{candidate.catalogImageCount?.toLocaleString("en-GB")} reference images</small></span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {emptyTabState && EmptyTabIcon ? (
        <section className="consumer-empty-tab-card">
          <EmptyTabIcon size={22} />
          <div><span>{emptyTabState.eyebrow}</span><strong>{emptyTabState.title}</strong><p>{emptyTabState.body}</p></div>
          <button type="button" onClick={() => onTabChange("scan")}>{emptyTabState.action}</button>
        </section>
      ) : null}

      {showResult ? (
        <section className="consumer-result-card">
          <div className="consumer-section-title">
            <span>{isCatalogProduct ? "Catalog identity" : isComplete ? "Scan complete" : "Ready to analyze"}</span>
            <strong>{confidencePercent}% confidence</strong>
          </div>
          <div className="consumer-product-row">
            <img src={product.image} alt={`${product.brand} ${product.model}`} />
            <div><h2>{product.brand} {product.model}</h2><p>{product.colorway}</p><span>{product.sku} / {product.size}</span></div>
          </div>
          <div className="consumer-stat-grid">
            <article><ShieldCheck size={17} /><span>Risk check</span><strong>{risk.label}</strong></article>
            <article><Gauge size={17} /><span>Condition</span><strong>{product.gradeLabel}</strong></article>
            <article><TrendingUp size={17} /><span>{hasLiveMarketplaceFeeds ? "Value" : "Pricing"}</span><strong>{hasLiveMarketplaceFeeds ? formatCurrencyRange(product.valueLow, product.valueHigh) : "Needs comps"}</strong></article>
          </div>
          <div className="consumer-price-row">
            <article><span>{hasLiveMarketplaceFeeds ? "List at" : "Catalog images"}</span><strong>{hasLiveMarketplaceFeeds ? formatCurrency(product.suggestedPrice) : (product.catalogImageCount ?? referenceImages).toLocaleString("en-GB")}</strong></article>
            <article><span>{hasLiveMarketplaceFeeds ? "Fast sale" : "Market comps"}</span><strong>{hasLiveMarketplaceFeeds ? formatCurrency(product.fastSalePrice) : "Required"}</strong></article>
            <article><span>{isCatalogProduct ? "Source" : "Release"}</span><strong>{isCatalogProduct ? "Real catalog" : product.release}</strong></article>
          </div>
          {product.editionStory ? <div className="consumer-edition-note"><span>Edition context</span><p>{product.editionStory}</p></div> : null}
          {scanAnalysis ? <div className="consumer-api-summary"><span>{apiMeta?.mode === "provider" ? `${apiMeta.provider} API` : "Local fallback"}</span><p>{scanAnalysis.summary}</p></div> : null}
        </section>
      ) : null}

      {showSellPlanner ? (
        <section className="consumer-tab-focus-card consumer-sell-focus">
          <Store size={22} />
          <div><span>Listing plan</span><strong>Lead with the edition, then prove condition.</strong><p>{product.editionStory}</p></div>
          <div className="consumer-mini-grid">
            <article><span>Buyer hook</span><strong>{product.brand} {product.model}</strong></article>
            <article><span>Condition lead</span><strong>{product.gradeLabel}</strong></article>
            <article><span>Market status</span><strong>{hasLiveMarketplaceFeeds ? "Live ranking" : "Feeds needed"}</strong></article>
          </div>
          <div className="consumer-card-actions">
            <button type="button" onClick={onShowListing}><ClipboardList size={17} />Generate listing</button>
            <button className="ghost" type="button" onClick={onStartNewListing}><RefreshCw size={17} />New listing</button>
          </div>
        </section>
      ) : null}

      {showMarket && !hasLiveMarketplaceFeeds ? (
        <section className="consumer-market-card consumer-market-pending">
          <div className="consumer-market-head">
            <div>
              <span>Marketplace agent ready</span>
              <h2>Live sold-comps required</h2>
              <p>The consumer app has the exact catalog identity, but it will not name the best marketplace until live sold-price, fee, volume, size, region, and time-to-sell feeds are connected.</p>
            </div>
            <strong>Locked</strong>
          </div>
          <div className="consumer-market-winner">
            <article><span>Exact item</span><strong>{product.brand} {product.model}</strong></article>
            <article><span>Catalog proof</span><strong>{(product.catalogImageCount ?? referenceImages).toLocaleString("en-GB")} refs</strong></article>
            <article><span>Next step</span><strong>Connect feeds</strong></article>
          </div>
          <div className="consumer-api-summary"><span>Production guardrail</span><p>No synthetic marketplace numbers are shown in the standalone consumer app without live sold-data feeds.</p></div>
        </section>
      ) : showMarket && topMarketplace ? (
        <section className="consumer-market-card">
          <div className="consumer-market-head">
            <div><span>Best place to sell</span><h2>{topMarketplace.marketplace}</h2><p>Exact-item agent balances net payout, weekly comparable volume, sale speed, and match confidence.</p></div>
            <strong>{Math.round(topMarketplace.agentScore * 100)} score</strong>
          </div>
          <div className="consumer-market-winner">
            <article><span>Expected net</span><strong>{formatCurrencyRange(topMarketplace.saleValueRange[0], topMarketplace.saleValueRange[1])}</strong></article>
            <article><span>Sale speed</span><strong>{topMarketplace.saleSpeedDays[0]}-{topMarketplace.saleSpeedDays[1]} days</strong></article>
            <article><span>Exact volume</span><strong>{topMarketplace.weeklyComps}/week</strong></article>
          </div>
          <div className="consumer-market-list" aria-label="Marketplace recommendation range">
            {marketplaceShortlist.map((item) => (
              <button key={item.marketplace} type="button" onClick={() => onTabChange("sell")}>
                <span>{item.marketplace}</span><strong>{formatCurrencyRange(item.saleValueRange[0], item.saleValueRange[1])}</strong><small>{item.saleSpeedDays[0]}-{item.saleSpeedDays[1]}d / {item.weeklyComps} comps</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showClosetPlanner ? (
        <section className="consumer-tab-focus-card consumer-closet-focus">
          <Grid2X2 size={22} />
          <div><span>Closet entry</span><strong>Ready to save with proof and care context.</strong><p>Keep this pair's scan evidence, identity, condition notes, care plan, and resale-readiness in one place.</p></div>
          <div className="consumer-mini-grid">
            <article><span>Identity</span><strong>{product.brand} {product.model}</strong></article>
            <article><span>Value</span><strong>{hasLiveMarketplaceFeeds ? formatCurrencyRange(product.valueLow, product.valueHigh) : "Pending comps"}</strong></article>
            <article><span>Care</span><strong>{product.nextAction}</strong></article>
          </div>
          <div className="consumer-card-actions">
            <button type="button" onClick={() => onTabChange("sell")}><Store size={17} />Plan resale</button>
            <button className="ghost" type="button" onClick={onStartNewListing}><RefreshCw size={17} />Scan another</button>
          </div>
        </section>
      ) : null}

      {showActions ? (
        <section className="consumer-action-stack">
          <button type="button" onClick={onShowListing}><ClipboardList size={18} />Create listing<ArrowRight size={16} /></button>
          <button type="button" onClick={() => onTabChange("closet")}><Grid2X2 size={18} />Save to closet<ArrowRight size={16} /></button>
          <button type="button" onClick={() => onTabChange("sell")}><Store size={18} />Compare marketplaces<ArrowRight size={16} /></button>
          <button className="consumer-reset-action" type="button" onClick={onStartNewListing}><RefreshCw size={18} />Start new listing<ArrowRight size={16} /></button>
        </section>
      ) : null}

      {showCare ? (
        <section className="consumer-care-card">
          <Sparkles size={20} />
          <div><span>Next best action</span><strong>{product.nextAction}</strong><p>{product.careImpact}</p></div>
        </section>
      ) : null}

      {activeTab === "activity" ? (
        <section className="consumer-activity-card">
          <article><span>Route</span><strong>{apiMeta ? `${apiMeta.provider === "local" ? "Local fallback" : `${apiMeta.provider} API`} active` : dataReadiness?.aiProviders.xai ? "xAI vision + OpenAI report layer" : "OpenAI report layer / xAI key needed"}</strong></article>
          <article><span>Provider health</span><strong>OpenAI {(apiMeta?.providerStatus.openai ?? dataReadiness?.aiProviders.openai) ? "connected" : "not configured"} / xAI {(apiMeta?.providerStatus.xai ?? dataReadiness?.aiProviders.xai) ? "connected" : "not configured"}</strong></article>
          <article><span>Real catalog</span><strong>{referenceProfiles ? `${referenceProfiles} models / ${referenceImages.toLocaleString("en-GB")} reference images` : "Catalog API not loaded"}</strong></article>
          <article><span>Marketplace feeds</span><strong>{dataReadiness?.marketplaceFeeds.enabled ? "Live sold-data feeds connected" : "Needs live sold-data credentials"}</strong></article>
          <article><span>Trust language</span><strong>{hasIdentification ? `${risk.label}, ${risk.confidence}% evidence confidence` : "Pending until a fresh scan is analyzed"}</strong></article>
          <article><span>Missing evidence</span><strong>{capturedRequired < requiredTotal ? `${requiredTotal - capturedRequired} required views still needed` : "All required views captured"}</strong></article>
        </section>
      ) : null}
    </section>
  );
}

function MobileBottomNav({
  activePage,
  onNavigate,
  onMore,
}: {
  activePage: PageId;
  onNavigate: (pageId: PageId) => void;
  onMore: () => void;
}) {
  const quickNav: NavItem[] = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "scan-intake", label: "Scan", icon: Camera },
    { id: "marketplace-agent", label: "Market", icon: Store },
    { id: "inventory", label: "Stock", icon: Grid2X2 },
  ];
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {quickNav.map((item) => (
        <button className={item.id === activePage ? "active" : ""} type="button" key={item.id} onClick={() => onNavigate(item.id)}>
          <item.icon size={18} /><span>{item.label}</span>
        </button>
      ))}
      <button type="button" onClick={onMore}><ListChecks size={18} /><span>More</span></button>
    </nav>
  );
}

function ConsumerBottomNav({ activeTab, onTabChange }: { activeTab: ConsumerTab; onTabChange: (tab: ConsumerTab) => void }) {
  const tabs: Array<{ id: ConsumerTab; label: string; icon: LucideIcon }> = [
    { id: "scan", label: "Scan", icon: Camera },
    { id: "home", label: "Result", icon: Sparkles },
    { id: "sell", label: "Sell", icon: Store },
    { id: "closet", label: "Closet", icon: Grid2X2 },
  ];
  return (
    <nav className="mobile-bottom-nav consumer-bottom-nav" aria-label="Consumer app navigation">
      {tabs.map((tab) => (
        <button className={tab.id === activeTab ? "active" : ""} type="button" key={tab.id} onClick={() => onTabChange(tab.id)}>
          <tab.icon size={18} /><span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function MobileNavDrawer({
  activePage,
  open,
  onClose,
  onNavigate,
}: {
  activePage: PageId;
  open: boolean;
  onClose: () => void;
  onNavigate: (pageId: PageId) => void;
}) {
  if (!open) return null;
  return (
    <div className="mobile-drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="mobile-nav-drawer" aria-label="All pages" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div><span>Navigation</span><h2>SoleLens</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close navigation"><ChevronDown size={20} /></button>
        </div>
        {[...navPrimary, ...navWorkflow, ...navSystem].map((item) => (
          <button className={item.id === activePage ? "active" : ""} type="button" key={item.id} onClick={() => onNavigate(item.id)}>
            <item.icon size={18} /><span>{item.label}</span>
          </button>
        ))}
      </aside>
    </div>
  );
}

function ListingDrawer({
  product,
  listing,
  marketplaceAgentResults,
  loading,
  apiMeta,
  onClose,
}: {
  product: ProductCandidate;
  listing: ListingDraft;
  marketplaceAgentResults: MarketplaceAgentResult[];
  loading: boolean;
  apiMeta: ApiResponseMeta | null;
  onClose: () => void;
}) {
  const [price, setPrice] = useState(product.suggestedPrice);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "blocked">("idle");
  const topMarketplace = marketplaceAgentResults[0];
  const pricePending = product.priceStatus === "pending" || !topMarketplace;

  async function handleCopy() {
    const draft = `${listing.title}\n\n${listing.description}\n\nPrice: ${pricePending ? "Pending live marketplace comps" : formatCurrency(price)}`;
    try {
      await navigator.clipboard.writeText(draft);
      setCopyStatus("copied");
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = draft;
      fallback.setAttribute("readonly", "true");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(fallback);
      setCopyStatus(copied ? "copied" : "blocked");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  }

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="listing-drawer" aria-label="Listing draft" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div><span>{loading ? "Generating listing" : "Listing draft"}</span><h2>{product.brand} {product.model}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close listing draft"><ChevronDown size={20} /></button>
        </div>
        <img className="drawer-image" src={product.image} alt={`${product.model} listing preview`} />
        <label className="field-stack">Title<textarea value={listing.title} readOnly rows={2} /></label>
        <label className="field-stack">
          Suggested price
          {pricePending ? (
            <div className="field-readout">Pending live marketplace comps</div>
          ) : (
            <input type="number" min={product.fastSalePrice} max={product.valueHigh + 100} value={price} onChange={(event) => setPrice(Number(event.currentTarget.value))} />
          )}
        </label>
        <label className="field-stack">Description<textarea value={listing.description} readOnly rows={8} /></label>
        <div className="drawer-checklist">
          <strong>Photo checklist</strong>
          {listing.checklist.map((item) => <span key={item}><Check size={15} /> {item}</span>)}
        </div>
        {topMarketplace ? (
          <div className="drawer-marketplace">
            <strong>Recommended marketplace</strong>
            <span>{topMarketplace.marketplace}</span>
            <p>Expected net {formatCurrencyRange(topMarketplace.saleValueRange[0], topMarketplace.saleValueRange[1])} in {topMarketplace.saleSpeedDays[0]}-{topMarketplace.saleSpeedDays[1]} days, based on {topMarketplace.weeklyComps} exact comps/week.</p>
          </div>
        ) : (
          <div className="drawer-marketplace">
            <strong>Recommended marketplace</strong>
            <span>Pending live comps</span>
            <p>Connect sold-price, fee, size, condition, region, and time-to-sell feeds before publishing marketplace recommendations.</p>
          </div>
        )}
        {listing.priceRationale || apiMeta ? (
          <div className="drawer-marketplace">
            <strong>AI route</strong>
            <span>{apiMeta?.mode === "provider" ? `${apiMeta.provider} API` : "Local fallback"}</span>
            <p>{listing.priceRationale ?? "Listing draft generated from structured SoleLens scan results."}</p>
          </div>
        ) : null}
        <button className="primary-button full" type="button" onClick={handleCopy} disabled={loading}>
          <Copy size={18} />
          {loading ? "Generating..." : copyStatus === "copied" ? "Copied" : copyStatus === "blocked" ? "Copy unavailable" : "Copy listing draft"}
        </button>
      </aside>
    </div>
  );
}
