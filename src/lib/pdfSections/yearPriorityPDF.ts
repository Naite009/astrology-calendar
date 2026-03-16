// PDF section: Year Priority Engine + Natal Overlay + Angle Activations
import type jsPDF from 'jspdf';
import type { PDFContext } from './pdfContext';
import type { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { computeYearPriorities } from '@/lib/yearPriorityScoring';

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, body, self-definition',
  2: 'money, resources, self-worth',
  3: 'communication, learning, siblings',
  4: 'home, family, roots, private life',
  5: 'creativity, romance, children',
  6: 'work, routines, health',
  7: 'relationships, partnership',
  8: 'shared resources, intimacy, transformation',
  9: 'beliefs, travel, higher learning',
  10: 'career, calling, reputation',
  11: 'friends, networks, future goals',
  12: 'rest, retreat, healing, spirituality',
};

function ord(n: number): string {
  if (n === 1) return 'st'; if (n === 2) return 'nd'; if (n === 3) return 'rd'; return 'th';
}

// ─── Felt-sense planet-in-natal-house interpretations ───────────
const PLANET_HOUSE_FELT: Record<string, Record<number, string>> = {
  Ascendant: {
    1: 'Your Solar Return lens overlays your natal identity — this year feels deeply personal. You are redefining yourself from the inside out.',
    2: 'The year\'s energy filters through your finances and self-worth. How you earn, spend, and value yourself becomes the frame for everything.',
    3: 'Daily conversations, short trips, and mental activity become the gateway to this year\'s growth. Your mind is unusually active.',
    4: 'Home and family become the container for this year\'s story. You may feel pulled inward, nesting, or dealing with roots.',
    5: 'Creativity, romance, and self-expression set the tone. You approach life with more playfulness and willingness to take risks.',
    6: 'Your daily routines and health habits become the vehicle for transformation. The year asks you to restructure how you work and care for your body.',
    7: 'Partnerships define the year. You cannot navigate it alone — the most important events happen through or because of another person.',
    8: 'Deep psychological shifts are the backdrop. Power, shared resources, and intimate bonds demand honesty you may not feel ready for.',
    9: 'Your worldview expands. Travel, study, philosophy, or legal matters provide the context for personal growth.',
    10: 'Career and public life are the stage. You feel more visible, more scrutinized, and more driven to make your mark.',
    11: 'Friends, groups, and your vision of the future shape everything. Your social world is the primary arena.',
    12: 'The year unfolds behind the scenes. Solitude, spiritual practice, and processing the past take priority over external action.',
  },
  Sun: {
    1: 'Your vitality and identity are fully activated — you feel more like yourself than you have in years. Others see you clearly.',
    2: 'Your purpose this year is inseparable from money and values. What you earn and what you\'re worth demand honest reckoning.',
    3: 'Your life force flows through words, ideas, and connections. You are a student and a teacher this year — communication is power.',
    4: 'Your deepest energy goes into home, family, and emotional foundations. This is a building year — what you root now lasts.',
    5: 'Your creative fire is lit. Romance, artistic expression, and joy are not luxuries — they are how you fulfill your purpose.',
    6: 'Your vitality is channeled into daily work, health, and service. The unglamorous details of life are where meaning lives this year.',
    7: 'Your purpose is realized through partnership. The most important person in your year is the one sitting across from you.',
    8: 'Your identity undergoes deep renovation. Something must be released before the new version of you can fully emerge.',
    9: 'Your spirit needs expansion. You feel confined by the familiar and drawn toward bigger questions, farther horizons.',
    10: 'Your purpose and your career converge. This is the year when what you do in the world IS who you are.',
    11: 'Your vitality goes into community, friendship, and collective vision. Personal ambition feels less important than shared purpose.',
    12: 'Your conscious identity takes a back seat to something deeper. Rest, reflection, and inner work are not optional — they are the work.',
  },
  Moon: {
    1: 'Your emotional life is written on your face this year. Feelings are visible, moods shift quickly, and self-care is survival.',
    2: 'Emotional security is tied to financial security. You feel anxious when money is uncertain and soothed when resources are stable.',
    3: 'Your emotional processing happens through talking, writing, and thinking. You need to verbalize feelings to understand them.',
    4: 'You feel everything more deeply at home. Family dynamics stir old emotions. Creating a safe domestic space is essential.',
    5: 'Your heart wants play, romance, and creative expression. Emotional fulfillment comes through what you create and who you love.',
    6: 'Your emotions live in your body this year. Stress shows up as physical symptoms; self-care routines become emotional anchors.',
    7: 'Your emotional needs are met (or unmet) through your closest relationship. You feel what your partner feels.',
    8: 'Emotions run deep and private. You process grief, desire, and power in ways you may not fully share with anyone.',
    9: 'Emotional growth comes through expanding your perspective — travel, study, or spiritual practice helps you feel alive.',
    10: 'Your emotional life is visible publicly. You may be seen as nurturing or vulnerable in professional settings.',
    11: 'Friends and community are your emotional home base. Belonging to a group feels necessary, not optional.',
    12: 'Your emotional world is largely internal. Dreams are vivid, intuition is strong, and you need significant solitude.',
  },
  Mercury: {
    1: 'Your mind is sharp and your words carry weight. People listen to you differently this year — what you say matters.',
    2: 'Your thinking is focused on money, deals, and practical value. Mental energy goes into financial planning and resource management.',
    3: 'Communication is supercharged. Writing, teaching, learning, and daily conversations are where the action is.',
    4: 'You think about home, family, and roots more than usual. Mental energy goes into domestic decisions and family conversations.',
    5: 'Your mind is playful and creative. Ideas flow, wit sharpens, and intellectual flirtation is more appealing than deep analysis.',
    6: 'Your thinking is detail-oriented and practical. You analyze routines, health data, and work processes with unusual precision.',
    7: 'Communication with partners is the year\'s theme. Contracts, negotiations, and honest dialogue shape your relationships.',
    8: 'Your mind goes deep — research, psychology, and hidden information fascinate you. Surface-level thinking feels unsatisfying.',
    9: 'Big ideas and philosophical questions occupy your mind. You may study, publish, or engage with foreign perspectives.',
    10: 'Your professional communication is highlighted. Presentations, public speaking, and career-related writing demand attention.',
    11: 'Your social network expands through ideas. Online communities, intellectual friendships, and group brainstorming energize you.',
    12: 'Your thinking is more intuitive than logical. Journaling, meditation, and private reflection reveal insights that analysis misses.',
  },
  Venus: {
    1: 'You feel more attractive and approachable. Your personal charm is amplified — people are drawn to you without effort.',
    2: 'Money comes more easily, and spending feels more pleasurable. Your values and aesthetics influence financial decisions.',
    3: 'Social charm flows through conversation. Diplomatic words, charming texts, and pleasant interactions smooth daily life.',
    4: 'Home becomes beautiful. You invest in decor, family harmony, and creating a space that feels like a sanctuary.',
    5: 'Romance and creative pleasure are at their peak. Love affairs, artistic projects, and joyful self-expression flourish.',
    6: 'Work relationships are harmonious. You find beauty in routine and pleasure in service. Health through pleasure — massage, good food, gentle movement.',
    7: 'Love and partnership are center stage. Existing relationships deepen; new romantic or business partnerships form naturally.',
    8: 'Intimacy deepens. You crave emotional honesty and physical closeness. Shared finances may benefit from someone else\'s generosity.',
    9: 'You fall in love with ideas, cultures, or people from different backgrounds. Beauty is found in the unfamiliar.',
    10: 'Professional relationships benefit from your charm. Your public image is more polished and aesthetically appealing.',
    11: 'Friendships bring joy. Social gatherings, group activities, and community involvement are where love and pleasure live.',
    12: 'Love is private and spiritual. You may have a secret attraction or find deep pleasure in solitude, art, and contemplation.',
  },
  Mars: {
    1: 'Your energy and assertiveness spike. You feel physically stronger, more competitive, and less willing to tolerate passivity.',
    2: 'You fight for your financial security. Aggressive earning, spending, or defending your resources is likely.',
    3: 'Your words have an edge. Arguments, passionate debates, and forceful communication are more frequent.',
    4: 'Conflict or renovation at home. Family dynamics may include arguments, but also the energy to make dramatic domestic changes.',
    5: 'Creative passion and romantic pursuit intensify. You go after what you want with boldness. Competitive hobbies thrive.',
    6: 'Work pace accelerates dramatically. You push yourself physically — gym goals, demanding projects, and an intolerance for inefficiency.',
    7: 'Conflict and passion in partnerships. Arguments may be more frequent, but so is the desire to fight FOR the relationship.',
    8: 'Power struggles surface. Sexual energy intensifies. You confront control dynamics head-on and demand authenticity.',
    9: 'You pursue truth aggressively — debates about beliefs, legal battles, or ambitious travel plans require courage.',
    10: 'Career ambition is fierce. You push for advancement, take on leadership roles, and refuse to be overlooked professionally.',
    11: 'You take action within groups. Leadership in communities, activism, or confrontation with friends over principles.',
    12: 'Anger may go underground. Frustration builds in private. Physical energy is best channeled into solitary exercise or spiritual discipline.',
  },
  Jupiter: {
    1: 'Confidence and optimism surge. You feel protected, expansive, and ready to say yes to opportunities. Weight gain is possible.',
    2: 'Money circulates in larger amounts — but direction depends on context. Income may rise, or spending expands. Financial movement intensifies.',
    3: 'Learning, communication, and travel opportunities multiply. Good news arrives. Writing, teaching, and intellectual exchange flourish.',
    4: 'Home improvements, real estate luck, and domestic contentment. This is one of the best years to buy property or settle down.',
    5: 'Romance, creativity, and joy expand. Fertility increases. Fun is abundant — the universe wants you to enjoy yourself.',
    6: 'Health recovers, work conditions improve, and daily life feels more supported. Healing therapies are especially effective.',
    7: 'Partnerships bring benefits. A generous partner appears, or an existing relationship becomes more supportive and expansive.',
    8: 'Shared resources grow. Inheritance, insurance payouts, or investment returns are possible. Psychological depth increases.',
    9: 'The most natural placement — travel, higher education, publishing, and spiritual expansion are all strongly favored.',
    10: 'Career advancement, promotions, and public recognition. Professional life expands beyond what you thought possible.',
    11: 'Social circle widens dramatically. Influential friends, group success, and optimism about the future increase.',
    12: 'Hidden blessings and spiritual protection. Retreat, rest, and inner work are rewarded. Grace arrives from unexpected sources.',
  },
  Saturn: {
    1: 'You feel the weight of responsibility on your shoulders. Self-discipline increases but so does self-criticism. You age and mature visibly.',
    2: 'Financial tightening or restructuring. You learn to live with less or build a more disciplined relationship with money.',
    3: 'Communication becomes more serious. Words carry consequences. Learning requires effort but produces lasting results.',
    4: 'Family responsibilities increase. A parent may need care. Home structures — literally or emotionally — require repair.',
    5: 'Joy requires effort this year. Creative blocks, romantic delays, or parenting pressures demand patience and discipline.',
    6: 'Work demands peak. Health issues require structural attention — bones, teeth, joints, chronic conditions. Discipline is medicine.',
    7: 'Relationships are tested. Commitments deepen or dissolve. Partnerships require work, honesty, and realistic expectations.',
    8: 'Financial obligations to others weigh heavily. Debt, taxes, or shared resource negotiations demand mature handling.',
    9: 'Beliefs are tested by reality. Travel may be restricted. Education requires discipline. Legal matters demand patience.',
    10: 'Career pressure and responsibility peak. Authority figures scrutinize your work. The results of years of effort become visible.',
    11: 'Social circles contract. Fair-weather friends disappear. The friendships that survive are the ones worth keeping.',
    12: 'Isolation may feel heavy but is purposeful. You confront fears, limitations, and old patterns in deep solitude.',
  },
  Uranus: {
    1: 'Expect sudden changes to your identity or appearance. You feel rebellious, restless, and unwilling to be who you were last year.',
    2: 'Financial surprises — sudden income or unexpected expenses. Your relationship with money and possessions becomes unpredictable.',
    3: 'Your thinking shifts radically. New ideas disrupt old mental habits. Technology plays a bigger role in daily communication.',
    4: 'Home disruptions — sudden moves, renovations, or family upheaval. What felt stable at home gets shaken loose.',
    5: 'Unexpected romance, creative breakthroughs, or surprises involving children. You take risks you never would have before.',
    6: 'Work routine is disrupted. You may change jobs suddenly, adopt radical health practices, or rebel against monotony.',
    7: 'Relationships experience sudden changes. Freedom within partnership becomes non-negotiable. New connections arrive unexpectedly.',
    8: 'Deep psychological shocks lead to liberation. Power dynamics shift overnight. Financial entanglements may break suddenly.',
    9: 'Your worldview shatters and rebuilds. Sudden travel, radical new beliefs, or encounters with foreign perspectives change you.',
    10: 'Career takes unexpected turns. You may leave a stable job, get recruited suddenly, or reinvent your professional identity.',
    11: 'Your social world transforms. You join unusual groups, meet eccentric people, or suddenly leave communities that no longer fit.',
    12: 'Spiritual awakenings arrive without warning. Intuition spikes. Hidden parts of yourself demand acknowledgment.',
  },
  Neptune: {
    1: 'Your boundaries dissolve. You are more empathetic, more artistic, and more vulnerable to absorbing other people\'s energy.',
    2: 'Financial clarity is elusive. Money may slip through your fingers, or idealistic spending replaces practical budgeting.',
    3: 'Your thinking becomes more intuitive than logical. Creative writing flourishes but factual communication may be foggy.',
    4: 'Home life has a dreamlike quality. You idealize family, escape into domestic fantasy, or deal with unclear living situations.',
    5: 'Romantic idealization is strong. Creative imagination soars. Be careful not to fall in love with a fantasy rather than a person.',
    6: 'Health symptoms may be hard to diagnose. Holistic healing approaches are more effective than conventional ones this year.',
    7: 'You see your partner through rose-colored glasses — or fog. Relationships require extra discernment and honest communication.',
    8: 'Psychological boundaries blur. Shared financial situations lack clarity. Intuition about hidden matters is strong but needs grounding.',
    9: 'Spiritual seeking intensifies. You may be drawn to meditation, pilgrimages, or philosophical traditions that transcend logic.',
    10: 'Your public image is idealized or misunderstood. Career in creative or healing fields thrives; conventional careers feel confusing.',
    11: 'You attract spiritual or artistic communities. Group idealism is high but collective illusions are also possible.',
    12: 'The most natural Neptune placement — deep spirituality, vivid dreams, artistic inspiration, and the need for regular solitude.',
  },
  Pluto: {
    1: 'Personal transformation is unavoidable. You feel a compulsive need to shed old versions of yourself. Others sense your intensity.',
    2: 'Your relationship with money and possessions undergoes deep change. Control issues around resources surface and demand resolution.',
    3: 'Your words become more penetrating. You uncover hidden information. Communication has a quality of exposure and revelation.',
    4: 'Family secrets surface. Home undergoes deep transformation — demolition and rebuilding, literally or psychologically.',
    5: 'Creative obsession, intense romance, or power dynamics with children. Whatever you create this year comes from your depths.',
    6: 'Work becomes a crucible. Health crises may force radical lifestyle changes. You cannot maintain routines that don\'t serve you.',
    7: 'Relationships undergo power transformation. You confront control dynamics, jealousy, or deep mutual evolution with a partner.',
    8: 'The most intense placement — death, rebirth, inheritance, sexuality, and psychological excavation are all activated simultaneously.',
    9: 'Your beliefs are transformed by encounters with truth that cannot be unseen. Fundamentalist thinking — in any direction — crumbles.',
    10: 'Career power dynamics intensify. You may dismantle and rebuild your professional life. Authority and ambition are transformed.',
    11: 'Group dynamics involve power struggles. You may transform a community from within or leave one that has become toxic.',
    12: 'Deep unconscious material surfaces. Therapy, dreams, and solitary processing are essential. You are composting your shadow.',
  },
  NorthNode: {
    1: 'Your soul\'s growth asks you to step into greater independence and self-definition. Leaning on others holds you back.',
    2: 'Growth comes through building your own resources and developing self-sufficiency. Stop outsourcing your security.',
    3: 'Your growth edge is communication, curiosity, and learning. Speak up. Ask questions. Stop assuming you already know.',
    4: 'Soul growth requires building emotional foundations and investing in home and family — even if career feels more comfortable.',
    5: 'Your growth direction points toward creative self-expression, joy, and taking heart-centered risks.',
    6: 'Growth comes through service, daily practice, and health attention. The spiritual path IS the mundane path this year.',
    7: 'Your soul\'s growth requires partnership, compromise, and showing up for another person — even when independence feels safer.',
    8: 'Growth demands emotional depth, vulnerability, and shared resources. Surface-level living won\'t satisfy you.',
    9: 'Your growth edge is expansion — travel, higher learning, and developing a personal philosophy that is truly yours.',
    10: 'Soul growth pushes you toward public achievement and taking responsibility for your contribution to the world.',
    11: 'Your growth direction points toward community, collective vision, and releasing attachment to personal recognition.',
    12: 'Growth comes through surrender, solitude, and letting go of the need to control outcomes. Trust the process.',
  },
  Chiron: {
    1: 'Old wounds around identity and self-worth are activated — not to re-injure you, but to show you how far you\'ve come.',
    2: 'Financial insecurity or self-worth wounds surface for healing. Your relationship with "enough" is being recalibrated.',
    3: 'Wounds around communication, intelligence, or being heard are activated. Healing comes through finding your voice.',
    4: 'Family wounds surface. Childhood pain may need attention. Healing your roots heals everything that grows from them.',
    5: 'Creative blocks, romantic wounds, or childhood pain around self-expression come up for healing through joy and play.',
    6: 'Health vulnerabilities point toward where healing is needed. Your body is your teacher — listen to its specific messages.',
    7: 'Relationship wounds activate. Past partnership pain informs present patterns. Healing comes through conscious relating.',
    8: 'Deep psychological wounds around trust, power, or intimacy surface. Healing requires going into the pain, not around it.',
    9: 'Wounds around meaning, faith, or belonging in the larger world need attention. Your search for truth IS the healing.',
    10: 'Career wounds or imposter syndrome activate. Healing comes through showing up professionally despite feeling inadequate.',
    11: 'Social rejection wounds surface. Healing comes through finding your people — the ones who see and accept the real you.',
    12: 'Spiritual wounds or existential suffering need compassionate attention. Healing happens in solitude and surrender.',
  },
};

