import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];

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
  1: 'Your identity is front and center. This is a year of personal reinvention — how you present yourself, your physical appearance, and your sense of direction are all being reset. Others notice the change.',
  2: 'Your strengths are channeled into building financial security and clarifying what you truly value. Income, possessions, and self-worth are the arena.',
  3: 'Your gifts shine through communication — writing, teaching, or conversations that change perspectives. Siblings and neighbors may play a larger role.',
  4: 'Your strengths serve your home and family — building emotional foundations and creating sanctuary. May involve a move, renovation, or family reckoning.',
  5: 'Creative gifts demand expression — romance, art, children, and joyful risk-taking are the assignment. What you create this year reflects your essence.',
  6: 'Your strengths are applied to daily life — health routines, work systems, and practical service. The body is a teacher this year.',
  7: 'Your gifts are activated through partnership — what you bring to relationships defines the year. Contracts and commitments are central.',
  8: 'Your strengths guide you through transformation — deep change, shared resources, and psychological growth. Something needs to end so something real can begin.',
  9: 'Your gifts expand through travel, education, and the search for meaning beyond your usual world. Publishing, teaching, or legal matters may feature.',
  10: 'Your strengths are visible to the world — career advancement and public recognition are the theme. Professional responsibility increases.',
  11: 'Your gifts serve the collective — friendships, community involvement, and shared purpose. Your social network is being restructured.',
  12: 'Your strengths work behind the scenes this year. Inner growth, spiritual practice, solitude, and healing take priority. A quieter year where the most important work is invisible — processing, integrating, and preparing for the next cycle. Dreams may be vivid. Therapy is productive. Time alone is not loneliness, it is replenishment.',
};
const moonStrength: Record<string, string> = {
  Aries: 'Emotional reactions are fast, honest, and courageous. You process feelings through action and movement.',
  Taurus: 'Emotional world is grounded and steady. You bring calm to chaos and make others feel physically safe.',
  Gemini: 'You process feelings through talking, writing, and thinking — naming emotions with precision gives you power over them.',
  Cancer: 'Emotional capacity is enormous. You feel everything deeply and your nurturing instinct is your greatest gift. People feel held in your presence.',
  Leo: 'Emotional warmth lights up rooms. You process feelings through creative expression and generosity of spirit.',
  Virgo: 'You process emotions practically — knowing exactly what someone needs before they ask. Service IS your love language.',
  Libra: 'Emotional world seeks harmony. You process feelings through relationship and dialogue — isolation is destabilizing.',
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
  Virgo: 'Anxiety as the dominant emotional state. Self-criticism that erodes confidence. Worry as a way to feel in control.',
  Libra: 'Suppressing negative emotions to keep the peace. Emotional dependency on others\' approval.',
  Scorpio: 'Emotional intensity that overwhelms partners. Using emotional withdrawal as punishment. Trust issues.',
  Sagittarius: 'Avoiding deep emotional processing by staying busy or leaving. Emotional impatience with others\' pain.',
  Capricorn: 'Suppressing emotions as weakness. Difficulty being vulnerable. Showing up as emotionally cold when actually overwhelmed.',
  Aquarius: 'Detaching from emotions when they become inconvenient. Treating feelings as problems to solve rather than experiences to have.',
  Pisces: 'Absorbing others\' emotions and losing yourself. Escapism. Difficulty distinguishing your feelings from someone else\'s.',
};
const moonYearAhead: Record<number, string> = {
  1: 'Emotional needs are front and center. Others perceive your moods more clearly. The body reflects emotional states directly.',
  2: 'Emotional security is tied to finances and material stability this year. Spending may reflect emotional states.',
  3: 'Emotional processing happens through conversation and writing. Sibling relationships carry emotional weight.',
  4: 'Home and family are the emotional center. Domestic changes affect everything. Need for a safe base is amplified.',
  5: 'Emotional fulfillment comes through creativity, romance, and play. Heart-led decisions dominate.',
  6: 'Emotional state directly affects physical health. Daily routines are emotionally significant. Work environment matters deeply.',
  7: 'Emotional needs are met (or frustrated) through partnerships. Relationship dynamics are the primary emotional teacher.',
  8: 'Deep emotional processing, intimacy, and shared vulnerability define the year. Emotional intensity is high.',
  9: 'Emotional growth through travel, study, or exposure to different worldviews. Restlessness signals the need for expansion.',
  10: 'Emotional investment in career and public role. Professional life carries personal emotional weight.',
  11: 'Emotional fulfillment through friendships and community. Social connections carry unusual emotional significance.',
  12: 'Emotions are internalized. Solitude is needed for processing. Dreams, meditation, and unconscious patterns are active.',
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
  Capricorn: (natal) => `Your SR Moon in Capricorn disciplines your natal ${natal} Moon. Emotions are managed through structure and responsibility.`,
  Aquarius: (natal) => `Your SR Moon in Aquarius detaches your natal ${natal} Moon just enough to see patterns clearly.`,
  Pisces: (natal) => `Your SR Moon in Pisces dissolves boundaries around your natal ${natal} Moon. Intuition is heightened.`,
};
const risingStrength: Record<string, string> = {
  Aries: 'People experience you as bold, direct, and energizing. You walk into a room and things start happening.',
  Taurus: 'People experience you as calm, reliable, and aesthetically aware. Your presence is grounding and stabilizing.',
  Gemini: 'People experience you as quick, interesting, and mentally stimulating. You adapt to any social environment.',
  Cancer: 'People experience you as warm, approachable, and emotionally perceptive. People trust you instinctively.',
  Leo: 'People experience you as radiant, confident, and generous. You have a natural presence that draws attention.',
  Virgo: 'People experience you as competent, helpful, and thoughtfully observant.',
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
  Virgo: 'Can appear critical, anxious, or overly cautious.',
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
  Pisces: 'The year enters through intuition, creativity, and spiritual sensitivity.',
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

  const textW = contentW;

  // ── Section header ──
  ctx.pageBg(doc);
  ctx.y += 8;
  ctx.trackedLabel(doc, '02 · YOUR BIG THREE', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;

  doc.setFont('times', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Natal strengths, shadow patterns, and how this year activates each one.', margin, ctx.y);
  ctx.y += 20;

  // ── Render each planet section ──
  const renderPlanetSection = (
    planetLabel: string,
    locationLabel: string,
    heading: string,
    strengthText: string,
    shadowText: string,
    yearLabel: string,
    yearText: string,
    extraLabel?: string,
    extraText?: string,
  ) => {
    ctx.checkPage(200);

    // Planet label line — tracked caps
    ctx.trackedLabel(doc, planetLabel, margin, ctx.y, { charSpace: 3 });
    ctx.y += 8;

    // Hairline rule
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 14;

    // Planet name heading
    doc.setFont('times', 'bold'); doc.setFontSize(18);
    doc.setTextColor(...INK);
    doc.text(heading, margin, ctx.y);
    ctx.y += 18;

    // Two-column strength/shadow block
    const colW = (textW - 20) / 2;

    // Left: STRENGTH
    const leftX = margin;
    const rightX = margin + colW + 20;
    const colStartY = ctx.y;

    ctx.trackedLabel(doc, 'STRENGTH', leftX, ctx.y, { charSpace: 3 });
    let leftY = ctx.y + 10;
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const sLines: string[] = doc.splitTextToSize(strengthText, colW);
    for (const line of sLines) { doc.text(line, leftX, leftY); leftY += 14; }

    // Right: SHADOW
    ctx.trackedLabel(doc, 'SHADOW', rightX, colStartY, { charSpace: 3 });
    let rightY = colStartY + 10;
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const shLines: string[] = doc.splitTextToSize(shadowText, colW);
    for (const line of shLines) { doc.text(line, rightX, rightY); rightY += 14; }

    // Thin vertical rule between columns
    const maxColY = Math.max(leftY, rightY);
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin + colW + 10, colStartY - 4, margin + colW + 10, maxColY - 4);

    ctx.y = maxColY + 10;

    // "What This Means For Your Year" block
    if (yearText) {
      ctx.trackedLabel(doc, yearLabel.toUpperCase(), margin, ctx.y, { charSpace: 3 });
      ctx.y += 8;
      doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
      doc.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 10;
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.setTextColor(...INK);
      const yLines: string[] = doc.splitTextToSize(yearText, textW);
      for (const line of yLines) { doc.text(line, margin, ctx.y); ctx.y += 16.5; }
      ctx.y += 6;
    }

    // Extra section
    if (extraLabel && extraText) {
      ctx.trackedLabel(doc, extraLabel.toUpperCase(), margin, ctx.y, { charSpace: 3 });
      ctx.y += 8;
      doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
      doc.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 10;
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.setTextColor(...INK);
      const eLines: string[] = doc.splitTextToSize(extraText, textW);
      for (const line of eLines) { doc.text(line, margin, ctx.y); ctx.y += 16.5; }
      ctx.y += 6;
    }

    ctx.y += 18;
  };

  // ── SUN ──
  if (sunSign && sunStrength[sunSign]) {
    const houseLabel = srSunHouse ? `SOLAR RETURN: ${ord(srSunHouse)} HOUSE` : '';
    renderPlanetSection(
      `SUN IN ${sunSign.toUpperCase()}  ·  ${houseLabel}`,
      '',
      `Sun in ${sunSign}`,
      sunStrength[sunSign],
      sunShadow[sunSign] || '',
      'What This Means For Your Year',
      srSunHouse ? (sunYearAhead[srSunHouse] || '') : '',
    );
  }

  // ── MOON — new page ──
  if (moonSign && moonStrength[moonSign]) {
    doc.addPage(); ctx.y = margin + 10; ctx.pageBg(doc);

    const srHouseLabel = srMoonHouse ? `SR HOUSE ${srMoonHouse}` : '';
    const srLabel = srMoonSign ? `SR MOON: ${srMoonSign.toUpperCase()}  ·  ${srHouseLabel}` : '';
    const activationText = srMoonSign && srMoonSignActivation[srMoonSign]
      ? srMoonSignActivation[srMoonSign](moonSign) : '';
    const whereText = srMoonHouse && moonYearAhead[srMoonHouse] ? moonYearAhead[srMoonHouse] : '';

    renderPlanetSection(
      `NATAL MOON IN ${moonSign.toUpperCase()}  ·  ${srLabel}`,
      '',
      `Moon in ${moonSign}`,
      moonStrength[moonSign],
      moonShadow[moonSign] || '',
      'How This Year Activates You',
      activationText,
      whereText ? `Where It Plays Out (${ord(srMoonHouse!)} House)` : undefined,
      whereText || undefined,
    );
  }

  // ── RISING — new page ──
  if (risingSign && risingStrength[risingSign]) {
    doc.addPage(); ctx.y = margin + 10; ctx.pageBg(doc);

    const srLabel = srAscSign ? `SR RISING: ${srAscSign.toUpperCase()}` : '';
    renderPlanetSection(
      `${risingSign.toUpperCase()} RISING  ·  ${srLabel}`,
      '',
      `${risingSign} Rising`,
      risingStrength[risingSign],
      risingShadow[risingSign] || '',
      'This Year',
      srAscSign && risingYearAhead[srAscSign] ? risingYearAhead[srAscSign] : '',
    );
  }

  ctx.y += 6;
}
