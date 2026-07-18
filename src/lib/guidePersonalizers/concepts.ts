// Guide concept personalizers: aspect types, dignities, dwarf planets,
// moon phases, Venus cycles, and difficult placements. Each function returns
// the same PersonalReading shape used by GuideConceptModal.

import type { NatalChart } from "@/hooks/useNatalChart";
import {
  houseForLongitude,
  toAbsoluteLongitude,
  ordinal,
  HOUSE_ARENA,
  SIGN_NAMES,
} from "@/lib/houseForLongitude";
import { STANDARD_ASPECTS, getEffectiveOrb } from "@/lib/aspectOrbs";
import type { PersonalReading, AspectHit } from "./divineFeminine";

const SIGN_FLAVOR: Record<string, string> = {
  Aries: "moving first and acting on instinct",
  Taurus: "building slowly and wanting things that last",
  Gemini: "gathering information and holding two ideas at once",
  Cancer: "tending to home and feeling everything through the gut",
  Leo: "being seen and leading with warmth",
  Virgo: "refining details and quietly running the systems",
  Libra: "weighing fairness and choosing beauty",
  Scorpio: "going all in and refusing surface-level anything",
  Sagittarius: "seeking meaning and needing room to move",
  Capricorn: "building structure and taking responsibility",
  Aquarius: "seeing the whole system and refusing to conform",
  Pisces: "feeling the unseen and trusting what can't be proven",
};

const angleBetween = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const CORE = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto","Ascendant","Midheaven","Chiron","NorthNode"] as const;

const ASPECT_SYMBOL: Record<string, string> = {
  conjunction: "☌", opposition: "☍", square: "□", trine: "△", sextile: "⚹",
};

const placementString = (chart: NatalChart, key: string): string | null => {
  const p: any =
    key === "Ascendant" ? chart.houseCusps?.house1 :
    key === "Midheaven" ? chart.houseCusps?.house10 :
    (chart.planets as any)?.[key];
  if (!p?.sign) return null;
  const abs = toAbsoluteLongitude(p);
  const h = key === "Ascendant" ? 1 : key === "Midheaven" ? 10 : houseForLongitude(chart, abs);
  const houseStr = h ? `, ${ordinal(h)} house` : "";
  return `${p.sign}${houseStr}, ${p.degree || 0}°${String(p.minutes || 0).padStart(2, "0")}'`;
};

// ================= ASPECTS =================
export const ASPECT_TYPES = ["conjunction", "sextile", "square", "trine", "opposition"] as const;
export type AspectType = typeof ASPECT_TYPES[number];

const ASPECT_HEADLINE: Record<AspectType, string> = {
  conjunction: "planets that fuse together and act as one force in your life",
  sextile: "supportive doors that open easily when you take a step through them",
  square: "internal friction that creates the muscle to actually change something",
  trine: "natural gifts that flow so easily you may not notice them as gifts",
  opposition: "polarities you keep balancing across your life, often through other people",
};

