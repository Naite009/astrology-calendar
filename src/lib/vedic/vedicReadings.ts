/**
 * Composes the Vedic reading sections.
 *
 * Every section returns two things:
 *  - logic: the technical proof lines for the "What the chart is showing" box,
 *    with Sanskrit terms visible.
 *  - paragraph: one integrated felt-sense paragraph, no jargon, no em dashes.
 *
 * Classical verdicts are labelled as classical. Timing is given as windows,
 * never as a promise about the future.
 */

import { VedicChart, VedicBody, houseLord, bodiesInHouse, formatDegree } from './siderealChart';
import { buildVarga, VargaChart, isVargottama, VARGA_LABELS } from './divisionalCharts';
import { computeKarakas, findKaraka, KARAKA_MEANING, KarakaAssignment } from './karakas';
import { buildVimshottari, findCurrentDasha, formatDashaRange, DashaPeriod, CurrentDasha } from './vimshottariDasha';
import { dashaCopy } from './interpretations/dashaCopy';
import { nakshatraCopy } from './interpretations/nakshatraCopy';
import { HOUSE_THEME, PLANET_ROLE, houseTheme, signStyle } from './interpretations/planetCopy';
import { dignityGloss } from './vedicDignity';
import { VedicPlanet } from './nakshatras';

export interface VedicSectionData {
  id: string;
  title: string;
  subtitle: string;
  logic: string[];
  paragraph: string;
  /** Optional extra rows rendered as a small table */
  rows?: { label: string; value: string }[];
}

export interface VedicReading {
  chart: VedicChart;
  vargas: Record<'D2' | 'D7' | 'D9' | 'D10' | 'D12', VargaChart>;
  karakas: KarakaAssignment[];
  dashas: DashaPeriod[];
  current: CurrentDasha | null;
  sections: VedicSectionData[];
}

const bodyLine = (b: VedicBody): string =>
  `${b.name} ${formatDegree(b.degree)} ${b.sign}${b.house ? `, house ${b.house}` : ''} (${b.nakshatra.name} pada ${b.nakshatra.pada})${b.dignity !== 'neutral' ? `, ${b.dignity}` : ''}`;

const has = (b?: VedicBody): b is VedicBody => !!b;

export function buildVedicReading(chart: VedicChart, today: Date = new Date()): VedicReading {
  const vargas = {
    D2: buildVarga(chart, 'D2'),
    D7: buildVarga(chart, 'D7'),
    D9: buildVarga(chart, 'D9'),
    D10: buildVarga(chart, 'D10'),
    D12: buildVarga(chart, 'D12'),
  };

  const karakas = computeKarakas(chart);
  const moon = chart.byName.Moon;
  const dashas = moon ? buildVimshottari(moon.longitude, chart.birthMoment) : [];
  const current = dashas.length ? findCurrentDasha(dashas, today) : null;

  const sections: VedicSectionData[] = [
    snapshotSection(chart),
    dashaSection(chart, current),
    pastLifeSection(chart, vargas.D12),
    purposeSection(chart, vargas.D9, karakas),
    wealthSection(chart, vargas.D2),
    careerSection(chart, vargas.D10, karakas),
    partnerSection(chart, vargas.D9, karakas, dashas),
    obstacleSection(chart),
    comparisonSection(chart),
  ].filter((s): s is VedicSectionData => !!s);

  return { chart, vargas, karakas, dashas, current, sections };
}

/* 1. Snapshot ------------------------------------------------------------- */

