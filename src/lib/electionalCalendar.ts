// ============================================================================
// ELECTIONAL CALENDAR - Dynamic calculation for any year
// Based on CHANI methodology + Traditional Electional Astrology
// ============================================================================

import * as Astronomy from 'astronomy-engine';
import { longitudeToZodiac, getNodePositions, getChironPosition, isPlanetRetrograde, ExtendedZodiacPosition } from './astrology';
import { NatalChart } from '@/hooks/useNatalChart';

// Types
export type ElectionalRating = 'RED' | 'YELLOW' | 'GREEN' | 'BLUE' | 'PURPLE';

export interface ElectionalDay {
  date: Date;
  rating: ElectionalRating;
  reason: string;
  avoid?: string[];
  bestFor?: string[];
  why: string;
  workaround?: string;
  category: string;
  power?: string;
}

export interface PersonalActivation {
  date: Date;
  planet: string;
  transitPlanet: string;
  aspectType: string;
  orb: number;
  intensity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  rating: ElectionalRating;
}

// Helper: Get zodiac sign name from longitude
const getZodiacSign = (longitude: number): string => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const normalizedLon = ((longitude % 360) + 360) % 360;
  return signs[Math.floor(normalizedLon / 30)];
};

// Helper: Get planet position at a date
const getPlanetLongitude = (date: Date, planet: string): number => {
  try {
    let body: Astronomy.Body;
    switch (planet.toLowerCase()) {
      case 'sun': body = Astronomy.Body.Sun; break;
      case 'moon': body = Astronomy.Body.Moon; break;
      case 'mercury': body = Astronomy.Body.Mercury; break;
      case 'venus': body = Astronomy.Body.Venus; break;
      case 'mars': body = Astronomy.Body.Mars; break;
      case 'jupiter': body = Astronomy.Body.Jupiter; break;
      case 'saturn': body = Astronomy.Body.Saturn; break;
      case 'uranus': body = Astronomy.Body.Uranus; break;
      case 'neptune': body = Astronomy.Body.Neptune; break;
      case 'pluto': body = Astronomy.Body.Pluto; break;
      default: return 0;
    }
    
    if (planet.toLowerCase() === 'moon') {
      const moonPos = Astronomy.EclipticGeoMoon(date);
      return moonPos.lon;
    }
    
    const vector = Astronomy.GeoVector(body, date, false);
    const ecliptic = Astronomy.Ecliptic(vector);
    return ecliptic.elon;
  } catch {
    return 0;
  }
};

// Calculate aspect between two planets
const calculateAspect = (lon1: number, lon2: number, aspectAngle: number, orb: number): { isExact: boolean; actualOrb: number } => {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  
  const actualOrb = Math.abs(diff - aspectAngle);
  return {
    isExact: actualOrb <= orb,
    actualOrb
  };
};

// ============================================================================
// CALCULATE ECLIPSES
// ============================================================================
export const calculateEclipses = (year: number): ElectionalDay[] => {
  const eclipses: ElectionalDay[] = [];
  
  try {
    // Solar eclipses
    let solarEclipse = Astronomy.SearchGlobalSolarEclipse(new Date(year, 0, 1));
    while (solarEclipse && solarEclipse.peak.date.getFullYear() === year) {
      const peakDate = solarEclipse.peak.date;
      const sunLon = getPlanetLongitude(peakDate, 'sun');
      const sign = getZodiacSign(sunLon);
      
      eclipses.push({
        date: new Date(peakDate),
        rating: 'RED',
        reason: `Solar Eclipse in ${sign}`,
        avoid: ['All major launches', 'Weddings', 'Business openings', 'Big decisions', 'Travel'],
        why: 'Eclipse energy = unpredictable power surges and outages. Things come to light or fall apart.',
        workaround: 'Wait at least 3 days before OR after eclipse. Too volatile in the moment.',
        category: 'eclipse'
      });
      
      solarEclipse = Astronomy.NextGlobalSolarEclipse(solarEclipse.peak);
    }
    
    // Lunar eclipses
    let lunarEclipse = Astronomy.SearchLunarEclipse(new Date(year, 0, 1));
    while (lunarEclipse && lunarEclipse.peak.date.getFullYear() === year) {
      const peakDate = lunarEclipse.peak.date;
      const moonLon = getPlanetLongitude(peakDate, 'moon');
      const sign = getZodiacSign(moonLon);
      
      eclipses.push({
        date: new Date(peakDate),
        rating: 'RED',
        reason: `Lunar Eclipse in ${sign}`,
        avoid: ['All major launches', 'Weddings', 'Big decisions', 'Commitments'],
        why: 'Eclipse = release, catharsis. Things come to light unexpectedly.',
        workaround: 'Use for endings, not beginnings. Wait 3 days either side.',
        category: 'eclipse'
      });
      
      lunarEclipse = Astronomy.NextLunarEclipse(lunarEclipse.peak);
    }
  } catch (e) {
    console.error('Error calculating eclipses:', e);
  }
  
  return eclipses;
};