export const personalizeAspectType = (
  chart: NatalChart | null | undefined,
  aspect: AspectType,
): PersonalReading => {
  const title = `Your tightest ${aspect}s`;
  if (!chart) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Pick a chart to see this person's tightest natal aspects." };

  const aspectDef = STANDARD_ASPECTS.find((a) => a.name === aspect);
  if (!aspectDef) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Aspect not recognized." };

  // Build all pairs
  const bodies = CORE.filter((k) => {
    const p: any = k === "Ascendant" ? chart.houseCusps?.house1 : k === "Midheaven" ? chart.houseCusps?.house10 : (chart.planets as any)?.[k];
    return !!p?.sign;
  });
  const lonMap = new Map<string, number>();
  for (const b of bodies) {
    const p: any = b === "Ascendant" ? chart.houseCusps?.house1 : b === "Midheaven" ? chart.houseCusps?.house10 : (chart.planets as any)?.[b];
    const abs = toAbsoluteLongitude(p);
    if (abs != null) lonMap.set(b, abs);
  }

  const pairs: Array<{ a: string; b: string; orb: number }> = [];
  const arr = Array.from(lonMap.entries());
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      const sep = angleBetween(arr[i][1], arr[j][1]);
      const orb = Math.abs(sep - aspectDef.angle);
      const allowed = getEffectiveOrb(arr[i][0], arr[j][0], aspect);
      if (orb <= allowed) pairs.push({ a: arr[i][0], b: arr[j][0], orb: Number(orb.toFixed(2)) });
    }
  }
  pairs.sort((x, y) => x.orb - y.orb);

  const hits: AspectHit[] = pairs.slice(0, 6).map((p) => ({
    natalBody: `${p.a} ${ASPECT_SYMBOL[aspect]} ${p.b}`,
    aspect,
    orb: p.orb,
    symbol: ASPECT_SYMBOL[aspect],
  }));

  const placement = pairs.length
    ? `${pairs.length} ${aspect}${pairs.length === 1 ? "" : "s"} within orb across your chart.`
    : `No ${aspect}s within standard orb.`;

  const reading = pairs.length
    ? `${aspect[0].toUpperCase() + aspect.slice(1)}s are ${ASPECT_HEADLINE[aspect]}. Your tightest one is ${pairs[0].a} ${ASPECT_SYMBOL[aspect]} ${pairs[0].b} at ${pairs[0].orb}°. The tighter the orb, the more this pair operates like a single fused mechanism whenever either planet is triggered by transit.`
    : `${aspect[0].toUpperCase() + aspect.slice(1)}s are ${ASPECT_HEADLINE[aspect]}. You don't have any within standard orb, so this angle isn't part of the wiring you were born with.`;

  const doThis = pairs.length
    ? `Watch what happens when transits hit either ${pairs[0].a} or ${pairs[0].b}. Both fire at once. Plan for it instead of getting blindsided.`
    : "Notice this shape in other people's behavior instead. You'll recognize it clearly even though you don't run it internally.";

  return { title, placement, aspects: hits, reading, doThis };
};

// ================= DIGNITIES =================
const DIGNITY: Record<string, { domicile: string[]; exalt: string; detriment: string[]; fall: string }> = {
  Sun:     { domicile: ["Leo"], exalt: "Aries", detriment: ["Aquarius"], fall: "Libra" },
  Moon:    { domicile: ["Cancer"], exalt: "Taurus", detriment: ["Capricorn"], fall: "Scorpio" },
  Mercury: { domicile: ["Gemini","Virgo"], exalt: "Virgo", detriment: ["Sagittarius","Pisces"], fall: "Pisces" },
  Venus:   { domicile: ["Taurus","Libra"], exalt: "Pisces", detriment: ["Scorpio","Aries"], fall: "Virgo" },
  Mars:    { domicile: ["Aries","Scorpio"], exalt: "Capricorn", detriment: ["Libra","Taurus"], fall: "Cancer" },
  Jupiter: { domicile: ["Sagittarius","Pisces"], exalt: "Cancer", detriment: ["Gemini","Virgo"], fall: "Capricorn" },
  Saturn:  { domicile: ["Capricorn","Aquarius"], exalt: "Libra", detriment: ["Cancer","Leo"], fall: "Aries" },
};

export const DIGNITY_PLANETS = Object.keys(DIGNITY);

