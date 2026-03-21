// Domain Deep-Dive Engine — synthesizes multiple houses per life area
import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

// ─── Types ──────────────────────────────────────────────────────────
export interface DomainPlanetHit {
  planet: string;
  sign: string;
  house: number | null;
  chart: 'SR' | 'Natal';
  role: string;          // e.g. "Rules your 2nd house", "Sits in your 8th house"
  tone: 'supportive' | 'challenging' | 'neutral' | 'transformative';
}

export interface DomainHouseSnapshot {
  houseNumber: number;
  label: string;         // "Earning Power (2nd)"
  sign: string | null;
  planets: string[];        // major planets only (Sun–Pluto)
  minorBodies: string[];    // asteroids, points (Juno, Ceres, etc.)
  interpretation: string;
}

export interface DomainSynthesis {
  headline: string;
  paragraph: string;
  practicalAdvice: string[];
}

export interface DomainDeepDive {
  id: string;
  title: string;
  emoji: string;
  houses: DomainHouseSnapshot[];
  keyPlanets: DomainPlanetHit[];
  synthesis: DomainSynthesis;
  activityLevel: number;  // 0-10
  tone: 'supportive' | 'challenging' | 'mixed' | 'transformative';
}

// ─── Helpers ────────────────────────────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const MAJOR_PLANETS = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']);

const PLANET_TONE: Record<string, 'supportive' | 'challenging' | 'neutral' | 'transformative'> = {
  Sun: 'supportive', Moon: 'supportive', Venus: 'supportive', Jupiter: 'supportive',
  Mercury: 'neutral', NorthNode: 'supportive', Juno: 'supportive', Ceres: 'supportive',
  Mars: 'challenging', Saturn: 'challenging', Chiron: 'challenging',
  Uranus: 'transformative', Neptune: 'transformative', Pluto: 'transformative',
};

function getHouseSign(srChart: SolarReturnChart, h: number): string | null {
  const key = `house${h}` as keyof typeof srChart.houseCusps;
  const cusp = srChart.houseCusps?.[key];
  return cusp?.sign || null;
}

function getAllBodiesInHouse(analysis: SolarReturnAnalysis, house: number): { major: string[]; minor: string[] } {
  const all = (analysis.houseOverlays || [])
    .filter(o => o.srHouse === house)
    .map(o => o.planet);
  return {
    major: all.filter(p => MAJOR_PLANETS.has(p)),
    minor: all.filter(p => !MAJOR_PLANETS.has(p)),
  };
}

function overallTone(hits: DomainPlanetHit[]): 'supportive' | 'challenging' | 'mixed' | 'transformative' {
  const s = hits.filter(h => h.tone === 'supportive').length;
  const c = hits.filter(h => h.tone === 'challenging').length;
  const t = hits.filter(h => h.tone === 'transformative').length;
  if (t >= 2) return 'transformative';
  if (s > c + 1) return 'supportive';
  if (c > s + 1) return 'challenging';
  return 'mixed';
}

// ─── House interpretation templates ─────────────────────────────────
const HOUSE_LABELS: Record<number, string> = {
  1: 'Self & Body', 2: 'Earning Power', 3: 'Communication & Learning',
  4: 'Home & Roots', 5: 'Romance & Creativity', 6: 'Daily Work & Health',
  7: 'Partnerships', 8: 'Shared Resources & Intimacy', 9: 'Growth & Beliefs',
  10: 'Public Role & Career', 11: 'Friends & Community', 12: 'Inner Life & Rest',
};

