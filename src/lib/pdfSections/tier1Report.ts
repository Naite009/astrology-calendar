/**
 * Tier 1 Solar Return PDF — "Your Year at a Glance"
 * A premium 1–2 page editorial report. Kinfolk meets astrology.
 */
import jsPDF from 'jspdf';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

type Color = [number, number, number];

// ─── Design Tokens ──────────────────────────────────────────────────
const T1 = {
  ink:       [30, 28, 26]   as Color,
  body:      [70, 65, 60]   as Color,
  dim:       [140, 135, 128] as Color,
  faint:     [185, 180, 173] as Color,
  rule:      [210, 205, 198] as Color,
  cream:     [248, 245, 240] as Color,
  warmWhite: [252, 250, 248] as Color,
  glyphGray: [190, 185, 178] as Color,
};

const MARGIN_H = 52;
const MARGIN_V = 44;

// ─── Lookup Tables ──────────────────────────────────────────────────
const SUN_SIGN_GLYPHS: Record<string, string> = {
  Aries: '\u2648', Taurus: '\u2649', Gemini: '\u264A', Cancer: '\u264B',
  Leo: '\u264C', Virgo: '\u264D', Libra: '\u264E', Scorpio: '\u264F',
  Sagittarius: '\u2650', Capricorn: '\u2651', Aquarius: '\u2652', Pisces: '\u2653',
};

const HOUSE_THEME_PLAIN: Record<number, string> = {
  1: 'Your identity & self-image', 2: 'Your finances & self-worth',
  3: 'Communication & learning', 4: 'Home & family',
  5: 'Creativity & joy', 6: 'Health & daily routines',
  7: 'Your relationships', 8: 'Transformation & shared resources',
  9: 'Travel & big-picture vision', 10: 'Career & public life',
  11: 'Community & friendships', 12: 'Rest & inner world',
};

const PROFECTION_THEME_PLAIN: Record<number, string> = {
  1: 'Identity & new beginnings', 2: 'Resources & self-worth',
  3: 'Expression & curiosity', 4: 'Home & roots',
  5: 'Joy & creativity', 6: 'Service & wellbeing',
  7: 'Partnerships & commitments', 8: 'Transformation & depth',
  9: 'Expansion & meaning', 10: 'Purpose & legacy',
  11: 'Community & vision', 12: 'Surrender & reflection',
};

const MOON_KEYWORD: Record<string, string> = {
  Aries: 'Emotionally bold', Taurus: 'Emotionally grounded', Gemini: 'Emotionally curious',
  Cancer: 'Emotionally deep', Leo: 'Emotionally radiant', Virgo: 'Emotionally discerning',
  Libra: 'Emotionally balanced', Scorpio: 'Emotionally intense', Sagittarius: 'Emotionally adventurous',
  Capricorn: 'Emotionally steady', Aquarius: 'Emotionally independent', Pisces: 'Emotionally intuitive',
};

const ELEMENT_WORD: Record<string, string> = {
  Fire: 'Ignition', Earth: 'Building', Air: 'Clarity', Water: 'Depth',
};

const PROFECTION_WORD: Record<number, string> = {
  1: 'Identity', 2: 'Resources', 3: 'Expression', 4: 'Home',
  5: 'Joy', 6: 'Service', 7: 'Partnership', 8: 'Transformation',
  9: 'Expansion', 10: 'Purpose', 11: 'Community', 12: 'Surrender',
};

const MOON_WORD: Record<string, string> = {
  Aries: 'Courage', Taurus: 'Patience', Gemini: 'Curiosity', Cancer: 'Nurture',
  Leo: 'Radiance', Virgo: 'Discernment', Libra: 'Balance', Scorpio: 'Depth',
  Sagittarius: 'Freedom', Capricorn: 'Mastery', Aquarius: 'Vision', Pisces: 'Surrender',
};