function snapshotSection(chart: VedicChart): VedicSectionData {
  const sun = chart.byName.Sun;
  const moon = chart.byName.Moon;
  const logic: string[] = [];

  if (chart.lagnaSign && chart.lagnaDegree !== null) {
    logic.push(`Lagna (rising): ${formatDegree(chart.lagnaDegree)} ${chart.lagnaSign}, lord ${chart.lagnaLord}`);
    if (chart.lagnaNakshatra) logic.push(`Lagna nakshatra: ${chart.lagnaNakshatra.name} pada ${chart.lagnaNakshatra.pada}`);
  } else {
    logic.push('Lagna: needs an accurate birth time. Sign-level material below still holds.');
  }
  if (has(sun)) logic.push(bodyLine(sun));
  if (has(moon)) logic.push(bodyLine(moon));
  logic.push(`Ayanamsa: Lahiri, ${formatDegree(chart.ayanamsa)}. Houses: whole sign.`);

  const nk = moon ? nakshatraCopy(moon.nakshatra.name) : null;
  const parts: string[] = [];

  if (has(moon) && nk) {
    parts.push(`Your Moon sits in ${moon.nakshatra.name}, which is the piece of this system that tends to land first: ${nk.essence}.`);
    parts.push(`The usable side of it is ${nk.gift}. The cost is that ${nk.friction}.`);
  }
  if (has(sun)) {
    parts.push(`Sidereally your Sun is in ${sun.sign}, so the way you hold authority reads as this: ${signStyle(sun.sign)}.`);
  }
  if (chart.lagnaSign) {
    parts.push(`With ${chart.lagnaSign} rising, people meet ${signStyle(chart.lagnaSign)} before they meet anything else about you, and ${chart.lagnaLord} is the planet whose condition sets the tone for your whole chart.`);
  }
  parts.push('If these signs look one back from the chart you already know, that is expected. This system measures from the fixed stars rather than the equinox, and the gap between the two is currently about twenty four degrees.');

  return {
    id: 'snapshot',
    title: 'Your Vedic Snapshot',
    subtitle: 'Sidereal placements, nakshatra and pada',
    logic,
    paragraph: parts.join(' '),
    rows: chart.bodies.map(b => ({
      label: b.name,
      value: `${formatDegree(b.degree)} ${b.sign}${b.house ? ` · house ${b.house}` : ''} · ${b.nakshatra.name} pada ${b.nakshatra.pada}${b.dignity !== 'neutral' ? ` · ${b.dignity}` : ''}`,
    })),
  };
}

/* 2. Dasha ---------------------------------------------------------------- */

function dashaSection(chart: VedicChart, current: CurrentDasha | null): VedicSectionData {
  const logic: string[] = [];
  const parts: string[] = [];

  if (!current) {
    logic.push('Vimshottari dasha needs the Moon position to seed. Add the Moon to this chart to unlock the timeline.');
    parts.push('Once the Moon is on this chart, the timeline will show which planetary chapter you are inside and when it hands over.');
  } else {
    const m = dashaCopy(current.maha.lord);
    logic.push(`Mahadasha: ${current.maha.lord}, ${formatDashaRange(current.maha)} (${current.maha.years} years)`);
    if (current.antar) logic.push(`Antardasha: ${current.antar.subLord} within ${current.maha.lord}, ${formatDashaRange(current.antar)}`);
    logic.push(`Progress through the mahadasha: ${Math.round(current.progress * 100)}%`);
    const seat = chart.byName[current.maha.lord];
    if (has(seat)) logic.push(`Dasha lord in the birth chart: ${bodyLine(seat)}`);

    parts.push(`You are living inside the ${current.maha.lord} chapter, ${m.title}, running ${formatDashaRange(current.maha)}.`);
    parts.push(`What this stretch asks is ${m.asks}, and what it tends to hand back is ${m.gives}.`);
    if (has(seat) && seat.house) {
      parts.push(`Because your ${current.maha.lord} sits in house ${seat.house}, the pressure and the payoff both show up around ${HOUSE_THEME[seat.house]}.`);
    }
    if (current.antar) {
      const a = dashaCopy(current.antar.subLord!);
      parts.push(`Inside it, the ${current.antar.subLord} sub-period through ${formatDashaRange(current.antar).split(' to ')[1]} narrows the focus to ${a.asks}.`);
    }
    parts.push(`The trap to watch is ${m.trap}. That is a tendency, not a verdict, and noticing it early is most of the work.`);
  }

  return {
    id: 'dasha',
    title: 'Your Life Timeline',
    subtitle: 'Vimshottari dasha, the chapter you are inside now',
    logic,
    paragraph: parts.join(' '),
  };
}

/* 3. Past life / why you came in ----------------------------------------- */

