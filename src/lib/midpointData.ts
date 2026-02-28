/**
 * Midpoint Calculator & Interpretations
 * Based on Michael Munkasey's "Midpoints: Unleashing the Power of the Planets"
 * 
 * A midpoint is the exact middle point between any two planets in your chart.
 * When a third planet sits at that midpoint, it "activates" or energizes
 * the combined meaning of the pair — creating a powerful three-way synthesis.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// ── Zodiac degree conversion ──
const SIGN_OFFSETS: Record<string, number> = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90, Leo: 120, Virgo: 150,
  Libra: 180, Scorpio: 210, Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330,
};

const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

export function toAbsoluteDegree(pos: NatalPlanetPosition): number {
  return (SIGN_OFFSETS[pos.sign] || 0) + pos.degree + (pos.minutes || 0) / 60;
}

export function absoluteToSignDegree(abs: number): { sign: string; degree: number; minutes: number } {
  const normalized = ((abs % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const inSign = normalized - signIndex * 30;
  return {
    sign: SIGN_NAMES[signIndex],
    degree: Math.floor(inSign),
    minutes: Math.round((inSign - Math.floor(inSign)) * 60),
  };
}

// ── Calculate midpoint between two absolute degrees ──
export function calculateMidpoint(degA: number, degB: number): number {
  const a = ((degA % 360) + 360) % 360;
  const b = ((degB % 360) + 360) % 360;
  let mid = (a + b) / 2;
  // Use the nearer midpoint (there are always two, 180° apart)
  if (Math.abs(a - b) > 180) {
    mid = (mid + 180) % 360;
  }
  return ((mid % 360) + 360) % 360;
}

// ── Planet keys we use for midpoints ──
export const MIDPOINT_PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'NorthNode', 'Ascendant', 'Chiron',
] as const;

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', Ascendant: 'ASC', Chiron: '⚷', Midheaven: 'MC',
};

// ── Check if a planet activates a midpoint (within orb) ──
export function isActivated(midDeg: number, planetDeg: number, orb = 2.0): boolean {
  const diff = Math.abs(midDeg - planetDeg);
  const d = diff > 180 ? 360 - diff : diff;
  // Check conjunction (0°), opposition (180°), square (90°), semi-square (45°)
  const harmonics = [0, 45, 90, 135, 180];
  return harmonics.some(h => {
    const hDiff = Math.abs(d - h);
    return hDiff <= orb;
  });
}

// ── Compute all midpoints for a chart ──
export interface MidpointResult {
  planetA: string;
  planetB: string;
  midpointDeg: number;
  midpointSign: string;
  midpointDegInSign: number;
  midpointMinutes: number;
  activatingPlanets: { name: string; aspect: string }[];
  interpretation: MidpointInterpretation | null;
}

function getAspectName(midDeg: number, planetDeg: number): string {
  const diff = Math.abs(midDeg - planetDeg);
  const d = diff > 180 ? 360 - diff : diff;
  if (d <= 2) return 'conjunction';
  if (Math.abs(d - 180) <= 2) return 'opposition';
  if (Math.abs(d - 90) <= 2) return 'square';
  if (Math.abs(d - 45) <= 2) return 'semi-square';
  if (Math.abs(d - 135) <= 2) return 'sesqui-square';
  return '';
}

export function computeChartMidpoints(chart: NatalChart): MidpointResult[] {
  const positions: { name: string; deg: number }[] = [];
  
  for (const p of MIDPOINT_PLANETS) {
    const pos = chart.planets[p as keyof typeof chart.planets];
    if (pos) {
      positions.push({ name: p, deg: toAbsoluteDegree(pos) });
    }
  }

  const results: MidpointResult[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i];
      const b = positions[j];
      const midDeg = calculateMidpoint(a.deg, b.deg);
      const signInfo = absoluteToSignDegree(midDeg);
      
      // Check which other planets activate this midpoint
      const activating: { name: string; aspect: string }[] = [];
      for (const p of positions) {
        if (p.name === a.name || p.name === b.name) continue;
        if (isActivated(midDeg, p.deg, 1.5)) {
          const asp = getAspectName(midDeg, p.deg);
          if (asp) activating.push({ name: p.name, aspect: asp });
        }
      }
      
      const key = `${a.name}/${b.name}`;
      const interpretation = MIDPOINT_INTERPRETATIONS[key] || null;
      
      results.push({
        planetA: a.name,
        planetB: b.name,
        midpointDeg: midDeg,
        midpointSign: signInfo.sign,
        midpointDegInSign: signInfo.degree,
        midpointMinutes: signInfo.minutes,
        activatingPlanets: activating,
        interpretation,
      });
    }
  }
  
  // Sort: activated midpoints first, then by importance
  return results.sort((a, b) => {
    if (a.activatingPlanets.length !== b.activatingPlanets.length) {
      return b.activatingPlanets.length - a.activatingPlanets.length;
    }
    return 0;
  });
}

// ── Interpretations ──
export interface MidpointInterpretation {
  title: string;
  emoji: string;
  basicIdea: string;
  personalLife: string;
  relationships: string;
  bodyMind: string;
  shadow: string;
}

export const MIDPOINT_INTERPRETATIONS: Record<string, MidpointInterpretation> = {
  'Sun/Moon': {
    title: 'Identity & Emotions',
    emoji: '☉☽',
    basicIdea: 'The marriage of your willpower and your feelings. This is your most personal midpoint — it represents your inner sense of wholeness, the blending of who you are (Sun) with what you need (Moon). When activated, you feel deeply aligned or deeply conflicted.',
    personalLife: 'How you integrate your public identity with your private emotional world. Your capacity for self-motivation and personal fulfillment. The quality of your relationship with yourself.',
    relationships: 'Your ability to bond and commit. This midpoint shows what you need to feel "at home" with another person. It often appears strongly in compatibility charts between partners.',
    bodyMind: 'Overall vitality and emotional well-being. The connection between your mental outlook and physical health. Stress when these two sides of you are at war.',
    shadow: 'Inner division — feeling like your heart wants one thing and your head wants another. Difficulty knowing what you truly want.',
  },
  'Sun/Mercury': {
    title: 'Mind & Will',
    emoji: '☉☿',
    basicIdea: 'Your thinking style fused with your sense of purpose. How you communicate your identity to the world. The power of your ideas and your ability to articulate your vision.',
    personalLife: 'Your intellectual confidence and how clearly you express yourself. Your learning style, curiosity, and mental agility. How you process and share information.',
    relationships: 'The way you talk in relationships — whether you lead conversations or listen. Your ability to express your needs clearly to others.',
    bodyMind: 'Brain function, nervous system vitality. The mind-body connection through the nervous system. How stress affects your thinking.',
    shadow: 'Over-identifying with your intellect. Being so attached to your opinions that you can\'t hear others. Nervous exhaustion from overthinking.',
  },
  'Sun/Venus': {
    title: 'Love & Radiance',
    emoji: '☉♀',
    basicIdea: 'Your capacity for joy, beauty, and attracting what you value. This is the "charisma" midpoint — the blending of your core identity with grace, charm, and aesthetic sensibility.',
    personalLife: 'Your relationship with pleasure, art, beauty, and money. How you express affection and what makes you feel appreciated. Your sense of personal worth.',
    relationships: 'Your attractiveness to others — not just physical, but the warmth and charm you radiate. How you show love and what you need to feel loved.',
    bodyMind: 'Throat, kidneys, and blood sugar balance. The healing power of beauty, nature, and sensory pleasure. Skin radiance and overall physical grace.',
    shadow: 'Vanity, excessive people-pleasing, or measuring your worth through others\' approval. Overindulgence as self-medication.',
  },
  'Sun/Mars': {
    title: 'Will & Drive',
    emoji: '☉♂',
    basicIdea: 'Your raw energy and ambition. The fusion of identity with action — this is your competitive edge, your courage, and your capacity to fight for what matters.',
    personalLife: 'Your initiative, physical energy, and assertiveness. How you go after what you want. Your relationship with anger, conflict, and healthy aggression.',
    relationships: 'Sexual chemistry and passion. How you handle conflicts and disagreements. Whether you fight fair or fight dirty.',
    bodyMind: 'Physical vitality, muscular strength, adrenal function. Your energy reserves and how quickly you burn through them.',
    shadow: 'Aggression, impulsiveness, domineering behavior. Burning out by pushing too hard. Anger issues masking deeper insecurity.',
  },
  'Sun/Jupiter': {
    title: 'Purpose & Growth',
    emoji: '☉♃',
    basicIdea: 'Your optimism, faith, and sense of meaning. This is the "big picture" midpoint — your capacity to envision a greater life and to believe you can achieve it.',
    personalLife: 'Your generosity, luck factor, and philosophical outlook. How you grow as a person — through travel, education, spirituality, or adventure.',
    relationships: 'How much joy and generosity you bring to partnerships. Your ability to be encouraging and uplifting with others.',
    bodyMind: 'Liver function, weight management, and overall physical expansion. The healing power of optimism and laughter.',
    shadow: 'Over-promising, exaggeration, arrogance. Believing you\'re above consequences. Excess and entitlement.',
  },
  'Sun/Saturn': {
    title: 'Purpose & Discipline',
    emoji: '☉♄',
    basicIdea: 'Your capacity for mastery, responsibility, and endurance. Where the Sun gives identity, Saturn demands you earn it. This is the midpoint of maturity, hard work, and lasting achievement.',
    personalLife: 'Your relationship with authority, discipline, and time. How you build structure in your life. Your ambition tempered by patience and realistic planning.',
    relationships: 'Loyalty, commitment, and the ability to show up consistently. Sometimes coldness or emotional reservation with partners.',
    bodyMind: 'Bone density, teeth, joints, and skin. The aging process. How chronic stress manifests physically over time.',
    shadow: 'Excessive self-criticism, depression, rigidity. Fear of failure preventing you from even trying. Workaholism as avoidance.',
  },
  'Sun/Uranus': {
    title: 'Identity & Freedom',
    emoji: '☉♅',
    basicIdea: 'Your uniqueness, originality, and need for independence. This midpoint electrifies your sense of self — it\'s where you break free from convention and insist on being authentically you.',
    personalLife: 'Your rebellious streak, innovative thinking, and tolerance for sudden change. How you handle disruption and surprise.',
    relationships: 'Need for space and autonomy within partnerships. Attraction to unconventional people or relationship structures.',
    bodyMind: 'Nervous system sensitivity, electrical impulses in the body. Sudden health events or breakthroughs.',
    shadow: 'Chronic restlessness, inability to commit, alienating others with your need to be different. Chaos disguised as freedom.',
  },
  'Sun/Neptune': {
    title: 'Identity & Vision',
    emoji: '☉♆',
    basicIdea: 'Your imagination, spiritual sensitivity, and creative vision. This midpoint dissolves the boundaries of ego — for better (compassion, art, transcendence) or worse (confusion, escapism, deception).',
    personalLife: 'Your connection to spirituality, dreams, and the unseen world. Your artistic and musical sensitivity. Your capacity for empathy and self-sacrifice.',
    relationships: 'Idealization of partners, romantic fantasies, and the challenge of seeing people clearly. Deep soul connections and codependency.',
    bodyMind: 'Immune system, lymphatic flow, and sensitivity to medications or substances. Psychosomatic symptoms. The healing power of meditation.',
    shadow: 'Self-deception, victim mentality, escapism through substances or fantasy. Losing yourself in others\' needs.',
  },
  'Sun/Pluto': {
    title: 'Identity & Power',
    emoji: '☉♇',
    basicIdea: 'Your deepest reserves of personal power. This midpoint represents transformation, intensity, and the ability to regenerate after destruction. It\'s where you confront your own darkness and emerge stronger.',
    personalLife: 'Your relationship with power, control, and transformation. Life-changing events that reshape who you are. Your capacity for deep psychological insight.',
    relationships: 'Intense, all-or-nothing bonds. Power struggles and the dance between vulnerability and control. Transformative relationships.',
    bodyMind: 'Reproductive system, elimination, and cellular regeneration. The body\'s ability to heal from deep trauma. DNA and genetic expression.',
    shadow: 'Obsession, manipulation, paranoia. Using power over others instead of empowerment. Refusing to let go of what needs to die.',
  },
  'Sun/NorthNode': {
    title: 'Identity & Destiny',
    emoji: '☉☊',
    basicIdea: 'Your life path illuminated by your core self. This midpoint highlights where your ego and your soul\'s evolutionary direction align — your capacity to grow toward your highest potential.',
    personalLife: 'Key connections and turning points that advance your soul growth. People who show up at the right time to help you evolve.',
    relationships: 'Fated meetings and karmic partnerships. People who feel destined or significant from the moment you meet them.',
    bodyMind: 'Vitality shifts connected to major life transitions. Your body\'s response to being "on path" versus "off path."',
    shadow: 'Confusing ego desires with soul purpose. Believing you\'re special or chosen while avoiding the actual work of growth.',
  },
  'Sun/Ascendant': {
    title: 'Identity & Presence',
    emoji: '☉↑',
    basicIdea: 'How your inner self meets the outer world. This midpoint shows how visible and authentic your self-expression is — whether people see the "real you" or a mask.',
    personalLife: 'Your personal impact on others. How you walk into a room. Your body language and the impression you make without trying.',
    relationships: 'First impressions in love and friendship. How quickly people "get" who you are. Whether you attract people who appreciate your true self.',
    bodyMind: 'Physical appearance, overall vitality and health presentation. How your inner state shows up in your face and posture.',
    shadow: 'Performing a version of yourself for approval. Disconnection between who you are inside and who you show the world.',
  },
  'Moon/Mercury': {
    title: 'Feelings & Thoughts',
    emoji: '☽☿',
    basicIdea: 'The bridge between your emotional world and your rational mind. How you think about your feelings and feel about your thoughts. Your emotional intelligence.',
    personalLife: 'Your inner monologue — the way you talk to yourself. Your memory, especially emotional memories. Intuitive reasoning and gut feelings that prove correct.',
    relationships: 'How you communicate feelings to others. The ability to understand what someone means behind what they say. Emotional literacy in partnerships.',
    bodyMind: 'Gut-brain connection, digestive sensitivity tied to emotions. Anxiety and worry patterns. Sleep quality affected by an active mind.',
    shadow: 'Overthinking feelings until you lose touch with them. Rationalizing emotions away. Gossip as emotional processing.',
  },
  'Moon/Venus': {
    title: 'Nurturing & Love',
    emoji: '☽♀',
    basicIdea: 'Your capacity for tenderness, comfort, and emotional pleasure. The most feminine midpoint — blending receptivity with grace. How you nurture and wish to be nurtured.',
    personalLife: 'Your relationship with comfort, food, home beauty, and self-care. What makes you feel safe and cherished. Your aesthetic instincts.',
    relationships: 'Deep emotional warmth in partnerships. The ability to create a loving, beautiful home life. Romantic sweetness and devotion.',
    bodyMind: 'Hormonal balance, fertility, breast health. The healing power of comfort foods, baths, and sensory soothing.',
    shadow: 'Emotional eating, codependency, staying in bad relationships because they\'re "comfortable." Smothering others with love.',
  },
  'Moon/Mars': {
    title: 'Feelings & Action',
    emoji: '☽♂',
    basicIdea: 'Your emotional courage and instinctive reactions. This midpoint fires up your emotions — it\'s where feelings become fuel for action, for better or worse.',
    personalLife: 'Your emotional intensity and reactivity. How quickly you act on feelings. Your courage to defend what you care about.',
    relationships: 'Passionate emotional responses. Fighting for the relationship — or just fighting. The heat between desire and emotional need.',
    bodyMind: 'Stomach acid, menstrual cycle, adrenal response to emotional triggers. Physical restlessness from unexpressed feelings.',
    shadow: 'Emotional volatility, moodiness driving impulsive actions. Passive aggression. Confusing anger with hurt.',
  },
  'Moon/Jupiter': {
    title: 'Feelings & Faith',
    emoji: '☽♃',
    basicIdea: 'Emotional generosity and inner abundance. This midpoint expands your emotional world — more feeling, more faith, more capacity to trust life. Your emotional optimism.',
    personalLife: 'A naturally hopeful emotional outlook. Generosity of spirit. Finding meaning and purpose through feelings rather than logic.',
    relationships: 'Warmth, humor, and emotional generosity with partners. The ability to forgive and see the best in people.',
    bodyMind: 'Water retention, liver and stomach interaction. Emotional overeating. The healing power of laughter and positive expectations.',
    shadow: 'Emotional excess, over-promising comfort you can\'t deliver. Using positivity to bypass genuine pain.',
  },
  'Moon/Saturn': {
    title: 'Feelings & Responsibility',
    emoji: '☽♄',
    basicIdea: 'Emotional maturity and the weight of feeling deeply. This midpoint brings structure to your emotional life — or restricts it. Learning to hold space for heavy feelings.',
    personalLife: 'Your emotional resilience and endurance. How you handle sadness, loneliness, and disappointment. The mother-father dynamic internalized.',
    relationships: 'Loyalty earned through time. Emotional walls that protect but also isolate. Learning to be vulnerable without being fragile.',
    bodyMind: 'Chronic emotional tension held in the body — especially stomach, skin, bones. Depression and its physical manifestations.',
    shadow: 'Emotional suppression, chronic worry, guilt. Punishing yourself for having needs. Coldness masking deep sensitivity.',
  },
  'Moon/Uranus': {
    title: 'Feelings & Freedom',
    emoji: '☽♅',
    basicIdea: 'Emotional electricity and the need for excitement. Your feelings change rapidly, your intuition is lightning-fast, and you need emotional freedom above all.',
    personalLife: 'Sudden emotional shifts, flashes of intuition, and a need for stimulation. An unconventional emotional makeup that doesn\'t follow "normal" patterns.',
    relationships: 'Attraction to exciting, unpredictable partners. Difficulty with emotional routine. Need for space and independence in love.',
    bodyMind: 'Nervous stomach, irregular emotional rhythms, sensitivity to electromagnetic fields. Sudden emotional releases that affect the body.',
    shadow: 'Emotional detachment disguised as independence. Chaos in domestic life. Running from intimacy.',
  },
  'Moon/Neptune': {
    title: 'Feelings & Intuition',
    emoji: '☽♆',
    basicIdea: 'Your psychic sensitivity and emotional depth. The most intuitive midpoint — dreams, empathy, and the ability to feel what others feel. The mystic within.',
    personalLife: 'Rich inner life, vivid dreams, artistic sensitivity. Your capacity for empathy, compassion, and spiritual connection through emotion.',
    relationships: 'Soul-level emotional bonds. Romanticizing partners. The ability to sense a partner\'s feelings without words — or to project your fantasies onto them.',
    bodyMind: 'Sensitivity to medications, alcohol, and environmental toxins. Psychosomatic symptoms. Water balance in the body. Immune sensitivity.',
    shadow: 'Emotional confusion, boundary dissolution, martyrdom. Absorbing others\' emotions as your own. Escapism through fantasy or substances.',
  },
  'Moon/Pluto': {
    title: 'Feelings & Transformation',
    emoji: '☽♇',
    basicIdea: 'The deepest emotional intensity. This midpoint takes you to the bottom of your psyche — primal feelings, powerful instincts, and the capacity for profound emotional transformation.',
    personalLife: 'Intense emotional experiences that fundamentally change you. Your relationship with your own darkness, fear, and desire. Psychological depth.',
    relationships: 'Obsessive attachments, powerful bonding, emotional control dynamics. Relationships that transform both people — sometimes through crisis.',
    bodyMind: 'Gut instincts, reproductive health, hormonal intensity. The body\'s response to emotional trauma and its capacity for emotional healing.',
    shadow: 'Emotional manipulation, jealousy, obsession. Using emotional intensity to control others. Inability to let go.',
  },
  'Venus/Mars': {
    title: 'Love & Desire',
    emoji: '♀♂',
    basicIdea: 'The ultimate relationship midpoint — the fusion of attraction and action, receptivity and assertion, feminine and masculine energy. Your erotic nature and creative passion.',
    personalLife: 'Your artistic drive and creative expression. How you balance giving and receiving. Your relationship with money — earning it and enjoying it.',
    relationships: 'Sexual chemistry, romantic pursuit, and the dance between desire and tenderness. How you initiate and respond in love.',
    bodyMind: 'Hormonal balance between estrogen and testosterone. Sexual vitality. The body\'s pleasure-pain response.',
    shadow: 'Using sexuality as power. Confusing lust with love. Passive aggression in romance — wanting something but refusing to ask directly.',
  },
  'Venus/Jupiter': {
    title: 'Love & Abundance',
    emoji: '♀♃',
    basicIdea: 'The "luckiest" midpoint — grace meeting opportunity. Your capacity for joy, generosity, and attracting good fortune. Art, beauty, and wealth amplified.',
    personalLife: 'A naturally generous and optimistic nature. Good taste, love of luxury, and the ability to attract abundance. Artistic talent blessed with opportunity.',
    relationships: 'Warm, joyful partnerships filled with laughter and shared adventures. Attracting partners who are generous and encouraging.',
    bodyMind: 'Healthy appetite, tendency toward weight gain from enjoying life too much. Thyroid and liver connection. The healing power of pleasure.',
    shadow: 'Extravagance, laziness, taking good fortune for granted. Expecting love without earning it. Over-indulgence.',
  },
  'Venus/Saturn': {
    title: 'Love & Commitment',
    emoji: '♀♄',
    basicIdea: 'Love that endures through time and difficulty. The midpoint of loyalty, mature love, and beauty that deepens with age. Also: the fear of not being lovable.',
    personalLife: 'Your relationship with self-worth and whether you feel deserving of love. Artistic discipline — craft mastered over years. Conservative taste.',
    relationships: 'Long-lasting commitments, age-gap relationships, and the work required to maintain love. Choosing stability over passion.',
    bodyMind: 'Skin health, bone density, dental health. Chronic conditions related to self-worth. The body\'s response to loneliness.',
    shadow: 'Withholding love as punishment. Staying in loveless relationships out of duty. Believing you don\'t deserve happiness.',
  },
  'Venus/Neptune': {
    title: 'Love & Transcendence',
    emoji: '♀♆',
    basicIdea: 'The most romantic midpoint — divine love, artistic vision, and the longing for a soulmate. Where beauty becomes spiritual and love becomes art.',
    personalLife: 'Extraordinary artistic sensitivity and imagination. Attraction to music, film, photography, and anything that captures the ineffable. Spiritual devotion.',
    relationships: 'The soulmate fantasy — and sometimes the real thing. Idealized love that inspires but can also deceive. Unconditional love and its challenges.',
    bodyMind: 'Sensitivity to drugs and alcohol. Allergies, immune confusion. The healing power of music, water, and beauty.',
    shadow: 'Romantic delusion, loving someone\'s potential instead of their reality. Sacrificing yourself for an ideal that doesn\'t exist.',
  },
  'Venus/Pluto': {
    title: 'Love & Obsession',
    emoji: '♀♇',
    basicIdea: 'Transformative love and magnetic attraction. This midpoint intensifies everything Venus touches — deeper pleasure, deeper attachment, deeper pain. Love as alchemy.',
    personalLife: 'Powerful creative drive, financial transformation, and the capacity to completely reinvent your sense of beauty and worth.',
    relationships: 'Obsessive attractions, jealousy, and the kind of love that changes you forever. Power dynamics in romance. Taboo attractions.',
    bodyMind: 'Reproductive health, hormonal intensity. The body\'s response to intense pleasure and pain. Detoxification and purging.',
    shadow: 'Possessiveness, using love as control, sexual manipulation. Destroying relationships through jealousy. Financial power plays.',
  },
  'Mars/Jupiter': {
    title: 'Action & Expansion',
    emoji: '♂♃',
    basicIdea: 'Ambitious energy and enthusiastic action. Your capacity to take big, bold moves. The warrior blessed with faith — confident action powered by vision.',
    personalLife: 'Physical vitality, competitive spirit, and the courage to take risks. Athletic ability and entrepreneurial drive.',
    relationships: 'Energizing, adventurous partnerships. Competing together rather than against each other. Shared enthusiasm.',
    bodyMind: 'Muscular strength, liver-adrenal connection. The body\'s capacity for peak performance and recovery.',
    shadow: 'Recklessness, overconfidence, biting off more than you can chew. Aggression justified by "noble" causes.',
  },
  'Mars/Saturn': {
    title: 'Action & Endurance',
    emoji: '♂♄',
    basicIdea: 'Controlled power and disciplined effort. The midpoint of stamina, strategic action, and the ability to work relentlessly toward a long-term goal. Force meets form.',
    personalLife: 'Your capacity for hard, sustained work. Military or athletic discipline. How you handle frustration and delayed gratification.',
    relationships: 'Patience and persistence in love — or frustration and resentment when effort goes unrecognized. The "strong silent type."',
    bodyMind: 'Muscle tension, joint inflammation, teeth grinding. The body under sustained stress. Endurance sports and physical discipline.',
    shadow: 'Bottled-up anger, cruelty, ruthlessness. Breaking down from relentless pressure. Punishing yourself or others.',
  },
  'Mars/Pluto': {
    title: 'Power & Intensity',
    emoji: '♂♇',
    basicIdea: 'The most powerful action midpoint — raw, transformative force. Your capacity to move mountains, to survive impossible situations, and to regenerate after devastation.',
    personalLife: 'Extraordinary willpower, physical stamina, and the drive to overcome any obstacle. Life-or-death intensity in everything you do.',
    relationships: 'Power struggles, intense physical attraction, and the capacity for both destruction and renewal within partnerships.',
    bodyMind: 'Adrenal extremes, surgical recovery, physical regeneration. The body\'s fight-or-flight at maximum intensity.',
    shadow: 'Obsessive need to dominate. Using force instead of persuasion. Destructive rage. Violence as a response to feeling powerless.',
  },
  'Jupiter/Saturn': {
    title: 'Expansion & Contraction',
    emoji: '♃♄',
    basicIdea: 'The great balancing act between growth and limitation, optimism and realism, faith and responsibility. This midpoint represents your ability to build something lasting and meaningful.',
    personalLife: 'Your sense of timing — knowing when to push forward and when to consolidate. Career ambition balanced by practical planning.',
    relationships: 'Mature partnerships that grow over time. The balance between having fun together and building something real.',
    bodyMind: 'Liver and bone health. The body\'s balance between expansion and contraction. Weight fluctuations tied to mood and ambition.',
    shadow: 'Paralysis between wanting more and fearing loss. Pessimistic optimism — hoping for the best but expecting the worst.',
  },
  'Saturn/Uranus': {
    title: 'Structure & Revolution',
    emoji: '♄♅',
    basicIdea: 'The tension between tradition and innovation, security and freedom, the old world and the new. Your ability to reform systems from within — or to shatter them.',
    personalLife: 'How you handle sudden changes to your life structure. Your relationship with authority and rebellion. Innovation within discipline.',
    relationships: 'The push-pull between commitment and independence. Relationships that challenge your need for both security and freedom.',
    bodyMind: 'Nervous tension, spasms, sudden structural issues (like back problems). The body\'s response to life upheavals.',
    shadow: 'Chronic anxiety from trying to control the uncontrollable. Rigid thinking that breaks instead of bending. Chaotic rebellions that destroy what you\'ve built.',
  },
  'Saturn/Neptune': {
    title: 'Reality & Dreams',
    emoji: '♄♆',
    basicIdea: 'The meeting of the practical and the mystical. Your capacity to make dreams real — or to have reality dissolve your dreams. Spiritual discipline and creative mastery.',
    personalLife: 'How you bring spiritual or artistic vision into concrete form. Your relationship with disillusionment, loss, and finding meaning through suffering.',
    relationships: 'The challenge of maintaining ideals within the structure of real commitment. Sacrifice and duty in love.',
    bodyMind: 'Immune system and chronic fatigue. The body\'s response to grief and spiritual crisis. Sensitivity to medications.',
    shadow: 'Cynicism, depression, feeling like dreams are impossible. Sacrificing so much that you lose yourself.',
  },
  'Saturn/Pluto': {
    title: 'Power & Endurance',
    emoji: '♄♇',
    basicIdea: 'The heaviest midpoint — ultimate power through ultimate discipline. The capacity to endure, survive, and rebuild from total destruction. Governments, institutions, and deep structural transformation.',
    personalLife: 'Your ability to face the darkest aspects of life and keep going. Ambition that borders on obsession. The drive to master power itself.',
    relationships: 'Intense loyalty and the willingness to weather any storm together. Also: control issues and power plays that can destroy partnerships.',
    bodyMind: 'Bone and teeth issues, chronic conditions that require endurance. The body\'s relationship with aging, regeneration, and survival.',
    shadow: 'Ruthlessness, authoritarian tendencies, crushing weight of responsibility. Using control to manage fear of annihilation.',
  },
  'Uranus/Neptune': {
    title: 'Innovation & Mysticism',
    emoji: '♅♆',
    basicIdea: 'Generational visioning — the marriage of scientific breakthrough and spiritual awakening. Technology meets consciousness. Your connection to collective awakening.',
    personalLife: 'Your relationship with cutting-edge ideas, alternative spirituality, and visionary experiences. Sudden spiritual insights.',
    relationships: 'Unconventional spiritual bonds. Relationships that feel like they belong to a different dimension or era.',
    bodyMind: 'Neurological sensitivity, unusual reactions to substances, electromagnetic sensitivity.',
    shadow: 'Spiritual delusion combined with technological escapism. Conspiracy thinking. Disconnection from grounded reality.',
  },
  'Uranus/Pluto': {
    title: 'Revolution & Transformation',
    emoji: '♅♇',
    basicIdea: 'The most explosive generational midpoint — sudden, radical transformation. Revolution, upheaval, and the total dismantling of what no longer serves evolution.',
    personalLife: 'Sudden life-changing events, radical personal transformation, and the courage to completely reinvent yourself.',
    relationships: 'Relationships that catalyze total transformation. Sudden breakups or sudden unions that change the course of your life.',
    bodyMind: 'Sudden health crises that lead to transformation. The body\'s response to extreme stress and its capacity for radical healing.',
    shadow: 'Destructive revolution, chaos for its own sake. Burning everything down without a plan for what comes next.',
  },
  'Neptune/Pluto': {
    title: 'Transcendence & Power',
    emoji: '♆♇',
    basicIdea: 'The deepest generational midpoint — the intersection of spiritual evolution and primal power. Mass movements, collective shadow, and humanity\'s relationship with the divine and the destructive.',
    personalLife: 'Your connection to collective spiritual currents. Deep psychological and spiritual transformation. Shamanic experiences.',
    relationships: 'Soul-level bonds that feel beyond personal choice. Karmic connections tied to larger collective patterns.',
    bodyMind: 'Immune and reproductive systems at the deepest level. Genetic and ancestral healing. Responses to mass health events.',
    shadow: 'Spiritual manipulation, cult dynamics, using transcendence to avoid accountability. Addiction as a shadow spiritual quest.',
  },
  'Mercury/Venus': {
    title: 'Thought & Beauty',
    emoji: '☿♀',
    basicIdea: 'The art of communication — charm, wit, and the ability to make ideas beautiful. Your capacity for diplomacy, writing, singing, and refined expression.',
    personalLife: 'Your taste in art, literature, and conversation. How you beautify your ideas and sweeten your words. Social grace and tact.',
    relationships: 'Love letters, sweet talk, and the ability to make a partner feel appreciated through words. Flirtatious communication.',
    bodyMind: 'Throat and voice quality. The connection between mental relaxation and physical beauty. Singing as healing.',
    shadow: 'Superficial charm, saying what people want to hear instead of the truth. Valuing style over substance.',
  },
  'Mercury/Mars': {
    title: 'Thought & Action',
    emoji: '☿♂',
    basicIdea: 'Quick thinking and sharp speech. Your mental speed, debate skills, and the ability to turn ideas into action immediately. The strategist and the surgeon.',
    personalLife: 'Fast reflexes, sharp wit, and decisive thinking. Your capacity for argument, debate, and cutting through confusion with clarity.',
    relationships: 'Stimulating conversations and heated debates. The ability to communicate assertively — or to wound with words.',
    bodyMind: 'Nerve reflexes, hand-eye coordination, headaches from mental overexertion. The surgeon\'s precision.',
    shadow: 'Verbal cruelty, using words as weapons. Mental aggression. Speaking before thinking and causing damage.',
  },
  'Mercury/Jupiter': {
    title: 'Thought & Wisdom',
    emoji: '☿♃',
    basicIdea: 'Big thinking and the love of learning. Your intellectual vision, philosophical mind, and ability to see the bigger picture. Teaching, publishing, and spreading ideas.',
    personalLife: 'Love of travel, education, and broadening your worldview. Intellectual optimism and the ability to inspire others through ideas.',
    relationships: 'Shared intellectual interests, exploring ideas together, teaching each other. The joy of mental companionship.',
    bodyMind: 'Lung capacity, breathing patterns. The mind\'s effect on physical expansion. Travel as mental health medicine.',
    shadow: 'Know-it-all tendencies, intellectual arrogance, promising more than you can deliver intellectually.',
  },
  'Mercury/Saturn': {
    title: 'Thought & Structure',
    emoji: '☿♄',
    basicIdea: 'Disciplined thinking and serious communication. Your capacity for deep study, careful planning, and saying exactly what you mean — no more, no less.',
    personalLife: 'Methodical learning, patient research, and the ability to master complex subjects over time. Your inner critic and how it shapes your thinking.',
    relationships: 'Clear communication about expectations and boundaries. Sometimes difficulty expressing warmth or emotion through words.',
    bodyMind: 'Tension headaches, jaw clenching, respiratory restriction under stress. The mind\'s relationship with chronic worry.',
    shadow: 'Pessimistic thinking, mental rigidity, fear of speaking up. Silencing yourself out of fear of being wrong.',
  },
  'Mercury/Uranus': {
    title: 'Thought & Genius',
    emoji: '☿♅',
    basicIdea: 'Brilliant, unconventional thinking and lightning-fast insight. The inventor\'s mind — flashes of genius, original ideas, and the ability to see what others miss.',
    personalLife: 'Intellectual excitement, love of technology, and restless curiosity. Your "eureka" moments and how they change your direction.',
    relationships: 'Stimulating conversations, surprising insights, and the need for intellectual freedom in partnerships.',
    bodyMind: 'Nervous system excitability, insomnia from racing thoughts. The brain\'s electrical activity and neural plasticity.',
    shadow: 'Mental instability, scattered thinking, contrarian for the sake of it. Ideas without follow-through.',
  },
  'Mercury/Neptune': {
    title: 'Thought & Imagination',
    emoji: '☿♆',
    basicIdea: 'Poetic thinking and intuitive communication. Your ability to channel ideas from beyond the rational mind. Music, poetry, film, and inspired writing.',
    personalLife: 'Rich imagination, psychic impressions, and the ability to sense meaning in symbols, dreams, and art.',
    relationships: 'Unspoken understanding, finishing each other\'s sentences. Also: miscommunication from assuming you know what someone means.',
    bodyMind: 'Sensitivity to medications, brain fog, and the nervous system\'s response to spiritual practices like meditation.',
    shadow: 'Lying, self-deception, confused thinking. Believing your fantasies are facts. Difficulty distinguishing intuition from wishful thinking.',
  },
  'Mercury/Pluto': {
    title: 'Thought & Depth',
    emoji: '☿♇',
    basicIdea: 'Penetrating insight and psychological depth. The detective\'s mind — your ability to see through facades, uncover hidden truths, and communicate with transformative power.',
    personalLife: 'Research skills, investigative thinking, and the ability to get to the bottom of any mystery. Your persuasive power and depth of analysis.',
    relationships: 'The ability to read people deeply — and sometimes uncomfortably. Conversations that change everything.',
    bodyMind: 'Nervous system under intense psychological pressure. The mind\'s role in healing through awareness and naming what\'s hidden.',
    shadow: 'Mental obsession, paranoid thinking, using information as power over others. Manipulation through words.',
  },
  'Jupiter/Uranus': {
    title: 'Growth & Breakthrough',
    emoji: '♃♅',
    basicIdea: 'Sudden opportunities and lucky breaks. The midpoint of innovation meeting expansion — breakthroughs that open entirely new chapters of life.',
    personalLife: 'Unexpected windfalls, sudden travel, and revolutionary ideas that change your trajectory. Entrepreneurial vision.',
    relationships: 'Exciting partnerships that open new worlds. Meeting people who dramatically expand your horizons.',
    bodyMind: 'Sudden improvements in health. The body\'s positive response to excitement and new experiences.',
    shadow: 'Gambling on every impulse, instability disguised as adventure. Discarding commitments at the first sign of boredom.',
  },
  'Jupiter/Neptune': {
    title: 'Faith & Imagination',
    emoji: '♃♆',
    basicIdea: 'Spiritual expansion and visionary faith. The midpoint of the mystic and the philosopher — transcendent experiences, charitable giving, and infinite compassion.',
    personalLife: 'Spiritual seeking, charitable impulses, and the ability to envision a better world. Artistic and musical talent infused with soul.',
    relationships: 'Idealistic love, shared spiritual journeys, and the joy of growing together in faith and meaning.',
    bodyMind: 'Liver-immune connection. The healing power of faith, prayer, and spiritual practice. Sensitivity to intoxicants.',
    shadow: 'Spiritual bypassing, naive trust, believing in saviors. Excess generosity that enables others\' dysfunction.',
  },
  'Jupiter/Pluto': {
    title: 'Growth & Power',
    emoji: '♃♇',
    basicIdea: 'Massive ambition and the drive for wealth, influence, and impact. The capacity to build empires — financial, intellectual, or spiritual.',
    personalLife: 'Your relationship with wealth, power, and influence. The drive to make a significant mark on the world.',
    relationships: 'Power couples, partnerships that create wealth or influence. The dynamics of shared resources and mutual empowerment.',
    bodyMind: 'Liver and reproductive health. The body\'s response to positions of great power or wealth.',
    shadow: 'Greed, megalomania, corruption. Using philosophy or spirituality to justify the pursuit of power.',
  },
  'Sun/Chiron': {
    title: 'Identity & Healing',
    emoji: '☉⚷',
    basicIdea: 'Your core wound and your healing gift. Where your sense of self was most deeply hurt — and where you develop the wisdom to help others heal the same wound.',
    personalLife: 'The wound in your identity that drives you to understand suffering. Your capacity to transform pain into teaching.',
    relationships: 'Attracting people who mirror your wounds back to you. Healing partnerships and the gift of empathetic witnessing.',
    bodyMind: 'Chronic health issues that become a path to holistic understanding. The body as teacher.',
    shadow: 'Identifying with being wounded. Using your pain as an identity rather than transforming it. Helping others to avoid healing yourself.',
  },
  'Moon/Chiron': {
    title: 'Feelings & Healing',
    emoji: '☽⚷',
    basicIdea: 'The emotional wound — often related to mothering, belonging, and feeling safe. Your sensitivity becomes your greatest healing tool when you learn to hold space for pain.',
    personalLife: 'Deep emotional sensitivity that was once a source of suffering but becomes a source of wisdom. Healing through nurturing others.',
    relationships: 'The ability to sense others\' emotional pain and offer genuine comfort. Wounded caretaker dynamics.',
    bodyMind: 'Stomach and digestive sensitivity connected to emotional wounds. The body\'s memory of early emotional experiences.',
    shadow: 'Emotional wounds that never heal because you keep reopening them. Caretaking as codependency.',
  },
  'Venus/Uranus': {
    title: 'Love & Excitement',
    emoji: '♀♅',
    basicIdea: 'Love at first sight and the craving for romantic excitement. Unconventional beauty, avant-garde art, and relationships that defy social norms.',
    personalLife: 'Unique aesthetic taste, attraction to the unusual, and a need for creative freedom. Financial surprises — both windfalls and losses.',
    relationships: 'Electric attraction, on-again off-again dynamics, and the need for novelty in love. Polyamory, open relationships, or simply unpredictable partners.',
    bodyMind: 'Hormonal fluctuations, nervous system sensitivity tied to romantic excitement. The body\'s response to sudden attraction.',
    shadow: 'Commitment phobia dressed up as "needing freedom." Serial infatuation. Mistaking intensity for depth.',
  },
  'Mars/Uranus': {
    title: 'Action & Rebellion',
    emoji: '♂♅',
    basicIdea: 'Explosive energy and the courage to break free. Your most daring, risk-taking impulse — the part of you that acts suddenly, decisively, and without asking permission.',
    personalLife: 'Sudden bursts of energy, risk-taking behavior, and the drive to do things your own way. Mechanical and technical ability.',
    relationships: 'Exciting but volatile partnerships. The person who shakes up your world — for better or worse.',
    bodyMind: 'Accident-proneness, sudden injuries, electrical sensitivity. The body\'s need for physical freedom and release.',
    shadow: 'Reckless behavior, explosive temper, dangerous impulsiveness. Breaking things (and people) in the name of freedom.',
  },
  'Mars/Neptune': {
    title: 'Action & Imagination',
    emoji: '♂♆',
    basicIdea: 'Inspired action and creative drive. The dancer, the actor, the healer who channels invisible forces into physical reality. Also: confusion about what you actually want.',
    personalLife: 'Artistic and spiritual motivation. The ability to act on inspiration. Compassion in action — volunteer work, activism, healing.',
    relationships: 'Romantic idealism in action. Rescuing or being rescued. Sexual fantasy and the gap between desire and reality.',
    bodyMind: 'Immune-adrenal connection. Sensitivity to drugs and alcohol. The body\'s response to spiritual practice and creative flow.',
    shadow: 'Passive aggression, deception, acting under false pretenses. Weakness disguised as spirituality. Addiction.',
  },
  // Mars/Saturn already defined above as 'Action & Endurance'
};

// ── What the midpoint means "about" ──
export const MIDPOINT_EDUCATION = {
  whatIs: 'A midpoint is the exact middle point between any two planets in your birth chart. Think of it as the place where two planetary energies blend into a single, combined meaning — like mixing two colors to create a third.',
  whyMatters: 'Midpoints reveal hidden connections in your chart that regular aspects might miss. When a third planet sits at your midpoint, it "activates" or energizes both planets at once — creating a three-way dialogue that profoundly shapes your personality and life experience.',
  howToRead: 'Look for midpoints that have one or more activating planets (shown with a ⚡ icon). These are your strongest midpoints — the ones most actively shaping your life. Midpoints without activators still exist as latent potential.',
  history: 'Midpoints were pioneered by the cosmobiology school of Reinhold Ebertin in Germany and further developed by Michael Munkasey. They go beyond traditional aspects to reveal the deeper synthesis of planetary energies working together.',
};
