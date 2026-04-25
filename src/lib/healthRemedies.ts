// Health Remedies Database - Vitamins, Minerals, Herbs by Planet and Condition
// Based on traditions of Kira Sutherland and Heather Eland

export interface PlanetRemedyProtocol {
  vitamins: string[];
  herbs: string[];
  lifestyle: string[];
}

export interface ConditionProtocol {
  name: string;
  natalIndicators: string[];
  transitTriggers: string[];
  vitamins: string[];
  herbs: string[];
  lifestyle: string[];
  transitSpecific: Record<string, string>;
}

export interface ElementVitaminProtocol {
  vitamins: string[];
  focus: string;
}

// Remedy database by planet
export const PLANET_REMEDIES: Record<string, PlanetRemedyProtocol> = {
  Sun: {
    vitamins: ['Vitamin D3 5000 IU', 'CoQ10 200mg', 'Vitamin C 1000mg'],
    herbs: ['Rosemary', "St. John's Wort", 'Calendula'],
    lifestyle: ['Morning sunlight 15 min', 'Heart-opening exercises', 'Creative expression daily']
  },
  Moon: {
    vitamins: ['B6 50mg', 'Magnesium 400mg', 'Probiotics'],
    herbs: ['Chamomile', 'Lemon balm', 'White willow'],
    lifestyle: ['Moon phase tracking', 'Emotional journaling', 'Warm baths', 'Regular meal schedule']
  },
  Mercury: {
    vitamins: ['B-Complex', 'Omega-3 2000mg', 'L-Theanine 200mg'],
    herbs: ['Gotu kola', 'Brahmi', 'Lavender'],
    lifestyle: ['Breathwork daily', 'Digital detox periods', 'Puzzles & brain games', 'Hand stretches']
  },
  Venus: {
    vitamins: ['Vitamin E 400 IU', 'Copper 2mg', 'Vitamin C 1000mg'],
    herbs: ['Rose hips', 'Hibiscus', 'Dandelion root'],
    lifestyle: ['Beauty rituals', 'Art therapy', 'Kidney-supporting hydration', 'Gentle yoga']
  },
  Mars: {
    vitamins: ['Iron (if deficient)', 'Vitamin C 1000mg', 'Magnesium 400mg'],
    herbs: ['Ashwagandha', 'Ginger', 'Turmeric'],
    lifestyle: ['Vigorous exercise', 'Martial arts', 'Anger management practices', 'Warm-up before activity']
  },
  Jupiter: {
    vitamins: ['Milk thistle', 'Chromium', 'B-Complex'],
    herbs: ['Dandelion root', 'Artichoke leaf', 'Burdock root'],
    lifestyle: ['Moderate portions', 'Liver-supporting diet', 'Outdoor walks', 'Avoid excess alcohol']
  },
  Saturn: {
    vitamins: ['Calcium 1000mg', 'Magnesium 400mg', 'Vitamin D3 5000 IU', 'Vitamin K2 100mcg'],
    herbs: ['Horsetail', 'Comfrey (external)', 'Nettle'],
    lifestyle: ['Weight-bearing exercise', 'Regular dental care', 'Structured routine', 'Joint mobility work']
  },
  Uranus: {
    vitamins: ['Magnesium Glycinate 600mg', 'B-Complex', 'GABA 500mg'],
    herbs: ['Passionflower', 'Holy basil (Tulsi)', 'Skullcap'],
    lifestyle: ['Grounding practices', 'Limit caffeine', 'Box breathing 4-4-4-4', 'Reduce screen time']
  },
  Neptune: {
    vitamins: ['Vitamin C 2000mg', 'Zinc 30mg', 'Vitamin D3'],
    herbs: ['Echinacea', 'Astragalus', 'Elderberry'],
    lifestyle: ['Foot care', 'Reduce alcohol', 'Lymphatic massage', 'Energy boundaries', 'Clean water']
  },
  Pluto: {
    vitamins: ['Probiotics', 'Digestive enzymes', 'Glutathione', 'NAC'],
    herbs: ['Milk thistle', 'Burdock root', 'Red clover'],
    lifestyle: ['Detox protocols', 'Elimination support', 'Shadow work', 'Deep breathing']
  }
};

