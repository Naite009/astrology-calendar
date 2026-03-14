import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

/** YOUR BIG THREE — strengths, shadow, and how the SR year activates each */

type Color = [number, number, number];

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function ord(n: number): string {
  return `${n}${getOrdinalSuffix(n)}`;
}

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
  11: 'Emotional fulfillment through friendships and community. Social connections carry unusual emotional significance. The group you belong to reflects your inner state.',
  12: 'Emotions are internalized. Solitude is needed for processing. Dreams, meditation, and unconscious patterns are active.',
};

const srMoonSignActivation: Record<string, (natalSign: string) => string> = {
  Aries: (natal) => `Your SR Moon in Aries pushes your natal ${natal} Moon toward action and independence. Emotions come fast and demand immediate expression. You may feel impatient with your usual emotional patterns — this year rewards directness over deliberation.`,
  Taurus: (natal) => `Your SR Moon in Taurus grounds your natal ${natal} Moon in physical comfort and stability. Emotions slow down this year — you need tangible proof of safety. Routines, good food, and sensory pleasure become emotional medicine.`,
  Gemini: (natal) => `Your SR Moon in Gemini activates your natal ${natal} Moon through communication. You process feelings by talking, texting, and writing this year. Mental stimulation IS emotional nourishment. Restlessness replaces stagnation.`,
  Cancer: (natal) => `Your SR Moon in Cancer amplifies your natal ${natal} Moon's deepest needs. Home, family, and belonging are the emotional arena. Vulnerability feels more accessible. You may feel more sensitive than usual — that sensitivity is data, not weakness.`,
  Leo: (natal) => `Your SR Moon in Leo activates your natal ${natal} Moon through creative self-expression and visibility. Your emotional needs include being seen and appreciated. Generosity flows naturally but so does the need for recognition.`,
  Virgo: (natal) => `Your SR Moon in Virgo channels your natal ${natal} Moon into practical service and self-improvement. Emotions are processed through doing useful things. Health routines become emotionally stabilizing. The shadow: anxiety masquerading as productivity.`,
  Libra: (natal) => `Your SR Moon in Libra filters your natal ${natal} Moon through relationships. Emotional balance depends on partnership harmony this year. You feel best when things are fair and beautiful. The shadow: suppressing your own needs to keep the peace.`,
  Scorpio: (natal) => `Your SR Moon in Scorpio intensifies your natal ${natal} Moon dramatically. Emotional depth is unavoidable this year. You feel everything at full volume — jealousy, desire, loyalty, rage. Superficial emotional exchanges feel intolerable. Transformation through emotional honesty.`,
  Sagittarius: (natal) => `Your SR Moon in Sagittarius expands your natal ${natal} Moon toward adventure and meaning. Emotional claustrophobia is real — you need space, travel, or philosophical exploration to feel okay. Optimism is your emotional default, but avoid using it to bypass genuine pain.`,
  Capricorn: (natal) => `Your SR Moon in Capricorn disciplines your natal ${natal} Moon. Emotions are managed through structure, responsibility, and achievement. You may feel emotionally reserved or stoic — not cold, but serious. Emotional maturity is the assignment. You process feelings by taking responsibility and building something lasting.`,
  Aquarius: (natal) => `Your SR Moon in Aquarius detaches your natal ${natal} Moon just enough to see patterns clearly. Emotional processing is intellectual this year. Community and friendship matter more than romance. You need space to feel free.`,
  Pisces: (natal) => `Your SR Moon in Pisces dissolves boundaries around your natal ${natal} Moon. Intuition is heightened, empathy is amplified, and you absorb the emotions of everyone around you. Creative and spiritual channels are essential emotional outlets. The shadow: losing yourself in others' feelings.`,
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
  Pisces: 'People experience you as gentle, intuitive, and creatively inspired. You seem to understand without being told.',
};

