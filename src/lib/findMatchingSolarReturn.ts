/**
 * Shared Solar Return matching helper.
 *
 * Background: Solar Return charts are linked to their natal chart via
 * `natalChartId`. In practice that link is fragile — a SR may have been
 * generated under a different chart instance ID (e.g. when a user re-imported
 * the same person), or stored with `natalChartId: "user"` while the active
 * chart now has a real ID. When the strict ID match fails the SR was being
 * silently treated as "missing", and the AI was told there was no SR data —
 * even though the user clearly had a SR for that person.
 *
 * This helper tries progressively looser identifiers so a SR that obviously
 * belongs to the same person is still found:
 *   1. Exact `natalChartId === chartId`
 *   2. The "user" alias (legacy primary-user shortcut)
 *   3. Same person by name + birth date (case-insensitive, trimmed)
 *
 * Returns the most recent matching SR (highest `solarReturnYear`) or null.
 */
import type { NatalChart } from "@/hooks/useNatalChart";
import type { SolarReturnChart } from "@/hooks/useSolarReturnChart";

const norm = (s: string | undefined | null): string =>
  (s ?? "").toString().trim().toLowerCase();

export function findMatchingSolarReturn(
  solarReturnCharts: SolarReturnChart[] | undefined | null,
  chart: Pick<NatalChart, "id" | "name" | "birthDate"> | null | undefined,
  activeChartId?: string,
): SolarReturnChart | null {
  if (!Array.isArray(solarReturnCharts) || solarReturnCharts.length === 0) return null;
  if (!chart) return null;

  const chartId = chart.id || activeChartId || "";
  const chartName = norm(chart.name);
  const chartBirthDate = norm(chart.birthDate);

  // Sort newest-first so any matching pass returns the most current SR.
  const sorted = [...solarReturnCharts].sort(
    (a, b) => (b.solarReturnYear || 0) - (a.solarReturnYear || 0),
  );

  // Pass 1: strict natalChartId match.
  const byId = sorted.find((sr) => sr.natalChartId && sr.natalChartId === chartId);
  if (byId) return byId;

  // Pass 2: legacy "user" alias (primary user shortcut).
  if (chartId === "user" || activeChartId === "user") {
    const byUser = sorted.find((sr) => sr.natalChartId === "user");
    if (byUser) return byUser;
  }

  // Pass 3: same-person fallback by name + birth date. Both must match —
  // name alone is too permissive (multiple people could share a first name)
  // and birth date alone misses common birthdays across the user's saved
  // profiles.
  if (chartName && chartBirthDate) {
    const bySameIdentity = sorted.find(
      (sr) => norm(sr.name) === chartName && norm(sr.birthDate) === chartBirthDate,
    );
    if (bySameIdentity) {
      // eslint-disable-next-line no-console
      console.warn(
        `[findMatchingSolarReturn] SR for "${chart.name}" matched via name+birthDate fallback (natalChartId mismatch: chart="${chartId}", sr="${bySameIdentity.natalChartId ?? "(none)"}")`,
      );
      return bySameIdentity;
    }
  }

  return null;
}
