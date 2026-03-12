/**
 * Expert-level Solar Return aspect interpretations.
 * Written in the voice of a wise teacher explaining to a bright 10-year-old:
 * clear, warm, grounded, with "how you'll feel" and "what to do" guidance.
 *
 * Structure:
 *   aspectMeanings  – what each aspect TYPE feels like (conjunction, trine, etc.)
 *   planetMeanings  – what each planet represents in your life
 *   srToNatalInterp – full paragraph combining aspect + both planets + SR context
 */

// ── Aspect-type core meanings ──────────────────────────────────────────
export const aspectTypeMeanings: Record<string, {
  glyph: string;
  keyword: string;
  feeling: string;
  childExplain: string;
}> = {
  Conjunction: {
    glyph: '☌',
    keyword: 'Fusion',
    feeling: 'Two energies merge into one — they can\'t be separated this year. It\'s like mixing two colors of paint: you get something brand new.',
    childExplain: 'Imagine two friends who are always together — they do everything as a team. That\'s what a conjunction feels like. The two planets become best friends and work as one force in your life.',
  },
  Sextile: {
    glyph: '⚹',
    keyword: 'Opportunity',
    feeling: 'A friendly door opens between two parts of your life. You still have to walk through it — it won\'t push you — but the path is clear and inviting.',
    childExplain: 'Think of it like getting an invitation to a really fun party. Nobody is forcing you to go, but if you say yes, great things happen. A sextile is the universe giving you a gentle nudge.',
  },
  Square: {
    glyph: '□',
    keyword: 'Tension & Growth',
    feeling: 'Two parts of your life are pulling in different directions. It feels uncomfortable — like wearing shoes that are slightly too tight — but this friction is what makes you grow.',
    childExplain: 'Imagine you want to play outside AND finish your drawing. You can\'t do both at the same time, so you have to figure out a solution. Squares feel frustrating, but they\'re the reason you get stronger and smarter.',
  },
  Trine: {
    glyph: '△',
    keyword: 'Flow & Ease',
    feeling: 'Things just work. These two energies support each other like a river flowing downhill — effortless, natural, almost too easy.',
    childExplain: 'It\'s like riding your bike downhill with the wind behind you. Everything feels smooth and fun. The only danger? Because it\'s so easy, you might not even notice the gift.',
  },
  Opposition: {
    glyph: '☍',
    keyword: 'Awareness Through Others',
    feeling: 'You see yourself through a mirror — often held up by other people. What you want and what the situation demands are at opposite ends, and you must find balance.',
    childExplain: 'Imagine you\'re on a seesaw. If you lean too far one way, the whole thing tips over. An opposition asks you to find the middle — and the people around you help you see what you can\'t see alone.',
  },
  Quincunx: {
    glyph: '⚻',
    keyword: 'Awkward Adjustment',
    feeling: 'Two things that don\'t naturally understand each other are forced to communicate. It feels weird — like trying to translate between two languages at once.',
    childExplain: 'Imagine you have to combine peanut butter and pickles — they\'re not enemies, but they\'re definitely not an obvious pair. A quincunx makes you adjust, tweak, and get creative until you find a way to make them work together.',
  },
  'Semi-sextile': {
    glyph: '⚺',
    keyword: 'Subtle Nudge',
    feeling: 'A quiet whisper between two neighboring energies. Easy to miss, but if you pay attention, it\'s a small, constant reminder to integrate something you usually ignore.',
    childExplain: 'It\'s like a tiny tap on your shoulder. You might not notice it at first, but it keeps tapping gently until you turn around. It\'s asking you to pay attention to something small but important.',
  },
};