function buildHouseSnapshot(
  analysis: SolarReturnAnalysis, srChart: SolarReturnChart,
  houseNum: number, contextLabel: string,
): DomainHouseSnapshot {
  const sign = getHouseSign(srChart, houseNum);
  const { major: planets, minor: minorBodies } = getAllBodiesInHouse(analysis, houseNum);
  const label = `${contextLabel} (${houseNum}${ordSuffix(houseNum)} House)`;
  
  let interp = '';
  if (planets.length === 0) {
    interp = sign
      ? `No planets here this year — the ${sign} energy on the cusp sets a quiet, steady backdrop.`
      : 'This house is quiet this year — not a primary focus.';
    if (minorBodies.length > 0) {
      interp += ` (${minorBodies.join(', ')} ${minorBodies.length === 1 ? 'is' : 'are'} also present as minor influences.)`;
    }
  } else if (planets.length === 1) {
    interp = `${planets[0]} in ${sign || 'this house'} brings focused attention to this area.`;
    if (minorBodies.length > 0) interp += ` ${minorBodies.join(', ')} add${minorBodies.length === 1 ? 's' : ''} subtle nuance.`;
  } else {
    interp = `${planets.join(', ')} all occupy this space — this is a busy, active zone this year.`;
    if (minorBodies.length > 0) interp += ` ${minorBodies.join(', ')} add${minorBodies.length === 1 ? 's' : ''} additional texture.`;
  }
  
  return { houseNumber: houseNum, label, sign, planets, minorBodies, interpretation: interp };
}

function ordSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  const last = n % 10;
  if (last === 1) return 'st'; if (last === 2) return 'nd'; if (last === 3) return 'rd'; return 'th';
}

// ─── Domain Builders ────────────────────────────────────────────────

function buildAbundance(analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart): DomainDeepDive {
  const h2 = buildHouseSnapshot(analysis, srChart, 2, 'What You Earn');
  const h8 = buildHouseSnapshot(analysis, srChart, 8, 'Shared Money & Debt');
  
  const hits: DomainPlanetHit[] = [];
  
  // Jupiter — the abundance planet
  const jupPos = srChart.planets.Jupiter;
  const jupHouse = analysis.houseOverlays?.find(o => o.planet === 'Jupiter')?.srHouse;
  if (jupPos) hits.push({ planet: 'Jupiter', sign: jupPos.sign, house: jupHouse || null, chart: 'SR', role: 'Your expansion and opportunity planet', tone: 'supportive' });
  
  // Venus — what you attract
  const venPos = srChart.planets.Venus;
  const venHouse = analysis.houseOverlays?.find(o => o.planet === 'Venus')?.srHouse;
  if (venPos) hits.push({ planet: 'Venus', sign: venPos.sign, house: venHouse || null, chart: 'SR', role: 'What you attract and value', tone: 'supportive' });
  
  // Planets in 2nd and 8th
  for (const p of h2.planets) {
    if (!hits.find(h => h.planet === p)) {
      const pos = srChart.planets[p as keyof typeof srChart.planets];
      hits.push({ planet: p, sign: pos?.sign || '', house: 2, chart: 'SR', role: 'Sits in your earning zone', tone: PLANET_TONE[p] || 'neutral' });
    }
  }
  for (const p of h8.planets) {
    if (!hits.find(h => h.planet === p)) {
      const pos = srChart.planets[p as keyof typeof srChart.planets];
      hits.push({ planet: p, sign: pos?.sign || '', house: 8, chart: 'SR', role: 'Sits in your shared resources zone', tone: PLANET_TONE[p] || 'neutral' });
    }
  }

  const t = overallTone(hits);
  const activity = Math.min(10, h2.planets.length * 2.5 + h8.planets.length * 2.5 + (jupHouse === 2 || jupHouse === 8 ? 3 : 1));

  const advice: string[] = [];
  if (jupPos) advice.push(`Jupiter in ${jupPos.sign} says growth comes through ${jupPos.sign === 'Taurus' || jupPos.sign === 'Virgo' || jupPos.sign === 'Capricorn' ? 'slow, practical steps' : jupPos.sign === 'Aries' || jupPos.sign === 'Leo' || jupPos.sign === 'Sagittarius' ? 'bold moves and risk-taking' : jupPos.sign === 'Gemini' || jupPos.sign === 'Libra' || jupPos.sign === 'Aquarius' ? 'networking and ideas' : 'intuition and creative flow'}.`);
  if (h2.planets.includes('Saturn')) advice.push('Saturn in the 2nd means money comes through discipline and patience — no shortcuts this year.');
  else if (h2.planets.includes('Mars')) advice.push('Mars in the 2nd pushes you to earn actively — freelancing, side hustles, or asking for raises.');
  if (h8.planets.length > 0) advice.push('Activity in the 8th suggests shared finances, inheritances, or insurance matters need attention.');
  if (advice.length === 0) advice.push('Track your spending weekly and notice where money flows easily versus where it sticks.');

  const headline = t === 'supportive' ? 'Money Flows More Easily This Year'
    : t === 'challenging' ? 'Financial Restructuring Year'
    : t === 'transformative' ? 'Deep Financial Shifts Ahead'
    : 'A Complex Money Year';

  const para = `Your earning zone (2nd house) has ${h2.planets.length > 0 ? h2.planets.join(' and ') + ' bringing direct energy' : 'no planets — a steadier backdrop'}. ` +
    `The shared resources zone (8th house) ${h8.planets.length > 0 ? 'is active with ' + h8.planets.join(', ') : 'is quiet'}. ` +
    `Jupiter in your ${jupHouse || '?'}${ordSuffix(jupHouse || 0)} house suggests your biggest growth opportunity lives in ${HOUSE_LABELS[jupHouse || 0] || 'that area'}.`;

  return { id: 'abundance', title: 'Money & Abundance', emoji: '💰', houses: [h2, h8], keyPlanets: hits, synthesis: { headline, paragraph: para, practicalAdvice: advice }, activityLevel: Math.round(activity), tone: t };
}