export const personalizeDignity = (
  chart: NatalChart | null | undefined,
  planet: string,
): PersonalReading => {
  const title = `Your ${planet}'s dignity`;
  if (!chart) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Pick a chart to check this planet's dignity." };

  const p: any = (chart.planets as any)?.[planet];
  if (!p?.sign) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: `${planet} isn't in this chart.` };

  const dig = DIGNITY[planet];
  const sign = p.sign;
  const placement = placementString(chart, planet) || "";
  let status = "peregrine";
  let statusLine = `${planet} in ${sign} is peregrine, which means it has no essential dignity or debility here. It operates as a neutral, adaptable version of itself.`;
  if (dig.domicile.includes(sign)) {
    status = "domicile";
    statusLine = `${planet} in ${sign} is in domicile (its own sign). This is ${planet} at full strength: it does its job naturally, without effort, and other people feel this planet clearly when they meet you.`;
  } else if (sign === dig.exalt) {
    status = "exaltation";
    statusLine = `${planet} in ${sign} is exalted. This is ${planet} at its highest expression: honored, dignified, and often the placement you're quietly proud of.`;
  } else if (dig.detriment.includes(sign)) {
    status = "detriment";
    statusLine = `${planet} in ${sign} is in detriment (opposite its home sign). It still wants its normal job, but has to do it in a foreign language. It comes out sideways under stress, and becomes very effective once you name what it's actually trying to do.`;
  } else if (sign === dig.fall) {
    status = "fall";
    statusLine = `${planet} in ${sign} is in fall (opposite its exaltation). Under pressure it collapses into the shadow expression first. This is the placement most likely to feel like a wound before it becomes a skill.`;
  }

  const reading = `${statusLine} Because it's in ${sign}, its normal job now runs through ${SIGN_FLAVOR[sign] || sign.toLowerCase()}.`;
  const doThis =
    status === "detriment" || status === "fall"
      ? `Give this planet a clean job description in ${sign} terms. When you notice it acting sideways, ask: what is it trying to protect? Then meet that need on purpose instead of letting it hijack the situation.`
      : status === "domicile" || status === "exaltation"
      ? `Lean on this planet. It's one of your most reliable inner tools. When you're stuck, let ${planet} lead.`
      : `Watch how ${planet} behaves in this chart across a few weeks. Peregrine planets often take their cue from whichever transit or house ruler activates them.`;

  return { title, placement, aspects: [], reading, doThis };
};

// ================= DWARF PLANETS / TNOs =================
export const DWARF_BODIES = ["Eris", "Sedna", "Makemake", "Haumea", "Quaoar", "Pholus", "Nessus"] as const;
export type DwarfBody = typeof DWARF_BODIES[number];

const DWARF_MEANING: Record<DwarfBody, { headline: (sign: string) => string; house: string; action: string; cadence: string }> = {
  Eris: {
    headline: (s) => `Eris in ${s} is your uninvited-guest self: the part of you that names the truth nobody in the room wants to say. It moves through ${SIGN_FLAVOR[s] || s}.`,
    house: "The area of life where you keep exposing what others tried to sweep under the rug is",
    action: "Stop softening the true thing. Say it once, cleanly, and let the room deal with it.",
    cadence: "Eris moves about 1° every 4-5 years. Everyone born within roughly your decade shares this sign, so what makes it personal is the house it sits in and the natal planets it aspects.",
  },
  Sedna: {
    headline: (s) => `Sedna in ${s} carries ancestral wounds around betrayal, abandonment, and resources. It processes through ${SIGN_FLAVOR[s] || s}.`,
    house: "The area of life where the old family wound keeps resurfacing is",
    action: "This wound isn't yours alone. Name what got handed down to you, and choose one lineage pattern you refuse to pass on.",
    cadence: "Sedna's orbit is over 11,000 years, so an entire generation shares her sign. The house is what makes her personal.",
  },
  Makemake: {
    headline: (s) => `Makemake in ${s} deals with what you create, what you consume, and what the earth can bear. It works through ${SIGN_FLAVOR[s] || s}.`,
    house: "The area of life where you're being asked to create sustainably instead of extractively is",
    action: "Pick one thing you keep taking from that you've never given back to. Give back this month.",
    cadence: "Makemake orbits every 305 years, so its sign is generational. The house is where it lands for you.",
  },
  Haumea: {
    headline: (s) => `Haumea in ${s} is your ability to regenerate what got broken. It rebuilds through ${SIGN_FLAVOR[s] || s}.`,
    house: "The area of life where you keep starting over and coming back stronger is",
    action: "Stop trying to preserve the old form. Let the thing die so the new version can grow.",
    cadence: "Haumea's orbit is 283 years, so its sign is generational. The house is where you personally do the rebuilding.",
  },
  Quaoar: {
    headline: (s) => `Quaoar in ${s} is the story you use to make sense of your life. You write it through ${SIGN_FLAVOR[s] || s}.`,
    house: "The area of life where your personal mythology gets built and rewritten is",
    action: "Notice the story you tell about your life. Is it still true? Rewrite the sentence that isn't.",
    cadence: "Quaoar orbits every 286 years, so its sign is generational. The house is where you personally do the storytelling.",
  },
  Pholus: {
    headline: (s) => `Pholus in ${s} is the small trigger that sets off enormous consequences. It works through ${SIGN_FLAVOR[s] || s}.`,
    house: "The area of life where one small choice keeps changing everything is",
    action: "Before a 'small' decision here, pause. In this arena, the tiny lever moves a huge weight.",
    cadence: "Pholus takes about 92 years to orbit, so its sign is shared with your generation. Aspects and house make it yours.",
  },
  Nessus: {
    headline: (s) => `Nessus in ${s} marks the abuse or power-misuse pattern that must end in your line. It surfaces through ${SIGN_FLAVOR[s] || s}.`,
    house: "The area of life where the toxic cycle keeps trying to repeat is",
    action: "The pattern stops at you. Name it precisely, out loud, once, so it can't disguise itself again.",
    cadence: "Nessus orbits every 122 years, so its sign is generational. The house and its aspects are what make it personal.",
  },
};