// ============================================================================
// CALCULATE MERCURY RETROGRADE
// ============================================================================
export const calculateMercuryRetrograde = (year: number): ElectionalDay[] => {
  const retrogrades: ElectionalDay[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  let currentDate = new Date(startDate);
  let wasRetrograde = false;
  let retroStart: Date | null = null;
  
  while (currentDate <= endDate) {
    const isRetro = isPlanetRetrograde(Astronomy.Body.Mercury, currentDate);
    
    if (isRetro && !wasRetrograde) {
      retroStart = new Date(currentDate);
    } else if (!isRetro && wasRetrograde && retroStart) {
      // Mercury went direct - add all retrograde days
      const sign = getZodiacSign(getPlanetLongitude(retroStart, 'mercury'));
      let day = new Date(retroStart);
      while (day < currentDate) {
        retrogrades.push({
          date: new Date(day),
          rating: 'YELLOW',
          reason: `Mercury Retrograde in ${sign}`,
          avoid: ['New contracts', 'Electronics purchases', 'Starting new projects', 'Travel (if avoidable)'],
          why: 'Classic Mercury Rx: delays, miscommunications, tech issues, things need to be redone.',
          workaround: "Good for: Review, revise, reconnect with old friends, finish existing projects. Don't start new.",
          category: 'mercury-rx'
        });
        day.setDate(day.getDate() + 1);
      }
      retroStart = null;
    }
    
    wasRetrograde = isRetro;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return retrogrades;
};

// ============================================================================
// CALCULATE PLANETARY ASPECTS
// ============================================================================
const calculatePlanetaryAspects = (year: number): ElectionalDay[] => {
  const aspects: ElectionalDay[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Check each day
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const marsLon = getPlanetLongitude(currentDate, 'mars');
    const plutoLon = getPlanetLongitude(currentDate, 'pluto');
    const venusLon = getPlanetLongitude(currentDate, 'venus');
    const saturnLon = getPlanetLongitude(currentDate, 'saturn');
    const jupiterLon = getPlanetLongitude(currentDate, 'jupiter');
    const neptuneLon = getPlanetLongitude(currentDate, 'neptune');
    const sunLon = getPlanetLongitude(currentDate, 'sun');
    const mercuryLon = getPlanetLongitude(currentDate, 'mercury');
    const chironPos = getChironPosition(currentDate);
    const chironLon = chironPos.longitude;
    const northNode = getNodePositions(currentDate).north;
    
    // Mars-Pluto square/opposition (RED)
    const marsPlutoSquare = calculateAspect(marsLon, plutoLon, 90, 1);
    const marsPlutoOpp = calculateAspect(marsLon, plutoLon, 180, 1);
    if (marsPlutoSquare.isExact || marsPlutoOpp.isExact) {
      const aspectType = marsPlutoSquare.isExact ? 'square' : 'opposition';
      aspects.push({
        date: new Date(currentDate),
        rating: 'RED',
        reason: `Mars ${aspectType} Pluto`,
        avoid: ['Power negotiations', 'Contracts with authority figures', 'Starting partnerships'],
        why: 'Ego clashes, power struggles, control issues. Warrior planet meets lord of underworld.',
        workaround: "Protect your energy. Let everyone else mind their own business. Don't get involved.",
        category: 'mars-pluto'
      });
    }
    
    // Venus-Saturn square/opposition (YELLOW)
    const venusSaturnSquare = calculateAspect(venusLon, saturnLon, 90, 1);
    const venusSaturnOpp = calculateAspect(venusLon, saturnLon, 180, 1);
    if (venusSaturnSquare.isExact || venusSaturnOpp.isExact) {
      const aspectType = venusSaturnSquare.isExact ? 'square' : 'opposition';
      aspects.push({
        date: new Date(currentDate),
        rating: 'YELLOW',
        reason: `Venus ${aspectType} Saturn`,
        avoid: ['First dates', 'Weddings', 'Starting romantic relationships', 'Fun ventures'],
        why: 'Planet of pleasure meets planet of reality checks. Limiting, stifling, downer energy.',
        workaround: 'Good for: Setting boundaries in relationships, learning commitment lessons.',
        category: 'venus-saturn'
      });
    }
    
    // Venus-Pluto square (YELLOW)
    const venusPlutoSquare = calculateAspect(venusLon, plutoLon, 90, 1);
    if (venusPlutoSquare.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'YELLOW',
        reason: 'Venus square Pluto',
        avoid: ['Relationship milestones', 'Declarations of love under pressure', 'Financial agreements'],
        why: "Drama potential HIGH. Power-obsessed Pluto crashes Venus' party. Manipulation, jealousy.",
        workaround: "Resist urge to make mountains out of molehills. Don't force intensity.",
        category: 'venus-pluto'
      });
    }
    
    // Mars-Chiron square (YELLOW)
    const marsChironSquare = calculateAspect(marsLon, chironLon, 90, 1);
    if (marsChironSquare.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'YELLOW',
        reason: 'Mars square Chiron',
        avoid: ['Confrontations', 'Aggressive action', 'Triggering wounded people'],
        why: 'Conflict planet Mars hits deepest wounds (Chiron). Very uncomfortable combo.',
        workaround: 'Extra compassion needed. Tread lightly. People are sensitive.',
        category: 'mars-chiron'
      });
    }
    
    // Mars-Saturn square (YELLOW)
    const marsSaturnSquare = calculateAspect(marsLon, saturnLon, 90, 1);
    if (marsSaturnSquare.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'YELLOW',
        reason: 'Mars square Saturn',
        avoid: ['Forcing things', 'Aggressive action', 'Impatient decisions'],
        why: 'Drive (Mars) hits limits (Saturn). Frustration, delays, obstacles.',
        workaround: 'Patience required. Strategic action beats brute force.',
        category: 'mars-saturn'
      });
    }
    
    // Mars conjunct North Node (YELLOW)
    const marsNodeConj = calculateAspect(marsLon, northNode.longitude, 0, 1);
    if (marsNodeConj.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'YELLOW',
        reason: 'Mars conjunct North Node',
        avoid: ["Weddings (don't seat angry cousins together!)", 'Sensitive negotiations', 'Diplomacy'],
        why: 'Frustrations get a megaphone. Abundant energy for action BUT tempers/tensions high.',
        workaround: 'Good for: Competition, sports, taking bold action. Bad for: Keeping the peace.',
        category: 'mars-node'
      });
    }
    
    // ========== BEST DAYS ==========
    
    // Venus-Jupiter conjunction/trine/sextile (GREEN)
    const venusJupiterConj = calculateAspect(venusLon, jupiterLon, 0, 1);
    const venusJupiterTrine = calculateAspect(venusLon, jupiterLon, 120, 1);
    const venusJupiterSextile = calculateAspect(venusLon, jupiterLon, 60, 1);
    if (venusJupiterConj.isExact || venusJupiterTrine.isExact || venusJupiterSextile.isExact) {
      const aspectType = venusJupiterConj.isExact ? 'conjunct' : venusJupiterTrine.isExact ? 'trine' : 'sextile';
      aspects.push({
        date: new Date(currentDate),
        rating: 'GREEN',
        reason: `Venus ${aspectType} Jupiter`,
        bestFor: ['Love', 'Romance', 'Money', 'Celebrations', 'Pleasure', 'Social events'],
        why: 'Two BENEFICS in harmony! Lucky in love and money. Expansive joy.',
        power: aspectType === 'conjunct' ? 
          "BIGGEST love/money day of the year! Plunge into life's pleasures!" : 
          'Abundance flows easily. Ask for raise, propose, throw party.',
        category: 'venus-jupiter'
      });
    }
    
    // Mars-Jupiter trine/sextile (GREEN)
    const marsJupiterTrine = calculateAspect(marsLon, jupiterLon, 120, 1);
    const marsJupiterSextile = calculateAspect(marsLon, jupiterLon, 60, 1);
    if (marsJupiterTrine.isExact || marsJupiterSextile.isExact) {
      const aspectType = marsJupiterTrine.isExact ? 'trine' : 'sextile';
      aspects.push({
        date: new Date(currentDate),
        rating: 'GREEN',
        reason: `Mars ${aspectType} Jupiter`,
        bestFor: ['Bold action', 'Sports', 'Competition', 'Business ventures', 'Taking risks'],
        why: 'Action planet harmonizes with luck planet. Courage + wisdom.',
        power: 'Take bold action with divine support. Go for it!',
        category: 'mars-jupiter'
      });
    }
    
    // Cazimis (planet within 17 arcminutes of Sun)
    const cazimiorb = 0.28; // ~17 arcminutes in degrees
    
    // Mercury Cazimi (BLUE)
    const mercurySunConj = calculateAspect(mercuryLon, sunLon, 0, cazimiorb);
    if (mercurySunConj.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'BLUE',
        reason: 'Mercury Cazimi',
        bestFor: ['Contracts', 'Communication launches', 'Innovation', 'Important messages'],
        why: 'Mercury empowered by Sun. Peak expression of Mercury energy.',
        power: 'Sign important papers, launch websites, announce plans.',
        category: 'cazimi'
      });
    }
    
    // Venus Cazimi (GREEN)
    const venusSunConj = calculateAspect(venusLon, sunLon, 0, cazimiorb);
    if (venusSunConj.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'GREEN',
        reason: 'Venus Cazimi',
        bestFor: ['Love commitments', 'Beauty ventures', 'Financial deals', 'Pleasure'],
        why: 'Venus empowered by Sun. Peak relationship and value power.',
        power: 'Professional partnerships through balance and strength.',
        category: 'cazimi'
      });
    }
    
    // Mars Cazimi (GREEN)
    const marsSunConj = calculateAspect(marsLon, sunLon, 0, cazimiorb);
    if (marsSunConj.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'GREEN',
        reason: 'Mars Cazimi',
        bestFor: ['Launches', 'Bold action', 'Competition', 'Athletic training'],
        why: 'Mars empowered by Sun. Peak drive and courage.',
        power: 'Start businesses, begin athletic training, assert yourself.',
        category: 'cazimi'
      });
    }
    
    // Saturn-Neptune conjunction (PURPLE - rare!)
    const saturnNeptuneConj = calculateAspect(saturnLon, neptuneLon, 0, 1);
    if (saturnNeptuneConj.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'PURPLE',
        reason: 'Saturn conjunct Neptune (every 36 years!)',
        bestFor: ['Manifesting dreams', 'Practical spirituality', 'Building visions'],
        why: 'Dreams meet reality. Rare alignment of structure + imagination.',
        power: 'Good IF you have solid plan. Bad if delusional. Make magic real.',
        category: 'rare-saturn-neptune'
      });
    }
    
    // Mercury-Venus conjunction (BLUE)
    const mercuryVenusConj = calculateAspect(mercuryLon, venusLon, 0, 2);
    if (mercuryVenusConj.isExact) {
      aspects.push({
        date: new Date(currentDate),
        rating: 'BLUE',
        reason: 'Mercury conjunct Venus',
        bestFor: ['Love letters', 'Sweet conversations', 'Creative writing', 'Artistic communication'],
        why: 'Words of love flow easily! Heart on sleeve energy.',
        power: "Express yourself. Don't wait - say it now!",
        category: 'mercury-venus'
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return aspects;
};

// ============================================================================
// CALCULATE NEW MOONS (Best for new beginnings)
// ============================================================================
const calculateNewMoons = (year: number): ElectionalDay[] => {
  const newMoons: ElectionalDay[] = [];
  
  let moonPhaseTime = Astronomy.SearchMoonPhase(0, new Date(year, 0, 1), 40);
  while (moonPhaseTime && moonPhaseTime.date.getFullYear() === year) {
    const phaseDate = moonPhaseTime.date;
    const moonLon = getPlanetLongitude(phaseDate, 'moon');
    const sign = getZodiacSign(moonLon);
    
    // Check if it's an eclipse (skip - those are in avoid list)
    const eclipses = calculateEclipses(year);
    const isEclipse = eclipses.some(e => 
      Math.abs(e.date.getTime() - phaseDate.getTime()) < 24 * 60 * 60 * 1000
    );
    
    if (!isEclipse) {
      const signKeywords: Record<string, string> = {
        'Aries': 'independence, courage, new beginnings',
        'Taurus': 'stability, finances, sensual pleasures',
        'Gemini': 'communication, learning, social connections',
        'Cancer': 'home, family, emotional security',
        'Leo': 'creativity, self-expression, leadership',
        'Virgo': 'health, service, organization',
        'Libra': 'partnerships, balance, beauty',
        'Scorpio': 'transformation, intimacy, power',
        'Sagittarius': 'travel, philosophy, expansion',
        'Capricorn': 'career, ambition, long-term goals',
        'Aquarius': 'innovation, community, humanitarian causes',
        'Pisces': 'spirituality, creativity, compassion'
      };
      
      newMoons.push({
        date: new Date(phaseDate),
        rating: 'GREEN',
        reason: `New Moon in ${sign}`,
        bestFor: ['New beginnings', 'Setting intentions', signKeywords[sign] || 'fresh starts'],
        why: `New Moon = fresh start, new beginnings. ${sign} themes activated.`,
        power: `Set intentions for ${signKeywords[sign] || 'new chapters'}`,
        category: 'new-moon'
      });
    }
    
    moonPhaseTime = Astronomy.SearchMoonPhase(0, new Date(phaseDate.getTime() + 24 * 60 * 60 * 1000), 40);
  }
  
  return newMoons;
};

// ============================================================================
// CALCULATE VENUS INGRESSES (entering favorable signs)
// ============================================================================
const calculateVenusIngresses = (year: number): ElectionalDay[] => {
  const ingresses: ElectionalDay[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  let currentDate = new Date(startDate);
  let lastSign = getZodiacSign(getPlanetLongitude(currentDate, 'venus'));
  
  while (currentDate <= endDate) {
    const venusLon = getPlanetLongitude(currentDate, 'venus');
    const currentSign = getZodiacSign(venusLon);
    
    if (currentSign !== lastSign) {
      // Venus changed signs
      if (currentSign === 'Taurus' || currentSign === 'Libra') {
        ingresses.push({
          date: new Date(currentDate),
          rating: 'GREEN',
          reason: `Venus enters ${currentSign}`,
          bestFor: currentSign === 'Taurus' ? 
            ['Sensual pleasures', 'Financial ventures', 'Building value', 'Stability'] :
            ['Weddings', 'Partnerships', 'Beauty ventures', 'Collaborations'],
          why: `Venus at HOME in ${currentSign}. Peak relationship/value power.`,
          power: currentSign === 'Libra' ? 
            'BEST time for marriage! Form partnerships, create beauty, harmonize.' :
            'Build lasting value. Ground in pleasure and stability.',
          category: 'venus-domicile'
        });
      } else if (currentSign === 'Pisces') {
        ingresses.push({
          date: new Date(currentDate),
          rating: 'GREEN',
          reason: 'Venus enters Pisces',
          bestFor: ['Romance', 'Spiritual love', 'Artistic ventures', 'Compassion work'],
          why: 'Venus EXALTED in Pisces. Magnetism off the charts!',
          power: 'Lead with your heart. Make real-life magic.',
          category: 'venus-exalted'
        });
      }
    }
    
    lastSign = currentSign;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return ingresses;
};

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================
export const calculateElectionalDays = (year: number): ElectionalDay[] => {
  const allDays: ElectionalDay[] = [
    ...calculateEclipses(year),
    ...calculateMercuryRetrograde(year),
    ...calculatePlanetaryAspects(year),
    ...calculateNewMoons(year),
    ...calculateVenusIngresses(year)
  ];
  
  // Sort by date
  return allDays.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// ============================================================================
// PERSONAL ACTIVATIONS (transits to natal chart)
// ============================================================================
export const calculatePersonalActivations = (
  year: number,
  month: number,
  natalChart: NatalChart
): PersonalActivation[] => {
  const activations: PersonalActivation[] = [];
  
  if (!natalChart.planets) return activations;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Natal planet longitudes
  const getNatalLongitude = (planetData: { degree: number; minutes: number; sign: string }): number => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signs.indexOf(planetData.sign);
    if (signIndex === -1) return 0;
    return signIndex * 30 + planetData.degree + planetData.minutes / 60;
  };
  
  const natalPlanets: { name: string; longitude: number }[] = [];
  
  if (natalChart.planets.Sun) natalPlanets.push({ name: 'Sun', longitude: getNatalLongitude(natalChart.planets.Sun) });
  if (natalChart.planets.Moon) natalPlanets.push({ name: 'Moon', longitude: getNatalLongitude(natalChart.planets.Moon) });
  if (natalChart.planets.Mercury) natalPlanets.push({ name: 'Mercury', longitude: getNatalLongitude(natalChart.planets.Mercury) });
  if (natalChart.planets.Venus) natalPlanets.push({ name: 'Venus', longitude: getNatalLongitude(natalChart.planets.Venus) });
  if (natalChart.planets.Mars) natalPlanets.push({ name: 'Mars', longitude: getNatalLongitude(natalChart.planets.Mars) });
  if (natalChart.planets.Jupiter) natalPlanets.push({ name: 'Jupiter', longitude: getNatalLongitude(natalChart.planets.Jupiter) });
  if (natalChart.planets.Saturn) natalPlanets.push({ name: 'Saturn', longitude: getNatalLongitude(natalChart.planets.Saturn) });
  if (natalChart.planets.Uranus) natalPlanets.push({ name: 'Uranus', longitude: getNatalLongitude(natalChart.planets.Uranus) });
  if (natalChart.planets.Neptune) natalPlanets.push({ name: 'Neptune', longitude: getNatalLongitude(natalChart.planets.Neptune) });
  if (natalChart.planets.Pluto) natalPlanets.push({ name: 'Pluto', longitude: getNatalLongitude(natalChart.planets.Pluto) });
  
  const transitPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
  const aspects = [
    { name: 'conjunction', angle: 0, orb: 1, intensity: 'HIGH' as const, symbol: '☌' },
    { name: 'opposition', angle: 180, orb: 1, intensity: 'HIGH' as const, symbol: '☍' },
    { name: 'square', angle: 90, orb: 1, intensity: 'MEDIUM' as const, symbol: '□' },
    { name: 'trine', angle: 120, orb: 1, intensity: 'MEDIUM' as const, symbol: '△' },
    { name: 'sextile', angle: 60, orb: 1, intensity: 'LOW' as const, symbol: '⚹' }
  ];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    
    for (const transitPlanet of transitPlanets) {
      const transitLon = getPlanetLongitude(date, transitPlanet);
      
      for (const natalPlanet of natalPlanets) {
        for (const aspect of aspects) {
          const result = calculateAspect(transitLon, natalPlanet.longitude, aspect.angle, aspect.orb);
          
          if (result.isExact) {
            // Determine rating based on aspect type
            let rating: ElectionalRating = 'BLUE';
            if (aspect.name === 'conjunction' || aspect.name === 'trine' || aspect.name === 'sextile') {
              rating = 'GREEN';
            } else if (aspect.name === 'square' || aspect.name === 'opposition') {
              rating = 'YELLOW';
            }
            
            activations.push({
              date,
              planet: natalPlanet.name,
              transitPlanet: transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1),
              aspectType: aspect.name,
              orb: result.actualOrb,
              intensity: aspect.intensity,
              description: `Transit ${transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1)} ${aspect.symbol} your natal ${natalPlanet.name}`,
              rating
            });
          }
        }
      }
    }
  }
  
  return activations;
};

// Get electional day for a specific date
export const getElectionalDayInfo = (date: Date, allDays: ElectionalDay[]): ElectionalDay | null => {
  return allDays.find(d => 
    d.date.getFullYear() === date.getFullYear() &&
    d.date.getMonth() === date.getMonth() &&
    d.date.getDate() === date.getDate()
  ) || null;
};

// Get all electional days for a specific month
export const getMonthElectionalDays = (year: number, month: number, allDays: ElectionalDay[]): ElectionalDay[] => {
  return allDays.filter(d => 
    d.date.getFullYear() === year && d.date.getMonth() === month
  );
};