const risingShadow: Record<string, string> = {
  Aries: 'Can come across as aggressive, impatient, or self-centered without realizing it. First impressions may intimidate.',
  Taurus: 'Can appear stubborn, slow to engage, or overly materialistic. May resist change that others see as necessary.',
  Gemini: 'Can seem scattered, unreliable, or superficial. May talk too much when nervous.',
  Cancer: 'Can appear moody, clingy, or overly protective. First impressions may seem guarded.',
  Leo: 'Can come across as attention-seeking, dramatic, or dominating conversations without awareness.',
  Virgo: 'Can appear critical, anxious, or overly cautious. May give the impression of judging before accepting. The perfectionism that makes you excellent can also make you hesitant to act until conditions are ideal — they rarely are.',
  Libra: 'Can seem indecisive, people-pleasing, or conflict-avoidant. May lose identity in social adaptation.',
  Scorpio: 'Can appear intimidating, suspicious, or emotionally guarded. Others may feel scrutinized.',
  Sagittarius: 'Can seem preachy, tactless, or unable to take things seriously when gravity is required.',
  Capricorn: 'Can appear cold, unapproachable, or overly serious. May create distance without meaning to.',
  Aquarius: 'Can seem detached, contrarian, or emotionally unavailable. May alienate through intellectual superiority.',
  Pisces: 'Can appear vague, passive, or easily overwhelmed. Boundaries may be unclear to others.',
};

const risingYearAhead: Record<string, string> = {
  Aries: 'The year\'s energy enters through bold action and initiative. First impressions are stronger. People see you as a leader whether you intend it or not.',
  Taurus: 'The year unfolds slowly and deliberately. Financial and material themes color every area. Patience is rewarded.',
  Gemini: 'Communication drives the year. Information comes from multiple directions. Flexibility is essential.',
  Cancer: 'Emotional and domestic themes dominate the year\'s entry point. Home, family, and emotional security are the lens.',
  Leo: 'The year demands creative self-expression and visibility. You are seen more clearly — use that attention wisely.',
  Virgo: 'The year enters through detailed analysis and practical improvement. Health and work systems are the gateway.',
  Libra: 'Relationships are the gateway to the year. Partnership decisions set the tone for everything else.',
  Scorpio: 'The year enters through intensity, transformation, and depth. Surface-level engagement is not an option.',
  Sagittarius: 'The year opens through expansion — travel, education, or philosophical growth. Adventure calls.',
  Capricorn: 'The year enters through structure, responsibility, and ambition. Professional themes dominate.',
  Aquarius: 'The year opens through innovation, community, and breaking from convention. Expect the unexpected.',
  Pisces: 'The year enters through intuition, creativity, and spiritual sensitivity. The boundary between inner and outer life is thin. Dreams and subtle impressions carry real information. The challenge is staying grounded while remaining open to what cannot be measured.',
};

// ─── Premium rendering helpers ───

function drawSectionBox(
  doc: jsPDF, x: number, y: number, w: number, h: number,
  bgColor: Color, borderColor: Color, label: string, labelColor: Color
) {
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, w, h, 5, 5, 'F');
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y, w, h, 5, 5, 'S');
  // Label badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...labelColor);
  doc.text(label, x + 12, y + 14);
}

function writeParagraph(
  doc: jsPDF, text: string, x: number, y: number, w: number,
  color: Color, fontSize: number = 10, lineH: number = 14
): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lines: string[] = doc.splitTextToSize(text, w);
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineH;
  }
  return y;
}

// ─── Main export — each planet gets generous space ───