export const personalizeDwarf = (
  chart: NatalChart | null | undefined,
  body: DwarfBody,
): PersonalReading => {
  const title = `Your ${body}`;
  if (!chart) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Pick a chart to see this body." };

  const p: any = (chart.planets as any)?.[body];
  if (!p?.sign) {
    return { title, placement: "", aspects: [], reading: "", doThis: "", missing: `${body} isn't in this chart's data yet.`, cadence: DWARF_MEANING[body].cadence };
  }
  const sign = p.sign;
  const abs = toAbsoluteLongitude(p);
  const house = houseForLongitude(chart, abs);
  const placement = placementString(chart, body) || "";
  const m = DWARF_MEANING[body];
  const houseLine = house ? `${m.house} the ${ordinal(house)} house (${HOUSE_ARENA[house] || ""}).` : "";
  const reading = `${m.headline(sign)} ${houseLine}`;
  return { title, placement, aspects: [], reading, doThis: m.action, cadence: m.cadence };
};

// ================= MOON PHASES (natal) =================
export const MOON_PHASES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Balsamic/Waning Crescent",
] as const;
export type MoonPhase = typeof MOON_PHASES[number];

const PHASE_MEANING: Record<MoonPhase, string> = {
  "New Moon": "You're a seed-planter. You launch things others can't yet see and are often ahead of your own understanding. Your job is to move on instinct even when the plan isn't visible.",
  "Waxing Crescent": "You're a faith-builder. You back the fragile new thing even when it doesn't look like much yet. Your work is to protect what you've started long enough for it to prove itself.",
  "First Quarter": "You're a crisis-in-action person. You make things happen by hitting obstacles head-on. You need friction to know you're moving.",
  "Waxing Gibbous": "You're a refiner. You take the rough version and make it real. You're at your best in the perfect-it phase, not the launch phase.",
  "Full Moon": "You're a fulfillment person. You were born under the completion of a cycle, so you're often the one who names what everyone else is feeling but not saying. Relationships are where your work lands.",
  "Waning Gibbous": "You're a translator and teacher. You take the meaning of the experience and give it back to other people. You need audience.",
  "Last Quarter": "You're a system-breaker. You were born under an integrity crisis, so you can see when a structure has outlived its usefulness and needs to come apart. You end things others can't.",
  "Balsamic/Waning Crescent": "You're a composter and finisher. Never 'initiator'. You process endings and prepare the ground for the next cycle. You need real rest and often carry old-soul quiet.",
};

const computePhase = (sunLon: number, moonLon: number): MoonPhase => {
  let d = (moonLon - sunLon + 360) % 360;
  if (d < 45) return "New Moon";
  if (d < 90) return "Waxing Crescent";
  if (d < 135) return "First Quarter";
  if (d < 180) return "Waxing Gibbous";
  if (d < 225) return "Full Moon";
  if (d < 270) return "Waning Gibbous";
  if (d < 315) return "Last Quarter";
  return "Balsamic/Waning Crescent";
};

