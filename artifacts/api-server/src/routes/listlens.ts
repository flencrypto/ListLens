// Demo-mode endpoints for the ListLens web artifact. Response shapes match
// the schemas in artifacts/listlens/src/lib/ai/schemas.ts.
import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();

const newId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

interface ItemMeta {
  lens?: string;
  marketplace?: string;
}
interface GuardMeta {
  url?: string;
  screenshotUrls?: string[];
  lens?: string;
}

const itemMeta = new Map<string, ItemMeta>();
const studioStore = new Map<string, Record<string, unknown>>();
const guardMeta = new Map<string, GuardMeta>();
const guardStore = new Map<string, Record<string, unknown>>();

function buildStudioOutput(lens: string, hint?: string) {
  const isShoe = lens === "ShoeLens";
  return {
    mode: "studio" as const,
    lens,
    identity: isShoe
      ? { brand: "Nike", model: "Air Max 90 — Triple White", confidence: 0.86 }
      : {
          brand: "Pink Floyd",
          model: "The Dark Side of the Moon (1973 UK 1st press)",
          confidence: 0.78,
        },
    attributes: isShoe
      ? {
          colourway: "Triple White",
          size_uk: 9,
          condition: "Used — Excellent",
          style_code: "CN8490-100",
          notes: hint ?? "Light creasing on toe box, soles clean.",
        }
      : {
          format: '12" Vinyl LP',
          speed: "33 RPM",
          sleeve_condition: "VG+",
          vinyl_condition: "VG+",
          catalogue_number: "SHVL 804",
        },
    missing_photos: isShoe
      ? ["Sole tread (close-up)", "Inner tongue label"]
      : ["Matrix / runout etching", "Inner sleeve"],
    pricing: isShoe
      ? {
          quick_sale: 65,
          recommended: 85,
          high: 110,
          currency: "GBP",
          confidence: 0.74,
        }
      : {
          quick_sale: 28,
          recommended: 42,
          high: 65,
          currency: "GBP",
          confidence: 0.62,
        },
    marketplace_outputs: {
      ebay: {
        title: isShoe
          ? "Nike Air Max 90 'Triple White' UK 9 — VGC Used"
          : "Pink Floyd — Dark Side of the Moon 1973 UK Vinyl LP",
        condition: "Used",
        category: isShoe ? "Trainers" : "Vinyl Records",
      },
      vinted: {
        title: isShoe
          ? "Nike Air Max 90 White UK 9"
          : "Pink Floyd Dark Side of the Moon LP",
        category: isShoe ? "Men's Trainers" : "Music",
      },
    },
    warnings: ["Demo mode — analysis values are illustrative only."],
  };
}

function buildGuardOutput(lens: string, url?: string) {
  const looksSus = url?.includes("vinted") ?? false;
  return {
    mode: "guard" as const,
    lens: lens || "ShoeLens",
    risk: {
      level: looksSus ? ("medium_high" as const) : ("low" as const),
      confidence: 0.71,
    },
    red_flags: looksSus
      ? [
          {
            severity: "high" as const,
            type: "stock_photo",
            message:
              "Listing photos appear to be manufacturer stock images, not the actual item.",
          },
          {
            severity: "medium" as const,
            type: "price_anomaly",
            message:
              "Asking price is ~38% below typical market for this model and condition.",
          },
        ]
      : [
          {
            severity: "low" as const,
            type: "missing_photo",
            message:
              "No close-up of the inner tongue label — request one before purchase.",
          },
        ],
    missing_photos: ["Sole tread", "Inner tongue label", "Original receipt"],
    seller_questions: [
      "Can you share a photo of the inner tongue label and stitching?",
      "Where and when did you originally purchase this?",
      "Will you accept payment via the marketplace's buyer protection?",
    ],
    disclaimer: "AI-assisted risk screen, not formal authentication.",
  };
}

const recordPayload = {
  mode: "recordlens.identify" as const,
  lens: "RecordLens" as const,
  top_match: {
    artist: "Pink Floyd",
    title: "The Dark Side of the Moon",
    label: "Harvest",
    catalogue_number: "SHVL 804",
    likely_release: "1973 UK 1st press, A2/B2 matrix, solid blue triangle",
    likelihood_percent: 62,
    evidence: [
      "Harvest label, no EMI box",
      "Catalogue SHVL 804 visible on label",
    ],
  },
  alternate_matches: [
    {
      artist: "Pink Floyd",
      title: "The Dark Side of the Moon",
      label: "Harvest",
      catalogue_number: "SHVL 804",
      likely_release: "1974 UK 2nd press, A3/B3 matrix",
      likelihood_percent: 24,
      evidence: ["Identical sleeve art, label variant ambiguous from photo"],
    },
    {
      artist: "Pink Floyd",
      title: "The Dark Side of the Moon",
      label: "Harvest / EMI",
      catalogue_number: "SHVL 804",
      likely_release: "Late-70s UK reissue with EMI box",
      likelihood_percent: 14,
      evidence: ["Possible EMI box artefact at label edge"],
    },
  ],
  matrix_clarification_questions: [
    "What does the matrix / runout etching read on Side A and Side B?",
    "Is there a solid or open blue triangle on the label?",
  ],
  warnings: ["Demo mode — release identification values are illustrative."],
  disclaimer:
    "AI-assisted release identification — confirm pressing details before listing or buying.",
};