// ─── Natal Overlay Section ──────────────────────────────────────
// Returns the dominant house info so it can be placed on a previous page
export function computeOverlayData(analysis: SolarReturnAnalysis) {
  interface Point { label: string; planetKey: string; house: number; meaning: string; felt: string; }
  const points: Point[] = [];
  const houseCounts: Record<number, string[]> = {};

  const addPt = (label: string, planetKey: string, house: number | null) => {
    if (!house) return;
    const feltMap = PLANET_HOUSE_FELT[planetKey];
    const felt = feltMap?.[house] || HOUSE_MEANINGS[house] || '';
    points.push({ label, planetKey, house, meaning: HOUSE_MEANINGS[house] || '', felt });
    if (!houseCounts[house]) houseCounts[house] = [];
    houseCounts[house].push(label);
  };

  if (analysis.srAscInNatalHouse) addPt('Ascendant', 'Ascendant', analysis.srAscInNatalHouse.natalHouse);
  addPt('Sun', 'Sun', analysis.sunNatalHouse?.house ?? null);
  addPt('Moon', 'Moon', analysis.moonNatalHouse?.house ?? null);
  for (const ov of analysis.houseOverlays || []) {
    addPt(ov.planet, ov.planet, ov.natalHouse);
  }

  let dominant: { house: number; count: number; labels: string[] } | null = null;
  for (const [h, labels] of Object.entries(houseCounts)) {
    if (labels.length >= 2 && (!dominant || labels.length > dominant.count)) {
      dominant = { house: Number(h), count: labels.length, labels };
    }
  }

  return { points, dominant };
}

