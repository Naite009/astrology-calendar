import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const AUTO_RELOAD_KEY = "__vite_preload_auto_reload_at";
const AUTO_RELOAD_COOLDOWN_MS = 15000;

const shouldAutoReload = () => {
  const lastReloadAt = Number(sessionStorage.getItem(AUTO_RELOAD_KEY) ?? "0");
  return Number.isFinite(lastReloadAt) && Date.now() - lastReloadAt > AUTO_RELOAD_COOLDOWN_MS;
};

const triggerAutoReload = () => {
  if (!shouldAutoReload()) return;
  sessionStorage.setItem(AUTO_RELOAD_KEY, String(Date.now()));
  window.location.reload();
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  triggerAutoReload();
});

window.addEventListener(
  "error",
  (event) => {
    const message = "message" in event ? String(event.message ?? "") : "";
    const target = event.target as HTMLScriptElement | HTMLLinkElement | null;
    const resourceUrl = target?.tagName === "SCRIPT"
      ? (target as HTMLScriptElement).src
      : target?.tagName === "LINK"
        ? (target as HTMLLinkElement).href
        : "";

    const isModuleLoadFailure =
      message.includes("Failed to fetch dynamically imported module") ||
      message.includes("Importing a module script failed") ||
      /\/src\/.*\.(ts|tsx|js|jsx)(\?|$)/.test(resourceUrl);

    if (isModuleLoadFailure) {
      triggerAutoReload();
    }
  },
  true,
);

createRoot(document.getElementById("root")!).render(<App />);

