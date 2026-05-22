// Chart validation guardrails.
// Detects bad/suspect house-cusp data BEFORE the portrait engine produces wrong text.
//
// Why this exists: a single typo in a house cusp (e.g. Aries 12° entered instead of
// Aries 22°) silently flips a planet from the 5th to the 6th house and every downstream
// narrative becomes wrong. These checks make those errors visible.

import type { NatalChart, NatalPlanetPosition } from "@/hooks/useNatalChart";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const absLon = (sign: string, degree = 0, minutes = 0): number | null => {
  const i = SIGNS.indexOf(sign);
  if (i < 0) return null;
  return i * 30 + degree + minutes / 60;
};

export type ChartIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  fix?: string;
};

export type ChartValidation = {
  ok: boolean;
  issues: ChartIssue[];
};

// Planets we always want validated
const CORE_PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto", "Chiron", "NorthNode", "SouthNode",
];

export function validateChart(chart: NatalChart): ChartValidation {
  const issues: ChartIssue[] = [];
  const cusps = chart.houseCusps;

  // 1. All 12 cusps present
  if (!cusps) {
    issues.push({
      severity: "error",
      code: "NO_CUSPS",
      message: "No house cusps stored — every house assignment will be wrong.",
      fix: "Re-import the chart with Placidus house cusps.",
    });
    return { ok: false, issues };
  }

  const cuspAbs: (number | null)[] = [null];
  for (let i = 1; i <= 12; i++) {
    const c = (cusps as any)[`house${i}`];
    if (!c?.sign) {
      issues.push({
        severity: "error",
        code: `MISSING_CUSP_${i}`,
        message: `House ${i} cusp is missing.`,
        fix: `Add the ${i}th house cusp from the source chart.`,
      });
      cuspAbs.push(null);
    } else {
      cuspAbs.push(absLon(c.sign, c.degree ?? 0, c.minutes ?? 0));
    }
  }

  // 2. Opposite cusps must be exactly 180° apart (axial symmetry)
  for (let i = 1; i <= 6; i++) {
    const a = cuspAbs[i];
    const b = cuspAbs[i + 6];
    if (a == null || b == null) continue;
    const normalized = (((b - a) % 360) + 360) % 360;
    const diff = Math.abs(normalized - 180);
    if (diff > 0.5) {
      issues.push({
        severity: "error",
        code: `AXIS_BREAK_${i}`,
        message: `House ${i} (${formatCusp(cusps, i)}) and house ${i + 6} (${formatCusp(cusps, i + 6)}) are not 180° apart (off by ${diff.toFixed(1)}°).`,
        fix: "One of those two cusps was entered incorrectly. Re-check both against the source chart.",
      });
    }
  }

  // 3. Cusps must be monotonically increasing around the wheel
  for (let i = 1; i <= 12; i++) {
    const cur = cuspAbs[i];
    const next = cuspAbs[(i % 12) + 1];
    if (cur == null || next == null) continue;
    const span = (next - cur + 360) % 360;
    if (span < 1 || span > 90) {
      issues.push({
        severity: "warning",
        code: `CUSP_SPAN_${i}`,
        message: `House ${i} spans ${span.toFixed(1)}° (typical range is 15–60°).`,
        fix: `Verify the ${i}th and ${i + 1 > 12 ? 1 : i + 1}th house cusps.`,
      });
    }
  }

  // Note: boundary-planet warnings were removed. The chart data is the source of
  // truth, and asking the user to "verify against the original chart" is not
  // useful when the chart wheel they would verify against IS this data.


  return { ok: issues.every((i) => i.severity !== "error"), issues };
}

function formatCusp(cusps: NatalChart["houseCusps"], i: number): string {
  const c = (cusps as any)?.[`house${i}`];
  if (!c?.sign) return "?";
  return `${c.sign} ${c.degree ?? 0}°${c.minutes ?? 0}'`;
}