// Draw the Main Arena banner (call from Year at a Glance page)
export function drawMainArenaBanner(
  ctx: PDFContext, doc: jsPDF,
  dominant: { house: number; count: number; labels: string[] },
) {
  ctx.checkPage(46);
  const bannerH = 38;
  doc.setFillColor(...ctx.colors.cardBg);
  doc.roundedRect(ctx.margin, ctx.y, ctx.contentW, bannerH, 3, 3, 'F');
  doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
  doc.roundedRect(ctx.margin, ctx.y, ctx.contentW, bannerH, 3, 3, 'S');
  doc.setFillColor(...ctx.colors.gold);
  doc.rect(ctx.margin, ctx.y, 3, bannerH, 'F');

  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...ctx.colors.gold);
  doc.text(`MAIN ARENA -- NATAL ${dominant.house}${ord(dominant.house).toUpperCase()} HOUSE`, ctx.margin + 10, ctx.y + 14);

  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...ctx.colors.ink);
  const dominantText = `${dominant.labels.join(', ')} land here, emphasizing ${HOUSE_MEANINGS[dominant.house] || ''}.`;
  const lines = doc.splitTextToSize(dominantText, ctx.contentW - 20);
  doc.text(lines[0] || dominantText, ctx.margin + 10, ctx.y + 26);

  ctx.y += bannerH + 8;
}

