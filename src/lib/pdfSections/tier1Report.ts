/**
 * Tier 1 Solar Return PDF — "Year at a Glance" — v3
 * 2 pages only: Cover + Snapshot. No quarterly. No monthly.
 * Print-first. Color from signColorThemes keyed to NATAL SUN SIGN.
 */
import jsPDF from 'jspdf';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { signColorThemes, SignColorTheme } from '@/lib/pdfSections/signColorThemes';

type Color = [number, number, number];

const MARGIN = 52;
const MARGIN_TOP = 44;
const MARGIN_BOTTOM = 44;

// ─── Lookup Tables ──────────────────────────────────────────────────

const RISING_QUALITY: Record<string, string> = {
  Aries: 'Bold, forward-moving', Taurus: 'Steady, grounding',
  Gemini: 'Curious, connective', Cancer: 'Nurturing, inward',
  Leo: 'Radiant, expressive', Virgo: 'Clear, purposeful',
  Libra: 'Harmonizing, relational', Scorpio: 'Deep, transformative',
  Sagittarius: 'Expansive, seeking', Capricorn: 'Focused, building',
  Aquarius: 'Visionary, freeing', Pisces: 'Gentle, open-hearted',
};

const PROFECTION_THEME_PLAIN: Record<number, string> = {
  1: 'fresh starts and stepping into yourself',
  2: 'building security and knowing your worth',
  3: 'learning, speaking up, and staying curious',
  4: 'home, roots, and what nourishes you',
  5: 'joy, creativity, and what lights you up',
  6: 'health, rhythm, and showing up daily',
  7: 'relationships and meaningful partnership',
  8: 'transformation and going deeper',
  9: 'expansion, travel, and finding meaning',
  10: 'purpose, work, and being seen',
  11: 'community, friendship, and shared vision',
  12: 'rest, healing, and inner renewal',
};

const HOUSE_THEME_SHORT: Record<number, string> = {
  1: 'Identity & fresh starts', 2: 'Security & self-worth',
  3: 'Learning & expression', 4: 'Home & roots',
  5: 'Joy & creativity', 6: 'Health & daily rhythm',
  7: 'Relationships & partnership', 8: 'Transformation & depth',
  9: 'Expansion & meaning', 10: 'Purpose & recognition',
  11: 'Community & friendship', 12: 'Rest & inner renewal',
};

const MOON_KEYWORD: Record<string, string> = {
  Aries: 'Active & independent', Taurus: 'Steady & grounded',
  Gemini: 'Curious & expressive', Cancer: 'Sensitive & nurturing',
  Leo: 'Warm & expressive', Virgo: 'Thoughtful & discerning',
  Libra: 'Balanced & relational', Scorpio: 'Intense & perceptive',
  Sagittarius: 'Free & optimistic', Capricorn: 'Steady & disciplined',
  Aquarius: 'Independent & aware', Pisces: 'Intuitive & compassionate',
};

const MOON_PHASE_PLAIN: Record<string, string> = {
  'New Moon': 'A year of fresh starts — plant new seeds',
  'Waxing Crescent': 'A building year — keep going',
  'First Quarter': 'A year of action — push through',
  'Waxing Gibbous': 'A year of refinement — almost there',
  'Full Moon': 'A completion year — things come full circle',
  'Waning Gibbous': 'A year of sharing — give what you\'ve learned',
  'Last Quarter': 'A year of release — let go gracefully',
  'Balsamic': 'A quiet year — rest before the next chapter',
  'Balsamic Moon': 'A quiet year — rest before the next chapter',
};

const ELEMENT_WORD: Record<string, string> = {
  Fire: 'Ignition', Earth: 'Roots', Air: 'Clarity', Water: 'Depth',
};

const PROFECTION_WORD: Record<number, string> = {
  1: 'Identity', 2: 'Resources', 3: 'Expression', 4: 'Home',
  5: 'Joy', 6: 'Service', 7: 'Partnership', 8: 'Transformation',
  9: 'Expansion', 10: 'Purpose', 11: 'Community', 12: 'Surrender',
};

