// Chart-signature detector.
// Generalizes what used to be one-off "ikeAuthorityPattern" checks into a
// single, name-free signature any chart can match. Returns the data the
// composer + validator need to drive chart-specific phrasing without
// hardcoding people.

import type { NatalChart } from "@/hooks/useNatalChart";

export type AuthoritySignature =
  | "merc-sat-reception"
  | "merc-jup-reception"
  | "venus-jup-reception"
  | "mars-merc-reception"
  | "sun-saturn-tight"
  | "sun-pluto-tight"
  | "sun-chiron-tight"
  | "mars-dominant"
  | "default";

export type MutualReceptionPair =
  | "merc-sat"
  | "merc-jup"
  | "venus-jup"
  | "mars-merc"
  | null;

export type TightAspect = {
  a: string;
  b: string;
  aspect: string;
  orb: number;
};

export type ChartSignature = {
  authority: AuthoritySignature;
  mutualReceptionPair: MutualReceptionPair;
  saturnCentral: boolean;
  chironCentral: boolean;
  mercury12th: boolean;
  marsDominant: boolean;
  // Back-compat alias for the previously-named pattern; now derived from
  // the generic signature so any equivalent chart gets the same treatment.
  ikeAuthorityPattern: boolean;
};

const RULER_OF: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

function hasReception(
  planets: any,
  pA: string,
  pB: string,
): boolean {
  const A = planets?.[pA]?.sign;
  const B = planets?.[pB]?.sign;
  if (!A || !B) return false;
  return RULER_OF[A] === pB && RULER_OF[B] === pA;
}

function findTight(
  aspects: TightAspect[],
  pA: string,
  pB: string,
  maxOrb = 3,
): TightAspect | undefined {
  return aspects.find((a) => {
    const pair = a.a + "|" + a.b;
    const hasA = pair.includes(pA);
    const hasB = pair.includes(pB);
    const hardAspect = /^(square|opposition|conjunction)$/i.test(a.aspect);
    return hasA && hasB && hardAspect && a.orb <= maxOrb;
  });
}

/**
 * Detect the chart's authority signature, mutual reception, and centrality
 * flags. Pure function — no chart math, just reads what is already on the
 * chart and computes booleans for the composer/validator pipeline.
 */
export function detectChartSignature(
  chart: NatalChart | undefined,
  tightAspects: TightAspect[] = [],
): ChartSignature {
  const planets: any = (chart?.planets as any) ?? {};

  // Mutual receptions (traditional rulerships only).
  const mercSat = hasReception(planets, "Mercury", "Saturn");
  const mercJup = hasReception(planets, "Mercury", "Jupiter");
  const venusJup = hasReception(planets, "Venus", "Jupiter");
  const marsMerc = hasReception(planets, "Mars", "Mercury");

  let mutualReceptionPair: MutualReceptionPair = null;
  if (mercSat) mutualReceptionPair = "merc-sat";
  else if (mercJup) mutualReceptionPair = "merc-jup";
  else if (venusJup) mutualReceptionPair = "venus-jup";
  else if (marsMerc) mutualReceptionPair = "mars-merc";

  // Tight pressure aspects.
  const sunSaturn = findTight(tightAspects, "Sun", "Saturn", 3);
  const sunPluto = findTight(tightAspects, "Sun", "Pluto", 3);
  const sunChiron = findTight(tightAspects, "Sun", "Chiron", 2.5);

  const saturnCentral = Boolean(sunSaturn || mercSat);
  const chironCentral = Boolean(sunChiron);

  // Mars dominance proxy: Mars angular (1st/4th/7th/10th) AND in a fire/cardinal sign.
  const marsHouseRaw = planets?.Mars?.house ?? null;
  const marsAngular = marsHouseRaw === 1 || marsHouseRaw === 4 || marsHouseRaw === 7 || marsHouseRaw === 10;
  const marsHot = ["Aries", "Scorpio", "Capricorn", "Leo"].includes(planets?.Mars?.sign);
  const marsDominant = Boolean(marsAngular && marsHot) || Boolean(sunPluto && planets?.Mars?.sign === "Aries");

  const mercury12th = planets?.Mercury?.house === 12;

  // Authority resolution — highest-precedence signature wins.
  let authority: AuthoritySignature = "default";
  if (mercSat) authority = "merc-sat-reception";
  else if (mercJup && (sunPluto || marsDominant)) authority = "merc-jup-reception";
  else if (mercJup) authority = "merc-jup-reception";
  else if (venusJup) authority = "venus-jup-reception";
  else if (marsMerc) authority = "mars-merc-reception";
  else if (sunSaturn) authority = "sun-saturn-tight";
  else if (sunPluto) authority = "sun-pluto-tight";
  else if (sunChiron) authority = "sun-chiron-tight";
  else if (marsDominant) authority = "mars-dominant";

  // Back-compat: anything that would have triggered the old hardcoded Ike
  // pattern (Mars Aries + Mercury Pisces + Sun/Pluto + Merc/Jup reception)
  // still matches; but ANY merc-jup + mars-dominant chart now also qualifies.
  const ikeAuthorityPattern =
    mercJup && (marsDominant || (planets?.Mars?.sign === "Aries" && Boolean(sunPluto)));

  return {
    authority,
    mutualReceptionPair,
    saturnCentral,
    chironCentral,
    mercury12th,
    marsDominant,
    ikeAuthorityPattern,
  };
}