export function generatePDFNatalOverlay(
  ctx: PDFContext, doc: jsPDF,
  analysis: SolarReturnAnalysis,
) {
  // Title page for this section
  ctx.sectionTitle(doc, 'HOW THIS YEAR LANDS IN YOUR NATAL CHART', 'Solar Return Planets in Your Natal Houses');

  const { points } = computeOverlayData(analysis);

  if (points.length === 0) {
    ctx.writeBody(doc, 'No major Solar Return-to-natal overlay points were detected in this chart.');
    return;
  }

  // Compact two-column layout — smaller cards, no glyphs, plain text
  const col2Gap = 10;
  const col2W = (ctx.contentW - col2Gap) / 2;
  const cardH = 52;
  const rowGap = 5;

  for (let i = 0; i < points.length; i += 2) {
    const leftP = points[i];
    const rightP = points[i + 1];

    ctx.checkPage(cardH + rowGap);
    const y = ctx.y;

    drawOverlayCard(doc, ctx, ctx.margin, y, col2W, cardH, leftP);
    if (rightP) {
      drawOverlayCard(doc, ctx, ctx.margin + col2W + col2Gap, y, col2W, cardH, rightP);
    }

    ctx.y = y + cardH + rowGap;
  }
}

function drawOverlayCard(
  doc: jsPDF, ctx: PDFContext,
  x: number, y: number, w: number, h: number,
  p: { label: string; house: number; felt: string },
) {
  doc.setFillColor(...ctx.colors.cream);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');
  doc.setFillColor(...ctx.colors.gold);
  doc.rect(x, y, 3, h, 'F');

  // Plain text label — no arrow glyph
  doc.setFont('times', 'bold'); doc.setFontSize(9);
  doc.setTextColor(...ctx.colors.ink);
  const label = `${p.label} in Natal ${p.house}${ord(p.house)} House`;
  const labelLines: string[] = doc.splitTextToSize(label, w - 18);
  let ty = y + 12;
  for (const l of labelLines.slice(0, 2)) { doc.text(l, x + 10, ty); ty += 10; }

  // Felt-sense interpretation
  doc.setFont('times', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...ctx.colors.muted);
  const feltLines: string[] = doc.splitTextToSize(p.felt, w - 18);
  for (const l of feltLines.slice(0, 3)) { doc.text(l, x + 10, ty); ty += 8; }
}