const MOON_WORD: Record<string, string> = {
  Aries: 'Courage', Taurus: 'Patience', Gemini: 'Curiosity', Cancer: 'Nurture',
  Leo: 'Radiance', Virgo: 'Precision', Libra: 'Balance', Scorpio: 'Depth',
  Sagittarius: 'Freedom', Capricorn: 'Mastery', Aquarius: 'Vision', Pisces: 'Flow',
};

const SUN_HOUSE_BODY: Record<number, string> = {
  1: 'This is a year where your sense of self takes center stage. You may feel a pull to reinvent, refresh, or simply show up more fully as who you are.',
  2: 'This year draws your attention to what you value — your resources, your time, and your sense of security. Building something tangible matters now.',
  3: 'This is a year of words, ideas, and connections. You may feel drawn to learn something new, speak up more, or explore your neighbourhood of thought.',
  4: 'This year turns your attention inward — toward home, family, and what nourishes you at the deepest level. Creating a sense of belonging matters now.',
  5: 'This is a year to follow what genuinely delights you. Joy, creativity, and self-expression are not luxuries — they are the point.',
  6: 'This year asks you to refine your daily rhythm. Health, habits, and how you show up each day become the quiet foundation for everything else.',
  7: 'This is a year defined by the people closest to you. Relationships — romantic, professional, or creative — take center stage.',
  8: 'This year invites you to go deeper. Transformation, shared resources, and emotional honesty become the themes that shape your growth.',
  9: 'This is a year to expand your world. Travel, education, philosophy, or simply a shift in perspective — the horizon calls.',
  10: 'This year puts your work and purpose in the spotlight. What you are building in the world becomes visible, and recognition is possible.',
  11: 'This is a year shaped by community, friendship, and shared vision. The people around you help define what comes next.',
  12: 'This year invites you to slow down, rest, and listen to what is happening beneath the surface. Healing and reflection are not delays — they are the work.',
};

const MOON_SIGN_BODY: Record<string, string> = {
  Aries: 'Your emotional world this year is quick, direct, and action-oriented. You process feelings by moving through them rather than sitting with them.',
  Taurus: 'Your emotional world this year is calm and steady. You find comfort in routine, beauty, and the tangible pleasures of daily life.',
  Gemini: 'Your emotional world this year is lively and curious. You process feelings through conversation, writing, and making connections.',
  Cancer: 'Your emotional world this year is tender and intuitive. You may feel more sensitive than usual — and that sensitivity is a gift.',
  Leo: 'Your emotional world this year is warm and generous. You need to feel seen and appreciated, and your heart leads the way.',
  Virgo: 'Your emotional world this year is thoughtful and discerning. You process feelings through analysis, order, and quiet acts of service.',
  Libra: 'Your emotional world this year seeks harmony. You process feelings through relationships and may feel unsettled until balance is restored.',
  Scorpio: 'Your emotional world this year runs deep. You feel things intensely and may be drawn to honesty that others find uncomfortable.',
  Sagittarius: 'Your emotional world this year is optimistic and restless. You process feelings by seeking meaning, movement, and broader perspective.',
  Capricorn: 'Your emotional world this year tends toward patience and practicality. You may find yourself less swayed by ups and downs, and more able to show up consistently.',
  Aquarius: 'Your emotional world this year is independent and clear-sighted. You process feelings at a slight distance, preferring logic and perspective over intensity.',
  Pisces: 'Your emotional world this year is fluid and deeply empathic. You absorb the feelings of others easily — boundaries and rest matter more than usual.',
};