function pastLifeSection(chart: VedicChart, d12: VargaChart): VedicSectionData {
  const ketu = chart.byName.Ketu;
  const rahu = chart.byName.Rahu;
  const logic: string[] = [];
  const parts: string[] = [];

  if (has(ketu)) {
    logic.push(`Ketu: ${bodyLine(ketu)}`);
    const k12 = d12.byName.Ketu;
    if (k12) logic.push(`Ketu in ${VARGA_LABELS.D12.name}: ${k12.sign}${k12.house ? `, house ${k12.house}` : ''}`);
  }
  if (has(rahu)) logic.push(`Rahu: ${bodyLine(rahu)}`);
  logic.push(`${VARGA_LABELS.D12.name} reads ${VARGA_LABELS.D12.reads}. Traditional claim, offered as inherited pattern rather than proven history.`);

  if (has(ketu)) {
    const nk = nakshatraCopy(ketu.nakshatra.name);
    parts.push(`Ketu marks the ground you arrived already fluent in. Yours sits in ${ketu.sign}${ketu.house ? ` in house ${ketu.house}` : ''}, which means ${houseTheme(ketu.house)} is the area where you are competent almost without trying, and also the area you quietly discount because it came easy.`);
    parts.push(`In ${ketu.nakshatra.name} that fluency looks like this: ${nk.gift}. The part that no longer serves you is ${nk.friction}.`);
  }
  if (has(rahu)) {
    parts.push(`Rahu sits opposite in ${rahu.sign}${rahu.house ? ` in house ${rahu.house}` : ''}, and that is the unfamiliar direction. ${rahu.house ? `You are here to get clumsy in public around ${HOUSE_THEME[rahu.house]}` : 'You are here to get clumsy in public in territory you have no track record in'}, which is why progress there feels like beginner work no matter how accomplished you are elsewhere.`);
  }
  parts.push('Traditional texts read this axis as unfinished business carried forward. Whether or not you take that literally, the practical version is the same: the thing you keep retreating into is not where the growth is.');

  return {
    id: 'past-life',
    title: 'Why You Came In',
    subtitle: 'Ketu, Rahu and the Dwadashamsha (D12)',
    logic,
    paragraph: parts.join(' '),
  };
}

/* 4. Purpose, gifts and talents ------------------------------------------ */

function purposeSection(chart: VedicChart, d9: VargaChart, karakas: KarakaAssignment[]): VedicSectionData {
  const ak = findKaraka(karakas, 'Atmakaraka');
  const logic: string[] = [];
  const parts: string[] = [];

  if (ak) {
    const body = chart.byName[ak.planet];
    logic.push(`Atmakaraka: ${ak.planet} at ${formatDegree(ak.degree)} ${ak.sign}${ak.house ? `, house ${ak.house}` : ''} (highest degree in the chart)`);
    logic.push(`Atmakaraka is ${KARAKA_MEANING.Atmakaraka}`);
    const ak9 = d9.byName[ak.planet];
    if (ak9) logic.push(`Atmakaraka in ${VARGA_LABELS.D9.name}: ${ak9.sign}${ak9.house ? `, house ${ak9.house}` : ''}${ak9.dignity !== 'neutral' ? `, ${ak9.dignity}` : ''}`);
    if (isVargottama(chart, d9, ak.planet)) logic.push(`${ak.planet} is vargottama, the same sign in the birth chart and the Navamsa. Classically the strongest mark of durability.`);
    if (has(body)) logic.push(`Nakshatra: ${body.nakshatra.name} pada ${body.nakshatra.pada}`);

    parts.push(`Your Atmakaraka is ${ak.planet}, the planet that travelled furthest into its sign, and in this system that makes it the loudest voice in your life. It governs ${PLANET_ROLE[ak.planet]}, so that is the theme your life keeps handing back to you until you deal with it directly.`);
    if (ak.house) {
      parts.push(`Sitting in house ${ak.house}, it works itself out through ${HOUSE_THEME[ak.house]}, and it does that in a ${ak.sign} way, meaning ${signStyle(ak.sign)}.`);
    }
    const ak9 = d9.byName[ak.planet];
    if (ak9) {
      const gloss = dignityGloss(ak9.dignity);
      parts.push(`The Navamsa is the pressure test, the chart that says whether something holds up over time rather than just showing up early. There your ${ak.planet} lands in ${ak9.sign} and ${gloss}, which tells you ${ak9.dignity === 'debilitated' ? 'this gift matures late and gets stronger specifically through the years you thought you were failing at it' : ak9.dignity === 'exalted' || ak9.dignity === 'own sign' ? 'this is the ability that keeps working when everything else about your life changes' : 'this ability develops steadily rather than dramatically, and it rewards repetition more than inspiration'}.`);
    }
    if (isVargottama(chart, d9, ak.planet)) {
      parts.push('It also repeats the same sign in both charts, which classical texts treat as unusually stable. In plain terms, this is the part of you that does not shift depending on who is in the room.');
    }
    if (has(body)) {
      const nk = nakshatraCopy(body.nakshatra.name);
      parts.push(`The specific talent, read through ${body.nakshatra.name}, is ${nk.gift}. Use that as the thing you offer, and treat ${nk.friction} as the maintenance cost rather than a character flaw.`);
    }
  } else {
    logic.push('Atmakaraka needs the seven grahas plus Rahu on the chart.');
    parts.push('Fill in the remaining planets on this chart and the soul indicator will resolve.');
  }

  return {
    id: 'purpose',
    title: 'Purpose, Gifts and Talents',
    subtitle: 'Atmakaraka and the Navamsa (D9)',
    logic,
    paragraph: parts.join(' '),
  };
}