// ─── Angle Activations Section ──────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number } | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

const ASPECT_DEFS = [
  { name: 'conjunct', angle: 0, glyph: '☌', keyword: 'merges with' },
  { name: 'opposite', angle: 180, glyph: '☍', keyword: 'confronts' },
  { name: 'square', angle: 90, glyph: '□', keyword: 'challenges' },
  { name: 'trine', angle: 120, glyph: '△', keyword: 'flows with' },
  { name: 'sextile', angle: 60, glyph: '⚹', keyword: 'supports' },
];
const ORB = 3;

// ─── Felt-sense narratives for angle activations ────────────────
const ANGLE_FELT: Record<string, string> = {
  Ascendant: 'your physical presence, first impressions, and how you instinctively approach new situations. You feel this in your body — posture shifts, energy levels change, and people respond to you differently without knowing why.',
  Descendant: 'your closest partnerships and how you relate one-on-one. Relationship dynamics feel electric — you attract new connections or existing partnerships undergo visible restructuring.',
  Midheaven: 'your career, public reputation, and life direction. Professional visibility increases — you feel more exposed, more scrutinized, and more driven toward what you want the world to see.',
  IC: 'your home, family roots, and emotional foundations. Something shifts at the base of your life — living situations change, family dynamics surface, or your private inner world demands attention.',
};