function buildLove(analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart): DomainDeepDive {
  const h5 = buildHouseSnapshot(analysis, srChart, 5, 'Romance & Joy');
  const h7 = buildHouseSnapshot(analysis, srChart, 7, 'Committed Partnerships');
  
  const hits: DomainPlanetHit[] = [];
  
  const venPos = srChart.planets.Venus;
  const venHouse = analysis.houseOverlays?.find(o => o.planet === 'Venus')?.srHouse;
  if (venPos) hits.push({ planet: 'Venus', sign: venPos.sign, house: venHouse || null, chart: 'SR', role: 'How you love and attract this year', tone: 'supportive' });
  
  const marsPos = srChart.planets.Mars;
  const marsHouse = analysis.houseOverlays?.find(o => o.planet === 'Mars')?.srHouse;
  if (marsPos) hits.push({ planet: 'Mars', sign: marsPos.sign, house: marsHouse || null, chart: 'SR', role: 'Your desire and pursuit energy', tone: PLANET_TONE['Mars'] || 'challenging' });

  const junoPos = srChart.planets.Juno as any;
  if (junoPos) {
    const junoH = analysis.houseOverlays?.find(o => o.planet === 'Juno')?.srHouse;
    hits.push({ planet: 'Juno', sign: junoPos.sign, house: junoH || null, chart: 'SR', role: 'What you need in commitment', tone: 'supportive' });
  }

  for (const p of h5.planets) {
    if (!hits.find(h => h.planet === p)) {
      const pos = srChart.planets[p as keyof typeof srChart.planets];
      hits.push({ planet: p, sign: pos?.sign || '', house: 5, chart: 'SR', role: 'In your romance and joy zone', tone: PLANET_TONE[p] || 'neutral' });
    }
  }
  for (const p of h7.planets) {
    if (!hits.find(h => h.planet === p)) {
      const pos = srChart.planets[p as keyof typeof srChart.planets];
      hits.push({ planet: p, sign: pos?.sign || '', house: 7, chart: 'SR', role: 'In your partnership zone', tone: PLANET_TONE[p] || 'neutral' });
    }
  }

  const t = overallTone(hits);
  const activity = Math.min(10, h5.planets.length * 2.5 + h7.planets.length * 2.5 + (venHouse === 5 || venHouse === 7 ? 3 : 1));

  const advice: string[] = [];
  if (venPos) advice.push(`Venus in ${venPos.sign} means you feel most loved through ${venPos.sign === 'Taurus' || venPos.sign === 'Cancer' ? 'physical comfort and security' : venPos.sign === 'Leo' || venPos.sign === 'Aries' ? 'attention and excitement' : venPos.sign === 'Libra' || venPos.sign === 'Gemini' ? 'conversation and fairness' : venPos.sign === 'Scorpio' || venPos.sign === 'Pisces' ? 'deep emotional honesty' : 'practical acts of service'}.`);
  if (h7.planets.includes('Saturn')) advice.push('Saturn in the 7th is a relationship reality check — what is real survives, what is not may end.');
  if (h7.planets.includes('Neptune')) advice.push('Neptune in the 7th can blur boundaries — be careful about seeing people as you wish they were instead of how they actually are.');
  if (h5.planets.includes('Jupiter')) advice.push('Jupiter in the 5th is great for dating, creative projects, and anything that brings you joy.');
  if (advice.length === 0) advice.push('Pay attention to how your body feels around people — your nervous system knows before your mind does.');

  const headline = t === 'supportive' ? 'A Year of Warmth and Connection'
    : t === 'challenging' ? 'Relationships Get Real This Year'
    : t === 'transformative' ? 'Deep Relationship Shifts Ahead'
    : 'Love Is Active and Complex';

  const para = `Your romance zone (5th house) ${h5.planets.length > 0 ? 'has ' + h5.planets.join(', ') + ' bringing energy to dating, play, and creative expression' : 'is quiet — not a primary dating year'}. ` +
    `Your partnership zone (7th house) ${h7.planets.length > 0 ? 'is active with ' + h7.planets.join(', ') + ' — committed relationships are in focus' : 'has a steadier energy'}. ` +
    `Venus in ${venPos?.sign || '?'} in your ${venHouse || '?'}${ordSuffix(venHouse || 0)} house shapes how you give and receive love.`;

  return { id: 'love', title: 'Love & Relationships', emoji: '💕', houses: [h5, h7], keyPlanets: hits, synthesis: { headline, paragraph: para, practicalAdvice: advice }, activityLevel: Math.round(activity), tone: t };
}