/* 5. Money and wealth ---------------------------------------------------- */

function wealthSection(chart: VedicChart, d2: VargaChart): VedicSectionData {
  const logic: string[] = [];
  const parts: string[] = [];

  const dhana = [2, 11, 9] as const;
  const lords: { house: number; sign: string; lord: VedicPlanet; body?: VedicBody }[] = [];
  for (const h of dhana) {
    const hl = houseLord(chart, h);
    if (hl) {
      const body = chart.byName[hl.lord];
      lords.push({ house: h, sign: hl.sign, lord: hl.lord, body });
      logic.push(`House ${h} lord: ${hl.lord} (${hl.sign})${body?.house ? `, sitting in house ${body.house}` : ''}${body && body.dignity !== 'neutral' ? `, ${body.dignity}` : ''}`);
    }
  }
  const occupants = [...bodiesInHouse(chart, 2), ...bodiesInHouse(chart, 11)];
  if (occupants.length) logic.push(`In the wealth houses: ${occupants.map(b => `${b.name} (house ${b.house})`).join(', ')}`);
  const jup2 = d2.byName.Jupiter;
  const ven2 = d2.byName.Venus;
  if (jup2) logic.push(`Jupiter in ${VARGA_LABELS.D2.name}: ${jup2.sign}`);
  if (ven2) logic.push(`Venus in ${VARGA_LABELS.D2.name}: ${ven2.sign}`);
  logic.push('Houses 2, 11 and 9 are the classical dhana (wealth) houses. Verdicts below are labelled as classical readings, not predictions.');

  const second = lords.find(l => l.house === 2);
  const eleventh = lords.find(l => l.house === 11);

  if (second?.body) {
    parts.push(`Money you earn and hold runs through ${second.lord}, and it sits in house ${second.body.house ?? 2}, so income tends to arrive through ${houseTheme(second.body.house)} rather than through the route you were told to take.`);
  } else if (second) {
    parts.push(`Money you earn and hold runs through ${second.lord} in ${second.sign}, so the way you handle earning looks like this: ${signStyle(second.sign)}.`);
  }
  if (eleventh?.body) {
    parts.push(`Gains, bonuses and the money that shows up through other people run through ${eleventh.lord} in house ${eleventh.body.house ?? 11}, which means networks and groups connected to ${houseTheme(eleventh.body.house)} are where the increase actually comes from.`);
  }
  const strained = lords.find(l => l.body?.dignity === 'debilitated');
  if (strained) {
    parts.push(`One honest note: your house ${strained.house} lord ${strained.lord} is in ${strained.sign}, which classical texts read as weakened. In lived terms that usually means money comes later and by effort rather than early and by luck, and the drain is ${strained.house === 2 ? 'spending that quietly matches whatever you earn' : 'saying yes to people whose plans cost you more than they return'}.`);
  } else {
    parts.push('None of your wealth-house rulers are in classically weakened signs, which reads as steady rather than dramatic. The money question for you is less about capacity and more about consistency.');
  }
  parts.push('The practical move: pick the one income stream that matches the house above and give it two quarters of undivided attention before adding anything new. This system describes tendency and timing windows. It does not tell you a number, and any reading that promises you wealth by a date is selling something.');

  return {
    id: 'wealth',
    title: 'Money and Wealth',
    subtitle: 'Dhana houses and the Hora chart (D2)',
    logic,
    paragraph: parts.join(' '),
  };
}