const PLANET_FELT: Record<string, string> = {
  Sun: 'your core identity and sense of purpose. You feel more visible, more yourself, and more aware of whether your daily life matches who you actually are.',
  Moon: 'your emotional needs and instinctive reactions. Feelings run stronger, intuition sharpens, and your body tells you what your mind hasn\'t caught up to yet.',
  Mercury: 'your thinking patterns, communication style, and daily information processing. Conversations carry more weight and what you say has consequences.',
  Venus: 'your values, relationships, and what you find beautiful. You feel more attuned to pleasure and more aware of where your relationships need honesty.',
  Mars: 'your drive, ambition, and how you handle conflict. Energy surges — you feel restless, competitive, or motivated to push through obstacles.',
  Jupiter: 'your growth, optimism, and where life feels expansive. Opportunities appear. The danger is overcommitting. The gift is genuine expansion.',
  Saturn: 'your responsibilities, limits, and long-term structures. You feel the weight of what matters — boundaries and commitments that demand follow-through.',
  Uranus: 'your need for freedom, originality, and sudden change. Expect the unexpected — disruptions that feel destabilizing but liberating afterward.',
  Neptune: 'your intuition, imagination, and where boundaries dissolve. Reality feels softer, dreams are vivid, and clarity takes patience.',
  Pluto: 'deep transformation and power dynamics. Something hidden surfaces — control patterns, buried emotions, or situations that force you to let go.',
  'N.Node': 'your soul\'s growth direction. Life events push you toward unfamiliar territory that feels uncomfortable but necessary.',
  NorthNode: 'your soul\'s growth direction. Life events push you toward unfamiliar territory that feels uncomfortable but necessary.',
  Chiron: 'your deepest wound and greatest healing gift. Old pain resurfaces — not to retraumatize, but to show you how far you\'ve come.',
};

const ANGLE_ICON: Record<string, string> = {
  Ascendant: 'ASC', Descendant: 'DSC', Midheaven: 'MC', IC: 'IC',
};