// Element-based vitamin protocols
export const ELEMENT_VITAMIN_PROTOCOLS: Record<string, ElementVitaminProtocol> = {
  Fire: {
    vitamins: ['Vitamin C 1000mg', 'B-Complex', 'Omega-3', 'CoQ10'],
    focus: 'Support adrenals and reduce inflammation from Mars energy'
  },
  Earth: {
    vitamins: ['Calcium/Magnesium', 'Vitamin D3', 'Probiotics', 'Collagen'],
    focus: 'Support bones, gut, and structural integrity governed by Saturn'
  },
  Air: {
    vitamins: ['B-Complex', 'Magnesium', 'Omega-3', 'CoQ10'],
    focus: 'Calm nervous system and support brain health via Mercury/Uranus'
  },
  Water: {
    vitamins: ['Vitamin D3', 'B6', 'Zinc', 'Adaptogenic herbs'],
    focus: 'Support mood, immunity, and emotional resilience via Moon/Neptune'
  }
};

// Condition-specific protocols
export const CONDITION_PROTOCOLS: Record<string, ConditionProtocol> = {
  anxiety: {
    name: 'Anxiety & Nervous System',
    natalIndicators: [
      'Uranus in 1st, 6th, or 12th house',
      'Uranus hard aspects to Sun, Moon, Mercury, or Ascendant',
      'Mercury square/opposition Neptune (confusion anxiety)',
      'Mercury square/opposition Saturn (worry, catastrophizing)',
      'Moon in Virgo or Moon-Mercury hard aspects (mental loops)',
      'Strong Gemini/Virgo with hard aspects (overthinking)',
      'Saturn in Gemini or 3rd house'
    ],
    transitTriggers: [
      'Uranus transiting Moon, Mercury, or Ascendant',
      'Saturn square/opposition Mercury or Moon',
      'Neptune square Mercury (existential anxiety)'
    ],
    vitamins: ['Magnesium Glycinate 400-600mg', 'L-Theanine 200mg', 'GABA 500mg', 'B-Complex (especially B6)', 'Vitamin D3', 'Omega-3'],
    herbs: ['Ashwagandha', 'Holy Basil (Tulsi)', 'Passionflower', 'Chamomile', 'Lemon Balm'],
    lifestyle: [
      'Ground daily: barefoot on earth',
      'Limit caffeine',
      'Box breathing: 4-4-4-4',
      'Routine & structure (Saturn stabilizes Uranus)',
      'Reduce news/social media during Uranus transits',
      'Best calm days: Saturdays (Saturn) & Mondays (Moon)'
    ],
    transitSpecific: {
      Uranus: 'Practice not controlling. Wait it out.',
      Saturn: 'Build structure, schedule everything.',
      Neptune: 'Reduce stimulation, increase boundaries.'
    }
  },
  eye_issues: {
    name: 'Eye & Vision Issues',
    natalIndicators: [
      'Afflicted Sun (right eye) or Moon (left eye)',
      'Aries or Leo on 6th house cusp',
      'Planets in Aries (head/eyes)',
      'Neptune aspects to Sun or Ascendant',
      'Mars-Saturn aspects (pressure, restriction)'
    ],
    transitTriggers: [
      'Neptune transiting Sun/Moon/Ascendant = blurry vision',
      'Saturn transiting Sun = dry eyes, eye pressure',
      'Mars through 1st or 6th = inflammation, strain',
      'Uranus transits = sudden changes, eye twitches'
    ],
    vitamins: ['Vitamin A 10,000 IU', 'Lutein/Zeaxanthin 20mg', 'Omega-3 2000mg DHA/EPA', 'Vitamin D3 5000 IU'],
    herbs: ['Bilberry extract', 'Eyebright tincture', 'Ginkgo biloba'],
    lifestyle: ['Rest eyes every 20 min', 'Reduce screen time during Neptune transits', 'Eye exercises on Sundays', 'Warm compresses'],
    transitSpecific: {
      Neptune: 'Vision fog — reduce screens, increase rest.',
      Saturn: 'Dry/pressure issues — hydrate eyes, check-ups.',
      Mars: 'Inflammation — reduce strain, warm compresses.'
    }
  },
  digestive: {
    name: 'Digestive Issues',
    natalIndicators: [
      'Afflicted Moon (stomach)',
      'Virgo placements with hard aspects (intestines)',
      '6th house emphasis',
      'Cancer on 6th house cusp'
    ],
    transitTriggers: [
      'Pluto transits = digestive transformation',
      'Saturn transiting Moon = restriction, constipation',
      'Neptune transiting Moon = food sensitivities'
    ],
    vitamins: ['Probiotics', 'Digestive enzymes', 'L-Glutamine', 'Zinc carnosine'],
    herbs: ['Ginger', 'Chamomile', 'Peppermint', 'Slippery elm'],
    lifestyle: ['Mindful eating', 'Avoid trigger foods for your Moon sign', 'Warm foods over cold', 'Best digestion: Moon in earth signs'],
    transitSpecific: {
      Pluto: 'Complete overhaul of diet may be needed.',
      Saturn: 'Structure meals, address constipation.',
      Neptune: 'Elimination diet for sensitivities.'
    }
  },
  sleep: {
    name: 'Sleep Issues',
    natalIndicators: [
      'Neptune or Uranus in 12th house',
      'Afflicted Moon',
      'Saturn in 12th house (chronic insomnia)'
    ],
    transitTriggers: [
      'Uranus transits = sudden waking, disrupted sleep',
      'Neptune transits = too much or too little sleep',
      'Saturn transits = early waking, restricted sleep'
    ],
    vitamins: ['Magnesium Glycinate 400mg (before bed)', 'Melatonin 1-3mg', 'L-Theanine 200mg', 'Glycine 3g'],
    herbs: ['Valerian root', 'Lavender', 'Passionflower', 'Hops'],
    lifestyle: ['Consistent bedtime', 'No screens 1hr before bed', 'Best sleep during Moon in Cancer/Taurus/Pisces', 'Cool, dark room'],
    transitSpecific: {
      Uranus: 'Accept disruption; don\'t fight wakefulness.',
      Saturn: 'Structure bedtime, reduce stimulation.',
      Neptune: 'Limit escapism, gentle wind-down.'
    }
  }
};