const body = (req: Request): Record<string, unknown> =>
  (req.body as Record<string, unknown>) ?? {};

router.post("/items", (req, res) => {
  const b = body(req);
  const id = newId("item");
  const lens = (b["lens"] as string) ?? "ShoeLens";
  const marketplace = b["marketplace"] as string | undefined;
  itemMeta.set(id, { lens, marketplace });
  res.json({ id, lens, marketplace, status: "draft" });
});

router.post("/items/:id/analyse", (req, res) => {
  const { id } = req.params;
  const b = body(req);
  const lens =
    (b["lens"] as string) ?? itemMeta.get(id)?.lens ?? "ShoeLens";
  const analysis = buildStudioOutput(lens, b["hint"] as string);
  studioStore.set(id, analysis);
  res.json({ analysis });
});

router.get("/items/:id/analysis", (req, res) => {
  const { id } = req.params;
  const analysis = studioStore.get(id);
  if (!analysis) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ analysis });
});

router.post("/items/:id/export/vinted", (req, res) => {
  const { id } = req.params;
  const analysis = studioStore.get(id);
  const vinted =
    (analysis?.["marketplace_outputs"] as
      | { vinted?: Record<string, unknown> }
      | undefined)?.vinted ?? {};
  const title = String(vinted["title"] ?? "ListLens demo item");
  const category = String(vinted["category"] ?? "Other");
  const price = String(
    (analysis?.["pricing"] as { recommended?: number } | undefined)
      ?.recommended ?? 0,
  );
  const csv = [
    "title,category,price,currency,description",
    [
      JSON.stringify(title),
      JSON.stringify(category),
      price,
      "GBP",
      JSON.stringify(
        "Demo export from Mr.FLENS · List-LENS — no real listing created.",
      ),
    ].join(","),
    "",
  ].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="vinted-${id}.csv"`,
  );
  res.send(csv);
});

router.post("/items/:id/publish/ebay-sandbox", (_req, res) => {
  const sandboxListingId = `EBAY-SBX-${Date.now().toString(36).toUpperCase()}`;
  res.json({
    ok: true,
    sandboxListingId,
    listing_url: `https://sandbox.ebay.co.uk/itm/${sandboxListingId}`,
    message: "Demo publish — no real listing was created.",
  });
});

router.post("/guard/checks", (req, res) => {
  const b = body(req);
  const id = newId("guard");
  guardMeta.set(id, {
    url: b["url"] as string,
    screenshotUrls: b["screenshotUrls"] as string[],
    lens: b["lens"] as string,
  });
  res.json({ id });
});

router.get("/guard/checks/:id", (req, res) => {
  const { id } = req.params;
  const report = guardStore.get(id);
  if (!report) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ id, report });
});

router.post("/guard/checks/:id/analyse", (req, res) => {
  const { id } = req.params;
  const meta = guardMeta.get(id) ?? {};
  const report = buildGuardOutput(meta.lens ?? "ShoeLens", meta.url);
  guardStore.set(id, report);
  res.json({ id, report });
});

router.post("/guard/checks/:id/save", (_req, res) => {
  res.json({ ok: true });
});

router.post("/lenses/record/identify", (_req, res) => {
  res.json({
    analysis: {
      ...recordPayload,
      input_type: "single_label_photo",
      needs_matrix_for_clarification: true,
    },
  });
});

router.post("/lenses/record/identify-with-matrix", (_req, res) => {
  res.json({
    analysis: {
      ...recordPayload,
      input_type: "label_and_matrix",
      needs_matrix_for_clarification: false,
      matrix_clarification_questions: [],
      top_match: { ...recordPayload.top_match, likelihood_percent: 91 },
    },
  });
});

router.get("/lenses", (_req, res) => {
  res.json({ lenses: ["ShoeLens", "RecordLens"] });
});

// Billing endpoints are submitted as <form method="POST"> from the billing
// page. In demo mode there are no Stripe keys, so we 303-redirect back to
// /billing with a flag instead of 404'ing.
router.post("/billing/checkout", (_req, res) => {
  res.redirect(303, "/billing?demo=checkout");
});
router.post("/billing/portal", (_req, res) => {
  res.redirect(303, "/billing?demo=portal");
});

export default router;
