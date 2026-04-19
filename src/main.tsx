import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const AUTO_RELOAD_KEY = "__lovable_auto_reload_at";
const AUTO_RELOAD_ATTEMPTS_KEY = "__lovable_auto_reload_attempts";
const AUTO_RELOAD_COOLDOWN_MS = 2000;
const MAX_AUTO_RELOADS = 4;

const readSessionNumber = (key: string) => {
  const value = Number(sessionStorage.getItem(key) ?? "0");
  return Number.isFinite(value) ? value : 0;
};

const canAutoReload = () => {
  const attempts = readSessionNumber(AUTO_RELOAD_ATTEMPTS_KEY);
  const lastReloadAt = readSessionNumber(AUTO_RELOAD_KEY);
  return attempts < MAX_AUTO_RELOADS && Date.now() - lastReloadAt > AUTO_RELOAD_COOLDOWN_MS;
};

const buildReloadUrl = () => {
  // Use the CURRENT window.location to build the reload URL — never substitute
  // a different origin. The Lovable preview can run on multiple sandbox origins
  // (lovableproject.com, lovable.app, *.sandbox.lovable.dev) and Supabase
  // sessions are stored in localStorage which is origin-scoped. If we reload
  // to a different origin we lose the session and the user gets signed out.
  const url = new URL(window.location.href);
  url.searchParams.set("__recover", String(Date.now()));
  return url.toString();
};

// Belt-and-suspenders: verify the reload target shares the current origin.
// If for any reason it doesn't, we abort the auto-reload and show the manual
// recovery screen instead — never silently bounce the user across origins
// (which would wipe their Supabase session from localStorage).
const isSafeSameOriginReload = (target: string): boolean => {
  try {
    const targetUrl = new URL(target, window.location.href);
    return targetUrl.origin === window.location.origin;
  } catch {
    return false;
  }
};

// Global flag set by AskView (and any other long-running operation) to block
// auto-reloads while a critical request is in flight. Prevents tab-switch HMR
// errors from killing a 60-180s AI generation.
declare global {
  interface Window {
    __askInFlight?: boolean;
  }
}

const triggerAutoReload = (reason: string) => {
  if (window.__askInFlight) {
    console.warn(`[main] Skipping auto-reload (${reason}) — Ask generation in flight`);
    return false;
  }
  if (!canAutoReload()) return false;

  const target = buildReloadUrl();

  // CRITICAL: never reload to a different origin. The Lovable preview iframe
  // can switch sandbox hosts (lovableproject.com ↔ lovable.app), and Supabase
  // sessions are stored in origin-scoped localStorage. A cross-origin reload
  // = the user gets signed out. Skip the reload and let the recovery screen
  // (or simply the existing app state) handle it.
  if (!isSafeSameOriginReload(target)) {
    console.warn(`[main] Skipping auto-reload (${reason}) — would cross origin`);
    return false;
  }

  const attempts = readSessionNumber(AUTO_RELOAD_ATTEMPTS_KEY) + 1;
  sessionStorage.setItem(AUTO_RELOAD_ATTEMPTS_KEY, String(attempts));
  sessionStorage.setItem(AUTO_RELOAD_KEY, String(Date.now()));

  console.warn(`Auto-reloading app (${attempts}/${MAX_AUTO_RELOADS}) due to: ${reason}`);
  window.location.replace(target);
  return true;
};

const showRecoveryScreen = () => {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div class="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div class="max-w-md text-center space-y-3">
        <h1 class="text-xl font-semibold">Still reconnecting…</h1>
        <p class="text-sm text-muted-foreground">The preview hit a temporary loading issue. Click below to retry.</p>
        <button id="recover-reload" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">Reload preview</button>
      </div>
    </div>
  `;

  const retryButton = document.getElementById("recover-reload");
  retryButton?.addEventListener("click", () => {
    sessionStorage.removeItem(AUTO_RELOAD_KEY);
    triggerAutoReload("manual-recovery-button");
  });
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  triggerAutoReload("vite-preload-error");
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
      triggerAutoReload("module-load-error");
    }
  },
  true,
);

window.addEventListener("unhandledrejection", (event) => {
  const reason = String(event.reason ?? "");
  if (
    reason.includes("Failed to fetch dynamically imported module") ||
    reason.includes("Importing a module script failed")
  ) {
    event.preventDefault();
    triggerAutoReload("unhandled-module-rejection");
  }
});

const bootstrap = async () => {
  try {
    const { default: App } = await import("./App.tsx");
    const root = document.getElementById("root");
    if (!root) return;

    createRoot(root).render(createElement(App));
    sessionStorage.removeItem(AUTO_RELOAD_ATTEMPTS_KEY);
    sessionStorage.removeItem(AUTO_RELOAD_KEY);
  } catch (error) {
    console.error("App bootstrap failed:", error);
    const reloading = triggerAutoReload("bootstrap-import-failure");
    if (!reloading) {
      showRecoveryScreen();
    }
  }
};

void bootstrap();

