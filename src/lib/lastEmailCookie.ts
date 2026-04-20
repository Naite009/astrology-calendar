// Stores the user's last-used email in a cookie scoped to the parent
// `.lovable.app` domain so it survives the preview iframe origin swap
// (e.g. `id-preview--…lovable.app` ↔ `…lovableproject.com`). Cookies on
// the eTLD+1 are readable by any subdomain, unlike `localStorage` /
// `IndexedDB` which are origin-scoped.
//
// We only store the EMAIL ADDRESS — never tokens or passwords. This is
// purely a UX hint to pre-fill the auth form and offer a one-tap magic
// link after the session is lost.

const COOKIE_NAME = "lov_last_email";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const getCookieDomain = (): string | null => {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  // Scope to the registrable parent so it survives subdomain swaps.
  if (host.endsWith(".lovable.app")) return ".lovable.app";
  if (host.endsWith(".lovableproject.com")) return ".lovableproject.com";
  if (host.endsWith(".lovable.dev")) return ".lovable.dev";
  // localhost or custom domain — fall back to host-only cookie.
  return null;
};

export const rememberLastEmail = (email: string) => {
  if (typeof document === "undefined" || !email) return;
  try {
    const value = encodeURIComponent(email.trim().toLowerCase());
    const domain = getCookieDomain();
    const parts = [
      `${COOKIE_NAME}=${value}`,
      "Path=/",
      `Max-Age=${ONE_YEAR_SECONDS}`,
      "SameSite=Lax",
    ];
    if (window.location.protocol === "https:") parts.push("Secure");
    if (domain) parts.push(`Domain=${domain}`);
    document.cookie = parts.join("; ");
  } catch (err) {
    console.warn("[lastEmailCookie] failed to write cookie", err);
  }
};

export const readLastEmail = (): string | null => {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const raw = match.split("=").slice(1).join("=");
    const decoded = decodeURIComponent(raw);
    return decoded || null;
  } catch (err) {
    console.warn("[lastEmailCookie] failed to read cookie", err);
    return null;
  }
};

export const forgetLastEmail = () => {
  if (typeof document === "undefined") return;
  const domain = getCookieDomain();
  const parts = [`${COOKIE_NAME}=`, "Path=/", "Max-Age=0"];
  if (domain) parts.push(`Domain=${domain}`);
  document.cookie = parts.join("; ");
};