function buildCareer(analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart): DomainDeepDive {
  const h2 = buildHouseSnapshot(analysis, srChart, 2, 'Income & Value');
  const h6 = buildHouseSnapshot(analysis, srChart, 6, 'Daily Work & Routines');
  const h10 = buildHouseSnapshot(analysis, srChart, 10, 'Public Role & Reputation');
  
  const hits: DomainPlanetHit[] = [];
  
  const satPos = srChart.planets.Saturn;
  const satHouse = analysis.houseOverlays?.find(o => o.planet === 'Saturn')?.srHouse;
  if (satPos) hits.push({ planet: 'Saturn', sign: satPos.sign, house: satHouse || null, chart: 'SR', role: 'Where you build lasting structure', tone: 'challenging' });
  
  const sunPos = srChart.planets.Sun;
  const sunHouse = analysis.sunHouse?.house;
  if (sunPos) hits.push({ planet: 'Sun', sign: sunPos.sign, house: sunHouse || null, chart: 'SR', role: 'Where your vitality and recognition go', tone: 'supportive' });

  const jupPos = srChart.planets.Jupiter;
  const jupHouse = analysis.houseOverlays?.find(o => o.planet === 'Jupiter')?.srHouse;
  if (jupPos && (jupHouse === 2 || jupHouse === 6 || jupHouse === 10)) {
    hits.push({ planet: 'Jupiter', sign: jupPos.sign, house: jupHouse, chart: 'SR', role: 'Expansion in your work area', tone: 'supportive' });
  }

  for (const h of [h6, h10]) {
    for (const p of h.planets) {
      if (!hits.find(x => x.planet === p)) {
        const pos = srChart.planets[p as keyof typeof srChart.planets];
        hits.push({ planet: p, sign: pos?.sign || '', house: h.houseNumber, chart: 'SR', role: `In your ${HOUSE_LABELS[h.houseNumber]} zone`, tone: PLANET_TONE[p] || 'neutral' });
      }
    }
  }

  const t = overallTone(hits);
  const activity = Math.min(10, h6.planets.length * 2 + h10.planets.length * 3 + (sunHouse === 10 ? 3 : sunHouse === 6 ? 2 : 0));

  const advice: string[] = [];
  if (sunHouse === 10) advice.push('Sun in the 10th — this is YOUR year for recognition. Put yourself out there.');
  if (h10.planets.includes('Saturn')) advice.push('Saturn in the 10th means career growth through hard work and patience — promotions come slowly but stick.');
  if (h10.planets.includes('Uranus')) advice.push('Uranus in the 10th can bring sudden career changes — stay flexible and open to unexpected directions.');
  if (h6.planets.includes('Mars')) advice.push('Mars in the 6th drives you to work harder — watch for burnout and make rest part of your productivity plan.');
  if (advice.length === 0) advice.push('Focus on the area where the most planets cluster — that is where your career energy naturally flows this year.');

  const headline = t === 'supportive' ? 'Career Growth Is Well-Supported'
    : t === 'challenging' ? 'A Year of Professional Testing'
    : t === 'transformative' ? 'Major Career Shifts Ahead'
    : 'Work Is Active on Multiple Fronts';

  const para = `Your daily work zone (6th house) ${h6.planets.length > 0 ? 'has ' + h6.planets.join(', ') : 'is quiet'}. ` +
    `Your public reputation (10th house) ${h10.planets.length > 0 ? 'is activated by ' + h10.planets.join(', ') : 'runs on autopilot'}. ` +
    `Saturn in ${satPos?.sign || '?'} (${satHouse || '?'}${ordSuffix(satHouse || 0)} house) shows where you are building something that lasts.`;

  return { id: 'career', title: 'Career & Work', emoji: '💼', houses: [h2, h6, h10], keyPlanets: hits, synthesis: { headline, paragraph: para, practicalAdvice: advice }, activityLevel: Math.round(activity), tone: t };
}

