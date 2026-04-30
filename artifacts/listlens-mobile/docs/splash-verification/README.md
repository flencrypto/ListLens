# Mobile Splash Cold-Start Verification

**Task:** #15 — Verify the mobile splash image looks right on cold start
**Date:** 2026-04-30
**Method:** Configuration audit + pixel-accurate crop simulation (no physical device available in this environment)

---

## Source of truth

| Item | Value |
| --- | --- |
| `app.json` → `splash.image` | `./assets/images/splash.png` |
| `app.json` → `splash.resizeMode` | `cover` |
| `app.json` → `splash.backgroundColor` | `#040a14` (dark navy) |
| Asset dimensions | 768 × 1408 px (PNG, 8-bit RGB) |
| Asset aspect ratio | 0.545 (W/H) |
| Subject safe margins | ~30% L/R, ~25% T/B around brain-in-cart focal area |
| `splash.dark.*` variant | Not configured — single dark splash, intentional (permanent dark brand) |

---

## What this verification covers

### 1. Configuration correctness ✅
- `splash.image` path resolves to a valid 768×1408 PNG.
- `resizeMode: "cover"` means no black bars will appear — the image always fills the screen.
- `backgroundColor: "#040a14"` matches the outer padding of the splash asset, so there is no visible seam if the OS letterboxes before the image loads.

### 2. Pixel-accurate crop simulation
The native splash is rendered by the OS before JavaScript loads — it cannot be exercised via the Expo web preview. The crop applied by `resizeMode: "cover"` is deterministic: scale the image so its shorter dimension fills the screen, then centre-crop the overflow. These simulations reproduce that operation exactly using ImageMagick at each device's native pixel resolution.

| Device | Native resolution | Splash AR vs device AR | Side cropped |
| --- | --- | --- | --- |
| iPhone SE (3rd gen) | 750 × 1334 | 0.545 vs 0.562 | ~3% off top + bottom |
| iPhone 15 Pro Max | 1290 × 2796 | 0.545 vs 0.461 | ~7–8% off each side |
| Pixel 7 | 1080 × 2400 | 0.545 vs 0.450 | ~9% off each side |

**Findings from the crops:**
- Brain-in-cart subject stays fully visible and centred in all three cases. The worst-case ~9% per-side crop on Pixel 7 is comfortably absorbed by the ~30% L/R safe margin.
- Crop edges blend with the asset's own `#040a14` outer padding — no visible transition.
- No distortion, no letterboxing.

**Simulated crop files:**
- [`cold-start-iphone-se-750x1334.jpg`](./cold-start-iphone-se-750x1334.jpg)
- [`cold-start-iphone-15-pro-max-1290x2796.jpg`](./cold-start-iphone-15-pro-max-1290x2796.jpg)
- [`cold-start-pixel-7-1080x2400.jpg`](./cold-start-pixel-7-1080x2400.jpg)

**What these crops do NOT cover:**
- Notch / Dynamic Island / punch-hole camera overlays — these are OS chrome rendered on top of the splash; they do not affect the splash image itself, only its visible area near the top edge. The subject sits well clear of the top ~5% safe-zone risk area.
- OEM-specific launch-screen timing differences (how long the OS holds the splash before handing off to JS). Visual content is unaffected.

### 3. In-app `/splash` route (separate from native cold-start)
Screenshots of the React Native animated splash screen (`app/splash.tsx`) confirm the post-cold-start JS-driven screen adapts cleanly across the three target viewport sizes. The lens component (`Math.min(width - 80, height * 0.32, 280)`) keeps content on-screen at all sizes.

| Device | Viewport | File |
| --- | --- | --- |
| iPhone SE | 375 × 667 | [`in-app-iphone-se-375x667.jpg`](./in-app-iphone-se-375x667.jpg) |
| iPhone 15 Pro Max | 430 × 932 | [`in-app-iphone-15-pro-max-430x932.jpg`](./in-app-iphone-15-pro-max-430x932.jpg) |
| Pixel 7 | 412 × 915 | [`in-app-pixel-7-412x915.jpg`](./in-app-pixel-7-412x915.jpg) |

Note: text fades in some screenshots due to Reanimated entrance animation timing at capture — this is a screenshot artefact, not a render defect.

---

## Light vs dark system mode

No `splash.dark.*` variant is configured. The same dark-navy splash appears regardless of system theme. This is intentional: the whole app uses a permanently dark theme and a light-mode splash would clash with the immediately-following dark app shell.

---

## Summary

| Check | Result |
| --- | --- |
| Config valid (path, resizeMode, backgroundColor) | ✅ Confirmed |
| Asset has adequate safe margins for all target aspect ratios | ✅ Confirmed by crop simulation |
| No black bars or distortion on any target device | ✅ Confirmed by crop simulation |
| Subject visible and centred on iPhone SE, iPhone 15 Pro Max, Pixel 7 | ✅ Confirmed by crop simulation |
| In-app splash route adapts across all three viewport sizes | ✅ Confirmed by screenshots |
| Physical cold-start on real hardware | ⚠️ Not testable from this environment — recommend QA on device before release |
| Notch / Dynamic Island impact | ⚠️ Not simulated — subject sits well clear of top-edge risk zone by design |