const SR_ASC_PLAIN: Record<string, string> = {
  Aries: 'You are showing up this year with directness and boldness. People see you as someone ready to act, full of initiative and fresh energy. This is a year to lead with courage and let yourself be visible.',
  Taurus: 'You are showing up this year with calm steadiness. People sense your groundedness and reliability. This is a year to move deliberately, build something lasting, and trust your own pace.',
  Gemini: 'You are showing up this year with curiosity and adaptability. People experience you as engaging, communicative, and mentally sharp. This is a year of conversations that change your direction.',
  Cancer: 'You are showing up this year with warmth and emotional sensitivity. Others feel your care and protectiveness. This is a year where your intuition guides you more than your logic.',
  Leo: 'You are showing up this year with confidence and creative energy. People are drawn to your warmth and presence. This is a year to step into the spotlight and let yourself shine.',
  Virgo: 'You are showing up this year with precision and thoughtfulness. People notice your competence and attention to detail. This is a year to refine, improve, and master the essentials.',
  Libra: 'You are showing up this year with grace and a desire for harmony. People experience you as diplomatic and fair-minded. This is a year where relationships shape your path forward.',
  Scorpio: 'You are showing up this year with intensity and depth. People sense something powerful beneath the surface. This is a year of transformation — shedding what is no longer authentic.',
  Sagittarius: 'You are showing up this year with optimism and an appetite for adventure. People see your enthusiasm and openness. This is a year to expand your world through travel, learning, or bold choices.',
  Capricorn: 'You are showing up this year with authority and quiet determination. People respect your seriousness and ambition. This is a year to build, commit, and take on greater responsibility.',
  Aquarius: 'You are showing up this year with originality and independence. People notice your unconventional perspective. This is a year to innovate, connect with your community, and trust your unique vision.',
  Pisces: 'You are showing up this year with gentleness and deep empathy. People feel your compassion and intuitive understanding. This is a year where creativity, spirituality, and letting go open unexpected doors.',
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
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function capitalizeLocation(loc: string | undefined): string {
  if (!loc) return '';
  return loc.replace(/\b\w+/g, w => w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function rule(doc: jsPDF, x1: number, x2: number, y: number) {
  doc.setDrawColor(...T1.rule); doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
}

function eyebrow(doc: jsPDF, text: string, x: number, y: number, align: 'left' | 'center' | 'right' = 'left') {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...T1.dim); doc.setCharSpace(0.8);
  doc.text(text.toUpperCase(), x, y, { align }); doc.setCharSpace(0);
}

function moonPhasePlain(phase: string | undefined): string {
  if (!phase) return 'A year of steady inner rhythm';
  const map: Record<string, string> = {
    'New Moon': 'New Moon year — fresh start energy',
    'Waxing Crescent': 'Building momentum — early effort rewarded',
    'First Quarter': 'Decision point year — time to commit',
    'Waxing Gibbous': 'Refining year — adjust and improve',
    'Full Moon': 'Full Moon year — completion energy',
    'Waning Gibbous': 'Sharing year — teach and give back',
    'Last Quarter': 'Release year — let go of what\'s outgrown',
    'Balsamic': 'Rest year — preparing for a fresh cycle',
    'Balsamic Moon': 'Rest year — preparing for a fresh cycle',
  };
  return map[phase] || 'A year of inner reflection';
}

function stripHouseNumbers(text: string): string {
  return text
    .replace(/\b(\d+)(st|nd|rd|th)\s*house\b/gi, '')
    .replace(/\bSR\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
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
  const contentW = pw - MARGIN_H * 2;

  const name = natalChart.name || 'You';
  const firstName = name.split(/\s+/)[0];
  const year = srChart.solarReturnYear;
  const sunSign = natalChart.planets?.Sun?.sign || '';
  const srSunSign = srChart.planets.Sun?.sign || sunSign;
  const srMoonSign = analysis.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.planets.Ascendant?.sign || analysis.yearlyTheme?.ascendantSign || '';

  // ════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════════════════
  let y = 52;

  // Brand mark
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...T1.dim); doc.setCharSpace(1.5);
  doc.text('MAGICO FI', pw / 2, y, { align: 'center' }); doc.setCharSpace(0);
  y += 14;

  // Top rule
  rule(doc, MARGIN_H + 40, pw - MARGIN_H - 40, y);
  y += 36;

  // Title block
  doc.setFont('helvetica', 'normal'); doc.setFontSize(28);
  doc.setTextColor(...T1.ink);
  doc.text('Solar Return', pw / 2, y, { align: 'center' });
  y += 22;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(14);
  doc.setTextColor(...T1.dim);
  doc.text(String(year), pw / 2, y, { align: 'center' });
  y += 28;

  // Name block
  doc.setFont('helvetica', 'italic'); doc.setFontSize(13);
  doc.setTextColor(...T1.dim);
  doc.text(`${firstName}'s`, pw / 2, y, { align: 'center' });
  y += 22;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(36);
  doc.setTextColor(...T1.ink);
  doc.text('Year Ahead', pw / 2, y, { align: 'center' });
  y += 32;

  // Cake image or glyph
  if (birthdayMode) {
    const cakeImgSrc = cakeImages[sunSign];
    if (cakeImgSrc) {
      const dataUrl = await loadImageDataUrl(cakeImgSrc);
      if (dataUrl) {
        doc.addImage(dataUrl, 'PNG', (pw - 200) / 2, y, 200, 170);
        y += 170;
      } else { y += 10; }
    } else { y += 10; }
  } else {
    // Large typographic glyph — try Unicode first, fall back to sign name
    const glyph = SUN_SIGN_GLYPHS[sunSign];
    if (glyph) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(72);
      doc.setTextColor(...T1.glyphGray);
      // Test if the glyph renders (jsPDF may not have it)
      try {
        doc.text(glyph, pw / 2, y + 60, { align: 'center' });
        y += 90;
      } catch {
        // Fallback: sign name in light italic
        doc.setFont('helvetica', 'italic'); doc.setFontSize(28);
        doc.setTextColor(...T1.glyphGray);
        doc.text(sunSign, pw / 2, y + 30, { align: 'center' });
        y += 50;
      }
    } else {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(28);
      doc.setTextColor(...T1.glyphGray);
      doc.text(sunSign, pw / 2, y + 30, { align: 'center' });
      y += 50;
    }
  }
  y += 28;

  // Bottom rule
  rule(doc, MARGIN_H + 40, pw - MARGIN_H - 40, y);
  y += 16;

  // SR Big 3 line
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...T1.dim); doc.setCharSpace(0.3);
  const big3Line = `Sun in ${srSunSign}  ·  Moon in ${srMoonSign}  ·  ${srRisingSign} Rising`;
  doc.text(big3Line, pw / 2, y, { align: 'center' }); doc.setCharSpace(0);
  y += 12;

  // Birth info
  const birthLine = `Born ${formatDatePretty(natalChart.birthDate)}  ·  ${capitalizeLocation(natalChart.birthLocation)}`;
  doc.setFontSize(8); doc.setTextColor(...T1.faint);
  doc.text(birthLine, pw / 2, y, { align: 'center' });
  y += 12;

  // SR location
  if (srChart.solarReturnLocation) {
    doc.text(`SR location: ${capitalizeLocation(srChart.solarReturnLocation)}`, pw / 2, y, { align: 'center' });
    y += 12;
  }

  // Personal message (birthday mode)
  if (birthdayMode && personalMessage.trim()) {
    y = Math.max(y + 8, ph - 160);
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 40);
    const msgH = msgLines.length * 14 + 20;
    doc.setFillColor(...T1.cream); doc.setDrawColor(...T1.rule); doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_H + 20, y, contentW - 40, msgH, 4, 4, 'FD');
    doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(100, 95, 90);
    let msgY = y + 14;
    for (const line of msgLines) { doc.text(line, pw / 2, msgY, { align: 'center' }); msgY += 14; }
    y += msgH + 8;
  }

  // Footer
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...T1.faint);
  doc.text('magico.fi', pw / 2, ph - 30, { align: 'center' });

  // ════════════════════════════════════════════════════════════════
  // PAGE 2 — CONTENT
  // ════════════════════════════════════════════════════════════════
  doc.addPage();
  y = MARGIN_V;

  // Page header
  eyebrow(doc, 'YOUR YEAR AT A GLANCE', MARGIN_H, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...T1.faint);
  doc.text(`${firstName}  ·  Solar Return ${year}`, pw - MARGIN_H, y, { align: 'right' });
  y += 10;
  rule(doc, MARGIN_H, pw - MARGIN_H, y);
  y += 16;

  // ── SECTION 1: THE YEAR'S THEME ──
  eyebrow(doc, "THIS YEAR'S THEME", MARGIN_H, y);
  y += 12;

  const themeHeadline = analysis.yearlyTheme
    ? `A ${analysis.yearlyTheme.ascendantSign} Year — guided by ${analysis.yearlyTheme.ascendantRuler}`
    : `A Year of Growth`;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(22);
  doc.setTextColor(...T1.ink);
  const headLines: string[] = doc.splitTextToSize(themeHeadline, contentW);
  for (const hl of headLines) { doc.text(hl, MARGIN_H, y); y += 27; }
  y += 4;

  const themeSummary = analysis.yearlyTheme
    ? stripHouseNumbers(analysis.yearlyTheme.yearTheme)
    : 'This year brings fresh energy and new directions into your life.';
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...T1.body);
  const sumLines: string[] = doc.splitTextToSize(themeSummary, contentW);
  for (const sl of sumLines.slice(0, 4)) { doc.text(sl, MARGIN_H, y); y += 16; }
  y += 14;

  rule(doc, MARGIN_H, pw - MARGIN_H, y);
  y += 16;

  // ── SECTION 2: THREE SNAPSHOT CARDS ──
  const cardGap = 8;
  const cardW = (contentW - cardGap * 2) / 3;
  const cardH = 80;

  const sunHouseTheme = analysis.sunHouse?.house
    ? (HOUSE_THEME_PLAIN[analysis.sunHouse.house] || 'A new focus area')
    : 'Your core direction';
  const moonKeyword = MOON_KEYWORD[srMoonSign] || 'Emotionally attuned';
  const moonPhaseDesc = moonPhasePlain(analysis.moonPhase?.phase);
  const profHouse = analysis.profectionYear?.houseNumber || 1;
  const profAge = analysis.profectionYear?.age;
  const profTheme = PROFECTION_THEME_PLAIN[profHouse] || 'A new chapter';

  const cards = [
    { label: 'LIFE FOCUS', value: sunHouseTheme, sub: `Sun in ${srSunSign} energy` },
    { label: 'INNER WORLD', value: moonKeyword, sub: moonPhaseDesc },
    { label: 'THIS YEAR ACTIVATES', value: profTheme, sub: profAge != null ? `Age ${profAge}  ·  ${ordinal(profHouse)} house year` : '' },
  ];

  for (let i = 0; i < 3; i++) {
    const cx = MARGIN_H + i * (cardW + cardGap);
    doc.setDrawColor(...T1.rule); doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cardW, cardH, 3, 3, 'S');

    eyebrow(doc, cards[i].label, cx + 10, y + 16);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.setTextColor(...T1.ink);
    const valLines: string[] = doc.splitTextToSize(cards[i].value, cardW - 20);
    let vy = y + 32;
    for (const vl of valLines.slice(0, 2)) { doc.text(vl, cx + 10, vy); vy += 15; }

    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...T1.dim);
    if (cards[i].sub) {
      const subLines: string[] = doc.splitTextToSize(cards[i].sub, cardW - 20);
      for (const sl of subLines.slice(0, 2)) { doc.text(sl, cx + 10, vy); vy += 12; }
    }
  }
  y += cardH + 18;

  // ── SECTION 3: YOUR RISING TONE ──
  eyebrow(doc, 'YOUR RISING TONE', MARGIN_H, y);
  y += 12;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.setTextColor(...T1.ink);
  doc.text(`${srRisingSign} Rising This Year`, MARGIN_H, y);
  y += 14;

  const risingText = SR_ASC_PLAIN[srRisingSign] || `This year you are showing up with ${srRisingSign} energy — a distinctive tone that colors every interaction.`;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  doc.setTextColor(...T1.body);
  const risingLines: string[] = doc.splitTextToSize(risingText, contentW);
  for (const rl of risingLines) { doc.text(rl, MARGIN_H, y); y += 15; }
  y += 18;

  // ── SECTION 4: THREE WORDS FOR YOUR YEAR ──
  rule(doc, MARGIN_H, pw - MARGIN_H, y);
  y += 14;

  eyebrow(doc, `THREE WORDS FOR ${year}`, pw / 2, y, 'center');
  y += 16;

  const dominantEl = analysis.elementBalance?.dominant || 'Fire';
  const w1 = ELEMENT_WORD[dominantEl] || 'Growth';
  const w2 = PROFECTION_WORD[profHouse] || 'Renewal';
  const w3 = MOON_WORD[srMoonSign] || 'Depth';

  doc.setFont('helvetica', 'normal'); doc.setFontSize(16);
  doc.setTextColor(90, 85, 80); doc.setCharSpace(0.5);
  doc.text(`${w1}    ·    ${w2}    ·    ${w3}`, pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // ── SECTION 5: FOOTER ──
  rule(doc, MARGIN_H, pw - MARGIN_H, ph - MARGIN_V - 20);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
  doc.setTextColor(...T1.faint);
  doc.text('For a deeper reading of your solar return year, explore Tier 2 and beyond at magico.fi', pw / 2, ph - MARGIN_V - 8, { align: 'center' });

  // Page number
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...T1.faint);
  doc.text('2', pw / 2, ph - 20, { align: 'center' });

  // ── SAVE ──
  doc.save(`Year-at-a-Glance-${year}-${firstName.replace(/\s+/g, '-')}.pdf`);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