// ── Planet core meanings (what each planet represents in YOUR life) ──
export const planetLifeMeanings: Record<string, {
  rules: string;
  inYourLife: string;
  bodyFeeling: string;
}> = {
  Sun: {
    rules: 'Identity, vitality, purpose',
    inYourLife: 'Your Sun is WHO YOU ARE at your core — your sense of self, your confidence, what makes you feel alive and proud. It\'s your inner light.',
    bodyFeeling: 'When your Sun is activated, you feel a warm glow in your chest — like standing in actual sunlight. You feel seen, purposeful, energized.',
  },
  Moon: {
    rules: 'Emotions, comfort, needs',
    inYourLife: 'Your Moon is what you NEED to feel safe. It\'s your emotional home base — how you react before you even think, what makes you feel comforted or anxious.',
    bodyFeeling: 'Moon activation feels like a wave in your stomach or chest — sometimes warm and cozy, sometimes unsettled, like butterflies before something big.',
  },
  Mercury: {
    rules: 'Communication, thinking, learning',
    inYourLife: 'Mercury is how your MIND works — how you talk, think, learn, and process information. It\'s the voice in your head and the words that come out of your mouth.',
    bodyFeeling: 'You\'ll notice Mercury activation as mental buzzing — thoughts speeding up, wanting to read, write, talk, text, or figure something out.',
  },
  Venus: {
    rules: 'Love, beauty, values, money',
    inYourLife: 'Venus is what you LOVE and what you find beautiful. It\'s your taste, your relationships, how you attract things, and what you think is worth spending time or money on.',
    bodyFeeling: 'Venus activation feels sweet — like seeing something beautiful or being around someone you love. A softening, a wanting-to-get-closer feeling.',
  },
  Mars: {
    rules: 'Action, desire, courage, anger',
    inYourLife: 'Mars is your ENGINE. It\'s what drives you to act, compete, fight for what you want, and defend what matters. It\'s also where your temper lives.',
    bodyFeeling: 'Mars activation feels like heat — adrenaline, impatience, a strong urge to DO something. Your muscles tense up. You feel ready to move.',
  },
  Jupiter: {
    rules: 'Growth, luck, expansion, wisdom',
    inYourLife: 'Jupiter is your GROWTH button. It expands everything it touches — more opportunities, more optimism, more learning. It\'s where life feels generous.',
    bodyFeeling: 'Jupiter feels like excitement and possibility — like the first day of a vacation when everything feels open and full of potential.',
  },
  Saturn: {
    rules: 'Responsibility, limits, mastery, time',
    inYourLife: 'Saturn is your TEACHER — the strict but fair one. It shows where you need to work hard, be patient, and build something real. It doesn\'t give shortcuts.',
    bodyFeeling: 'Saturn feels heavy — like carrying a backpack that\'s a bit too full. Pressure on your shoulders. But when you do the work, you feel solid and proud.',
  },
  Uranus: {
    rules: 'Freedom, change, surprise, awakening',
    inYourLife: 'Uranus is the LIGHTNING BOLT in your life. It breaks patterns, surprises you, and pushes you toward freedom — even when you weren\'t planning to change.',
    bodyFeeling: 'Uranus activation feels electric — sudden restlessness, an urge to break free, excitement mixed with nervousness. Like static electricity under your skin.',
  },
  Neptune: {
    rules: 'Dreams, intuition, illusion, spirituality',
    inYourLife: 'Neptune is your IMAGINATION and your connection to something bigger. It\'s where you dream, create, and feel compassion — but also where you can get confused or deceived.',
    bodyFeeling: 'Neptune feels floaty and dreamy — like being half-asleep, slightly unfocused, deeply moved by music or art. Sometimes foggy, sometimes magical.',
  },
  Pluto: {
    rules: 'Transformation, power, depth, rebirth',
    inYourLife: 'Pluto is the VOLCANO of your chart. It transforms things completely — endings that lead to new beginnings. It goes to the deepest, most hidden places.',
    bodyFeeling: 'Pluto activation feels intense — a deep pull in your gut, obsessive focus, a sense that something underground is shifting. Powerful but not comfortable.',
  },
  Chiron: {
    rules: 'Wounds, healing, teaching through experience',
    inYourLife: 'Chiron is your SENSITIVE SPOT — the place where you\'ve been hurt but where you can also become a healer for others. Your greatest wisdom comes from this wound.',
    bodyFeeling: 'Chiron activation feels tender — like pressing on a bruise. Something aches, but the ache is calling you to pay attention and heal.',
  },
  'North Node': {
    rules: 'Soul growth, destiny, unfamiliar territory',
    inYourLife: 'Your North Node is where your SOUL wants to grow — it feels unfamiliar and slightly scary because it\'s the direction you haven\'t mastered yet.',
    bodyFeeling: 'North Node activation feels like a pull toward something exciting but uncomfortable — like standing at the edge of a diving board.',
  },
  'South Node': {
    rules: 'Past patterns, comfort zone, innate talents',
    inYourLife: 'Your South Node is your COMFORT ZONE — what you\'re already good at from past experience. It feels safe but can become a rut if you lean on it too much.',
    bodyFeeling: 'South Node activation feels like slipping into old habits — comfortable but slightly stale, like rewatching a movie you\'ve seen twenty times.',
  },
  Ascendant: {
    rules: 'Self-image, first impressions, physical body',
    inYourLife: 'Your Ascendant is your FRONT DOOR — how you meet the world and how the world first sees you. It shapes your appearance, style, and instinctive reactions.',
    bodyFeeling: 'Ascendant activation feels personal and physical — changes in how you present yourself, how others react to you, even shifts in your body or appearance.',
  },
  Midheaven: {
    rules: 'Career, public image, life direction',
    inYourLife: 'Your Midheaven is your PUBLIC FACE — your career, reputation, and what you\'re known for. It\'s the mountaintop you\'re climbing toward.',
    bodyFeeling: 'Midheaven activation feels like ambition stirring — a pull toward achievement, visibility, or a sense that "I need to do something important."',
  },
};

