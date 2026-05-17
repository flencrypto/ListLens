import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

function getNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const num = Number(raw);
  if (Number.isNaN(num) || num <= 0) {
    throw new Error(`Invalid ${name} value: "${raw}"`);
  }
  return num;
}

function normalizeBasePath(rawBasePath: string | undefined): string {
  const trimmed = (rawBasePath ?? "/").trim();
  const basePath = trimmed.length > 0 ? trimmed : "/";
  const withLeading = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

// Build environments (e.g. Vercel/CI) won't provide runtime PORT/BASE_PATH, so
// default safely and keep strict validation only for explicit values.
const port = (() => {
  if (process.env.VITE_PORT) return getNumberEnv("VITE_PORT", 3000);
  if (process.env.PORT) return getNumberEnv("PORT", 3000);
  return 3000;
})();
const basePath = normalizeBasePath(process.env.BASE_PATH);

export default defineConfig({
  base: basePath,
  plugins: [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
