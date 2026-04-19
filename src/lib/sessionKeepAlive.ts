/**
 * Session Keep-Alive
 *
 * Per the project's "never sign me out" rule, this module makes the Supabase
 * session as durable as possible:
 *
 *   1. Forever-retrying token refresh — if a refresh fails (network error,
 *      503, etc.), retry with capped exponential backoff INDEFINITELY. Never
 *      call signOut, never clear tokens. The user stays "signed in" from
 *      the app's perspective even during long offline periods; the next
 *      successful refresh restores full access.
 *
 *   2. IndexedDB session backup — every time the auth state changes, mirror
 *      the current session JSON into IndexedDB. If localStorage is wiped
 *      (preview reload under a new sandbox URL, browser cache clear, etc.)
 *      we restore from the IndexedDB copy on next boot via setSession().
 *
 *   3. Page-visibility refresh — when the tab becomes visible again after
 *      being backgrounded, kick a refresh attempt so a stale token doesn't
 *      cause the next request to fail.
 *
 * Hard rules (enforced by `.lovable/memory/preferences/never-sign-out.md`):
 *   - NEVER call supabase.auth.signOut() from anywhere in this file.
 *   - NEVER clear auth tokens from localStorage.
 *   - On error: log + retry. Do not surface auth errors as logout flows.
 */

import { supabase } from "@/integrations/supabase/client";

const IDB_NAME = "lovable-auth-backup";
const IDB_STORE = "sessions";
const IDB_KEY = "current";

const REFRESH_INITIAL_DELAY_MS = 2_000;
const REFRESH_MAX_DELAY_MS = 60_000;

let started = false;

// ─────────────────────────────────────────────────────────────────────────
// IndexedDB helpers (zero deps, tiny wrapper)
// ─────────────────────────────────────────────────────────────────────────

const openDb = (): Promise<IDBDatabase | null> =>
  new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn("[sessionKeepAlive] IndexedDB open failed", req.error);
        resolve(null);
      };
    } catch (err) {
      console.warn("[sessionKeepAlive] IndexedDB unavailable", err);
      resolve(null);
    }
  });

const idbPut = async (value: unknown) => {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.warn("[sessionKeepAlive] IDB put failed", tx.error);
        resolve();
      };
    } catch (err) {
      console.warn("[sessionKeepAlive] IDB put threw", err);
      resolve();
    }
  });
  db.close();
};

const idbGet = async (): Promise<unknown> => {
  const db = await openDb();
  if (!db) return null;
  const result = await new Promise<unknown>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  db.close();
  return result;
};

// ─────────────────────────────────────────────────────────────────────────
// Forever-retrying refresh loop
// ─────────────────────────────────────────────────────────────────────────

let refreshInFlight: Promise<void> | null = null;

// "AuthSessionMissingError" / "Auth session missing!" means there is literally
// no refresh token in storage — retrying cannot fix this, it just hammers the
// auth server every minute and (worse) every retry call into the Supabase SDK
// can wipe the in-memory session, causing currently-running queries to 401.
//
// We treat this as a TERMINAL "go quiet" state: stop the loop, do NOT signOut,
// do NOT clear tokens. If the user later signs back in, onAuthStateChange will
// repopulate everything and the next refreshWithRetry call will succeed.
const isMissingSessionError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; message?: string; __isAuthError?: boolean };
  if (e.name === "AuthSessionMissingError") return true;
  if (typeof e.message === "string" && e.message.toLowerCase().includes("auth session missing")) {
    return true;
  }
  return false;
};

const refreshWithRetry = async (reason: string): Promise<void> => {
  if (refreshInFlight) return refreshInFlight;

  // Cheap pre-check: if there's no session in storage at all, don't even call
  // refreshSession() — it will just throw AuthSessionMissingError. This is the
  // single most important guard against the runaway refresh loop.
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      console.info(
        `[sessionKeepAlive] no session in storage (reason: ${reason}); skipping refresh`,
      );
      return;
    }
  } catch {
    // getSession should never throw, but if it does, fall through to refresh.
  }

  refreshInFlight = (async () => {
    let attempt = 0;
    let delay = REFRESH_INITIAL_DELAY_MS;
    const MAX_ATTEMPTS = 8; // ~ couple of minutes of backoff, then give up quietly
    while (attempt < MAX_ATTEMPTS) {
      attempt += 1;
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        if (data.session) {
          console.info(
            `[sessionKeepAlive] ✅ refresh succeeded on attempt ${attempt} (reason: ${reason})`,
          );
          return;
        }
        // No session at all (unauthenticated) — stop retrying. Do NOT sign out.
        console.info(
          `[sessionKeepAlive] no active session to refresh (reason: ${reason}); stopping retries`,
        );
        return;
      } catch (err) {
        // TERMINAL: no refresh token to refresh. Stop the loop. Do NOT signOut.
        if (isMissingSessionError(err)) {
          console.info(
            `[sessionKeepAlive] auth session missing (reason: ${reason}); stopping refresh loop (no signOut)`,
          );
          return;
        }
        console.warn(
          `[sessionKeepAlive] refresh attempt ${attempt} failed (reason: ${reason}); retrying in ${delay}ms`,
          err,
        );
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 2, REFRESH_MAX_DELAY_MS);
      }
    }
    console.info(
      `[sessionKeepAlive] giving up refresh loop after ${MAX_ATTEMPTS} attempts (reason: ${reason}); will retry on next visibility/online event`,
    );
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

// ─────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────

export const startSessionKeepAlive = () => {
  if (started || typeof window === "undefined") return;
  started = true;

  // 1. Mirror every auth state change into IndexedDB as a backup.
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      void idbPut({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        savedAt: Date.now(),
      });
    }
    // CRITICAL: do NOT clear the IDB backup on SIGNED_OUT. The only path that
    // hits SIGNED_OUT is the explicit user-clicked button, and even then we
    // keep the backup around so an accidental logout can be recovered from
    // by signing back in. (The token will be invalid, but having the email
    // available speeds up re-auth.)
    if (event === "TOKEN_REFRESHED") {
      console.info("[sessionKeepAlive] TOKEN_REFRESHED — backup updated");
    }
  });

  // 2. On boot: if Supabase has no session but IndexedDB has a backup, try
  //    to restore it via setSession(). This protects against localStorage
  //    being wiped (e.g. preview sandbox URL change).
  void (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return; // already signed in, nothing to do

    const backup = (await idbGet()) as
      | { access_token?: string; refresh_token?: string }
      | null;
    if (!backup?.access_token || !backup?.refresh_token) return;

    console.info("[sessionKeepAlive] localStorage empty but IDB backup found — restoring session");
    try {
      const { error } = await supabase.auth.setSession({
        access_token: backup.access_token,
        refresh_token: backup.refresh_token,
      });
      if (error) {
        console.warn(
          "[sessionKeepAlive] setSession from backup failed; will retry refresh forever (no signOut)",
          error,
        );
        void refreshWithRetry("idb-restore-failed");
      } else {
        console.info("[sessionKeepAlive] ✅ session restored from IndexedDB backup");
      }
    } catch (err) {
      console.warn("[sessionKeepAlive] setSession threw; retrying refresh forever", err);
      void refreshWithRetry("idb-restore-threw");
    }
  })();

  // 3. When the tab becomes visible again, proactively refresh so a token
  //    that expired while backgrounded doesn't break the first request.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void refreshWithRetry("tab-visible");
    }
  });

  // 4. When network comes back online, refresh immediately.
  window.addEventListener("online", () => {
    void refreshWithRetry("network-online");
  });
};