// ── SR-to-Natal aspect combination interpretations ──────────────────
// Key format: "AspectType" → generates interpretation using both planets
export function generateSRtoNatalInterpretation(
  srPlanet: string,
  natalPlanet: string,
  aspectType: string,
  orb: number
): { headline: string; howItFeels: string; whatItMeans: string; whatToDo: string } {
  const asp = aspectTypeMeanings[aspectType];
  const sr = planetLifeMeanings[srPlanet] || planetLifeMeanings['Sun'];
  const natal = planetLifeMeanings[natalPlanet] || planetLifeMeanings['Sun'];

  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(aspectType);
  const isSoft = ['Trine', 'Sextile', 'Semi-sextile'].includes(aspectType);
  const isFusion = aspectType === 'Conjunction';
  const tightness = orb <= 1 ? 'very tight — you\'ll feel this strongly all year' : orb <= 3 ? 'fairly close — a clear and noticeable theme' : 'wider but still active — a background influence';

  // Generate planet-pair specific content
  const pairInterpretations = getSRNatalPairInterp(srPlanet, natalPlanet, aspectType);

  const headline = pairInterpretations?.headline ||
    `${srPlanet} ${asp?.glyph || ''} Natal ${natalPlanet}: ${asp?.keyword || aspectType}`;

  const howItFeels = pairInterpretations?.howItFeels ||
    buildGenericFeeling(srPlanet, natalPlanet, aspectType, sr, natal, asp);

  const whatItMeans = pairInterpretations?.whatItMeans ||
    buildGenericMeaning(srPlanet, natalPlanet, aspectType, sr, natal, tightness, isHard, isSoft, isFusion);

  const whatToDo = pairInterpretations?.whatToDo ||
    buildGenericAdvice(srPlanet, natalPlanet, aspectType, isHard, isSoft, isFusion);

  return { headline, howItFeels, whatItMeans, whatToDo };
}

function buildGenericFeeling(srP: string, natP: string, aspType: string, sr: any, natal: any, asp: any): string {
  if (!asp) return `This year's ${srP} is connecting to your natal ${natP}.`;
  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(aspType);
  const isSoft = ['Trine', 'Sextile', 'Semi-sextile'].includes(aspType);

  if (isHard) {
    return `This year, the universe is creating FRICTION between your ${srP} energy (${sr.rules}) and your natal ${natP} (${natal.rules}). ${sr.bodyFeeling} Meanwhile, your ${natP} side responds: ${natal.bodyFeeling} These two sensations are pulling against each other — and that tension is asking you to grow.`;
  }
  if (isSoft) {
    return `This year brings a beautiful FLOW between your ${srP} energy (${sr.rules}) and your natal ${natP} (${natal.rules}). ${sr.bodyFeeling} Your ${natP} side harmonizes naturally: ${natal.bodyFeeling} Together, they create an easy, supportive rhythm.`;
  }
  // Conjunction
  return `This year, ${srP} energy (${sr.rules}) fuses directly with your natal ${natP} (${natal.rules}). ${sr.bodyFeeling} And layered right on top of that: ${natal.bodyFeeling} They become inseparable — one amplified force.`;
}