const RISING_BODY: Record<string, string> = {
  Aries: 'You come across as someone ready to act — direct, energetic, and unafraid to lead. People respond to your courage and initiative this year.',
  Taurus: 'You come across as grounded and dependable — someone others instinctively trust. This year rewards patience and a steady pace.',
  Gemini: 'You come across as bright, curious, and adaptable. People are drawn to your ideas and your ability to connect dots others miss.',
  Cancer: 'You come across as warm, intuitive, and emotionally intelligent. People feel safe around you, and that quality opens doors this year.',
  Leo: 'You come across as confident, warm, and naturally magnetic. This year invites you to step into the spotlight and let yourself be seen.',
  Virgo: 'You come across as competent, thoughtful, and precise. People notice your attention to detail, and this year rewards careful, purposeful action.',
  Libra: 'You come across as graceful, fair-minded, and diplomatic. This year, relationships shape your path more than personal ambition.',
  Scorpio: 'You come across as intense, perceptive, and quietly powerful. This year invites transformation — shedding what is no longer true.',
  Sagittarius: 'You come across as open, enthusiastic, and ready for adventure. This year rewards expansion — through travel, learning, or bold choices.',
  Capricorn: 'You come across as serious, capable, and quietly ambitious. People respect your authority, and this year rewards commitment and responsibility.',
  Aquarius: 'You come across as original, independent, and slightly unconventional. This year rewards innovation and trusting your own perspective.',
  Pisces: 'You come across as gentle, open-hearted, and deeply intuitive. People are drawn to your compassion, and this year opens doors through connection rather than force.',
};

// ─── Helpers ────────────────────────────────────────────────────────
function loadImageDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx2 = c.getContext('2d');
      if (!ctx2) { resolve(null); return; }
      ctx2.drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function formatDatePretty(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split(/[-/]/);
    let month: string, day: string, year: string;
    if (parts[0].length === 4) {
      year = parts[0]; month = String(parseInt(parts[1], 10)).padStart(2, '0'); day = String(parseInt(parts[2], 10)).padStart(2, '0');
    } else {
      month = String(parseInt(parts[0], 10)).padStart(2, '0'); day = String(parseInt(parts[1], 10)).padStart(2, '0'); year = parts[2];
    }
    return `${month}-${day}-${year}`;
  } catch { return dateStr || ''; }
}