// Constitutional strength assessment
export interface ConstitutionalAssessment {
  rating: 'Strong' | 'Moderate' | 'Sensitive';
  score: number;
  factors: string[];
}

export function assessConstitutionalStrength(
  planets: Record<string, { sign: string; degree: number; minutes?: number; isRetrograde?: boolean }>,
  ascendantSign?: string
): ConstitutionalAssessment {
  let score = 50; // baseline
  const factors: string[] = [];
  // Track positive vs negative contributors separately so the rating
  // requires meaningful CORROBORATION across multiple chart factors —
  // not just one sign placement (e.g., a single Fire/Earth rising should
  // not single-handedly push the rating to "Strong"). This prevents the
  // "two charts with the same rising get different ratings" confusion
  // by making it clear that the rating reflects a CHART-WIDE pattern.
  let positiveContributors = 0;
  let negativeContributors = 0;

  // Fire/Earth ascendant = more robust
  const fireEarth = ['Aries', 'Taurus', 'Leo', 'Virgo', 'Capricorn', 'Sagittarius'];
  const sensitive = ['Cancer', 'Pisces', 'Scorpio'];

  if (ascendantSign) {
    if (fireEarth.includes(ascendantSign)) { score += 10; factors.push(`${ascendantSign} rising: robust constitution (+10)`); positiveContributors++; }
    else if (sensitive.includes(ascendantSign)) { score -= 5; factors.push(`${ascendantSign} rising: sensitive constitution (-5)`); negativeContributors++; }
  }

  // Sun dignity
  const sunSign = planets.Sun?.sign;
  if (sunSign === 'Leo') { score += 10; factors.push('Sun in Leo: strong natural vitality (+10)'); positiveContributors++; }
  else if (sunSign === 'Aries') { score += 8; factors.push('Sun in Aries: dynamic energy (+8)'); positiveContributors++; }
  else if (sunSign === 'Pisces' || sunSign === 'Libra') { score -= 5; factors.push(`Sun in ${sunSign}: more sensitive vitality (-5)`); negativeContributors++; }

  // Mars condition
  const marsSign = planets.Mars?.sign;
  if (marsSign === 'Aries' || marsSign === 'Capricorn' || marsSign === 'Scorpio') {
    score += 8; factors.push(`Mars in ${marsSign}: strong physical energy (+8)`); positiveContributors++;
  } else if (marsSign === 'Cancer' || marsSign === 'Libra') {
    score -= 5; factors.push(`Mars in ${marsSign}: gentler physical energy (-5)`); negativeContributors++;
  }

  // Saturn condition
  if (planets.Saturn?.isRetrograde) {
    score -= 3; factors.push('Saturn retrograde: internalized health discipline needed (-3)'); negativeContributors++;
  }

  // Jupiter beneficial
  const jupSign = planets.Jupiter?.sign;
  if (jupSign === 'Sagittarius' || jupSign === 'Cancer' || jupSign === 'Pisces') {
    score += 5; factors.push(`Jupiter in ${jupSign}: natural healing optimism (+5)`); positiveContributors++;
  }

  // Rating requires CORROBORATION — a single positive factor (e.g., just
  // a Fire/Earth rising) is not enough to land "Strong." Need either a
  // higher score OR multiple supporting factors. This is the fix for
  // "Hannah is Strong because Virgo rising but Ben (also Virgo rising)
  // is Moderate" — when Virgo rising is the ONLY positive, the rating
  // now correctly lands "Moderate" for both unless other factors agree.
  let rating: 'Strong' | 'Moderate' | 'Sensitive';
  if (score >= 65 && positiveContributors >= 2) {
    rating = 'Strong';
  } else if (score >= 40) {
    rating = 'Moderate';
  } else {
    rating = 'Sensitive';
  }

  // Add a baseline note so the user can read the breakdown clearly.
  factors.unshift(`Baseline: 50 → final score ${Math.max(0, Math.min(100, score))} (${positiveContributors} support${positiveContributors === 1 ? '' : 's'}, ${negativeContributors} caution${negativeContributors === 1 ? '' : 's'})`);

  return { rating, score: Math.max(0, Math.min(100, score)), factors };
}

