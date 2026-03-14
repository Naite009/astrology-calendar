import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const GOLD:  Color = [184, 150, 62];
const CARD_BG: Color = [245, 241, 234];
const CHARCOAL: Color = [58, 54, 50];

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
function ord(n: number): string { return `${n}${getOrdinalSuffix(n)}`; }

const sunStrength: Record<string, string> = {
  Aries: 'Initiative, courage, and the drive to start what others only imagine. You act first and think later — and it usually works.',
  Taurus: 'Steadiness, sensory awareness, and the patience to build things that endure. You are the rock others lean on.',
  Gemini: 'Mental agility, curiosity, and the ability to make connections others miss. You process information faster than anyone in the room.',
  Cancer: 'Emotional intelligence, protective instinct, and the ability to create safety for others. People trust you before they know why.',
  Leo: 'Warmth, creative authority, and the capacity to make others feel celebrated. You light up rooms without trying.',
  Virgo: 'Discernment, analytical precision, and the drive to improve everything you touch. You see what needs fixing.',
  Libra: 'Relational awareness, aesthetic intelligence, and the ability to hold opposing truths without collapsing.',
  Scorpio: 'Emotional depth, penetrating perception, and the refusal to accept anything at face value. You see through pretense.',
  Sagittarius: 'Philosophical reach, restless honesty, and the need to find meaning in everything. You expand whatever you touch.',
  Capricorn: 'Strategic patience, structural thinking, and the ability to build legacies. You play the long game.',
  Aquarius: 'Original thinking, humanitarian awareness, and the ability to see systemic patterns others ignore.',
  Pisces: 'Compassion, creative imagination, and profound sensitivity to what the world needs. You absorb the emotional frequency of every room.',
};
const sunShadow: Record<string, string> = {
  Aries: 'Impatience, impulsivity, and a tendency to bulldoze through situations that require diplomacy. Can mistake aggression for strength.',
  Taurus: 'Stubbornness that masquerades as stability. Resistance to necessary change. Hoarding — material or emotional — out of fear of scarcity.',
  Gemini: 'Scattered attention, superficiality when depth is required, and using wit to deflect emotional vulnerability.',
  Cancer: 'Emotional manipulation through guilt or withdrawal. Smothering under the guise of nurturing. Difficulty letting go.',
  Leo: 'Need for validation that undermines authentic self-expression. Can become domineering when feeling unseen. Takes rejection personally.',
  Virgo: 'Paralysis through perfectionism. Critical inner voice that extends outward. Anxiety disguised as productivity.',
  Libra: 'People-pleasing that erodes identity. Avoiding conflict until it explodes. Indecision as a strategy to avoid accountability.',
  Scorpio: 'Controlling behavior driven by fear of betrayal. Holding grudges as emotional armor. Power struggles in intimate relationships.',
  Sagittarius: 'Restlessness that prevents commitment. Brutal honesty without empathy. Escaping through ideology or travel instead of facing what is here.',
  Capricorn: 'Emotional unavailability disguised as strength. Measuring self-worth through achievement. Difficulty asking for help.',
  Aquarius: 'Emotional detachment presented as objectivity. Contrarianism for its own sake. Difficulty with intimacy and emotional vulnerability.',
  Pisces: 'Boundary dissolution that leads to enmeshment. Escapism through substances, fantasy, or spiritual bypassing. Martyrdom.',
};
const sunYearAhead: Record<number, string> = {
  1: 'Your identity is front and center. This is a year of personal reinvention — how you present yourself, your physical appearance, and your sense of direction are all being reset.',
  2: 'Your strengths are channeled into building financial security and clarifying what you truly value. Income, possessions, and self-worth are the arena.',
  3: 'Your gifts shine through communication — writing, teaching, or conversations that change perspectives.',
  4: 'Your strengths serve your home and family — building emotional foundations and creating sanctuary.',
  5: 'Creative gifts demand expression — romance, art, children, and joyful risk-taking are the assignment.',
  6: 'Your strengths are applied to daily life — health routines, work systems, and practical service.',
  7: 'Your gifts are activated through partnership — what you bring to relationships defines the year.',
  8: 'Your strengths guide you through transformation — deep change, shared resources, and psychological growth.',
  9: 'Your gifts expand through travel, education, and the search for meaning beyond your usual world.',
  10: 'Your strengths are visible to the world — career advancement and public recognition are the theme.',
  11: 'Your gifts serve the collective — friendships, community involvement, and shared purpose.',
  12: 'Your strengths work behind the scenes this year. Inner growth, spiritual practice, solitude, and healing take priority. A quieter year where the most important work is invisible — processing, integrating, and preparing for the next cycle. Dreams may be vivid. Therapy is productive. Time alone is not loneliness, it is replenishment.',
};
const moonStrength: Record<string, string> = {
  Aries: 'Emotional reactions are fast, honest, and courageous. You process feelings through action and movement.',
  Taurus: 'Emotional world is grounded and steady. You bring calm to chaos and make others feel physically safe.',
  Gemini: 'You process feelings through talking, writing, and thinking — naming emotions with precision gives you power over them.',
  Cancer: 'Emotional capacity is enormous. You feel everything deeply and your nurturing instinct is your greatest gift. People feel held in your presence.',
  Leo: 'Emotional warmth lights up rooms. You process feelings through creative expression and generosity of spirit.',
  Virgo: 'You process emotions practically — knowing exactly what someone needs before they ask. Service IS your love language.',
  Libra: 'Emotional world seeks harmony. You process feelings through relationship and dialogue.',
  Scorpio: 'Emotional depth is extraordinary. You feel everything at full intensity and your loyalty is absolute and transformative.',
  Sagittarius: 'Emotional resilience is remarkable. You process feelings through meaning-making, adventure, and philosophical reframing.',
  Capricorn: 'Emotional strength is quiet but immense. You carry responsibilities others cannot and rarely complain.',
  Aquarius: 'Emotional intelligence is innovative. You see patterns in feelings that others miss and can detach enough to help.',
  Pisces: 'Emotional sensitivity is a superpower. You absorb the emotional atmosphere of every space and make people feel truly understood.',
};
const moonShadow: Record<string, string> = {
  Aries: 'Emotional impulsivity — reacting before processing. Anger as a default emotion covering hurt or fear.',
  Taurus: 'Emotional rigidity. Refusing to feel what is uncomfortable. Using food, comfort, or routine to numb.',
  Gemini: 'Intellectualizing emotions to avoid feeling them. Talking about feelings without actually experiencing them.',
  Cancer: 'Emotional flooding, mood swings, and using guilt to maintain closeness. Can confuse enmeshment with love.',
  Leo: 'Needing to be the emotional center of attention. Dramatizing feelings. Wounded pride masquerading as heartbreak.',
  Virgo: 'Anxiety as the dominant emotional state. Self-criticism that erodes confidence.',
  Libra: 'Suppressing negative emotions to keep the peace. Emotional dependency on others\' approval.',
  Scorpio: 'Emotional intensity that overwhelms partners. Using emotional withdrawal as punishment. Trust issues.',
  Sagittarius: 'Avoiding deep emotional processing by staying busy or leaving. Emotional impatience with others\' pain.',
  Capricorn: 'Suppressing emotions as weakness. Difficulty being vulnerable. Showing up as emotionally cold when actually overwhelmed.',
  Aquarius: 'Detaching from emotions when they become inconvenient. Treating feelings as problems to solve rather than experiences to have.',
  Pisces: 'Absorbing others\' emotions and losing yourself. Escapism. Difficulty distinguishing your feelings from someone else\'s.',
};
const moonYearAhead: Record<number, string> = {
  1: 'Emotional needs are front and center. Others perceive your moods more clearly.',
  2: 'Emotional security is tied to finances and material stability this year.',
  3: 'Emotional processing happens through conversation and writing.',
  4: 'Home and family are the emotional center. Domestic changes affect everything.',
  5: 'Emotional fulfillment comes through creativity, romance, and play.',
  6: 'Emotional state directly affects physical health. Daily routines are emotionally significant.',
  7: 'Emotional needs are met (or frustrated) through partnerships.',
  8: 'Deep emotional processing, intimacy, and shared vulnerability define the year.',
  9: 'Emotional growth through travel, study, or exposure to different worldviews.',
  10: 'Emotional investment in career and public role.',
  11: 'Emotional fulfillment through friendships and community.',
  12: 'Emotions are internalized. Solitude is needed for processing.',
};
const srMoonSignActivation: Record<string, (natalSign: string) => string> = {
  Aries: (natal) => `Your SR Moon in Aries pushes your natal ${natal} Moon toward action and independence. Emotions come fast and demand immediate expression.`,
  Taurus: (natal) => `Your SR Moon in Taurus grounds your natal ${natal} Moon in physical comfort and stability. Emotions slow down this year.`,
  Gemini: (natal) => `Your SR Moon in Gemini activates your natal ${natal} Moon through communication. You process feelings by talking, texting, and writing.`,
  Cancer: (natal) => `Your SR Moon in Cancer amplifies your natal ${natal} Moon's deepest needs. Vulnerability feels more accessible.`,
  Leo: (natal) => `Your SR Moon in Leo activates your natal ${natal} Moon through creative self-expression and visibility.`,
  Virgo: (natal) => `Your SR Moon in Virgo channels your natal ${natal} Moon into practical service and self-improvement.`,
  Libra: (natal) => `Your SR Moon in Libra filters your natal ${natal} Moon through relationships. Emotional balance depends on partnership harmony.`,
  Scorpio: (natal) => `Your SR Moon in Scorpio intensifies your natal ${natal} Moon dramatically. Emotional depth is unavoidable.`,
  Sagittarius: (natal) => `Your SR Moon in Sagittarius expands your natal ${natal} Moon toward adventure and meaning.`,
  Capricorn: (natal) => `Your SR Moon in Capricorn disciplines your natal ${natal} Moon. Emotions are managed through structure, responsibility, and achievement. Emotional maturity is the assignment. You process feelings by taking responsibility and building something lasting.`,
  Aquarius: (natal) => `Your SR Moon in Aquarius detaches your natal ${natal} Moon just enough to see patterns clearly.`,
  Pisces: (natal) => `Your SR Moon in Pisces dissolves boundaries around your natal ${natal} Moon. Intuition is heightened.`,
};
const risingStrength: Record<string, string> = {
  Aries: 'People experience you as bold, direct, and energizing. You walk into a room and things start happening.',
  Taurus: 'People experience you as calm, reliable, and aesthetically aware. Your presence is grounding and stabilizing.',
  Gemini: 'People experience you as quick, interesting, and mentally stimulating. You adapt to any social environment.',
  Cancer: 'People experience you as warm, approachable, and emotionally perceptive. People trust you instinctively.',
  Leo: 'People experience you as radiant, confident, and generous. You have a natural presence that draws attention.',
  Virgo: 'People experience you as competent, helpful, and thoughtfully observant. You notice what others overlook and your practical intelligence is immediately apparent.',
  Libra: 'People experience you as charming, balanced, and socially graceful. You create harmony in any environment.',
  Scorpio: 'People experience you as intense, magnetic, and deeply perceptive. You see through surface presentations.',
  Sagittarius: 'People experience you as adventurous, honest, and inspiring. Your enthusiasm is contagious.',
  Capricorn: 'People experience you as mature, capable, and quietly authoritative. You command respect without demanding it.',
  Aquarius: 'People experience you as unique, intellectually fascinating, and refreshingly unconventional.',
  Pisces: 'People experience you as gentle, intuitive, and creatively inspired.',
};
const risingShadow: Record<string, string> = {
  Aries: 'Can come across as aggressive, impatient, or self-centered without realizing it.',
  Taurus: 'Can appear stubborn, slow to engage, or overly materialistic.',
  Gemini: 'Can seem scattered, unreliable, or superficial. May talk too much when nervous.',
  Cancer: 'Can appear moody, clingy, or overly protective.',
  Leo: 'Can come across as attention-seeking, dramatic, or dominating conversations.',
  Virgo: 'Can appear critical, anxious, or overly cautious. Perfectionism that makes you excellent can also make you hesitant to act until conditions are ideal — they rarely are.',
  Libra: 'Can seem indecisive, people-pleasing, or conflict-avoidant.',
  Scorpio: 'Can appear intimidating, suspicious, or emotionally guarded.',
  Sagittarius: 'Can seem preachy, tactless, or unable to take things seriously.',
  Capricorn: 'Can appear cold, unapproachable, or overly serious.',
  Aquarius: 'Can seem detached, contrarian, or emotionally unavailable.',
  Pisces: 'Can appear vague, passive, or easily overwhelmed.',
};
const risingYearAhead: Record<string, string> = {
  Aries: 'The year\'s energy enters through bold action and initiative. First impressions are stronger.',
  Taurus: 'The year unfolds slowly and deliberately. Financial and material themes color every area.',
  Gemini: 'Communication drives the year. Information comes from multiple directions.',
  Cancer: 'Emotional and domestic themes dominate the year\'s entry point.',
  Leo: 'The year demands creative self-expression and visibility.',
  Virgo: 'The year enters through detailed analysis and practical improvement.',
  Libra: 'Relationships are the gateway to the year.',
  Scorpio: 'The year enters through intensity, transformation, and depth.',
  Sagittarius: 'The year opens through expansion — travel, education, or philosophical growth.',
  Capricorn: 'The year enters through structure, responsibility, and ambition.',
  Aquarius: 'The year opens through innovation, community, and breaking from convention.',
  Pisces: 'The year enters through intuition, creativity, and spiritual sensitivity. The boundary between inner and outer life is thin. Dreams and subtle impressions carry real information. The challenge is staying grounded while remaining open to what cannot be measured.',
};