export function generatePDFAngleActivations(
  ctx: PDFContext, doc: jsPDF,
  natalChart: NatalChart, srChart: SolarReturnChart,
  maxOrb: number = ORB,
) {
  const { pw, margin, contentW } = ctx;
  const ph = doc.internal.pageSize.getHeight();
  const INK: [number, number, number] = [58, 54, 50];
  const MUTED: [number, number, number] = [130, 125, 118];
  const GOLD: [number, number, number] = [184, 150, 62];
  const RULE: [number, number, number] = [200, 195, 188];
  const WHITE: [number, number, number] = [255, 255, 255];
  const CREAM: [number, number, number] = [252, 250, 245];

  // ─── New page with section title ───────────────────────────────
  doc.addPage();
  ctx.y = margin;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, ph, 'F');

  ctx.y += 12;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('ANGLE ACTIVATIONS', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 5;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 14;

  doc.setFont('times', 'normal'); doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Where Your Year Hits Hardest', margin, ctx.y);
  ctx.y += 10;

  // ─── Explanatory intro ─────────────────────────────────────────
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const intro = 'The previous section showed where Solar Return planets land in your natal houses — like guests arriving in different rooms of your life. This section is different. Angles are not planets. They are the structural frame of the chart itself — the four compass points (Ascendant, Midheaven, Descendant, IC) that define how you meet the world, who you attract, what you\'re building, and where you retreat. When an angle from one chart makes an exact aspect to a planet in the other, it creates a direct, visceral activation — something you feel immediately, not abstractly.';
  const introLines: string[] = doc.splitTextToSize(intro, contentW);
  for (const l of introLines) { doc.text(l, margin, ctx.y); ctx.y += 11; }
  ctx.y += 6;

  // ─── Compute activations ──────────────────────────────────────
  interface Act { label: string; srBody: string; natalBody: string; aspectName: string; aspectGlyph: string; aspectKeyword: string; orb: number; narrative: string; priority: number; group: 'angle-to-planet' | 'planet-to-angle'; }
  const allActivations: Act[] = [];

  // SR angles
  const srAngles: { name: string; deg: number | null }[] = [];
  const srAsc = srChart.houseCusps?.house1; const srMC = srChart.houseCusps?.house10;
  if (srAsc) { const d = toAbsDeg(srAsc); srAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) srAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
  if (srMC) { const d = toAbsDeg(srMC); srAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) srAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

  // Natal angles
  const natalAngles: { name: string; deg: number | null }[] = [];
  const nAsc = natalChart.houseCusps?.house1; const nMC = natalChart.houseCusps?.house10;
  if (nAsc) { const d = toAbsDeg(nAsc); natalAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) natalAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
  if (nMC) { const d = toAbsDeg(nMC); natalAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) natalAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

  const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','Chiron'];

  // Group 1: SR angles → natal planets
  for (const angle of srAngles) {
    if (angle.deg === null) continue;
    for (const pName of planetNames) {
      const pos = natalChart.planets[pName as keyof typeof natalChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos); if (pDeg === null) continue;
      for (const asp of ASPECT_DEFS) {
        let diff = Math.abs(angle.deg - pDeg); if (diff > 180) diff = 360 - diff;
        const orb = Math.abs(diff - asp.angle);
        if (orb <= maxOrb) {
          const dp = pName === 'NorthNode' ? 'N.Node' : pName;
          const felt = PLANET_FELT[pName] || '';
          allActivations.push({
            label: `SR ${angle.name} ${asp.glyph} Natal ${dp}`,
            srBody: angle.name, natalBody: dp,
            aspectName: asp.name, aspectGlyph: asp.glyph, aspectKeyword: asp.keyword,
            orb: Math.round(orb * 10) / 10,
            narrative: felt ? `The year's structural frame activates ${felt}` : `SR ${angle.name} ${asp.keyword} natal ${dp}.`,
            priority: asp.angle === 0 ? 1 : 2,
            group: 'angle-to-planet',
          });
        }
      }
    }
  }

  // Group 2: SR planets → natal angles
  for (const pName of planetNames) {
    const srPos = srChart.planets[pName as keyof typeof srChart.planets];
    if (!srPos) continue;
    const srDeg = toAbsDeg(srPos); if (srDeg === null) continue;
    for (const angle of natalAngles) {
      if (angle.deg === null) continue;
      for (const asp of ASPECT_DEFS) {
        let diff = Math.abs(srDeg - angle.deg); if (diff > 180) diff = 360 - diff;
        const orb = Math.abs(diff - asp.angle);
        if (orb <= maxOrb) {
          const dp = pName === 'NorthNode' ? 'N.Node' : pName;
          const felt = ANGLE_FELT[angle.name] || '';
          allActivations.push({
            label: `SR ${dp} ${asp.glyph} Natal ${angle.name}`,
            srBody: dp, natalBody: angle.name,
            aspectName: asp.name, aspectGlyph: asp.glyph, aspectKeyword: asp.keyword,
            orb: Math.round(orb * 10) / 10,
            narrative: felt ? `This year's ${dp} energy directly reshapes ${felt}` : `SR ${dp} ${asp.keyword} natal ${angle.name}.`,
            priority: asp.angle === 0 ? 1 : 3,
            group: 'planet-to-angle',
          });
        }
      }
    }
  }

  const group1 = allActivations.filter(a => a.group === 'angle-to-planet').sort((a, b) => a.priority - b.priority || a.orb - b.orb);
  const group2 = allActivations.filter(a => a.group === 'planet-to-angle').sort((a, b) => a.priority - b.priority || a.orb - b.orb);

  if (group1.length === 0 && group2.length === 0) {
    ctx.writeBody(doc, 'No significant angle contacts detected within the orb.');
    return;
  }

  // ─── GROUP 1: This Year's Frame → Your Natal Planets ──────────
  if (group1.length > 0) {
    drawGroupHeader(doc, ctx, margin, contentW, INK, GOLD, MUTED,
      'THIS YEAR\'S FRAME → YOUR NATAL PLANETS',
      'The Solar Return Ascendant and Midheaven act like a lens placed over your birth chart. When they land on one of your natal planets, that planet becomes a central character in your year — louder, more visible, impossible to ignore.');
    drawActivationCards(doc, ctx, group1.slice(0, 6), margin, contentW, ph, INK, MUTED, GOLD, RULE, CREAM);
  }

  // ─── GROUP 2: This Year's Planets → Your Natal Frame ──────────
  if (group2.length > 0) {
    ctx.checkPage(80);
    drawGroupHeader(doc, ctx, margin, contentW, INK, GOLD, MUTED,
      'THIS YEAR\'S PLANETS → YOUR NATAL FRAME',
      'When a Solar Return planet lands directly on one of your natal angles (ASC, MC, DSC, IC), it injects that planet\'s energy into a foundational area of your life — your identity, career, relationships, or home. This is not subtle.');
    drawActivationCards(doc, ctx, group2.slice(0, 6), margin, contentW, ph, INK, MUTED, GOLD, RULE, CREAM);
  }
}