// Detect afflicted planets (planets with hard aspects)
export interface AfflictedPlanet {
  planet: string;
  symbol: string;
  sign: string;
  afflictions: string[];
  bodyAreas: string[];
  remedies: PlanetRemedyProtocol;
  severity: 'high' | 'medium' | 'low';
}

const SIGN_DEGREES: Record<string, number> = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90, Leo: 120, Virgo: 150,
  Libra: 180, Scorpio: 210, Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const PLANET_BODY_AREAS: Record<string, string[]> = {
  Sun: ['Heart', 'Spine', 'Vitality', 'Right eye'],
  Moon: ['Stomach', 'Breasts', 'Fluids', 'Hormones'],
  Mercury: ['Nervous system', 'Lungs', 'Hands', 'Thyroid'],
  Venus: ['Kidneys', 'Throat', 'Skin', 'Sugar metabolism'],
  Mars: ['Muscles', 'Blood', 'Adrenals', 'Head/inflammation'],
  Jupiter: ['Liver', 'Hips', 'Weight', 'Pituitary'],
  Saturn: ['Bones', 'Teeth', 'Knees', 'Skin/joints'],
  Uranus: ['Nervous system', 'Ankles', 'Circulation', 'Spasms'],
  Neptune: ['Immune system', 'Feet', 'Lymphatic', 'Allergies'],
  Pluto: ['Reproductive', 'Elimination', 'Cell regeneration']
};