function buildHome(analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart): DomainDeepDive {
  const h4 = buildHouseSnapshot(analysis, srChart, 4, 'Home & Family');
  
  const hits: DomainPlanetHit[] = [];
  
  const moonPos = srChart.planets.Moon;
  const moonHouse = analysis.moonHouse?.house;
  if (moonPos) hits.push({ planet: 'Moon', sign: moonPos.sign, house: moonHouse || null, chart: 'SR', role: 'Your emotional home base this year', tone: 'supportive' });
  
  const ceresPos = srChart.planets.Ceres as any;
  if (ceresPos) {
    const ceresH = analysis.houseOverlays?.find(o => o.planet === 'Ceres')?.srHouse;
    hits.push({ planet: 'Ceres', sign: ceresPos.sign, house: ceresH || null, chart: 'SR', role: 'How you nurture and feel nurtured', tone: 'supportive' });
  }

  for (const p of h4.planets) {
    if (!hits.find(h => h.planet === p)) {
      const pos = srChart.planets[p as keyof typeof srChart.planets];
      hits.push({ planet: p, sign: pos?.sign || '', house: 4, chart: 'SR', role: 'In your home and roots zone', tone: PLANET_TONE[p] || 'neutral' });
    }
  }

  const t = overallTone(hits);
  const activity = Math.min(10, h4.planets.length * 3 + (moonHouse === 4 ? 3 : 1));

  const advice: string[] = [];
  if (moonPos) advice.push(`Moon in ${moonPos.sign} means you recharge through ${moonPos.sign === 'Cancer' || moonPos.sign === 'Taurus' ? 'cozy, familiar spaces' : moonPos.sign === 'Aries' || moonPos.sign === 'Sagittarius' ? 'physical activity and freedom' : moonPos.sign === 'Gemini' || moonPos.sign === 'Aquarius' ? 'social connection and stimulation' : 'quiet alone time and reflection'}.`);
  if (h4.planets.includes('Saturn')) advice.push('Saturn in the 4th can mean home repairs, family responsibilities, or feeling weighed down by obligations at home.');
  if (h4.planets.includes('Uranus')) advice.push('Uranus in the 4th can bring a move, renovation, or sudden changes in living situation.');
  if (advice.length === 0) advice.push('Your home life is a quieter zone this year — use it as a stable base while other areas demand attention.');

  const headline = t === 'supportive' ? 'Home Life Feels Nourishing'
    : t === 'challenging' ? 'Home and Family Need Your Attention'
    : t === 'transformative' ? 'Expect Changes on the Home Front'
    : 'Home Is Evolving This Year';

  const para = `Your home zone (4th house) ${h4.planets.length > 0 ? 'has ' + h4.planets.join(', ') + ' — family and living situation are active' : 'is quiet — home serves as a stable backdrop'}. ` +
    `The Moon in ${moonPos?.sign || '?'} in your ${moonHouse || '?'}${ordSuffix(moonHouse || 0)} house shows where your emotional comfort lives.`;

  return { id: 'home', title: 'Home & Family', emoji: '🏠', houses: [h4], keyPlanets: hits, synthesis: { headline, paragraph: para, practicalAdvice: advice }, activityLevel: Math.round(activity), tone: t };
}

