/**
 * Composes the Vedic reading sections.
 *
 * Writing engine rules (do not relax these):
 *  1. Interpret the astrology. Never invent a biography, an event, a symptom,
 *     a job, a relationship or a financial circumstance.
 *  2. Every technical term is defined in plain English the moment it is used.
 *  3. Follow the chain: astrological fact, meaning, how it may show up, how it
 *     connects with the rest of the chart.
 *  4. Each section ends with a short "What this means in real life" synthesis.
 *  5. No em dashes.
 *
 * Sophisticated technique underneath (chart ruler, house lords, dispositors,
 * dignity, nakshatras, karakas, dasha, divisional charts), plain output on top.
 */

import { VedicChart, VedicBody, houseLord, bodiesInHouse, formatDegree } from './siderealChart';
import { buildVarga, VargaChart, isVargottama, VARGA_LABELS, VARGA_NOTE } from './divisionalCharts';
import { computeKarakas, findKaraka, KARAKA_MEANING, KarakaAssignment } from './karakas';
import { buildVimshottari, findCurrentDasha, formatDashaRange, formatDashaDateExact, formatYears, DashaPeriod, CurrentDasha } from './vimshottariDasha';
import { nakshatraCopy } from './interpretations/nakshatraCopy';
import {
  PLANET_PLAIN, PLANET_MOTIVE, housePlain, signTendency, dignityPlain,
  DASHA_EMPHASIS, moneyPattern, KARAKA_PLAIN, DASHA_DEFINITION,
} from './interpretations/plainMeaning';
import { SIGN_LORDS, dignityDefinition, exaltationSign } from './vedicDignity';
import { VedicPlanet } from './nakshatras';

export interface VedicSectionData {
  id: string;
  title: string;
  subtitle: string;
  logic: string[];
  /** Human interpretation, one entry per rendered paragraph. */
  paragraphs: string[];
  /** Legacy single-string form, kept for exports. */
  paragraph: string;
  /** Short "What this means in real life" synthesis. */
  takeaway?: string;
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

const list = (items: string[]): string =>
  items.length <= 1 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/** Houses a planet rules, counted from the lagna. */
function rulership(chart: VedicChart, planet: VedicPlanet): number[] {
  if (!chart.lagnaSign) return [];
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const lagnaIdx = signs.indexOf(chart.lagnaSign);
  return Object.entries(SIGN_LORDS)
    .filter(([, lord]) => lord === planet)
    .map(([sign]) => ((signs.indexOf(sign) - lagnaIdx + 12) % 12) + 1)
    .sort((a, b) => a - b);
}

function rulershipPhrase(chart: VedicChart, planet: VedicPlanet): string | null {
  const houses = rulership(chart, planet);
  if (!houses.length) return null;
  return `${planet} also rules ${list(houses.map(h => `house ${h}, which covers ${housePlain(h)}`))}`;
}

/** The sign lord of the sign a planet sits in, which classical texts call its dispositor. */
function dispositor(body: VedicBody): VedicPlanet | null {
  const lord = SIGN_LORDS[body.sign];
  return lord && lord !== body.name ? lord : null;
}

function section(
  id: string, title: string, subtitle: string,
  logic: string[], paragraphs: string[], takeaway?: string,
  rows?: { label: string; value: string }[],
): VedicSectionData {
  const clean = paragraphs.filter(Boolean);
  return { id, title, subtitle, logic, paragraphs: clean, paragraph: clean.join(' '), takeaway, rows };
}

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
    bigPictureSection(chart, vargas, karakas, current),
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
    logic.push(`Lagna (rising sign): ${formatDegree(chart.lagnaDegree)} ${chart.lagnaSign}, ruled by ${chart.lagnaLord}`);
    if (chart.lagnaNakshatra) logic.push(`Lagna nakshatra: ${chart.lagnaNakshatra.name} pada ${chart.lagnaNakshatra.pada}`);
  } else {
    logic.push('Lagna: needs an accurate birth time. Sign-level material below still holds.');
  }
  if (has(sun)) logic.push(bodyLine(sun));
  if (has(moon)) logic.push(bodyLine(moon));
  logic.push(`Ayanamsa: Lahiri, ${formatDegree(chart.ayanamsa)}. Houses: whole sign.`);

  const paras: string[] = [];

  if (chart.lagnaSign) {
    paras.push(
      `Your lagna, the sign rising in the east at the moment you were born, is ${chart.lagnaSign}. In Vedic astrology the lagna is more than a rising sign: it sets the whole house structure, so the quality people meet first and the way you enter new situations comes from here. You tend to approach new situations ${signTendency(chart.lagnaSign)}. ` +
      `The ruler of ${chart.lagnaSign} is ${chart.lagnaLord}, and the condition of that one planet colors everything else, because it stands for you.`
    );
  } else {
    paras.push(
      'Your lagna is the sign rising in the east at birth, and it sets the whole house structure. An accurate birth time is needed to pin it down, so the sign-level material below still holds even though the house picture is not fixed.'
    );
  }
  if (has(moon)) {
    const nk = nakshatraCopy(moon.nakshatra.name);
    paras.push(
      `${PLANET_PLAIN.Moon}. Yours is in ${moon.sign}${moon.house ? `, in the house of ${housePlain(moon.house)}` : ''}, so emotionally you tend to operate ${signTendency(moon.sign)}. ` +
      (nk ? `Each sign is further divided into 27 lunar segments called nakshatras, a finer flavor inside the sign, and yours sits in ${moon.nakshatra.name}. That narrows the feeling further: ${nk.essence}.` : '')
    );
  }
  if (has(sun)) {
    const nkSun = nakshatraCopy(sun.nakshatra.name);
    const rp = rulershipPhrase(chart, 'Sun');
    const disp = dispositor(sun);
    const withSun = sun.house
      ? bodiesInHouse(chart, sun.house).filter(b => b.name !== 'Sun')
      : [];
    paras.push(
      `${PLANET_PLAIN.Sun}. In this system the Sun is never read as a personality label on its own, so the sign is only the first of several inputs. ` +
      `Yours is in ${sun.sign}${sun.house ? `, in the house of ${housePlain(sun.house)}` : ''}, and the house matters more than the sign here: it says the area of life where you are meant to be visible and to carry responsibility. ` +
      (rp ? `${rp}, so those departments answer to the same planet and tend to rise and fall together. ` : '') +
      (nkSun ? `Inside ${sun.sign} the Sun sits in the lunar segment ${sun.nakshatra.name} pada ${sun.nakshatra.pada}, which narrows the flavor to something specific: ${nkSun.essence}. ` : '') +
      (sun.dignity !== 'neutral' ? `By sign condition the Sun is ${sun.dignity}. ${dignityPlain('Sun', sun.sign, sun.dignity) || ''} ` : '') +
      (disp ? `${sun.sign} is ruled by ${disp}, so the Sun reports to ${disp} here, and how ${disp} is placed changes how easily your authority lands. ` : '') +
      (withSun.length ? `It shares that house with ${list(withSun.map(b => b.name))}, which blends those functions into how you show up. ` : '') +
      `Read together with your lagna, your Moon and the period you are currently in, that is the actual Vedic Sun. The sign by itself is not.`
    );
  }
  paras.push(
    'If these signs look one back from the chart you already know, that is expected. This system measures from the fixed stars rather than from the equinox, and the current gap between the two is about twenty four degrees. Neither chart is wrong, and a sign change here does not mean you stopped being your Western sign or that you should now recognize yourself in the new one instead. They are two lenses on the same sky, and each one is read with its own rules. The houses here are whole sign: the rising sign is the entire first house, the next sign the entire second, and so on.'
  );


  return section(
    'snapshot',
    'Your Vedic Snapshot',
    'Sidereal placements, nakshatra and pada',
    logic,
    paras,
    undefined,
    chart.bodies.map(b => ({
      label: b.name,
      value: `${formatDegree(b.degree)} ${b.sign}${b.house ? ` · house ${b.house}` : ''} · ${b.nakshatra.name} pada ${b.nakshatra.pada}${b.dignity !== 'neutral' ? ` · ${b.dignity}` : ''}`,
    })),
  );
}

