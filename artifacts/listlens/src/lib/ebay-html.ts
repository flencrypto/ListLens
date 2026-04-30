import type { StudioOutput } from "./ai/schemas";

const BRAND_COLOR = "#e85d04";
const LENS_LABELS: Record<string, string> = {
  ShoeLens: "Footwear",
  RecordLens: "Vinyl Record",
  LP: "Vinyl LP",
  Clothing: "Clothing",
  Watch: "Watch",
  default: "Item",
};

function esc(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attributeRows(
  attrs: Record<string, unknown>,
  exclude: string[] = [],
): string {
  return Object.entries(attrs)
    .filter(([k, v]) => !exclude.includes(k) && v !== null && v !== undefined && typeof v !== "object")
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:7px 10px;font-weight:600;width:38%;background:#f7f7f7;border-bottom:1px solid #eee;font-size:13px">${esc(k)}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px">${esc(String(v))}</td>
        </tr>`,
    )
    .join("");
}

export function generateEbayHtml(
  analysis: StudioOutput,
  title: string,
  description: string,
  price: number,
): string {
  const lensLabel = LENS_LABELS[analysis.lens] ?? LENS_LABELS.default;
  const ebay = analysis.marketplace_outputs.ebay ?? {};
  const condition = (ebay["condition"] as string | undefined) ?? "Used";
  const attrs = (analysis.attributes as Record<string, unknown>) ?? {};
  const attrRows = attributeRows(attrs);
  const bullets = analysis.missing_photos?.length
    ? `<div style="margin-top:18px;padding:12px 16px;background:#fff8e1;border-left:4px solid #f9a825;border-radius:4px;font-size:13px">
        <strong style="color:#f57f17">Photos to add for a stronger listing:</strong>
        <ul style="margin:6px 0 0 16px;padding:0;color:#555">
          ${analysis.missing_photos.map((p) => `<li style="margin-bottom:3px">${esc(p)}</li>`).join("")}
        </ul>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#fff">
<div style="font-family:Arial,Helvetica,sans-serif;max-width:660px;margin:0 auto;color:#222;line-height:1.6;padding:20px">

  <div style="border-bottom:3px solid ${BRAND_COLOR};padding-bottom:12px;margin-bottom:20px">
    <h1 style="margin:0 0 4px;font-size:22px;color:#111;line-height:1.3">${esc(title)}</h1>
    <p style="margin:0;color:#777;font-size:13px">${esc(lensLabel)}${condition ? ` · ${esc(condition)}` : ""} · <strong style="color:${BRAND_COLOR}">£${price.toFixed(2)}</strong></p>
  </div>

  <h2 style="font-size:15px;color:#333;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Description</h2>
  <p style="margin:0 0 20px;color:#444;font-size:14px;line-height:1.7">${esc(description || "See photos for full details.")}</p>

  ${attrRows ? `<h2 style="font-size:15px;color:#333;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Item Specifics</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #eee;border-radius:6px;overflow:hidden">
    ${attrRows}
  </table>` : ""}

  ${bullets}

  ${analysis.warnings?.length ? `<div style="margin-top:18px;padding:10px 14px;background:#fff3e0;border-left:4px solid ${BRAND_COLOR};border-radius:4px;font-size:13px;color:#555">
    ${analysis.warnings.map((w) => `<p style="margin:3px 0">⚠ ${esc(w)}</p>`).join("")}
  </div>` : ""}

  <div style="margin-top:28px;padding:10px 14px;background:#f5f5f5;border-radius:4px;font-size:11px;color:#999;text-align:center">
    AI-assisted listing · <a href="https://mrflens.app" style="color:#999">Mr.FLENS · List-LENS</a>
  </div>

</div>
</body>
</html>`;
}
