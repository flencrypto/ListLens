import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const base = import.meta.env.BASE_URL ?? "/";
    const swUrl = `${base}sw.js`;
    navigator.serviceWorker
      .register(swUrl, { scope: base })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              console.info("[SW] Update available — reload to apply.");
            }
          });
        });
      })
      .catch((err) => console.warn("[SW] Registration failed:", err));
  });
}