export function detectAfflictedPlanets(
  planets: Record<string, { sign: string; degree: number; minutes?: number }>
): AfflictedPlanet[] {
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const malefics = ['Mars', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const afflicted: AfflictedPlanet[] = [];

  const getLongitude = (p: { sign: string; degree: number; minutes?: number }) => {
    if (!SIGN_DEGREES.hasOwnProperty(p.sign)) return null;
    return SIGN_DEGREES[p.sign] + p.degree + (p.minutes || 0) / 60;
  };

  for (const name of planetNames) {
    const planet = planets[name];
    if (!planet?.sign) continue;

    const lon = getLongitude(planet);
    if (lon === null) continue;

    const afflictions: string[] = [];

    // Check aspects to malefics
    for (const malefic of malefics) {
      if (malefic === name) continue;
      const mPlanet = planets[malefic];
      if (!mPlanet?.sign) continue;
      const mLon = getLongitude(mPlanet);
      if (mLon === null) continue;

      let diff = Math.abs(lon - mLon);
      if (diff > 180) diff = 360 - diff;

      // Square (90°, 7° orb) or Opposition (180°, 8° orb) or Conjunction with malefic (0°, 8° orb)
      if (Math.abs(diff - 90) <= 7) {
        afflictions.push(`□ ${PLANET_SYMBOLS[malefic] || malefic} ${malefic} (square)`);
      } else if (Math.abs(diff - 180) <= 8) {
        afflictions.push(`☍ ${PLANET_SYMBOLS[malefic] || malefic} ${malefic} (opposition)`);
      } else if (diff <= 8 && malefics.includes(malefic) && !['Jupiter'].includes(name)) {
        afflictions.push(`☌ ${PLANET_SYMBOLS[malefic] || malefic} ${malefic} (conjunction)`);
      }
    }

    // Check detriment/fall
    const detriments: Record<string, string[]> = {
      Sun: ['Aquarius'], Moon: ['Capricorn'], Mercury: ['Sagittarius', 'Pisces'],
      Venus: ['Aries', 'Scorpio'], Mars: ['Taurus', 'Libra'],
      Jupiter: ['Gemini', 'Virgo'], Saturn: ['Cancer', 'Leo']
    };
    const falls: Record<string, string[]> = {
      Sun: ['Libra'], Moon: ['Scorpio'], Mercury: ['Pisces'],
      Venus: ['Virgo'], Mars: ['Cancer'],
      Jupiter: ['Capricorn'], Saturn: ['Aries']
    };

    if (detriments[name]?.includes(planet.sign)) {
      afflictions.push(`In detriment (${planet.sign})`);
    }
    if (falls[name]?.includes(planet.sign)) {
      afflictions.push(`In fall (${planet.sign})`);
    }

    if (afflictions.length > 0) {
      const severity = afflictions.length >= 3 ? 'high' : afflictions.length >= 2 ? 'medium' : 'low';
      afflicted.push({
        planet: name,
        symbol: PLANET_SYMBOLS[name] || '★',
        sign: planet.sign,
        afflictions,
        bodyAreas: PLANET_BODY_AREAS[name] || [],
        remedies: PLANET_REMEDIES[name] || { vitamins: [], herbs: [], lifestyle: [] },
        severity
      });
    }
  }

  // Sort by severity
  const sevOrder = { high: 0, medium: 1, low: 2 };
  afflicted.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  return afflicted;
}

// Generate prevention protocol based on chart
export interface PreventionItem {
  text: string;
  reason: string; // astrological WHY
}

export interface PreventionProtocol {
  daily: PreventionItem[];
  weekly: PreventionItem[];
  avoid: PreventionItem[];
  keySupplements: string[];
}

export function generatePreventionProtocol(
  dominantElement: string,
  afflictedPlanets: AfflictedPlanet[],
  ascendantSign?: string
): PreventionProtocol {
  const daily: PreventionItem[] = [];
  const weekly: PreventionItem[] = [];
  const avoid: PreventionItem[] = [];
  const keySupplements: string[] = [];

  // Element-based daily
  const elementProtocol = ELEMENT_VITAMIN_PROTOCOLS[dominantElement];
  if (elementProtocol) {
    keySupplements.push(...elementProtocol.vitamins);
  }

  // Element daily habits with WHY
  switch (dominantElement) {
    case 'Fire':
      daily.push(
        { text: 'Morning movement or exercise', reason: 'Fire-dominant charts carry excess Mars/Sun heat — movement channels that energy before it becomes inflammation or restlessness.' },
        { text: 'Anti-inflammatory foods', reason: 'Fire signs (Aries, Leo, Sagittarius) are prone to inflammation, fevers, and heat-related conditions. Cooling foods balance your elemental excess.' },
        { text: 'Hydrate generously', reason: 'Fire dries out the body. Your element naturally burns through fluids faster, making dehydration a chronic risk.' }
      );
      avoid.push(
        { text: 'Overexertion without rest', reason: 'Fire signs push past limits — your Mars energy feels endless until burnout hits suddenly. Rest prevents adrenal fatigue.' },
        { text: 'Excess caffeine', reason: 'Your system already runs hot and stimulated. Caffeine overfires your adrenals (Mars) and can cause heart palpitations (Sun).' },
        { text: 'Skipping cool-down', reason: 'Fire signs generate excess heat during activity. Without cool-down, inflammation and muscle tension accumulate in Mars-ruled areas.' }
      );
      break;
    case 'Earth':
      daily.push(
        { text: 'Stretching/flexibility work', reason: 'Earth-dominant charts tend toward stiffness and rigidity (Saturn influence). Your bones, joints, and connective tissue need regular mobilization.' },
        { text: 'Mineral-rich foods', reason: 'Earth signs govern bones (Capricorn), digestion (Virgo), and throat/thyroid (Taurus). Your body uses minerals faster than other elements.' },
        { text: 'Regular meal schedule', reason: 'Earth energy thrives on rhythm and consistency. Irregular eating destabilizes your naturally steady metabolism (Venus/Saturn rulership).' }
      );
      avoid.push(
        { text: 'Sedentary patterns', reason: 'Earth\'s natural inertia means your body holds onto stagnation — lymph slows, digestion stalls, and Saturn-ruled joints stiffen without movement.' },
        { text: 'Heavy late-night eating', reason: 'Earth signs already have slower metabolism. Late eating overloads your Virgo-ruled digestive system during its natural rest period.' },
        { text: 'Ignoring stiffness', reason: 'Early stiffness is Saturn whispering. Ignoring it leads to chronic joint/bone issues that become much harder to reverse later.' }
      );
      break;
    case 'Air':
      daily.push(
        { text: 'Breathwork or meditation', reason: 'Air-dominant charts (Gemini/Libra/Aquarius) overactivate the Mercury/Uranus nervous system. Breathwork is the direct antidote — it calms the electrical system.' },
        { text: 'Brain-nourishing fats', reason: 'Mercury and Uranus rule your nervous system and brain. Omega-3s and healthy fats are essential fuel for your most active organ system.' },
        { text: 'Digital detox breaks', reason: 'Air signs absorb information constantly via Mercury. Your nervous system needs deliberate breaks from input or it becomes chronically overstimulated.' }
      );
      avoid.push(
        { text: 'Excess caffeine', reason: 'Your Mercury/Uranus-ruled nervous system is already highly wired. Caffeine amplifies anxiety, scattered thinking, and nervous exhaustion.' },
        { text: 'Eating while distracted', reason: 'Air signs live in their heads — eating while multitasking means your nervous system stays in sympathetic (fight-or-flight) mode, shutting down digestion. Your Mercury needs to be present with food.' },
        { text: 'Over-stimulation', reason: 'Air\'s natural tendency is to take in everything. Without boundaries, your Uranus-ruled electrical system short-circuits into anxiety, insomnia, or nerve pain.' }
      );
      break;
    case 'Water':
      daily.push(
        { text: 'Emotional check-in', reason: 'Water-dominant charts (Cancer/Scorpio/Pisces) store emotions in the body — unprocessed feelings directly impact Moon-ruled digestion and Neptune-ruled immunity.' },
        { text: 'Clean water (2L+)', reason: 'Water signs govern the lymphatic (Neptune), fluid (Moon), and elimination (Pluto) systems. Hydration is literally your element — your body needs more than most.' },
        { text: 'Gentle movement in nature', reason: 'Water energy stagnates without flow. Nature calms your Neptune sensitivity while movement keeps your Moon-ruled lymphatic system circulating.' }
      );
      avoid.push(
        { text: 'Excess alcohol', reason: 'Neptune (your dominant planetary energy) already creates blurred boundaries. Alcohol amplifies this, weakening your immune system and making you absorb others\' energy.' },
        { text: 'Emotional eating triggers', reason: 'Your Moon-ruled digestive system responds directly to emotions. Eating to numb feelings creates a cycle where the body stores emotional weight as physical weight.' },
        { text: 'Energy vampires', reason: 'Water signs are energetic sponges (Neptune/Moon). Spending time with draining people depletes your immune system and emotional reserves faster than any other element.' }
      );
      break;
  }

  // Affliction-based supplements with WHY
  for (const aff of afflictedPlanets.slice(0, 3)) {
    keySupplements.push(...aff.remedies.vitamins.slice(0, 2));
    if (aff.remedies.lifestyle[0]) {
      daily.push({
        text: aff.remedies.lifestyle[0],
        reason: `Your ${aff.planet} in ${aff.sign} is ${aff.afflictions[0]?.toLowerCase() || 'challenged'} — this directly affects ${aff.bodyAreas.slice(0, 2).join(' and ').toLowerCase()}.`
      });
    }
  }

  // Weekly with WHY
  weekly.push({
    text: 'Review energy levels and adjust activities',
    reason: `Your ${dominantElement}-dominant chart has specific energy rhythms. Weekly review helps you catch depletion patterns before they become health issues.`
  });
  weekly.push({
    text: 'One dedicated self-care practice (massage, bath, etc.)',
    reason: 'Consistent self-care supports your constitutional type. It keeps your dominant element balanced rather than letting it swing to excess or deficiency.'
  });
  if (afflictedPlanets.some(a => a.planet === 'Saturn')) {
    weekly.push({
      text: 'Bone/joint strengthening exercises',
      reason: 'Your Saturn is afflicted — Saturn governs bones, teeth, joints, and skin. Weight-bearing exercise prevents the chronic conditions Saturn brings when neglected.'
    });
  }
  if (afflictedPlanets.some(a => a.planet === 'Neptune')) {
    weekly.push({
      text: 'Lymphatic support (dry brushing, movement)',
      reason: 'Your Neptune is afflicted — Neptune rules the lymphatic and immune systems. Without active support, you\'re more prone to mysterious illnesses and immune weakness.'
    });
  }

  // Deduplicate by text
  const dedup = (arr: PreventionItem[]) => {
    const seen = new Set<string>();
    return arr.filter(item => {
      if (seen.has(item.text)) return false;
      seen.add(item.text);
      return true;
    });
  };

  return {
    daily: dedup(daily),
    weekly: dedup(weekly),
    avoid: dedup(avoid),
    keySupplements: [...new Set(keySupplements)]
  };
}