function buildGenericMeaning(srP: string, natP: string, aspType: string, sr: any, natal: any, tightness: string, isHard: boolean, isSoft: boolean, isFusion: boolean): string {
  const base = `This aspect is ${tightness}.`;

  if (isFusion) {
    return `${base} When Solar Return ${srP} sits right on top of your natal ${natP}, it supercharges that natal placement for the entire year. Everything ${srP} represents (${sr.rules}) gets filtered through your deepest ${natP} patterns (${natal.rules}). This is a year where these two energies become ONE story in your life — impossible to separate, and demanding your full attention.`;
  }
  if (isHard) {
    return `${base} Solar Return ${srP} is challenging your natal ${natP} — creating productive pressure. The ${srP} themes this year (${sr.rules}) are clashing with your established ${natP} patterns (${natal.rules}). This doesn't mean something bad — it means something is READY TO CHANGE. The friction is the engine of transformation. The areas ruled by both planets in your natal chart will be the stages where this plays out.`;
  }
  return `${base} Solar Return ${srP} is supporting your natal ${natP} — creating a channel of ease. The ${srP} themes this year (${sr.rules}) are naturally enhancing your ${natP} gifts (${natal.rules}). This is an area where things can come together with relatively little effort — but you still need to take action. The opportunity is real, but opportunities don't walk through the door on their own.`;
}

function buildGenericAdvice(srP: string, natP: string, aspType: string, isHard: boolean, isSoft: boolean, isFusion: boolean): string {
  if (isFusion) {
    return `Pay extra attention to ${natP} themes in your life this year — they're being amplified and renewed. Journal about what ${srP} and ${natP} mean to you personally. This conjunction is a reset button.`;
  }
  if (isHard) {
    return `Don't avoid the tension — lean into it. When you feel the friction between ${srP} and ${natP} themes, that's your growth edge. Ask yourself: "What would happen if I found a way to honor BOTH of these needs?" The answer usually reveals your next step.`;
  }
  return `Actively USE this ease — don't let it slide by unnoticed. Create something, start a project, or deepen a relationship in the area where ${srP} and ${natP} overlap. This is the universe rolling out a green carpet for you.`;
}