function drawGroupHeader(
  doc: jsPDF, ctx: PDFContext, margin: number, contentW: number,
  INK: [number, number, number], GOLD: [number, number, number], MUTED: [number, number, number],
  title: string, description: string,
) {
  ctx.checkPage(60);
  
  // Gold bar accent
  doc.setFillColor(...GOLD);
  doc.rect(margin, ctx.y, 30, 2, 'F');
  ctx.y += 8;

  // Group title
  doc.setFont('times', 'bold'); doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(title, margin, ctx.y);
  ctx.y += 10;

  // Group description
  doc.setFont('times', 'normal'); doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const descLines: string[] = doc.splitTextToSize(description, contentW);
  for (const l of descLines) { doc.text(l, margin, ctx.y); ctx.y += 10; }
  ctx.y += 6;
}

function drawActivationCards(
  doc: jsPDF, ctx: PDFContext, acts: any[], margin: number, contentW: number, ph: number,
  INK: [number, number, number], MUTED: [number, number, number], GOLD: [number, number, number],
  RULE: [number, number, number], CREAM: [number, number, number],
) {
  for (const act of acts) {
    const cardH = 52;
    ctx.checkPage(cardH + 8);

    const x = margin;
    const y = ctx.y;

    // Card background
    doc.setFillColor(...CREAM);
    doc.roundedRect(x, y, contentW, cardH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.roundedRect(x, y, contentW, cardH, 3, 3, 'S');

    // Left: Gold circle with angle/planet abbreviation
    const circleR = 12;
    const circleX = x + 20;
    const circleY = y + cardH / 2;
    doc.setFillColor(...GOLD);
    doc.circle(circleX, circleY, circleR, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    const abbr = ANGLE_ICON[act.srBody] || act.srBody.substring(0, 3).toUpperCase();
    doc.text(abbr, circleX, circleY + 3, { align: 'center' });

    // Arrow + aspect glyph
    const arrowX = circleX + circleR + 6;
    doc.setFont('times', 'normal'); doc.setFontSize(14);
    doc.setTextColor(...GOLD);
    doc.text(`→`, arrowX, circleY + 4);

    // Right content area
    const textX = arrowX + 14;
    const textW = contentW - (textX - x) - 8;
    let ty = y + 14;

    // Activation header: "SR Ascendant ☌ Natal Venus"
    doc.setFont('times', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(act.label, textX, ty);
    
    // Orb badge
    doc.setFont('times', 'normal'); doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`${act.orb}° orb`, x + contentW - 8, ty, { align: 'right' });
    ty += 10;

    // Aspect keyword line: "merges with · conjunction"
    doc.setFont('times', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(`${act.aspectKeyword} · ${act.aspectName}`, textX, ty);
    ty += 10;

    // Narrative
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const narLines: string[] = doc.splitTextToSize(act.narrative, textW);
    for (const l of narLines.slice(0, 2)) { doc.text(l, textX, ty); ty += 9; }

    ctx.y = y + cardH + 6;
  }
}

// ─── Year Priority Engine Section ───────────────────────────────
export function generatePDFYearPriority(
  ctx: PDFContext, doc: jsPDF,
  analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart,
) {
  ctx.sectionTitle(doc, 'YEAR PRIORITY ENGINE', 'Top Themes Ranked by House Placements and Angle Contacts');

  const ranked = computeYearPriorities(analysis, natalChart, srChart);
  const top3 = ranked.slice(0, 3);

  if (top3.length === 0) {
    ctx.writeBody(doc, 'Insufficient data to rank year themes.');
    return;
  }

  for (let i = 0; i < top3.length; i++) {
    const theme = top3[i];
    ctx.checkPage(100);

    ctx.drawCard(doc, () => {
      // Rank + label
      doc.setFont('times', 'bold'); doc.setFontSize(12);
      doc.setTextColor(...(i === 0 ? ctx.colors.gold : ctx.colors.ink));
      doc.text(`#${i + 1}  ${theme.label}`, ctx.margin + 12, ctx.y);
      ctx.y += 14;

      // Why this ranks
      ctx.trackedLabel(doc, 'WHY THIS RANKS', ctx.margin + 12, ctx.y, { size: 6, charSpace: 2 });
      ctx.y += 10;
      for (const d of theme.drivers.slice(0, 4)) {
        doc.setFont('times', 'normal'); doc.setFontSize(8);
        doc.setTextColor(...ctx.colors.ink);
        const lines = doc.splitTextToSize(`- ${d.source}`, ctx.contentW - 32);
        for (const l of lines) { doc.text(l, ctx.margin + 16, ctx.y); ctx.y += 11; }
      }
    }, i === 0 ? ctx.colors.gold : ctx.colors.rule);

    ctx.y += 8;
  }

  // Compact remaining
  const rest = ranked.slice(3, 8);
  if (rest.length > 0) {
    ctx.checkPage(60);
    ctx.trackedLabel(doc, 'OTHER ACTIVE THEMES', ctx.margin, ctx.y, { size: 7, charSpace: 3 });
    ctx.y += 14;
    for (const theme of rest) {
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...ctx.colors.ink);
      doc.text(theme.label, ctx.margin + 8, ctx.y);
      ctx.y += 11;
    }
  }
}
