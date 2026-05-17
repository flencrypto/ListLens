import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleAiApiRequest } from "./server/aiApi.mjs";
import { handleDataApiRequest } from "./server/dataApi.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(root, "dist");
const port = Number(process.env.PORT ?? 5188);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname.split("?")[0]);
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return join(distDir, clean === "/" ? "index.html" : clean);
}

async function serveStatic(req, res) {
  let filePath = safePath(req.url ?? "/");
  if (!existsSync(filePath)) {
    filePath = join(distDir, "index.html");
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", contentTypes[extname(filePath)] ?? "application/octet-stream");
    createReadStream(filePath).pipe(res);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  if (await handleAiApiRequest(req, res)) {
    return;
  }
  if (await handleDataApiRequest(req, res)) {
    return;
  }
  await serveStatic(req, res);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`SoleLens server listening on http://localhost:${port}`);
});