/* 6. Career -------------------------------------------------------------- */

function careerSection(chart: VedicChart, d10: VargaChart, karakas: KarakaAssignment[]): VedicSectionData {
  const logic: string[] = [];
  const parts: string[] = [];

  const tenth = houseLord(chart, 10);
  const amk = findKaraka(karakas, 'Amatyakaraka');
  const tenthLordBody = tenth ? chart.byName[tenth.lord] : undefined;
  const tenthOccupants = bodiesInHouse(chart, 10);

  if (tenth) logic.push(`House 10 lord: ${tenth.lord} (${tenth.sign})${tenthLordBody?.house ? `, sitting in house ${tenthLordBody.house}` : ''}`);
  if (tenthOccupants.length) logic.push(`In house 10: ${tenthOccupants.map(b => b.name).join(', ')}`);
  if (amk) logic.push(`Amatyakaraka (career indicator): ${amk.planet} at ${formatDegree(amk.degree)} ${amk.sign}${amk.house ? `, house ${amk.house}` : ''}`);
  const amk10 = amk ? d10.byName[amk.planet] : undefined;
  if (amk10) logic.push(`Amatyakaraka in ${VARGA_LABELS.D10.name}: ${amk10.sign}${amk10.house ? `, house ${amk10.house}` : ''}`);
  if (d10.lagnaSign) logic.push(`${VARGA_LABELS.D10.name} lagna: ${d10.lagnaSign}`);

  if (amk) {
    parts.push(`Your career indicator is ${amk.planet}, which means the work that fits you is work that uses ${PLANET_ROLE[amk.planet]}.`);
  }
  if (tenthLordBody?.house) {
    parts.push(`Your tenth house lord ${tenth!.lord} sits in house ${tenthLordBody.house}, so your reputation gets built through ${houseTheme(tenthLordBody.house)}, which is usually not the job title you would have picked on paper.`);
  } else if (tenth) {
    parts.push(`Your tenth house is ruled by ${tenth.lord} in ${tenth.sign}, so the way you work is this: ${signStyle(tenth.sign)}.`);
  }
  if (amk10) {
    parts.push(`The Dashamsha is the career-only chart, and there your ${amk.planet} lands in ${amk10.sign}${amk10.house ? ` in house ${amk10.house}` : ''}, which points at an environment that ${signStyle(amk10.sign)}. Put plainly, you do well where ${amk10.dignity === 'debilitated' ? 'you are given time to get good rather than judged in the first year' : 'your specific method is the reason they hired you'}.`);
  }
  if (tenthOccupants.length) {
    parts.push(`With ${tenthOccupants.map(b => b.name).join(' and ')} in the tenth, your work is visible whether or not you want it to be, and staying quietly competent in the background rarely works out for you.`);
  }
  parts.push('The mismatch that burns you out is taking a role that pays well while using none of the above. When you notice the tiredness that sleep does not fix, that is usually the signal, not a work-ethic problem.');

  return {
    id: 'career',
    title: 'Career and Work',
    subtitle: 'Tenth house, Amatyakaraka and the Dashamsha (D10)',
    logic,
    paragraph: parts.join(' '),
  };
}