// ── Specific planet-pair interpretations (expert level) ──────────────
// Returns null if no specific entry exists (falls back to generic)
function getSRNatalPairInterp(srPlanet: string, natalPlanet: string, aspectType: string): {
  headline: string; howItFeels: string; whatItMeans: string; whatToDo: string;
} | null {
  const key = `${srPlanet}-${natalPlanet}-${aspectType}`;
  const interps: Record<string, { headline: string; howItFeels: string; whatItMeans: string; whatToDo: string }> = {
    // ── Sun combinations ──
    'Sun-Sun-Conjunction': {
      headline: 'Solar Return: Your Core Identity Renewed',
      howItFeels: 'This is your birthday chart activating your very essence. You feel a surge of "this is ME" energy — clarity about who you are and what you want. It\'s like your internal compass recalibrating to true north.',
      whatItMeans: 'The SR Sun conjunct your natal Sun means this year\'s themes hit you right at the CENTER of who you are. Your vitality, confidence, and life direction are all being refreshed. Whatever house this falls in becomes YOUR personal spotlight this year.',
      whatToDo: 'Set powerful intentions around your birthday. This is literally the "new year" for your soul. What do you want the next chapter of your life story to be about?',
    },
    'Sun-Moon-Conjunction': {
      headline: 'Head and Heart Become One',
      howItFeels: 'Your will and your feelings are fused this year. What you WANT and what you NEED are the same thing. There\'s an emotional intensity to everything you pursue — you feel things deeply and personally.',
      whatItMeans: 'The SR Sun illuminating your natal Moon means your emotional world gets a spotlight. Family, home, security needs, and your private inner life become front and center. Decisions are guided by gut feeling more than logic.',
      whatToDo: 'Trust your instincts this year — they\'re unusually accurate. Create a living space and daily rhythm that truly nourishes you. Your emotional truth IS your compass.',
    },
    'Sun-Saturn-Square': {
      headline: 'The Year You Prove What You\'re Made Of',
      howItFeels: 'Heavy. Like there\'s a weight test on your shoulders, and the universe is watching to see if you can carry it. You might feel blocked, delayed, or like authority figures are in your way. But underneath the frustration: determination.',
      whatItMeans: 'SR Sun square natal Saturn is one of the classic "hard work" years. Your goals (Sun) are being tested by reality (Saturn). Shortcuts won\'t work. But if you do the work — really do it — you build something permanent. This square often coincides with career pressure, health wake-up calls, or taking on adult responsibilities.',
      whatToDo: 'Don\'t fight Saturn — work WITH it. Make a realistic plan. Get organized. Accept that this year moves at Saturn\'s pace, not yours. The payoff comes later, and it\'s worth it.',
    },
    'Sun-Jupiter-Trine': {
      headline: 'The Lucky Break Year',
      howItFeels: 'Optimistic, generous, expansive. You feel like doors are opening and the world is on your side. Confidence comes naturally. You might feel restless for something BIGGER.',
      whatItMeans: 'SR Sun trine natal Jupiter is one of the most fortunate aspects in a Solar Return. Growth, travel, education, and opportunity flow easily into your life. The danger is overextending — Jupiter can make you think everything will work out without effort.',
      whatToDo: 'Take the opportunities that show up — they\'re real. But stay grounded. Expand in ONE direction rather than scattering your energy in ten. This is your green light year.',
    },
    'Moon-Venus-Conjunction': {
      headline: 'Emotional Sweetness & Deep Connection',
      howItFeels: 'Tender, romantic, soft. Your emotional needs and your love nature are wrapped together. You crave beauty, affection, and harmony. Life feels more gentle and aesthetically rich.',
      whatItMeans: 'SR Moon conjunct natal Venus is one of the loveliest placements for relationships and self-care. Love comes easier this year. You attract kindness. Your emotional world is infused with Venusian warmth.',
      whatToDo: 'Invest in relationships, art, beauty, and pleasure this year. Your heart is open — let good things in. Decorate your space. Say yes to invitations.',
    },
    'Mars-Saturn-Square': {
      headline: 'The Pressure Cooker Year',
      howItFeels: 'Frustrated. Like driving with the brakes on. You want to ACT but something keeps holding you back — rules, responsibilities, authority figures, or your own fear. Anger may simmer beneath the surface.',
      whatItMeans: 'SR Mars square natal Saturn is one of the toughest aspects because your drive (Mars) hits a wall (Saturn). This creates enormous pressure. But pressure creates diamonds. This year teaches you disciplined action — not reckless impulse, but strategic, patient force.',
      whatToDo: 'Channel the frustration into physical exercise and structured goals. Don\'t lash out at authority — become the authority. Build muscle (literal or metaphorical) through steady, disciplined effort.',
    },
    'Venus-Pluto-Square': {
      headline: 'Love Gets Intense & Transformative',
      howItFeels: 'Obsessive, magnetic, consuming. Relationships (or financial matters) feel like they\'re pulling you into deep water. Jealousy, power struggles, or all-consuming attractions may surface. Nothing about love feels casual.',
      whatItMeans: 'SR Venus square natal Pluto demands emotional honesty in relationships. Surface-level connections won\'t satisfy you — you want REAL, raw, deep. This can transform a relationship or end one that lacks depth. Money and values get a Plutonian audit too.',
      whatToDo: 'Be honest about what you really want in love and money. Let go of what\'s toxic. Don\'t try to control others — work on your own patterns of attachment. What you release makes room for something more authentic.',
    },
    'Mercury-Uranus-Conjunction': {
      headline: 'Breakthrough Thinking & Sudden Insights',
      howItFeels: 'Electrically mental. Your mind races with new ideas. You may feel restless, unable to stick with old routines. Communication styles shift suddenly. You might say things that surprise even yourself.',
      whatItMeans: 'SR Mercury conjunct natal Uranus rewires your thinking. Original ideas, technological breakthroughs, unconventional solutions — this is the year your mind breaks free of old patterns. Learning accelerates. You may be drawn to new subjects, technologies, or radical philosophies.',
      whatToDo: 'Follow the lightning bolts of inspiration — write them down immediately. Be open to changing your mind. This is a year to innovate, not repeat.',
    },
    'Jupiter-Saturn-Opposition': {
      headline: 'Expansion vs. Contraction: Finding the Balance',
      howItFeels: 'Torn between wanting MORE and knowing you should be careful. One day you feel optimistic and ready to leap; the next, doubt and caution hold you back. It\'s a seesaw between hope and realism.',
      whatItMeans: 'SR Jupiter opposing natal Saturn puts your dreams against your duties. Growth opportunities arise, but responsibilities demand attention too. This is about SUSTAINABLE expansion — growing in a way that\'s built on solid ground, not wishful thinking.',
      whatToDo: 'Don\'t choose one side over the other. Say yes to growth BUT with a realistic plan. Let Saturn give your Jupiter dreams a solid structure.',
    },
  };

  return interps[key] || null;
}