export function generateStrengthsPortrait(
  ctx: PDFContext, doc: jsPDF, natalChart: NatalChart, analysis: SolarReturnAnalysis
) {
  const { pw, ph, margin, contentW, colors } = ctx;
  const sunSign = natalChart.planets?.Sun?.sign || '';
  const moonSign = natalChart.planets?.Moon?.sign || '';
  const risingSign = natalChart.houseCusps?.house1?.sign || '';
  const srSunHouse = analysis.planetSRHouses?.['Sun'];
  const srMoonHouse = analysis.planetSRHouses?.['Moon'];
  const srAscSign = analysis.yearlyTheme?.ascendantSign || '';
  const srMoonSign = analysis.moonSign || '';

  const bodyColor = colors.bodyText;
  const textInset = margin + 16;
  const textW = contentW - 32;

  // ═══════════════════════════════════════════
  // SECTION TITLE PAGE
  // ═══════════════════════════════════════════
  ctx.y += 8;
  doc.setDrawColor(...colors.gold);
  doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...colors.gold);
  doc.text('YOUR BIG THREE', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 8;

  // Decorative underline
  doc.setLineWidth(0.8);
  doc.line(pw / 2 - 50, ctx.y, pw / 2 + 50, ctx.y);
  ctx.y += 14;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...colors.dimText);
  doc.text('Natal strengths, shadow patterns, and how this year activates each one.', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 28;

  // ═══════════════════════════════════════════
  // ☉ SUN
  // ═══════════════════════════════════════════
  const renderPlanetSection = (
    title: string,
    subtitle: string,
    strengthText: string,
    shadowText: string,
    yearLabel: string,
    yearText: string,
    extraLabel?: string,
    extraText?: string,
  ) => {
    // Title bar with gold background
    ctx.checkPage(200);
    const titleBarY = ctx.y;
    doc.setFillColor(...colors.softGold);
    doc.roundedRect(margin, titleBarY, contentW, 40, 6, 6, 'F');
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(2);
    doc.line(margin, titleBarY, margin, titleBarY + 40);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...colors.gold);
    doc.text(title, margin + 14, titleBarY + 18);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...colors.deepBrown);
      doc.text(subtitle, margin + 14, titleBarY + 32);
    }

    ctx.y = titleBarY + 52;

    // ── Strength box ──
    const strengthLines: string[] = doc.splitTextToSize(strengthText, textW - 24);
    const strengthBoxH = 24 + strengthLines.length * 13 + 8;
    ctx.checkPage(strengthBoxH + 10);

    const sY = ctx.y;
    doc.setFillColor(240, 248, 240); // very light green
    doc.roundedRect(margin + 4, sY, contentW - 8, strengthBoxH, 4, 4, 'F');
    doc.setDrawColor(...colors.accentGreen);
    doc.setLineWidth(1.5);
    doc.line(margin + 4, sY + 4, margin + 4, sY + strengthBoxH - 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.accentGreen);
    doc.text('Strength', margin + 16, sY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...bodyColor);
    let lineY = sY + 30;
    for (const line of strengthLines) {
      doc.text(line, margin + 16, lineY);
      lineY += 13;
    }
    ctx.y = sY + strengthBoxH + 8;

    // ── Shadow box ──
    const shadowLines: string[] = doc.splitTextToSize(shadowText, textW - 24);
    const shadowBoxH = 24 + shadowLines.length * 13 + 8;
    ctx.checkPage(shadowBoxH + 10);

    const shY = ctx.y;
    doc.setFillColor(252, 244, 238); // very light rust/peach
    doc.roundedRect(margin + 4, shY, contentW - 8, shadowBoxH, 4, 4, 'F');
    doc.setDrawColor(...colors.accentRust);
    doc.setLineWidth(1.5);
    doc.line(margin + 4, shY + 4, margin + 4, shY + shadowBoxH - 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.accentRust);
    doc.text('Shadow', margin + 16, shY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...bodyColor);
    lineY = shY + 30;
    for (const line of shadowLines) {
      doc.text(line, margin + 16, lineY);
      lineY += 13;
    }
    ctx.y = shY + shadowBoxH + 8;

    // ── This Year box ──
    if (yearText) {
      const yearLines: string[] = doc.splitTextToSize(yearText, textW - 24);
      const yearBoxH = 24 + yearLines.length * 13 + 8;
      ctx.checkPage(yearBoxH + 10);

      const yY = ctx.y;
      doc.setFillColor(...colors.softGold);
      doc.roundedRect(margin + 4, yY, contentW - 8, yearBoxH, 4, 4, 'F');
      doc.setDrawColor(...colors.gold);
      doc.setLineWidth(1.5);
      doc.line(margin + 4, yY + 4, margin + 4, yY + yearBoxH - 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.gold);
      doc.text(yearLabel, margin + 16, yY + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...bodyColor);
      lineY = yY + 30;
      for (const line of yearLines) {
        doc.text(line, margin + 16, lineY);
        lineY += 13;
      }
      ctx.y = yY + yearBoxH + 8;
    }

    // ── Extra section (e.g. "How This Year Activates You") ──
    if (extraLabel && extraText) {
      const extraLines: string[] = doc.splitTextToSize(extraText, textW - 24);
      const extraBoxH = 24 + extraLines.length * 13 + 8;
      ctx.checkPage(extraBoxH + 10);

      const eY = ctx.y;
      doc.setFillColor(...colors.softBlue);
      doc.roundedRect(margin + 4, eY, contentW - 8, extraBoxH, 4, 4, 'F');
      doc.setDrawColor(100, 140, 190);
      doc.setLineWidth(1.5);
      doc.line(margin + 4, eY + 4, margin + 4, eY + extraBoxH - 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 100, 150);
      doc.text(extraLabel, margin + 16, eY + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...bodyColor);
      lineY = eY + 30;
      for (const line of extraLines) {
        doc.text(line, margin + 16, lineY);
        lineY += 13;
      }
      ctx.y = eY + extraBoxH + 8;
    }

    ctx.y += 6;
  };

  // ── SUN ──
  if (sunSign && sunStrength[sunSign]) {
    const houseLabel = srSunHouse ? `Solar Return ${ord(srSunHouse)} House` : '';
    renderPlanetSection(
      `SUN IN ${sunSign.toUpperCase()}`,
      houseLabel,
      sunStrength[sunSign],
      sunShadow[sunSign] || '',
      'What This Means For Your Year',
      srSunHouse ? (sunYearAhead[srSunHouse] || '') : '',
    );
  }

  // ── MOON — start fresh page for breathing room ──
  if (moonSign && moonStrength[moonSign]) {
    doc.addPage();
    ctx.y = margin + 10;

    const srHouseLabel = srMoonHouse ? `, ${ord(srMoonHouse)} House` : '';
    const srMoonLabel = srMoonSign ? `SR Moon: ${srMoonSign}${srHouseLabel}` : '';
    const activationText = srMoonSign && srMoonSignActivation[srMoonSign]
      ? srMoonSignActivation[srMoonSign](moonSign) : '';
    const whereText = srMoonHouse && moonYearAhead[srMoonHouse]
      ? moonYearAhead[srMoonHouse] : '';

    // Combine "where it plays out" into the activation text if both exist
    let yearText = '';
    if (whereText && activationText) {
      yearText = whereText;
    } else if (whereText) {
      yearText = whereText;
    }

    renderPlanetSection(
      `NATAL MOON IN ${moonSign.toUpperCase()}`,
      srMoonLabel,
      moonStrength[moonSign],
      moonShadow[moonSign] || '',
      'How This Year Activates You',
      activationText,
      whereText ? `Where It Plays Out (${ord(srMoonHouse!)} House)` : undefined,
      whereText || undefined,
    );
  }

  // ── RISING — start fresh page ──
  if (risingSign && risingStrength[risingSign]) {
    doc.addPage();
    ctx.y = margin + 10;

    const srLabel = srAscSign ? `SR Rising: ${srAscSign}` : '';
    const yearText = srAscSign && risingYearAhead[srAscSign] ? risingYearAhead[srAscSign] : '';

    renderPlanetSection(
      `${risingSign.toUpperCase()} RISING`,
      srLabel,
      risingStrength[risingSign],
      risingShadow[risingSign] || '',
      'This Year',
      yearText,
    );
  }

  ctx.y += 6;
}
