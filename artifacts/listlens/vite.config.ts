import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ command }) => {
  const basePath = process.env.BASE_PATH ?? "/";
  let port: number | undefined;

  if (command !== "build") {
    const rawPort = process.env.PORT;

    if (!rawPort) {
      throw new Error(
        "PORT environment variable is required but was not provided.",
      );
    }

    port = Number(rawPort);

    if (Number.isNaN(port) || port <= 0) {
      throw new Error(`Invalid PORT value: "${rawPort}"`);
    }

    if (!process.env.BASE_PATH) {
      throw new Error(
        "BASE_PATH environment variable is required but was not provided.",
      );
    }
  }

  return {
    base: basePath,
    plugins: [
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
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    define: {
      // Allow using NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (from existing .env) as
      // the Vite-side publishable key without renaming env vars.
      "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
        process.env["VITE_CLERK_PUBLISHABLE_KEY"] ??
          process.env["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] ??
          "",
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    ...(command !== "build" && {
      server: {
        port,
        strictPort: true,
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
    }),
  };
});
