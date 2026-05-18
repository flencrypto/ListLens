import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { handleAiApiRequest } from "./server/aiApi.mjs";
import { handleDataApiRequest } from "./server/dataApi.mjs";

export default defineConfig({
  plugins: [
    {
      name: "solelens-ai-api",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (await handleAiApiRequest(req, res)) {
            return;
          }
          if (await handleDataApiRequest(req, res)) {
            return;
          }
          next();
        });
      },
    },
    react(),
  ],
  server: {
    port: 5173,
  },
});