function buildHealth(analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart): DomainDeepDive {
  const h1 = buildHouseSnapshot(analysis, srChart, 1, 'Body & Appearance');
  const h6 = buildHouseSnapshot(analysis, srChart, 6, 'Health & Daily Habits');
  
  const hits: DomainPlanetHit[] = [];
  
  const chironPos = srChart.planets.Chiron as any;
  if (chironPos) {
    const chironH = analysis.houseOverlays?.find(o => o.planet === 'Chiron')?.srHouse;
    hits.push({ planet: 'Chiron', sign: chironPos.sign, house: chironH || null, chart: 'SR', role: 'Where old sore spots surface for healing', tone: 'challenging' });
  }

  const marsPos = srChart.planets.Mars;
  const marsHouse = analysis.houseOverlays?.find(o => o.planet === 'Mars')?.srHouse;
  if (marsPos) hits.push({ planet: 'Mars', sign: marsPos.sign, house: marsHouse || null, chart: 'SR', role: 'Your physical energy and drive', tone: 'challenging' });

  for (const h of [h1, h6]) {
    for (const p of h.planets) {
      if (!hits.find(x => x.planet === p)) {
        const pos = srChart.planets[p as keyof typeof srChart.planets];
        hits.push({ planet: p, sign: pos?.sign || '', house: h.houseNumber, chart: 'SR', role: `In your ${HOUSE_LABELS[h.houseNumber]} zone`, tone: PLANET_TONE[p] || 'neutral' });
      }
    }
  }

  const t = overallTone(hits);
  const activity = Math.min(10, h1.planets.length * 2 + h6.planets.length * 3 + (marsHouse === 1 || marsHouse === 6 ? 2 : 0));

  const advice: string[] = [];
  if (marsPos) advice.push(`Mars in ${marsPos.sign} — your energy runs ${marsPos.sign === 'Aries' || marsPos.sign === 'Leo' || marsPos.sign === 'Sagittarius' ? 'hot and fast — you need intense exercise but also real rest' : marsPos.sign === 'Taurus' || marsPos.sign === 'Virgo' || marsPos.sign === 'Capricorn' ? 'steady and grounded — consistency beats intensity' : 'in bursts — listen to your body about when to push and when to stop'}.`);
  if (h6.planets.includes('Neptune')) advice.push('Neptune in the 6th can make health symptoms confusing — get clear medical advice instead of guessing.');
  if (h6.planets.includes('Saturn')) advice.push('Saturn in the 6th demands a disciplined health routine — the boring basics (sleep, water, vegetables) matter most.');
  if (advice.length === 0) advice.push('Build one small daily habit this year — the compound effect matters more than dramatic overhauls.');

  const headline = t === 'supportive' ? 'Your Body Is Well-Supported'
    : t === 'challenging' ? 'Health Needs Conscious Attention'
    : t === 'transformative' ? 'Body and Habits Are Transforming'
    : 'Health Is Active and Worth Watching';

  const para = `Your body zone (1st house) ${h1.planets.length > 0 ? 'has ' + h1.planets.join(', ') : 'is quiet'}. ` +
    `Your health routines (6th house) ${h6.planets.length > 0 ? 'are activated by ' + h6.planets.join(', ') : 'run steadily'}. ` +
    `Mars in ${marsPos?.sign || '?'} shapes your physical energy and how you burn through it.`;

  return { id: 'health', title: 'Health & Vitality', emoji: '🌿', houses: [h1, h6], keyPlanets: hits, synthesis: { headline, paragraph: para, practicalAdvice: advice }, activityLevel: Math.round(activity), tone: t };
}