export const personalizeMoonPhase = (
  chart: NatalChart | null | undefined,
  phase: MoonPhase,
): PersonalReading => {
  const title = `${phase} in your chart`;
  if (!chart) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Pick a chart to see this person's natal Moon phase." };
  const sunLon = toAbsoluteLongitude((chart.planets as any)?.Sun);
  const moonLon = toAbsoluteLongitude((chart.planets as any)?.Moon);
  if (sunLon == null || moonLon == null) {
    return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Sun or Moon missing from chart data." };
  }
  const natalPhase = computePhase(sunLon, moonLon);
  const isMatch = natalPhase === phase;
  const placement = `You were born under the ${natalPhase}.`;
  const reading = isMatch
    ? `Yes: this is your natal Moon phase. ${PHASE_MEANING[phase]}`
    : `This is not your natal phase. Your phase is ${natalPhase}: ${PHASE_MEANING[natalPhase]} You still feel every ${phase} as it comes through the sky, but ${natalPhase} is your baseline operating rhythm.`;
  const doThis = isMatch
    ? "Structure your month around your natural rhythm instead of fighting it. Your energy will match this phase every cycle."
    : `When the ${phase} comes each month, notice it as weather. When your natal ${natalPhase} returns, that's your reset point.`;
  return { title, placement, aspects: [], reading, doThis };
};

// ================= VENUS CYCLES (star point) =================
export const personalizeVenusPhase = (
  chart: NatalChart | null | undefined,
): PersonalReading => {
  const title = "Your Venus phase";
  if (!chart) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Pick a chart to see this person's Venus phase." };
  const sunLon = toAbsoluteLongitude((chart.planets as any)?.Sun);
  const venLon = toAbsoluteLongitude((chart.planets as any)?.Venus);
  if (sunLon == null || venLon == null) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Sun or Venus missing." };
  let d = (venLon - sunLon + 360) % 360;
  // Venus <48° from Sun. Ahead of Sun (0-48) = Evening Star. Behind (312-360) = Morning Star.
  let phase: "Morning Star" | "Evening Star";
  if (d <= 180) phase = "Evening Star";
  else phase = "Morning Star";
  const placement = `Venus is ${Math.round(Math.min(d, 360 - d))}° from your Sun. You're a Venus ${phase}.`;
  const reading = phase === "Morning Star"
    ? "Morning Star Venus (Venus rises before the Sun): you lead with Venus. You're direct in love, initiate connection, and know what you want. This is the Inanna/warrior Venus, comfortable being first."
    : "Evening Star Venus (Venus sets after the Sun): Venus follows the Sun. You're the receiver, drawing people to you rather than chasing. This is the priestess Venus, comfortable being sought.";
  const doThis = phase === "Morning Star"
    ? "Stop apologizing for going first. Reach out, name what you want, make the call. That IS your Venus job."
    : "Stop chasing what should be coming to you. Show up beautifully and let people arrive.";
  return {
    title, placement, aspects: [], reading, doThis,
    cadence: "Your Venus phase is fixed for life. The full 584-day Venus cycle brings 'Venus Star Points' (Sun-Venus conjunctions) that reset the theme for everyone; whether you're Morning or Evening Star is your personal signature.",
  };
};

// ================= DIFFICULT PLACEMENTS =================
export const personalizeDifficultPlacements = (
  chart: NatalChart | null | undefined,
): PersonalReading => {
  const title = "Your 'costume adjustments'";
  if (!chart) return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Pick a chart to see this person's difficult placements." };
  const items: string[] = [];
  for (const [planet, dig] of Object.entries(DIGNITY)) {
    const p: any = (chart.planets as any)?.[planet];
    if (!p?.sign) continue;
    if (dig.detriment.includes(p.sign)) items.push(`${planet} in ${p.sign} (detriment)`);
    else if (p.sign === dig.fall) items.push(`${planet} in ${p.sign} (fall)`);
  }
  const placement = items.length ? items.join(" · ") : "No traditional planets are in detriment or fall.";
  const reading = items.length
    ? `These are the planets that come out sideways under stress. They aren't broken. They just need a clean job description. Tap each planet in the Dignities section to see the specific translation work for that placement.`
    : "None of your traditional planets are in classical debility. Your 'costume adjustments' will show up in other places (squares to outer planets, intercepted signs, house rulers in tough condition). Check the Chart Decoder's Director's Notes for those.";
  const doThis = items.length
    ? `Pick the first item in the list. Ask: what is this planet trying to protect? Then give it a lawful, on-purpose way to do that job this week.`
    : "Read the Director's Notes section of Chart Decoder for the next layer of difficulty translation.";
  return { title, placement, aspects: [], reading, doThis };
};