export function generateStrengthsPortrait(
  ctx: PDFContext, doc: jsPDF, natalChart: NatalChart, analysis: SolarReturnAnalysis
) {
  const { pw, margin, contentW } = ctx;
  const sunSign = natalChart.planets?.Sun?.sign || '';
  const moonSign = natalChart.planets?.Moon?.sign || '';
  const risingSign = natalChart.houseCusps?.house1?.sign || '';
  const srSunHouse = analysis.planetSRHouses?.['Sun'];
  const srMoonHouse = analysis.planetSRHouses?.['Moon'];
  const srAscSign = analysis.yearlyTheme?.ascendantSign || '';
  const srMoonSign = analysis.moonSign || '';

  // ── Force new page for this section ──
  ctx.pageBg(doc);
  ctx.y += 28;

  // Tracked label
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('YOUR BIG THREE', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 12;

  // Hairline
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 32;

  // Large serif display title — renamed
  doc.setFont('times', 'normal'); doc.setFontSize(32);
  doc.setTextColor(...INK);
  doc.text('The Natal-to-Return Shift', margin, ctx.y);
  ctx.y += 16;

  doc.setFont('times', 'italic'); doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text('How this year activates your natal strengths', margin, ctx.y);
  ctx.y += 36;

  // ── Render each planet as a clean editorial card ──
  const renderPlanetSpread = (
    planetLabel: string,
    natalTag: string,
    srTag: string,
    heading: string,
    strengthText: string,
    shadowText: string,
    yearLabel: string,
    yearText: string,
    extraLabel?: string,
    extraText?: string,
  ) => {
    ctx.checkPage(320);

    // ── Header strip — white background with charcoal text (print-friendly) ──
    const stripH = 62;
    const stripY = ctx.y;
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, stripY, contentW, stripH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, stripY, contentW, stripH, 3, 3, 'S');

    // Gold accent bar on left
    doc.setFillColor(...GOLD);
    doc.rect(margin, stripY, 3, stripH, 'F');

    // Planet label in gold — larger font
    doc.setFont('times', 'bold'); doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3);
    doc.text(planetLabel, margin + 16, stripY + 22);
    doc.setCharSpace(0);

    // Large heading in charcoal — increased size
    doc.setFont('times', 'bold'); doc.setFontSize(26);
    doc.setTextColor(...CHARCOAL);
    doc.text(heading, margin + 16, stripY + 48);

    // Natal → SR tags on right (clean arrow instead of glyph)
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text(`${natalTag}  →  ${srTag}`, pw - margin - 16, stripY + 48, { align: 'right' });

    ctx.y = stripY + stripH + 22;

    // ── STRENGTH block ──
    doc.setFont('times', 'bold'); doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3);
    doc.text('STRENGTH', margin + 8, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 16;

    ctx.writeBody(doc, strengthText, INK, 11, 17);
    ctx.y += 16;

    // ── SHADOW block ──
    doc.setFont('times', 'bold'); doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(3);
    doc.text('SHADOW', margin + 8, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 16;

    ctx.writeBody(doc, shadowText, INK, 11, 17);
    ctx.y += 18;

    // ── Year activation — nested card ──
    if (yearText) {
      ctx.writeCardSection(doc, yearLabel, yearText);
    }

    // Extra section
    if (extraLabel && extraText) {
      ctx.writeCardSection(doc, extraLabel, extraText);
    }

    // Bottom rule
    ctx.y += 10;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.2);
    doc.line(margin + 20, ctx.y, pw - margin - 20, ctx.y);
    ctx.y += 28;
  };

  // ── SUN ──
  if (sunSign && sunStrength[sunSign]) {
    const houseLabel = srSunHouse ? `SR ${ord(srSunHouse)} House` : '';
    renderPlanetSpread(
      `SUN IN ${sunSign.toUpperCase()}`,
      sunSign,
      houseLabel,
      `Sun in ${sunSign}`,
      sunStrength[sunSign],
      sunShadow[sunSign] || '',
      'What This Means For Your Year',
      srSunHouse ? (sunYearAhead[srSunHouse] || '') : '',
    );
  }

  // ── MOON ──
  if (moonSign && moonStrength[moonSign]) {
    const moonHouseLabel = srMoonHouse ? `SR ${ord(srMoonHouse)} House` : '';
    const srMoonActivation = srMoonSign && srMoonSignActivation[srMoonSign]
      ? srMoonSignActivation[srMoonSign](moonSign)
      : '';

    renderPlanetSpread(
      `MOON IN ${moonSign.toUpperCase()}`,
      moonSign,
      `${srMoonSign} Moon → ${moonHouseLabel}`,
      `Moon in ${moonSign}`,
      moonStrength[moonSign],
      moonShadow[moonSign] || '',
      'Emotional Climate This Year',
      srMoonHouse ? (moonYearAhead[srMoonHouse] || '') : '',
      srMoonActivation ? 'Moon Sign Activation' : undefined,
      srMoonActivation || undefined,
    );
  }

  // ── RISING ──
  if (risingSign && risingStrength[risingSign]) {
    renderPlanetSpread(
      `RISING IN ${risingSign.toUpperCase()}`,
      risingSign,
      `${srAscSign} Rising`,
      `${risingSign} Rising`,
      risingStrength[risingSign],
      risingShadow[risingSign] || '',
      'How You Show Up This Year',
      risingYearAhead[srAscSign] || '',
    );
  }

  ctx.sectionDivider(doc);
}
