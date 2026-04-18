/**
 * Claim Anonymous Charts on Sign-In
 *
 * The moment a user signs in, this module attaches every anonymous chart
 * (rows in `device_charts` with `user_id IS NULL` that match this browser's
 * device_id) to that user's account.
 *
 * After this runs once, those charts are tied to the user_id forever and
 * will load on ANY device the user signs into — not just this browser.
 *
 * Idempotent: safe to run on every sign-in. The UPDATE only touches rows
 * that still have user_id IS NULL, so re-runs are no-ops.
 *
 * RLS-safe: the existing UPDATE policy on device_charts allows updates
 * where `auth.uid() IS NULL AND user_id IS NULL`, so an authenticated
 * client can only flip rows from NULL → its own uid (it cannot steal
 * rows owned by anyone else).
 */

import { supabase } from "@/integrations/supabase/client";

const DEVICE_ID_KEY = "astro_device_id";
const CLAIMED_FLAG_KEY_PREFIX = "astro_charts_claimed_for_";

const getDeviceId = (): string | null => {
  try {
    return localStorage.getItem(DEVICE_ID_KEY);
  } catch {
    return null;
  }
};

let claimInFlight: Promise<void> | null = null;

export const claimAnonymousChartsForUser = async (
  userId: string,
): Promise<void> => {
  if (!userId) return;

  // Run at most once per user per browser session — we set a flag in
  // localStorage so we don't hammer the DB on every auth event.
  const flagKey = `${CLAIMED_FLAG_KEY_PREFIX}${userId}`;
  try {
    if (localStorage.getItem(flagKey) === "1") return;
  } catch {
    // localStorage unavailable — fall through and try anyway
  }

  if (claimInFlight) return claimInFlight;

  claimInFlight = (async () => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      console.info("[claimCharts] no device_id on this browser, nothing to claim");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("device_charts")
        .update({ user_id: userId })
        .eq("device_id", deviceId)
        .is("user_id", null)
        .select("id, chart_id, chart_name");

      if (error) {
        console.warn("[claimCharts] update failed (will retry next sign-in):", error);
        return;
      }

      const claimed = data?.length ?? 0;
      if (claimed > 0) {
        console.info(
          `[claimCharts] ✅ attached ${claimed} anonymous chart(s) to user ${userId}`,
          data,
        );
      } else {
        console.info("[claimCharts] no anonymous charts on this device to claim");
      }

      try {
        localStorage.setItem(flagKey, "1");
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn("[claimCharts] unexpected error (will retry next sign-in):", err);
    }
  })().finally(() => {
    claimInFlight = null;
  });

  return claimInFlight;
};