/* 7. Partner and marriage ------------------------------------------------ */

function partnerSection(chart: VedicChart, d9: VargaChart, karakas: KarakaAssignment[], dashas: DashaPeriod[]): VedicSectionData {
  const logic: string[] = [];
  const parts: string[] = [];

  const dk = findKaraka(karakas, 'Darakaraka');
  const seventh = houseLord(chart, 7);
  const seventhLordBody = seventh ? chart.byName[seventh.lord] : undefined;
  const occupants = bodiesInHouse(chart, 7);
  const venus = chart.byName.Venus;

  if (dk) logic.push(`Darakaraka (partner indicator): ${dk.planet} at ${formatDegree(dk.degree)} ${dk.sign}${dk.house ? `, house ${dk.house}` : ''} (lowest degree in the chart)`);
  if (seventh) logic.push(`House 7 lord: ${seventh.lord} (${seventh.sign})${seventhLordBody?.house ? `, sitting in house ${seventhLordBody.house}` : ''}`);
  if (seventhLordBody) logic.push(`House 7 lord nakshatra: ${seventhLordBody.nakshatra.name} pada ${seventhLordBody.nakshatra.pada}`);
  if (occupants.length) logic.push(`In house 7: ${occupants.map(b => b.name).join(', ')}`);
  if (has(venus)) logic.push(`Venus: ${bodyLine(venus)}`);
  const dk9 = dk ? d9.byName[dk.planet] : undefined;
  if (dk9) logic.push(`Darakaraka in ${VARGA_LABELS.D9.name}: ${dk9.sign}${dk9.house ? `, house ${dk9.house}` : ''}`);

  if (dk) {
    parts.push(`Your partner indicator is ${dk.planet} in ${dk.sign}, so the person tends to arrive carrying ${PLANET_ROLE[dk.planet]} into your life. In behavior that reads as someone who ${signStyle(dk.sign).replace(/^you /, '')}, and what they avoid is the opposite move: sitting in ambiguity without acting on it.`);
  }
  if (seventhLordBody?.house) {
    parts.push(`Where and how you meet is read from the seventh lord, and yours sits in house ${seventhLordBody.house}. That points to meetings connected to ${houseTheme(seventhLordBody.house)} rather than to a scene you would go out looking in.`);
  }
  if (occupants.length) {
    parts.push(`With ${occupants.map(b => b.name).join(' and ')} sitting in the seventh, partnership is a main arena of your life rather than a side plot, and you tend to become noticeably different inside a relationship than outside one.`);
  }
  if (dk9) {
    parts.push(`The Navamsa is the marriage chart in this tradition, and there your ${dk.planet} is in ${dk9.sign}, which suggests the relationship that lasts is one that ${dk9.dignity === 'debilitated' ? 'starts unglamorously and gets better as both people stop performing' : 'holds together through shared practical commitment rather than intensity'}.`);
  }
  const partnerWindows = dashas
    .filter(p => (dk && p.lord === dk.planet) || (seventh && p.lord === seventh.lord) || p.lord === 'Venus')
    .filter(p => p.end.getFullYear() >= new Date().getFullYear())
    .slice(0, 3);
  if (partnerWindows.length) {
    logic.push(`Partnership-flavored dasha windows: ${partnerWindows.map(p => `${p.lord} ${formatDashaRange(p)}`).join('; ')}`);
    parts.push(`The windows when partnership themes get loud are the periods of ${partnerWindows.map(p => `${p.lord} (${formatDashaRange(p)})`).join(', ')}. Those are windows for the theme to activate, not appointments, and plenty happens between them.`);
  }
  parts.push('Classical texts are blunt about marriage timing. This app is not, on purpose, because a date you can be measured against turns a useful description into a countdown.');

  return {
    id: 'partner',
    title: 'Partner and Marriage',
    subtitle: 'Darakaraka, seventh house and the Navamsa (D9)',
    logic,
    paragraph: parts.join(' '),
  };
}

/* 8. Obstacles ----------------------------------------------------------- */