function capitalizeLocation(loc: string | undefined): string {
  if (!loc) return '';
  return loc.replace(/\b\w+/g, w => w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function getTheme(natalSunSign: string): SignColorTheme {
  return signColorThemes[natalSunSign] || signColorThemes['Pisces'];
}

// ─── Main Export ────────────────────────────────────────────────────
export async function generateTier1SolarReturnPDF(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  birthdayMode: boolean,
  personalMessage: string,
  cakeImages: Record<string, string>,
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pw = 612;
  const ph = 792;
  const contentW = pw - MARGIN * 2;

  const name = natalChart.name || 'You';
  const firstName = name.split(/\s+/)[0];
  const year = srChart.solarReturnYear;
  const natalSunSign = natalChart.planets?.Sun?.sign || '';
  const natalMoonSign = natalChart.planets?.Moon?.sign || '';
  const natalRisingSign = natalChart.houseCusps?.house1?.sign || natalChart.planets?.Ascendant?.sign || '';
  const srSunSign = srChart.planets.Sun?.sign || natalSunSign;
  const srMoonSign = analysis.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.houseCusps?.house1?.sign || analysis.yearlyTheme?.ascendantSign || srChart.planets.Ascendant?.sign || '';
  const sunHouse = analysis.sunHouse?.house || 1;
  const profHouse = analysis.profectionYear?.houseNumber || 1;
  const profAge = analysis.profectionYear?.age;

  const t = getTheme(natalSunSign);

  // ════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER (editorial)
  // ════════════════════════════════════════════════════════════════
  const CREAM: Color = [250, 247, 242];
  const INK: Color = [18, 16, 14];
  const MUTED: Color = [130, 125, 118];
  const RULE: Color = [200, 195, 188];
  const ACCENT: Color = [90, 80, 68];

  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pw, ph, 'F');

  let y = MARGIN_TOP;

  // Rule centered
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(pw / 2 - 30, y, pw / 2 + 30, y);
  y += 20;

  // Name italic
  doc.setFont('times', 'italic'); doc.setFontSize(13);
  doc.setTextColor(...MUTED);
  doc.text(`${firstName}'s`, pw / 2, y, { align: 'center' });
  y += 22;

  // Year Ahead — large
  doc.setFont('times', 'bold'); doc.setFontSize(48);
  doc.setTextColor(...INK);
  doc.text('Year Ahead', pw / 2, y, { align: 'center' });
  y += 6;

  // Year
  doc.setFont('times', 'normal'); doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(1.5);
  doc.text(String(year), pw / 2, y + 16, { align: 'center' });
  doc.setCharSpace(0);
  y += 40;

  // Cake image
  const cakeImgSrc = cakeImages[natalSunSign];
  if (cakeImgSrc) {
    const dataUrl = await loadImageDataUrl(cakeImgSrc);
    if (dataUrl) {
      doc.addImage(dataUrl, 'PNG', (pw - 200) / 2, y, 200, 170);
      y += 184;
    } else { y += 20; }
  } else { y += 20; }

  // Rule
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pw - MARGIN, y);
  y += 14;

  // Big Three
  doc.setFont('times', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...ACCENT);
  doc.setCharSpace(0.4);
  doc.text(`Sun in ${natalSunSign}  ·  Moon in ${natalMoonSign}  ·  ${natalRisingSign} Rising`, pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);
  y += 8;

  // Birth info
  const birthLine = `Born ${formatDatePretty(natalChart.birthDate)}  ·  ${capitalizeLocation(natalChart.birthLocation)}`;
  doc.setFont('times', 'normal'); doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(birthLine, pw / 2, y + 8, { align: 'center' });
  y += 16;

  // Personal message
  if (birthdayMode && personalMessage.trim()) {
    y += 18;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 24);
    doc.setFont('times', 'italic'); doc.setFontSize(10);
    doc.setTextColor(...ACCENT);
    let msgY = y;
    for (const line of msgLines.slice(0, 3)) { doc.text(line, pw / 2, msgY, { align: 'center' }); msgY += 14; }
  }

  // ════════════════════════════════════════════════════════════════
  // PAGE 2 — SNAPSHOT
  // ════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pw, ph, 'F');
  y = MARGIN_TOP;

  // Page header
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3.5);
  doc.text('YOUR YEAR AT A GLANCE', MARGIN, y);
  doc.setCharSpace(0);
  doc.setFont('times', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`${firstName} · ${year}`, pw - MARGIN, y, { align: 'right' });
  y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pw - MARGIN, y);
  y += 18;

  // ── SECTION A: THIS YEAR'S THEME ──
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3.5);
  doc.text("THIS YEAR'S THEME", MARGIN, y);
  doc.setCharSpace(0);
  y += 6;

  const risingQuality = RISING_QUALITY[srRisingSign] || 'Fresh, evolving';
  const profThemePlain = PROFECTION_THEME_PLAIN[profHouse] || 'growth and renewal';
  const themeHeadline = `${risingQuality} energy leads this year — a time for ${profThemePlain}.`;

  doc.setFont('times', 'normal'); doc.setFontSize(22);
  doc.setTextColor(...INK);
  const headLines: string[] = doc.splitTextToSize(themeHeadline, contentW);
  y += 20;
  for (const hl of headLines) { doc.text(hl, MARGIN, y); y += 27; }
  y += 4;

  const themeBody = `This year invites you into a season of ${profThemePlain}. The energy is ${risingQuality.toLowerCase()}, and the invitation is to trust what emerges naturally rather than forcing outcomes.`;
  doc.setFont('times', 'normal'); doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const bodyLines: string[] = doc.splitTextToSize(themeBody, contentW);
  for (const bl of bodyLines) { doc.text(bl, MARGIN, y); y += 16; }

  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 2, pw - MARGIN, y + 2);
  y += 18;

  // ── SECTION B: THREE SNAPSHOT CARDS ──
  const cardGap = 10;
  const cardW = (contentW - cardGap * 2) / 3;
  const cardH = 88;

  const sunHouseTheme = HOUSE_THEME_SHORT[sunHouse] || 'A new focus area';
  const moonKeyword = MOON_KEYWORD[srMoonSign] || 'Emotionally attuned';
  const moonPhaseDesc = MOON_PHASE_PLAIN[analysis.moonPhase?.phase || ''] || 'A year of steady inner rhythm';
  const profThemeShort = HOUSE_THEME_SHORT[profHouse] || 'A new chapter';

  interface SnapCard { micro: string; value: string; sub: string }
  const cards: SnapCard[] = [
    { micro: 'WHERE YOUR ENERGY GOES', value: sunHouseTheme, sub: SUN_HOUSE_BODY[sunHouse]?.split('.')[0] + '.' || '' },
    { micro: 'YOUR EMOTIONAL WEATHER', value: moonKeyword, sub: moonPhaseDesc },
    { micro: 'THE FOCUS OF THIS YEAR', value: profThemeShort, sub: profAge != null ? `Year ${profAge}` : '' },
  ];

  for (let i = 0; i < 3; i++) {
    const cx = MARGIN + i * (cardW + cardGap);

    // Tracked caps micro label
    doc.setFont('times', 'normal'); doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text(cards[i].micro, cx + 10, y + 14);
    doc.setCharSpace(0);

    // Value
    doc.setFont('times', 'bold'); doc.setFontSize(13);
    doc.setTextColor(...INK);
    const valLines: string[] = doc.splitTextToSize(cards[i].value, cardW - 20);
    let vy = y + 32;
    for (const vl of valLines.slice(0, 2)) { doc.text(vl, cx + 10, vy); vy += 16; }
    vy += 4;

    // Sub
    doc.setFont('times', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    if (cards[i].sub) {
      const subLines: string[] = doc.splitTextToSize(cards[i].sub, cardW - 20);
      for (const sl of subLines.slice(0, 2)) { doc.text(sl, cx + 10, vy); vy += 11; }
    }

    // Vertical divider
    if (i < 2) {
      doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
      doc.line(cx + cardW + cardGap / 2, y, cx + cardW + cardGap / 2, y + cardH);
    }
  }
  y += cardH + 18;

  // ── SECTION C: HOW THIS YEAR MEETS YOU ──
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3.5);
  doc.text('HOW THIS YEAR MEETS YOU', MARGIN, y);
  doc.setCharSpace(0);
  y += 6;

  // Intro
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Your natal chart is who you are. Your Solar Return shows how this year\'s energy meets that.', MARGIN, y);
  y += 12;

  const bigThreeCards = [
    {
      label: 'YOUR SUN',
      natalTag: natalSunSign, srTag: `H${sunHouse}`,
      headline: getBigThreeSunHeadline(natalSunSign, sunHouse),
      body: SUN_HOUSE_BODY[sunHouse] || 'This year draws your energy toward a meaningful new focus.',
    },
    {
      label: 'YOUR MOON',
      natalTag: natalMoonSign, srTag: srMoonSign,
      headline: getBigThreeMoonHeadline(natalMoonSign, srMoonSign),
      body: MOON_SIGN_BODY[srMoonSign] || 'Your emotional world shifts into a new rhythm this year.',
    },
    {
      label: 'YOUR PRESENCE THIS YEAR',
      natalTag: natalRisingSign, srTag: srRisingSign,
      headline: getBigThreeRisingHeadline(natalRisingSign, srRisingSign),
      body: RISING_BODY[srRisingSign] || 'The way you show up in the world takes on a new quality this year.',
    },
  ];

  for (let i = 0; i < bigThreeCards.length; i++) {
    const card = bigThreeCards[i];

    if (y + 80 > ph - MARGIN_BOTTOM) {
      doc.addPage();
      doc.setFillColor(...CREAM);
      doc.rect(0, 0, pw, ph, 'F');
      y = MARGIN_TOP;
    }

    // Tracked label
    doc.setFont('times', 'normal'); doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(3);
    doc.text(card.label, MARGIN, y);
    doc.setCharSpace(0);

    // Tags right-aligned
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${card.natalTag}  -->  ${card.srTag}`, MARGIN + contentW, y, { align: 'right' });
    y += 12;

    // Headline
    doc.setFont('times', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(card.headline, MARGIN + 8, y);
    y += 14;

    // Body — 2 sentences max for Tier 1
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const bdLines: string[] = doc.splitTextToSize(card.body, contentW - 16);
    for (const bl of bdLines.slice(0, 2)) { doc.text(bl, MARGIN + 8, y); y += 13; }
    y += 4;

    // Hairline rule
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(MARGIN, y, MARGIN + contentW, y);
    y += 10;
  }

  // ── SECTION D: THREE WORDS ──
  if (y + 50 > ph - MARGIN_BOTTOM) {
    doc.addPage();
    doc.setFillColor(...CREAM);
    doc.rect(0, 0, pw, ph, 'F');
    y = MARGIN_TOP;
  }

  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pw - MARGIN, y);
  y += 12;

  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3.5);
  doc.text(`THREE WORDS FOR ${year}`, pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);
  y += 10;

  const dominantEl = analysis.elementBalance?.dominant || 'Fire';
  const w1 = ELEMENT_WORD[dominantEl] || 'Growth';
  const w2 = PROFECTION_WORD[profHouse] || 'Renewal';
  const w3 = MOON_WORD[srMoonSign] || 'Depth';

  doc.setFont('times', 'normal'); doc.setFontSize(16);
  doc.setTextColor(...ACCENT);
  doc.setCharSpace(0.5);
  doc.text(`${w1}  ·  ${w2}  ·  ${w3}`, pw / 2, y + 4, { align: 'center' });
  doc.setCharSpace(0);
  y += 18;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pw - MARGIN, y);

  // Birthday footer
  if (birthdayMode) {
    doc.setFont('times', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Wishing you a beautiful year ahead.', pw / 2, ph - MARGIN_BOTTOM, { align: 'center' });
  }

  doc.save(`Year-at-a-Glance-${year}-${firstName.replace(/\s+/g, '-')}.pdf`);
}

// ─── Big Three headline generators (plain language) ─────────────
function getBigThreeSunHeadline(natalSign: string, srHouse: number): string {
  const houseThemes: Record<number, string> = {
    1: 'finds fresh expression', 2: 'focuses on what truly matters',
    3: 'discovers new ways to communicate', 4: 'turns homeward',
    5: 'lights up with joy and creativity', 6: 'refines daily life',
    7: 'meets itself through others', 8: 'goes deeper than usual',
    9: 'seeks a bigger picture', 10: 'steps into the spotlight',
    11: 'connects with community', 12: 'turns inward for renewal',
  };
  return `Your core self ${houseThemes[srHouse] || 'enters a new chapter'}`;
}

function getBigThreeMoonHeadline(natalMoon: string, srMoon: string): string {
  if (natalMoon && natalMoon === srMoon) return 'Your emotional world stays in familiar territory';
  const qualities: Record<string, string> = {
    Aries: 'quickens and activates', Taurus: 'steadies and grounds',
    Gemini: 'lightens and opens', Cancer: 'deepens and softens',
    Leo: 'warms and brightens', Virgo: 'clarifies and refines',
    Libra: 'seeks harmony and balance', Scorpio: 'intensifies and transforms',
    Sagittarius: 'expands and lifts', Capricorn: 'steadies and clarifies',
    Aquarius: 'detaches and sees clearly', Pisces: 'opens and dissolves boundaries',
  };
  return `Your emotional world ${qualities[srMoon] || 'shifts into new territory'}`;
}

function getBigThreeRisingHeadline(natalRising: string, srRising: string): string {
  if (natalRising && natalRising === srRising) return 'Your natural presence becomes your greatest strength';
  const qualities: Record<string, string> = {
    Aries: 'becomes bolder and more direct', Taurus: 'grounds into quiet confidence',
    Gemini: 'becomes lighter and more curious', Cancer: 'softens and becomes more intuitive',
    Leo: 'becomes more visible and warm', Virgo: 'sharpens and becomes more purposeful',
    Libra: 'becomes more graceful and diplomatic', Scorpio: 'deepens and becomes more magnetic',
    Sagittarius: 'opens up and reaches further', Capricorn: 'becomes more focused and authoritative',
    Aquarius: 'becomes more independent and original', Pisces: 'becomes gentler and more compassionate',
  };
  return `Your presence ${qualities[srRising] || 'takes on a new quality'}`;
}