/* 2. The Big Picture ------------------------------------------------------ */

function bigPictureSection(
  chart: VedicChart,
  vargas: Record<'D2' | 'D7' | 'D9' | 'D10' | 'D12', VargaChart>,
  karakas: KarakaAssignment[],
  current: CurrentDasha | null,
): VedicSectionData {
  const logic: string[] = [];
  const paras: string[] = [];

  const moon = chart.byName.Moon;
  const sun = chart.byName.Sun;
  const lagnaLordBody = chart.lagnaLord ? chart.byName[chart.lagnaLord] : undefined;
  const ak = findKaraka(karakas, 'Atmakaraka');
  const strong = chart.bodies.filter(b => b.dignity === 'exalted' || b.dignity === 'own sign');
  const weak = chart.bodies.filter(b => b.dignity === 'debilitated');

  // House concentration: where several bodies gather.
  const byHouse = new Map<number, VedicBody[]>();
  chart.bodies.forEach(b => {
    if (!b.house) return;
    byHouse.set(b.house, [...(byHouse.get(b.house) || []), b]);
  });
  const busiest = [...byHouse.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const cluster = busiest && busiest[1].length >= 2 ? busiest : null;

  if (chart.lagnaSign) logic.push(`Rising sign ${chart.lagnaSign}, ruler ${chart.lagnaLord}${lagnaLordBody?.house ? ` in house ${lagnaLordBody.house}` : ''}`);
  if (has(moon)) logic.push(`Moon in ${moon.sign}${moon.house ? `, house ${moon.house}` : ''}, ${moon.nakshatra.name}`);
  if (has(sun)) logic.push(`Sun in ${sun.sign}${sun.house ? `, house ${sun.house}` : ''}`);
  if (ak) logic.push(`Atmakaraka (highest degree planet): ${ak.planet}`);
  if (strong.length) logic.push(`Strong by sign: ${strong.map(b => `${b.name} ${b.dignity} in ${b.sign}`).join(', ')}`);
  if (weak.length) logic.push(`Working uphill by sign: ${weak.map(b => `${b.name} debilitated in ${b.sign}`).join(', ')}`);
  if (cluster) logic.push(`Concentration: ${cluster[1].map(b => b.name).join(', ')} in house ${cluster[0]}`);
  if (current) logic.push(`Current period: ${current.maha.lord} mahadasha${current.antar ? `, ${current.antar.subLord} antardasha` : ''}`);

  // Paragraph 1: dominant personality pattern, rising plus its ruler.
  if (chart.lagnaSign && lagnaLordBody) {
    const disp = dispositor(lagnaLordBody);
    paras.push(
      `The core pattern. With ${chart.lagnaSign} rising you meet life ${signTendency(chart.lagnaSign)}, and the planet that runs your chart is ${chart.lagnaLord}, since it rules ${chart.lagnaSign}. ` +
      `That planet sits in ${lagnaLordBody.sign}, in the area of ${housePlain(lagnaLordBody.house)}, which means your sense of yourself is worked out largely through that part of life rather than in the abstract. ` +
      (disp ? `Because ${lagnaLordBody.sign} is ruled by ${disp}, the condition of ${disp} feeds into this as well, which is why the chart keeps pointing back to a small number of planets rather than treating each one separately.` : '') +
      (cluster && cluster[1].some(b => b.name === chart.lagnaLord) ? ` It is not alone there, which intensifies that whole area.` : '')
    );
  } else if (chart.lagnaSign) {
    paras.push(`The core pattern. With ${chart.lagnaSign} rising you meet life ${signTendency(chart.lagnaSign)}, and the ruler of that sign, ${chart.lagnaLord}, sets the tone for the chart as a whole.`);
  }

  // Paragraph 2: emotional pattern, Moon plus nakshatra plus Sun interaction.
  if (has(moon)) {
    const nk = nakshatraCopy(moon.nakshatra.name);
    const sameHouseAsSun = has(sun) && sun.house && sun.house === moon.house;
    paras.push(
      `Emotionally. ${PLANET_PLAIN.Moon}, and yours works ${signTendency(moon.sign)}${moon.house ? `, focused on ${housePlain(moon.house)}` : ''}. ` +
      (nk ? `${moon.nakshatra.name} narrows that to something more specific: ${nk.essence}. The strength in it is ${nk.gift}, and the cost is that ${nk.friction}.` : '') +
      (sameHouseAsSun ? ` Your Sun sits in the same area, so who you are and what settles you are pulled toward the same part of life, which concentrates energy there but leaves less separation between confidence and mood.` : '')
    );
  }

  // Paragraph 3: gifts and tensions from dignity.
  if (strong.length || weak.length) {
    const strongText = strong.length
      ? `${list(strong.map(b => `${b.name} ${b.dignity === 'exalted' ? 'exalted' : 'in its own sign'} in ${b.sign}`))} ${strong.length > 1 ? 'are' : 'is'} classically read as well placed. ${list(strong.map(b => `${b.dignity === 'exalted' ? `${b.name} is exalted: ${dignityDefinition('exalted')}` : `${b.name} is in its own sign: ${dignityDefinition('own sign')} ${b.name}'s exaltation sign is ${exaltationSign(b.name)}, which is a separate condition and not what is happening here`}`))}. Practically, ${list(strong.map(b => PLANET_MOTIVE[b.name]))} may come more easily to you than to most people, and ${strong.length > 1 ? 'those tend to be the functions' : 'that tends to be the function'} other people rely on you for.`
      : '';
    const weakText = weak.length
      ? `At the same time ${list(weak.map(b => `${b.name} is debilitated in ${b.sign}`))}. Debilitated means placed in the sign where a planet operates least comfortably. It is not a defect. It usually shows up as a function that matures later, works in a personal and non-standard way, and becomes genuinely capable through experience rather than arriving ready-made. Since ${list(weak.map(b => PLANET_PLAIN[b.name]))}, that is where the learning curve sits.`
      : '';
    paras.push(`Gifts and the learning curve. ${strongText}${strongText && weakText ? ' ' : ''}${weakText}`);
  }

  // Paragraph 4: central tension and repeating lesson from AK plus dasha plus D9/D10 echoes.
  if (ak) {
    const akBody = chart.byName[ak.planet];
    const ak9 = vargas.D9.byName[ak.planet];
    const ak10 = vargas.D10.byName[ak.planet];
    const echoes: string[] = [];
    if (ak9 && akBody && ak9.sign === akBody.sign) echoes.push('the same sign repeats in the Navamsa, the divisional chart used to test whether something holds up over time');
    if (ak10 && akBody && ak10.sign === akBody.sign) echoes.push('it repeats again in the Dashamsha, the chart read for work and public role');
    if (current && current.maha.lord === ak.planet) echoes.push('and the long period you are currently in is ruled by that same planet');
    paras.push(
      `The repeating lesson. ${ak.planet} is your Atmakaraka, ${KARAKA_PLAIN.Atmakaraka} For you that means the recurring theme is ${PLANET_MOTIVE[ak.planet]}, worked out ${akBody ? `${signTendency(akBody.sign)}${akBody.house ? ` and mostly through ${housePlain(akBody.house)}` : ''}` : 'through that planet\u2019s themes'}. ` +
      (echoes.length ? `This is not a single signal: ${list(echoes)}. When a theme shows up in more than one technique, it matters more, not less.` : 'Watch how often it reappears in the sections below, because repetition across techniques is how importance is measured in this system.')
    );
  }

  // Paragraph 5: relationship and work pattern, plus current period.
  const seventh = houseLord(chart, 7);
  const tenth = houseLord(chart, 10);
  const rel = seventh ? chart.byName[seventh.lord] : undefined;
  const work = tenth ? chart.byName[tenth.lord] : undefined;
  const relWork: string[] = [];
  if (seventh && rel) {
    relWork.push(`In close relationships, the seventh house covers partnership, and its ruler ${seventh.lord} sits in the area of ${housePlain(rel.house)}, so partnership tends to be bound up with that part of your life rather than kept separate from it`);
  }
  if (tenth && work) {
    relWork.push(`in work, the tenth house covers career direction, and its ruler ${tenth.lord} sits in the area of ${housePlain(work.house)}, which points to the conditions you function best under rather than to a specific job`);
  }
  if (relWork.length) paras.push(`Relationships and work. ${list(relWork)}.`);

  const takeaway = current
    ? `You are a ${chart.lagnaSign || 'this'} rising person whose life keeps circling ${ak ? PLANET_MOTIVE[ak.planet] : 'one central theme'}, and you are currently inside a ${current.maha.lord} period, ${DASHA_EMPHASIS[current.maha.lord].label}. Read the sections below as the reasons behind that summary. Nothing here is a prediction. It is a description of tendency, and tendency responds to what you decide to do with it.`
    : 'Read the sections below as the reasoning behind this summary. Everything here describes tendency and possibility, not fixed outcomes.';

  return section(
    'big-picture',
    'The Big Picture',
    'Who this chart describes, before the detail',
    logic,
    paras,
    takeaway,
  );
}

/* 3. Dasha ---------------------------------------------------------------- */

function dashaSection(chart: VedicChart, current: CurrentDasha | null): VedicSectionData {
  const logic: string[] = [];
  const paras: string[] = [];
  let takeaway: string | undefined;

  if (!current) {
    logic.push('Vimshottari dasha needs the Moon position to seed. Add the Moon to this chart to unlock the timeline.');
    paras.push('Once the Moon is on this chart, the timeline will show which planetary period you are inside and when it hands over.');
  } else {
    const lord = current.maha.lord;
    const info = DASHA_EMPHASIS[lord];
    const seat = chart.byName[lord];
    logic.push(`Mahadasha (a long planetary chapter): ${lord}, ${formatDashaDateExact(current.maha.start)} to ${formatDashaDateExact(current.maha.end)} (${formatYears(current.maha.years)}${current.maha.isBirthBalance ? `, the balance of a ${current.maha.fullYears} year period remaining at birth` : ''})`);
    if (current.antar) logic.push(`Antardasha (the smaller chapter inside it): ${current.antar.subLord} within ${lord}, ${formatDashaDateExact(current.antar.start)} to ${formatDashaDateExact(current.antar.end)}`);
    logic.push(`Progress through the mahadasha: ${Math.round(current.progress * 100)}%`);
    if (has(seat)) logic.push(`${lord} in the birth chart: ${bodyLine(seat)}`);
    const ruled = rulership(chart, lord);
    if (ruled.length) logic.push(`${lord} rules house ${ruled.join(' and house ')}`);

    paras.push(`${DASHA_DEFINITION}`);

    paras.push(
      `You are currently in a ${lord} mahadasha, ${info.label}, running ${formatDashaRange(current.maha)}. ` +
      `In general that period brings forward ${info.emphasis}. What it tends to build is ${info.grows}, and the strain that comes with it is ${info.strain}.`
    );

    if (has(seat)) {
      const disp = dispositor(seat);
      const rp = rulershipPhrase(chart, lord);
      const dg = dignityPlain(lord, seat.sign, seat.dignity);
      const nk = nakshatraCopy(seat.nakshatra.name);
      paras.push(
        `That general meaning has to be filtered through where ${lord} actually sits in your chart, which is what makes a period personal. ` +
        `Yours is in ${seat.sign}${seat.house ? `, in the area of ${housePlain(seat.house)}` : ''}, so ${lord} themes are likely to be loudest there and to be handled ${signTendency(seat.sign)}. ` +
        (rp ? `${rp}, so those areas get pulled into the period as well. ` : '') +
        (dg ? `${dg} ` : '') +
        (nk ? `Its nakshatra is ${seat.nakshatra.name} pada ${seat.nakshatra.pada}, ruled by ${seat.nakshatra.lord}, which adds a more specific flavor: ${nk.essence}. ` : '') +
        (disp ? `${seat.sign} is ruled by ${disp}, so the condition of ${disp} in your chart quietly shapes how this period behaves.` : '')
      );
    }

    if (current.antar) {
      const sub = current.antar.subLord as VedicPlanet;
      const subInfo = DASHA_EMPHASIS[sub];
      const subBody = chart.byName[sub];
      const subRuled = rulership(chart, sub);
      paras.push(
        `Inside the main period you are in a ${sub} antardasha, the sub-period running to ${formatDashaRange(current.antar).split(' to ')[1]}. ` +
        `Read it as ${lord} and ${sub} operating together rather than as two separate forecasts. ${sub} brings ${subInfo.emphasis} into a ${lord} framework, ` +
        (has(subBody) ? `and since your ${sub} sits in ${subBody.sign}${subBody.house ? `, in the area of ${housePlain(subBody.house)}` : ''}${subRuled.length ? ` and rules house ${subRuled.join(' and house ')}` : ''}, those are the themes most likely to feel louder right now. ` : '') +
        `In practice the combination usually reads as ${subInfo.emphasis.split(',')[0]} being approached with the ${lord} requirement of ${info.emphasis.split(',')[0]}.`
      );
    }

    takeaway = `A period emphasizes a theme. It does not switch other parts of life off, and it does not promise or withhold anything. During a ${lord} period the practical question is simple: what in your life is asking for ${info.emphasis.split(',')[0]}, and are you meeting it deliberately or resisting it? The trap named above, ${info.strain}, is the most common way people spend a good period badly.`;
  }

  return section(
    'dasha',
    'Your Life Timeline',
    'Vimshottari dasha, the period you are inside now',
    logic,
    paras,
    takeaway,
  );
}

/* 4. Past life / why you came in ----------------------------------------- */

function pastLifeSection(chart: VedicChart, d12: VargaChart): VedicSectionData {
  const ketu = chart.byName.Ketu;
  const rahu = chart.byName.Rahu;
  const logic: string[] = [];
  const paras: string[] = [];

  if (has(ketu)) {
    logic.push(`Ketu: ${bodyLine(ketu)}`);
    const k12 = d12.byName.Ketu;
    if (k12) logic.push(`Ketu in ${VARGA_LABELS.D12.name}: ${k12.sign}${k12.house ? `, house ${k12.house}` : ''}`);
  }
  if (has(rahu)) logic.push(`Rahu: ${bodyLine(rahu)}`);
  logic.push(`${VARGA_LABELS.D12.name} reads ${VARGA_LABELS.D12.reads}. ${VARGA_NOTE}`);

  paras.push(
    'Rahu and Ketu are not planets. They are the two points where the Moon\u2019s path crosses the Sun\u2019s, and they always sit exactly opposite each other. In plain language, Ketu is what already feels familiar or instinctive, and therefore may be easy to fall back on. Rahu is what attracts you and stretches you, but may initially feel unfamiliar, excessive, or hard to regulate. Neither side is the bad side.'
  );

  if (has(ketu)) {
    const nk = nakshatraCopy(ketu.nakshatra.name);
    paras.push(
      `${PLANET_PLAIN.Ketu}. Yours is in ${ketu.sign}${ketu.house ? `, in the area of ${housePlain(ketu.house)}` : ''}. ` +
      `That suggests real competence in that part of life, competence you tend to undervalue precisely because it did not cost you much to acquire. ` +
      (nk ? `In ${ketu.nakshatra.name} the specific ability reads as ${nk.gift}, and the part that stops being useful is ${nk.friction}.` : '')
    );
  }
  if (has(rahu)) {
    paras.push(
      `${PLANET_PLAIN.Rahu}. Yours sits opposite, in ${rahu.sign}${rahu.house ? `, in the area of ${housePlain(rahu.house)}` : ''}, and this is the side you have less experience with and more appetite for. ` +
      `Progress there is likely to feel like beginner work no matter how accomplished you are elsewhere, which is an accurate description of the axis rather than a sign anything is wrong.`
    );
  }
  if (has(ketu) && has(rahu) && ketu.house && rahu.house) {
    paras.push(
      `The short version of the axis: from ${housePlain(ketu.house)}, which you already have a feel for, toward ${housePlain(rahu.house)}, which asks for practice. The Ketu skill stays a resource. Rahu simply describes the developmental stretch, and stretching there tends to feel like beginner work even for people who are accomplished elsewhere.`
    );
  }
  paras.push(
    'Traditional Jyotish may interpret some of this axis, and some ancestral patterns in the D12, karmically as unfinished business carried forward. That is a spiritual interpretation rather than something the chart can prove. The practical reading above holds either way.'
  );

  const takeaway = has(ketu) && has(rahu)
    ? `In real life this usually shows up as a pull between two comfortable options: retreating into ${housePlain(ketu.house)}, where you already know what you are doing, or stretching into ${housePlain(rahu.house)}, where you do not. Both are legitimate. The one that develops you is the second, and the useful move is to keep the Ketu skill as a resource rather than a hiding place.`
    : undefined;

  return section('past-life', 'Familiar Ground and the Stretch', 'Ketu, Rahu and the Dwadashamsha (D12): parents, ancestry and inherited patterns', logic, paras, takeaway);
}

/* 5. Purpose, gifts and talents ------------------------------------------ */

function purposeSection(chart: VedicChart, d9: VargaChart, karakas: KarakaAssignment[]): VedicSectionData {
  const ak = findKaraka(karakas, 'Atmakaraka');
  const logic: string[] = [];
  const paras: string[] = [];
  let takeaway: string | undefined;

  if (!ak) {
    logic.push('Atmakaraka needs the seven grahas plus Rahu on the chart.');
    paras.push('Fill in the remaining planets on this chart and this section will resolve.');
    return section('purpose', 'Purpose, Gifts and Talents', 'Atmakaraka and the Navamsa (D9)', logic, paras);
  }

  const body = chart.byName[ak.planet];
  logic.push(`Atmakaraka: ${ak.planet} at ${formatDegree(ak.degree)} ${ak.sign}${ak.house ? `, house ${ak.house}` : ''} (highest degree in the chart)`);
  logic.push(`Atmakaraka is ${KARAKA_MEANING.Atmakaraka}`);
  const ak9 = d9.byName[ak.planet];
  if (ak9) logic.push(`Atmakaraka in ${VARGA_LABELS.D9.name}: ${ak9.sign}${ak9.house ? `, house ${ak9.house}` : ''}${ak9.dignity !== 'neutral' ? `, ${ak9.dignity}` : ''}`);
  if (isVargottama(chart, d9, ak.planet)) logic.push(`${ak.planet} is vargottama, the same sign in the birth chart and the Navamsa`);
  if (has(body)) logic.push(`Nakshatra: ${body.nakshatra.name} pada ${body.nakshatra.pada}`);

  paras.push(
    `In the Jaimini branch of Vedic astrology, the Atmakaraka is the planet with the highest relevant degree, and it is traditionally treated as a major recurring developmental theme rather than proof of a soul purpose. Think of it as a subject life keeps asking you to study. Yours is ${ak.planet}, and ${PLANET_PLAIN[ak.planet]}. ` +
    `So the repeating subject is ${PLANET_MOTIVE[ak.planet]}.`
  );

  if (has(body)) {
    const dg = dignityPlain(ak.planet, body.sign, body.dignity);
    const rp = rulershipPhrase(chart, ak.planet);
    paras.push(
      `It sits in ${body.sign}${body.house ? `, in the area of ${housePlain(body.house)}` : ''}, so the theme is expressed ${signTendency(body.sign)} and tends to be worked out in that part of life. ` +
      (rp ? `${rp}, which links those areas to the same thread. ` : '') +
      (dg ? dg : '')
    );
    const nk = nakshatraCopy(body.nakshatra.name);
    if (nk) {
      paras.push(
        `The nakshatra adds precision. ${body.nakshatra.name} pada ${body.nakshatra.pada}, ruled by ${body.nakshatra.lord}, describes ${nk.essence}. The usable talent inside that is ${nk.gift}. The recurring cost is that ${nk.friction}, which is worth treating as maintenance rather than as a flaw.`
      );
    }
  }

  if (ak9) {
    const vargottama = isVargottama(chart, d9, ak.planet);
    paras.push(
      `The Navamsa, or D9, is a divisional chart built by dividing each sign into nine parts. It is traditionally used to see whether something holds up over time rather than only showing well early. ` +
      `In your Navamsa ${ak.planet} lands in ${ak9.sign}${ak9.dignity !== 'neutral' ? `, ${ak9.dignity} there` : ''}. ` +
      (ak9.dignity === 'debilitated'
        ? 'That combination usually describes an ability that matures late and improves specifically through the stretch where you assumed you were failing at it.'
        : ak9.dignity === 'exalted' || ak9.dignity === 'own sign'
          ? 'That combination describes an ability that keeps functioning when the outer circumstances of your life change.'
          : 'That combination describes an ability that develops steadily rather than dramatically, and that rewards repetition more than inspiration.') +
      (vargottama ? ' It also holds the same sign in both charts, which classical texts call vargottama and treat as unusually stable. In plain terms, this part of you does not change much depending on who is in the room.' : '')
    );
  }

  takeaway = `The practical version is this: your strongest contribution runs through ${ak.planet}, meaning ${PLANET_MOTIVE[ak.planet]}. Choose work, projects and commitments that ask for that function directly. When you are using it, effort tends to convert into progress. When a situation gives you no room for it, you can perform well and still feel like the wrong person for the job.`;

  return section('purpose', 'Purpose, Gifts and Talents', 'Atmakaraka and the Navamsa (D9)', logic, paras, takeaway);
}

/* 6. Money and wealth ---------------------------------------------------- */

function wealthSection(chart: VedicChart, d2: VargaChart): VedicSectionData {
  const logic: string[] = [];
  const paras: string[] = [];

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
  if (jup2) logic.push(`Jupiter in ${VARGA_LABELS.D2.name}: ${jup2.sign}`);
  logic.push('Houses 2, 11 and 9 are the classical dhana (wealth) houses: what you earn and hold, what you gain through networks, and what comes through knowledge and good fortune.');

  const second = lords.find(l => l.house === 2);
  const eleventh = lords.find(l => l.house === 11);

  paras.push(
    'In Vedic astrology money is read from a group of houses rather than one. The second house covers what you earn and hold, along with self-worth and speech. The eleventh covers gains, goals and networks. The ninth covers knowledge, mentors and good fortune. The rulers of those houses, and where they sit, describe the pattern your earning tends to follow.'
  );

  if (second?.body) {
    const disp = dispositor(second.body);
    paras.push(
      `Your second house is ruled by ${second.lord}, and ${PLANET_PLAIN[second.lord]}. It sits in the area of ${housePlain(second.body.house)}. ` +
      `${moneyPattern(second.body.house)} ` +
      (disp ? `${second.body.sign} is ruled by ${disp}, so how well this works is also tied to the condition of ${disp} in your chart.` : '')
    );
  } else if (second) {
    paras.push(`Your second house is ruled by ${second.lord} in ${second.sign}, so you tend to handle earning and security ${signTendency(second.sign)}. House placement, which would make this more specific, needs an accurate birth time.`);
  }

  if (eleventh?.body) {
    paras.push(
      `Gains, meaning increases beyond your base income, are read from the eleventh house. Yours is ruled by ${eleventh.lord}, sitting in the area of ${housePlain(eleventh.body.house)}. ` +
      `${moneyPattern(eleventh.body.house)} The useful implication is that growth is more likely to come from strengthening that channel than from working longer hours at the base.`
    );
  }

  if (second && eleventh && second.lord === eleventh.lord) {
    const seat = second.body;
    paras.push(
      `Worth noticing: both the second and the eleventh house are ruled by the same planet, ${second.lord}${seat?.house ? `, and it sits in house ${seat.house}, the area of ${housePlain(seat.house)}` : ''}. When one planet runs both earning and gains, the two tend to move together rather than independently. Income and increases may be especially connected with ${PLANET_MOTIVE[second.lord]}${seat?.house === 1 ? ', which here means your own knowledge, decisions, initiative, skills, reputation and personal contribution' : ''}. In plain terms, your ideas, knowledge, communication or personal expertise may themselves become resources.`
    );
  }

  const strained = lords.find(l => l.body?.dignity === 'debilitated');
  if (strained && strained.body) {
    paras.push(
      `One honest note. The ruler of your ${strained.house}th house, ${strained.lord}, is debilitated in ${strained.sign}, meaning it is in the sign where it operates least comfortably. Classically this is read as a slower and more effortful route rather than a blocked one. In practice it often describes financial confidence that builds later and through experience, and a tendency to underestimate what you are worth in the meantime.`
    );
  } else {
    paras.push('None of your wealth house rulers are in signs classical texts read as weakened, which describes a steady rather than dramatic pattern. The question for you is consistency more than capacity.');
  }

  const takeaway = second?.body
    ? `In real life: your money tends to follow the pattern above rather than the standard advice. Identify the one income channel that matches it and give it sustained attention before adding another. This system describes tendency and timing. It does not name a number, and any reading that promises wealth by a date is selling something.`
    : 'In real life: this section describes the shape your earning tends to take, not an amount and not a schedule.';

  return section('wealth', 'Money and Wealth', 'Dhana houses and the Hora chart (D2)', logic, paras, takeaway);
}

/* 7. Career -------------------------------------------------------------- */

function careerSection(chart: VedicChart, d10: VargaChart, karakas: KarakaAssignment[]): VedicSectionData {
  const logic: string[] = [];
  const paras: string[] = [];

  const tenth = houseLord(chart, 10);
  const amk = findKaraka(karakas, 'Amatyakaraka');
  const tenthLordBody = tenth ? chart.byName[tenth.lord] : undefined;
  const tenthOccupants = bodiesInHouse(chart, 10);

  if (tenth) logic.push(`House 10 lord: ${tenth.lord} (${tenth.sign})${tenthLordBody?.house ? `, sitting in house ${tenthLordBody.house}` : ''}`);
  if (tenthOccupants.length) logic.push(`In house 10: ${tenthOccupants.map(b => b.name).join(', ')}`);
  if (amk) logic.push(`Amatyakaraka (an important capacity used in work and contribution): ${amk.planet} at ${formatDegree(amk.degree)} ${amk.sign}${amk.house ? `, house ${amk.house}` : ''}`);
  const amk10 = amk ? d10.byName[amk.planet] : undefined;
  if (amk10) logic.push(`Amatyakaraka in ${VARGA_LABELS.D10.name}: ${amk10.sign}${amk10.house ? `, house ${amk10.house}` : ''}`);
  if (d10.lagnaSign) logic.push(`${VARGA_LABELS.D10.name} lagna: ${d10.lagnaSign}`);

  paras.push(
    'Career is read from three places at once: the tenth house and its ruler, which describe direction and responsibility, the Amatyakaraka, which is the second highest degree planet and is read as the function your working life runs through, and the Dashamsha or D10, a divisional chart used only for work and public role.'
  );

  if (amk) {
    paras.push(
      `Your Amatyakaraka is ${amk.planet}, and ${PLANET_PLAIN[amk.planet]}. In Jaimini astrology this is read as an important capacity used in work and contribution, one of the tools you use to do something meaningful, so it points toward work which genuinely uses that capacity. It describes the function, not a job title, so it can be satisfied in many different fields, and it is a useful test to run on any role you are considering.`
    );
  }
  if (tenth && tenthLordBody?.house) {
    const rp = rulershipPhrase(chart, tenth.lord);
    paras.push(
      `The tenth house covers career direction and public reputation. Yours is ruled by ${tenth.lord}, which sits in the area of ${housePlain(tenthLordBody.house)}. ` +
      `That suggests your professional standing may be built through that part of life more than through a conventional ladder, and it is often not the route you would have picked on paper. ` +
      (rp ? `${rp}, which is why those themes keep turning up in work contexts for you.` : '')
    );
  } else if (tenth) {
    paras.push(`Your tenth house is ruled by ${tenth.lord} in ${tenth.sign}, so you tend to work ${signTendency(tenth.sign)}.`);
  }
  if (amk10 && amk) {
    paras.push(
      `In the Dashamsha your ${amk.planet} lands in ${amk10.sign}${amk10.house ? `, in the area of ${housePlain(amk10.house)}` : ''}, which describes the working environment that suits you: one that operates ${signTendency(amk10.sign)}. ` +
      (amk10.dignity === 'debilitated'
        ? 'It also suggests you develop into your professional strength over time rather than arriving fully formed, so situations that allow a learning curve suit you better than ones that judge you in the first year.'
        : 'It also suggests your particular method is part of what makes you valuable, so roles that require you to work generically tend to underuse you.')
    );
  }
  if (tenthOccupants.length) {
    paras.push(
      `With ${list(tenthOccupants.map(b => b.name))} placed in the tenth house, work and visibility carry more weight in this chart than average. Tradition reads this as a life where public role tends to be a main theme rather than a background one.`
    );
  }

  paras.push(
    'Two things to hold together rather than choosing between. A chart can combine privacy and depth with responsibility and professional visibility at the same time. Where that happens, the person often works especially well when the job requires discretion, strategy, investigation, emotional intelligence, deep focus, specialised knowledge, or institutional and behind-the-scenes work, while still allowing them to build authority or expertise. Wanting recognition for genuine expertise or a meaningful contribution is different from wanting visibility for its own sake, and a 12th house emphasis does not mean recognition is impossible or unwanted.'
  );

  const takeaway = amk
    ? `In real life: the fit test is not the industry, it is whether the role asks for ${PLANET_MOTIVE[amk.planet]}. A well-paid position that never uses that capacity tends to feel wrong for reasons that are hard to explain, and a modest one that uses it constantly tends to hold your interest.`
    : undefined;

  return section('career', 'Career and Work', 'Tenth house, Amatyakaraka and the Dashamsha (D10)', logic, paras, takeaway);
}

/* 8. Partner and marriage ------------------------------------------------ */

function partnerSection(chart: VedicChart, d9: VargaChart, karakas: KarakaAssignment[], dashas: DashaPeriod[]): VedicSectionData {
  const logic: string[] = [];
  const paras: string[] = [];

  const dk = findKaraka(karakas, 'Darakaraka');
  const seventh = houseLord(chart, 7);
  const seventhLordBody = seventh ? chart.byName[seventh.lord] : undefined;
  const occupants = bodiesInHouse(chart, 7);
  const venus = chart.byName.Venus;

  if (dk) logic.push(`Darakaraka (one indicator for close partnership): ${dk.planet} at ${formatDegree(dk.degree)} ${dk.sign}${dk.house ? `, house ${dk.house}` : ''} (lowest degree in the chart)`);
  if (seventh) logic.push(`House 7 lord: ${seventh.lord} (${seventh.sign})${seventhLordBody?.house ? `, sitting in house ${seventhLordBody.house}` : ''}`);
  if (seventhLordBody) logic.push(`House 7 lord nakshatra: ${seventhLordBody.nakshatra.name} pada ${seventhLordBody.nakshatra.pada}`);
  if (occupants.length) logic.push(`In house 7: ${occupants.map(b => b.name).join(', ')}`);
  if (has(venus)) logic.push(`Venus: ${bodyLine(venus)}`);
  const dk9 = dk ? d9.byName[dk.planet] : undefined;
  if (dk9) logic.push(`Darakaraka in ${VARGA_LABELS.D9.name}: ${dk9.sign}${dk9.house ? `, house ${dk9.house}` : ''}`);

  paras.push(
    'Close one-to-one relationships are an important arena of development in every chart, and this section describes what that arena tends to ask for. It applies to romantic partnership and marriage, and equally to other important one-to-one bonds, business partnerships and close collaborative relationships. Partnership is read from the seventh house and its ruler, from Venus, which describes what you value and enjoy in closeness, and from the Darakaraka, the planet at the lowest degree in the chart, read as the qualities that matter most in a close relationship. The Navamsa is then used to see what tends to hold over time.'
  );

  if (dk) {
    paras.push(
      `Your Darakaraka is ${dk.planet} in ${dk.sign}, and ${PLANET_PLAIN[dk.planet]}. In Jaimini astrology the Darakaraka is one indicator used for close partnership, the relationship energy that can teach you a lot about yourself, rather than a description of a specific spouse. Read that way, that points to closeness where ${PLANET_MOTIVE[dk.planet]} is central: it is both what you tend to be drawn to in someone else and what you are asked to develop in yourself. Expressed ${signTendency(dk.sign)}, that quality can look like steadiness or like pressure depending on how consciously it is handled.`
    );
  }
  if (seventh && seventhLordBody?.house) {
    paras.push(
      `The ruler of your seventh house is ${seventh.lord}, sitting in the area of ${housePlain(seventhLordBody.house)}. That connects partnership to that part of your life, meaning relationships tend to become intertwined with those themes rather than existing separately from them. It describes a connection between areas, not a place or a person.`
    );
  }
  if (occupants.length) {
    paras.push(
      `With ${list(occupants.map(b => b.name))} in the seventh house, one-to-one relationship is a main arena in this chart rather than a side theme. Tradition reads this as someone who becomes noticeably different inside a close partnership than outside one, so who you partner with shapes more of your life than it does for most people.`
    );
  }
  if (dk9 && dk) {
    paras.push(
      `In the Navamsa your ${dk.planet} sits in ${dk9.sign}. ` +
      (dk9.dignity === 'debilitated'
        ? 'That suggests relationships that improve as both people stop performing, and a partnership pattern that is more durable than it is impressive early on.'
        : 'That suggests durability comes from shared practical commitment rather than from intensity alone.')
    );
  }

  const partnerWindows = dashas
    .filter(p => (dk && p.lord === dk.planet) || (seventh && p.lord === seventh.lord) || p.lord === 'Venus')
    .filter(p => p.end.getFullYear() >= new Date().getFullYear())
    .slice(0, 3);
  if (partnerWindows.length) {
    logic.push(`Periods that emphasize partnership themes: ${partnerWindows.map(p => `${p.lord} ${formatDashaRange(p)}`).join('; ')}`);
    paras.push(
      `The periods when relationship themes may be emphasised are ${list(partnerWindows.map(p => `${p.lord}, ${formatDashaRange(p)}`))}. These periods can increase the emphasis on relationship themes, but relationships can begin, deepen, change or end during many different planetary periods. Real timing requires the natal chart, the seventh house and its ruler, Venus, the D9, the mahadasha, the antardasha and the relevant transits together, so treat this line as emphasis and nothing more.`
    );
  }

  const takeaway = dk
    ? `In real life: this section describes what closeness asks of you, not who arrives or when. The recurring work is ${PLANET_MOTIVE[dk.planet]}, and relationships tend to go better when you develop that quality yourself instead of looking for someone to supply it.`
    : undefined;

  return section('partner', 'Close Partnership', 'Seventh house and ruler, Venus, Darakaraka and the Navamsa (D9)', logic, paras, takeaway);
}

/* 9. Obstacles ----------------------------------------------------------- */

function obstacleSection(chart: VedicChart): VedicSectionData {
  const logic: string[] = [];
  const paras: string[] = [];

  const saturn = chart.byName.Saturn;
  const rahu = chart.byName.Rahu;
  const lagnaLordBody = chart.lagnaLord ? chart.byName[chart.lagnaLord] : undefined;

  if (has(saturn)) logic.push(`Saturn: ${bodyLine(saturn)}`);
  if (has(rahu)) logic.push(`Rahu: ${bodyLine(rahu)}`);
  if (has(lagnaLordBody)) logic.push(`Lagna lord ${chart.lagnaLord}: ${bodyLine(lagnaLordBody)}`);
  const sixth = bodiesInHouse(chart, 6);
  if (sixth.length) logic.push(`In house 6 (daily work, routine, problem solving): ${sixth.map(b => b.name).join(', ')}`);

  if (has(saturn)) {
    const rp = rulershipPhrase(chart, saturn.name);
    const dg = dignityPlain('Saturn', saturn.sign, saturn.dignity);
    paras.push(
      `${PLANET_PLAIN.Saturn}. Yours is in ${saturn.sign}${saturn.house ? `, in the area of ${housePlain(saturn.house)}` : ''}, which is the part of life where you are most likely to feel that things take longer for you than they appear to for other people. ` +
      `Saturn placements describe delay and durability together, so the same area that resists early usually becomes an area of real competence later. ` +
      (dg ? `${dg} ` : '') +
      (rp ? `${rp}, so responsibility in those areas tends to arrive early or feel heavier than expected.` : '')
    );
  }
  if (has(rahu) && rahu.house) {
    paras.push(
      `${PLANET_PLAIN.Rahu}. Yours is in the area of ${housePlain(rahu.house)}, which describes strong appetite in a place where you have limited experience. The typical tension is impatience with the unglamorous middle stage of a process, and that is usually where the avoidable mistakes happen.`
    );
  }
  if (has(lagnaLordBody) && lagnaLordBody.dignity === 'debilitated') {
    paras.push(
      `The ruler of your rising sign, ${chart.lagnaLord}, is debilitated, meaning placed in the sign where it works least comfortably. Since that planet stands for you, tradition reads this as energy and confidence that need managing rather than pushing. The practical version is that your capacity is real but has a budget, and spending it in advance is the pattern worth breaking.`
    );
  }

  const takeaway = has(saturn)
    ? `In real life: the counter-move for a Saturn area is not intensity, it is repetition. Pick the smallest version of the work you can sustain and keep it going on a schedule that feels almost too modest. For the Rahu area, the counter-move is finishing one thing before reaching for the next. These are patterns you can see coming, which is what makes them workable.`
    : undefined;

  return section('obstacles', 'Obstacles and How You Move Them', 'Saturn, Rahu and the lagna lord', logic, paras, takeaway);
}

/* 10. Vedic vs Western ---------------------------------------------------- */

function comparisonSection(chart: VedicChart): VedicSectionData {
  const shifted = chart.bodies.filter(b => b.sign !== b.tropicalSign);
  const held = chart.bodies.filter(b => b.sign === b.tropicalSign);

  const logic: string[] = [
    `Ayanamsa applied: Lahiri, ${formatDegree(chart.ayanamsa)}`,
    `Signs that shift: ${shifted.length ? shifted.map(b => `${b.name} ${b.tropicalSign} to ${b.sign}`).join(', ') : 'none'}`,
    `Signs that hold: ${held.length ? held.map(b => b.name).join(', ') : 'none'}`,
    'Western houses stay Placidus elsewhere in the app. This tab uses whole sign houses, which is standard for Jyotish.',
  ];

  const paras: string[] = [];
  paras.push(
    'Two systems, one sky. The planets did not move. The measuring stick changed, because the Western zodiac starts from the spring equinox and the Vedic zodiac starts from a fixed star reference. Nothing you already know about your Western chart becomes wrong here.'
  );
  if (shifted.length) {
    const heldClause = held.length === 0
      ? 'nothing stays put'
      : held.length === 1
        ? `${held[0].name} stays put`
        : `${list(held.map(b => b.name))} stay put`;
    paras.push(
      `For you, ${list(shifted.map(b => b.name))} ${shifted.length === 1 ? 'changes' : 'change'} sign in this system, and ${heldClause}. A shifted Sun is the one people misread most often. It does not mean you are secretly the new sign and were never the old one. A Vedic Sun is never read as a sign label by itself: it is read through its house, the houses it rules, its nakshatra, its sign condition, the planet that rules the sign it sits in, what it sits with, and the period you are in. The Western Sun sign keeps doing its own job under its own rules. Two lenses, same sky, different questions.`
    );
  } else {
    paras.push('Unusually, every body on your chart lands in the same sign in both systems, so the two readings will sound like each other.');
  }

  return section(
    'comparison',
    'Vedic and Western Side by Side',
    'What changed, what held',
    logic,
    paras,
    'In real life: Western and Vedic astrology begin with the same astronomical birth sky but use different zodiac frameworks and interpretive traditions. Neither chart replaces the other in this app. The Western tab leads with psychological pattern, personality, emotional needs, aspects, house dynamics and transits. This tab leads with sidereal placements, whole-sign house structure, house rulers, nakshatras, planetary dignity, Vimshottari periods, Jaimini indicators and divisional charts. Reading them together, what you are looking for is repetition, reinforcement, tension, or the same underlying theme expressed two different ways. It is not that one system tells you who you are and the other tells you what happens.',
  );
}