function obstacleSection(chart: VedicChart): VedicSectionData {
  const logic: string[] = [];
  const parts: string[] = [];

  const saturn = chart.byName.Saturn;
  const rahu = chart.byName.Rahu;
  const lagnaLordBody = chart.lagnaLord ? chart.byName[chart.lagnaLord] : undefined;

  if (has(saturn)) logic.push(`Saturn: ${bodyLine(saturn)}`);
  if (has(rahu)) logic.push(`Rahu: ${bodyLine(rahu)}`);
  if (has(lagnaLordBody)) logic.push(`Lagna lord ${chart.lagnaLord}: ${bodyLine(lagnaLordBody)}`);
  const sixth = bodiesInHouse(chart, 6);
  if (sixth.length) logic.push(`In house 6 (friction, work, health): ${sixth.map(b => b.name).join(', ')}`);

  if (has(saturn)) {
    parts.push(`Saturn shows where life makes you earn it, and yours is in ${saturn.sign}${saturn.house ? ` in house ${saturn.house}` : ''}. The recurring block shows up around ${houseTheme(saturn.house)}, and it is slow rather than dramatic: things there take longer for you than they seem to for other people.`);
    parts.push(`The counter-move is specific. Pick the smallest repeatable version of that work and do it on a schedule you would be embarrassed to call ambitious. Saturn responds to repetition and does not respond at all to intensity.`);
  }
  if (has(rahu) && rahu.house) {
    parts.push(`Rahu in house ${rahu.house} is the other kind of obstacle, the one that comes from wanting fast. Around ${HOUSE_THEME[rahu.house]} you will be tempted to skip the boring middle, and that is exactly where the mess gets made.`);
  }
  if (has(lagnaLordBody) && lagnaLordBody.dignity === 'debilitated') {
    parts.push(`Your lagna lord ${chart.lagnaLord} is in a classically weakened sign, which traditionally reads as a body and confidence that need managing rather than pushing. The practical translation is that your energy is a resource with a budget, and spending it in advance is the pattern to break.`);
  }
  parts.push('No remedies to buy here, and no curse language. The obstacles in this reading are patterns you can see coming, which is the only thing that makes them workable.');

  return {
    id: 'obstacles',
    title: 'Obstacles and How You Move Them',
    subtitle: 'Saturn, Rahu and the lagna lord',
    logic,
    paragraph: parts.join(' '),
  };
}

/* 9. Vedic vs Western ---------------------------------------------------- */

function comparisonSection(chart: VedicChart): VedicSectionData {
  const shifted = chart.bodies.filter(b => b.sign !== b.tropicalSign);
  const held = chart.bodies.filter(b => b.sign === b.tropicalSign);

  const logic: string[] = [
    `Ayanamsa applied: Lahiri, ${formatDegree(chart.ayanamsa)}`,
    `Signs that shift: ${shifted.length ? shifted.map(b => `${b.name} ${b.tropicalSign} to ${b.sign}`).join(', ') : 'none'}`,
    `Signs that hold: ${held.length ? held.map(b => b.name).join(', ') : 'none'}`,
    'Western houses stay Placidus elsewhere in the app. This tab uses whole-sign houses, which is correct for Jyotish.',
  ];

  const parts: string[] = [];
  parts.push(`Two systems, one sky. The placements themselves did not move, only the measuring stick did, so nothing you already know about your Western chart becomes wrong here.`);
  if (shifted.length) {
    parts.push(`For you, ${shifted.map(b => b.name).join(', ')} change sign in this system, and ${held.length ? `${held.map(b => b.name).join(', ')} stay put` : 'nothing stays put'}. The ones that shifted are worth reading twice, because the two descriptions usually cover different parts of the same behavior rather than contradicting each other.`);
  } else {
    parts.push('Unusually, everything on your chart lands in the same sign in both systems, which means the two readings will sound like each other.');
  }
  parts.push('Use the Western chart for psychology and timing of transits, and use this tab for life chapters, purpose and the practical questions about money, work and partnership. They are answering different questions.');

  return {
    id: 'comparison',
    title: 'Vedic and Western Side by Side',
    subtitle: 'What changed, what held',
    logic,
    paragraph: parts.join(' '),
  };
}