function buildSpiritual(analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart): DomainDeepDive {
  const h9 = buildHouseSnapshot(analysis, srChart, 9, 'Beliefs & Growth');
  const h12 = buildHouseSnapshot(analysis, srChart, 12, 'Inner Life & Rest');
  
  const hits: DomainPlanetHit[] = [];
  
  const nepPos = srChart.planets.Neptune;
  const nepHouse = analysis.houseOverlays?.find(o => o.planet === 'Neptune')?.srHouse;
  if (nepPos) hits.push({ planet: 'Neptune', sign: nepPos.sign, house: nepHouse || null, chart: 'SR', role: 'Your intuition and imagination', tone: 'transformative' });
  
  const nnPos = srChart.planets.NorthNode;
  const nnHouse = analysis.houseOverlays?.find(o => o.planet === 'NorthNode')?.srHouse;
  if (nnPos) hits.push({ planet: 'North Node', sign: nnPos.sign, house: nnHouse || null, chart: 'SR', role: 'Your growth direction', tone: 'supportive' });

  for (const h of [h9, h12]) {
    for (const p of h.planets) {
      if (!hits.find(x => x.planet === p)) {
        const pos = srChart.planets[p as keyof typeof srChart.planets];
        hits.push({ planet: p, sign: pos?.sign || '', house: h.houseNumber, chart: 'SR', role: `In your ${HOUSE_LABELS[h.houseNumber]} zone`, tone: PLANET_TONE[p] || 'neutral' });
      }
    }
  }

  const t = overallTone(hits);
  const activity = Math.min(10, h9.planets.length * 2.5 + h12.planets.length * 2.5 + (nepHouse === 9 || nepHouse === 12 ? 2 : 0));

  const advice: string[] = [];
  if (nnPos) advice.push(`Your North Node in ${nnPos.sign} points toward growth through ${nnPos.sign === 'Aries' || nnPos.sign === 'Leo' ? 'trusting yourself and taking the lead' : nnPos.sign === 'Taurus' || nnPos.sign === 'Virgo' || nnPos.sign === 'Capricorn' ? 'building something real and tangible' : nnPos.sign === 'Gemini' || nnPos.sign === 'Libra' || nnPos.sign === 'Aquarius' ? 'connecting with others and sharing ideas' : 'going inward and trusting your feelings'}.`);
  if (h12.planets.length >= 2) advice.push('Multiple planets in the 12th suggest you need more alone time than usual — rest is productive this year.');
  if (h9.planets.includes('Jupiter')) advice.push('Jupiter in the 9th is excellent for travel, education, and expanding your worldview.');
  if (advice.length === 0) advice.push('Set aside 10 minutes daily for stillness — meditation, journaling, or simply sitting with no input.');

  const headline = t === 'supportive' ? 'Inner Growth Feels Natural'
    : t === 'challenging' ? 'The Inner Work Is Demanding This Year'
    : t === 'transformative' ? 'Deep Spiritual Shifts Underway'
    : 'A Year of Quiet Expansion';

  const para = `Your beliefs zone (9th house) ${h9.planets.length > 0 ? 'has ' + h9.planets.join(', ') + ' — your worldview is actively evolving' : 'is quiet'}. ` +
    `Your inner life (12th house) ${h12.planets.length > 0 ? 'is activated by ' + h12.planets.join(', ') + ' — solitude and reflection are important' : 'runs in the background'}. ` +
    `Neptune in ${nepPos?.sign || '?'} colors how you connect to meaning beyond the everyday.`;

  return { id: 'spiritual', title: 'Spiritual Growth & Inner Life', emoji: '🔮', houses: [h9, h12], keyPlanets: hits, synthesis: { headline, paragraph: para, practicalAdvice: advice }, activityLevel: Math.round(activity), tone: t };
}

// ─── Main Export ─────────────────────────────────────────────────────
export function generateDomainDeepDives(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
): DomainDeepDive[] {
  return [
    buildAbundance(analysis, natalChart, srChart),
    buildLove(analysis, natalChart, srChart),
    buildCareer(analysis, natalChart, srChart),
    buildHome(analysis, natalChart, srChart),
    buildHealth(analysis, natalChart, srChart),
    buildSpiritual(analysis, natalChart, srChart),
  ];
}
