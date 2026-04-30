# App Store Screenshot Frames — Task #22

**Generated:** 2026-04-30  
**Prior art:** Tasks #15, #20 (splash-verification geometry), #21 (splash keep-awake)

---

## What this directory contains

Submission-ready screenshot frames for Apple App Store and Google Play Store, covering the three required device form factors at their respective physical pixel resolutions.

---

## Device coverage

| Device | Resolution | Store target |
| --- | --- | --- |
| iPhone SE (3rd gen) | 750 × 1334 | Apple App Store — 4.7" class |
| iPhone 15 Pro Max | 1290 × 2796 | Apple App Store — 6.7" class (required primary) |
| Pixel 7 | 1080 × 2400 | Google Play Store — Android flagship |

Apple requires at least one set in the 6.7" class (1290 × 2796); additional sizes are optional but recommended. Google Play accepts any standard Android resolution; 1080 × 2400 covers the Pixel 7 / Android 13 flagship viewport.

---

## Screen coverage

| Screenshot | Route | Description |
| --- | --- | --- |
| `home-*` | `/(tabs)/index` | Dashboard with quick-action grid, Studio & Guard panels, upgrade card, brand footer |
| `studio-*` | `/(tabs)/studio` | Studio tab with feature highlights, Start CTA, Lens grid, Marketplace chips |
| `guard-report-*` | `/guard/report` | Guard risk report showing score (72 / High Risk), red-flag list, suggested seller questions, action buttons |

---

## File listing (9 PNGs + 9 source SVGs)

```
home-iphone-se-750x1334.png
home-iphone-15-pro-max-1290x2796.png
home-pixel-7-1080x2400.png

studio-iphone-se-750x1334.png
studio-iphone-15-pro-max-1290x2796.png
studio-pixel-7-1080x2400.png

guard-report-iphone-se-750x1334.png
guard-report-iphone-15-pro-max-1290x2796.png
guard-report-pixel-7-1080x2400.png
```

Intermediate `.svg` source files are retained for easy iteration (edit SVG → re-run magick to re-export).

---

## Methodology

### Why SVG + ImageMagick

Expo simulator and Xcode/Android emulators are not available in the CI environment (same constraint documented in `splash-verification/README.md`). Instead, pixel-accurate SVG mockups are rendered to PNG using ImageMagick's built-in **librsvg 2.60.0** renderer — the same tool chain established for splash verification.

The screenshots are designed at the exact physical pixel dimensions (not at logical/CSS pixels with a DPR scale), so the output files are byte-for-byte submission-ready without any further resizing.

### Design fidelity

- All colours match `constants/Colors.ts` exactly (navy `#040a14`, brand cyan `#22d3ee`, brand violet `#8b5cf6`, etc.).
- Typography uses **DejaVu Sans** (the available system-UI equivalent), matching the weight scale used by Inter in the live app.
- Layout proportions scale automatically across device sizes: font sizes, padding, card heights and icon sizes are all expressed as multiples of the device's physical pixel width/height, so each size is correctly proportioned without manual tweaking.
- Status bars include a time indicator (`9:41`) and battery/signal icons.
- iPhone 15 Pro Max: Dynamic Island pill rendered at correct dimensions (376 × 88 px physical).
- Pixel 7: Punch-hole camera circle rendered at correct position.
- Tab bar includes active-indicator line and correct icon labels; active tab matches the displayed screen.
- Plain dark background (`#040a14`) is used throughout — no device chrome frame — which is the recommended approach for App Store and Google Play primary screenshots per current Apple HIG and Google Play guidelines.

### Generation script

```
scripts/src/gen-store-screenshots.mjs
```

Run from the workspace root:

```bash
node scripts/src/gen-store-screenshots.mjs
```

Output is written directly to this directory.

---

## Pre-submission checklist

| Check | Status |
| --- | --- |
| iPhone SE 750 × 1334 | ✅ Rendered and verified |
| iPhone 15 Pro Max 1290 × 2796 | ✅ Rendered and verified |
| Pixel 7 1080 × 2400 | ✅ Rendered and verified |
| Home / Dashboard screen | ✅ |
| Studio screen | ✅ |
| Guard risk report screen | ✅ |
| Dark background suitable for store listing | ✅ |
| Dynamic Island clearance (15 Pro Max) | ✅ — subject begins well below 88 px pill |
| Punch-hole clearance (Pixel 7) | ✅ — subject begins below 64 px top chrome |
| Physical smoke-test on real devices | ⏳ Recommended before final submission |

---

## Relationship to splash-verification

The crop geometry established in `splash-verification/README.md` (Task #20) confirmed that the splash asset is safe across all three form factors. These store screenshots use the same device dimensions and the same safe-zone assumptions, extended to in-app UI content rather than the native splash asset.
