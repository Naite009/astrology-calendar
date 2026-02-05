 /**
  * Grounded Narrative Analysis Engine
  * Computes operating mode scores, pressure points, and absence signals from natal chart data
  */
 
 import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
 
 // Types for the analysis engine
 export interface OperatingModeScores {
   visibility: number;
   functionality: number;
   expressive: number;
   contained: number;
   relational: number;
   selfDirected: number;
 }
 
 export interface PressurePoint {
   type: 'anaretic' | 'threshold' | 'retrograde' | 'hard_aspect' | 'stellium' | 'saturn_pattern' | 'asc_ruler';
   planet?: string;
   description: string;
   weight: number;
   details: string;
 }
 
 export interface AbsenceSignals {
   missingElements: string[];
   missingModalities: string[];
   fewAngularPlanets: boolean;
   angularPlanetCount: number;
   fewOuterPersonalLinks: boolean;
 }
 
 export interface SignalsData {
   operatingMode: OperatingModeScores;
   pressurePointsRanked: PressurePoint[];
   absenceSignals: AbsenceSignals;
 }
 
 export interface SourceMapEntry {
   sentence: string;
   triggers: { type: string; object: string; details: string }[];
 }
 
 // Sign properties
 const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
 const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];
 const AIR_SIGNS = ['Gemini', 'Libra', 'Aquarius'];
 const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];
 
 const CARDINAL_SIGNS = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
 const FIXED_SIGNS = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
 const MUTABLE_SIGNS = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];
 
 const ANGULAR_HOUSES = [1, 4, 7, 10];
 const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
 
 // Helper to get element from sign
 const getElement = (sign: string): string => {
   if (FIRE_SIGNS.includes(sign)) return 'Fire';
   if (EARTH_SIGNS.includes(sign)) return 'Earth';
   if (AIR_SIGNS.includes(sign)) return 'Air';
   if (WATER_SIGNS.includes(sign)) return 'Water';
   return 'Unknown';
 };
 
 // Helper to get modality from sign
 const getModality = (sign: string): string => {
   if (CARDINAL_SIGNS.includes(sign)) return 'Cardinal';
   if (FIXED_SIGNS.includes(sign)) return 'Fixed';
   if (MUTABLE_SIGNS.includes(sign)) return 'Mutable';
   return 'Unknown';
 };
 
 // Helper to get house number from a position (simplified - uses degree to estimate house)
 const estimateHouse = (degree: number, ascDegree: number): number => {
   const absoluteDegree = degree;
   const houseSize = 30;
   const houseOffset = Math.floor(((absoluteDegree - ascDegree + 360) % 360) / houseSize);
   return ((houseOffset % 12) + 1);
 };
 
 // Convert position to absolute degree (0-359)
 const positionToAbsoluteDegree = (position: NatalPlanetPosition): number => {
   const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
   const signIndex = signOrder.indexOf(position.sign);
   return (signIndex * 30) + position.degree + (position.minutes / 60);
 };
 
 /**
  * Compute Operating Mode Scores (0-100 scale)
  */
 export function computeOperatingModeScores(chart: NatalChart): OperatingModeScores {
   const planets = chart.planets;
   let visibility = 50;
   let functionality = 50;
   let expressive = 50;
   let contained = 50;
   let relational = 50;
   let selfDirected = 50;
 
   const ascDegree = planets.Ascendant ? positionToAbsoluteDegree(planets.Ascendant) : 0;
 
   // Count elements and modalities
   let fireCount = 0, earthCount = 0, airCount = 0, waterCount = 0;
   let fixedCount = 0;
   let angularPlanets = 0;
   let retrogrades = 0;
 
   const planetEntries = Object.entries(planets) as [string, NatalPlanetPosition | undefined][];
 
   for (const [name, pos] of planetEntries) {
     if (!pos) continue;
     const element = getElement(pos.sign);
     if (element === 'Fire') fireCount++;
     if (element === 'Earth') earthCount++;
     if (element === 'Air') airCount++;
     if (element === 'Water') waterCount++;
 
     const modality = getModality(pos.sign);
     if (modality === 'Fixed') fixedCount++;
 
     // Estimate house
     const house = estimateHouse(positionToAbsoluteDegree(pos), ascDegree);
     if (ANGULAR_HOUSES.includes(house)) angularPlanets++;
 
     if (pos.isRetrograde) retrogrades++;
 
     // Specific sign/house bonuses
     if (pos.sign === 'Leo' || pos.sign === 'Aries') visibility += 3;
     if (pos.sign === 'Virgo' || pos.sign === 'Capricorn') functionality += 3;
     if (pos.sign === 'Libra') relational += 5;
     if (pos.sign === 'Aries') selfDirected += 5;
   }
 
   // Visibility: angular planets, Leo/Aries, Sun/Moon in 1/10
   visibility += angularPlanets * 5;
   if (planets.Sun?.sign === 'Leo') visibility += 10;
   if (planets.Moon?.sign === 'Leo') visibility += 5;
 
   // Functionality: Saturn emphasis, earth dominance, Virgo
   if (planets.Saturn) {
     const saturnHouse = estimateHouse(positionToAbsoluteDegree(planets.Saturn), ascDegree);
     if (ANGULAR_HOUSES.includes(saturnHouse)) functionality += 15;
     if (planets.Saturn.sign === 'Capricorn' || planets.Saturn.sign === 'Aquarius') functionality += 10;
   }
   functionality += earthCount * 4;
 
   // Expressive: fire + air, Jupiter emphasis
   expressive += (fireCount + airCount) * 3;
   if (planets.Jupiter) {
     const jupHouse = estimateHouse(positionToAbsoluteDegree(planets.Jupiter), ascDegree);
     if (jupHouse === 5 || jupHouse === 11) expressive += 10;
   }
 
   // Contained: earth + water, Saturn, fixed, retrogrades
   contained += (earthCount + waterCount) * 3;
   contained += fixedCount * 2;
   contained += retrogrades * 5;
 
   // Relational: Libra/7th emphasis, Venus
   if (planets.Venus) {
     const venusHouse = estimateHouse(positionToAbsoluteDegree(planets.Venus), ascDegree);
     if (venusHouse === 7) relational += 15;
     if (planets.Venus.sign === 'Libra' || planets.Venus.sign === 'Taurus') relational += 10;
   }
 
   // Self-directed: Aries/1st, Mars
   if (planets.Mars) {
     const marsHouse = estimateHouse(positionToAbsoluteDegree(planets.Mars), ascDegree);
     if (marsHouse === 1) selfDirected += 15;
     if (planets.Mars.sign === 'Aries' || planets.Mars.sign === 'Scorpio') selfDirected += 10;
   }
 
   // Clamp all scores to 0-100
   const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
 
   return {
     visibility: clamp(visibility),
     functionality: clamp(functionality),
     expressive: clamp(expressive),
     contained: clamp(contained),
     relational: clamp(relational),
     selfDirected: clamp(selfDirected),
   };
 }
 
 /**
  * Identify and rank pressure points
  */
 export function computePressurePoints(chart: NatalChart): PressurePoint[] {
   const points: PressurePoint[] = [];
   const planets = chart.planets;
 
   const planetEntries = Object.entries(planets) as [string, NatalPlanetPosition | undefined][];
 
   for (const [name, pos] of planetEntries) {
     if (!pos) continue;
 
     // Anaretic degrees (29°)
     if (pos.degree === 29) {
       points.push({
         type: 'anaretic',
         planet: name,
         description: `${name} at 29° ${pos.sign}`,
         weight: 85,
         details: `Anaretic degree suggests urgency, mastery pressure, and culmination energy in ${name}'s function.`
       });
     }
 
     // Threshold degrees (0°)
     if (pos.degree === 0) {
       points.push({
         type: 'threshold',
         planet: name,
         description: `${name} at 0° ${pos.sign}`,
         weight: 75,
         details: `Threshold degree indicates fresh, raw energy—${name} is learning to operate in ${pos.sign}.`
       });
     }
 
     // Retrograde personal planets
     if (pos.isRetrograde && PERSONAL_PLANETS.includes(name)) {
       points.push({
         type: 'retrograde',
         planet: name,
         description: `${name} retrograde`,
         weight: name === 'Mercury' ? 70 : 80,
         details: `Retrograde ${name} suggests internalized, reflective processing of ${name}'s themes.`
       });
     }
   }
 
   // Saturn-Moon patterns
   if (planets.Saturn && planets.Moon) {
     points.push({
       type: 'saturn_pattern',
       planet: 'Saturn-Moon',
       description: 'Saturn-Moon signature present',
       weight: 75,
       details: "Saturn's relationship to Moon often indicates emotional caution, need for structure around feelings."
     });
   }
 
   // Saturn-Mars patterns
   if (planets.Saturn && planets.Mars) {
     points.push({
       type: 'saturn_pattern',
       planet: 'Saturn-Mars',
       description: 'Saturn-Mars signature present',
       weight: 70,
       details: "Saturn-Mars dynamics may manifest as controlled assertion, disciplined action, or frustration with limits."
     });
   }
 
   // ASC ruler condition
   if (planets.Ascendant) {
     const ascSign = planets.Ascendant.sign;
     const ascRuler = getSignRuler(ascSign);
     const rulerPos = planets[ascRuler as keyof typeof planets];
     if (rulerPos) {
       points.push({
         type: 'asc_ruler',
         planet: ascRuler,
         description: `Chart ruler ${ascRuler} in ${rulerPos.sign}`,
         weight: 65,
         details: `As ruler of the Ascendant, ${ascRuler} in ${rulerPos.sign} colors overall life approach.`
       });
     }
   }
 
   // Sort by weight descending and take top 8
   return points.sort((a, b) => b.weight - a.weight).slice(0, 8);
 }
 
 /**
  * Detect absence signals
  */
 export function computeAbsenceSignals(chart: NatalChart): AbsenceSignals {
   const planets = chart.planets;
   const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
   const modalities = { Cardinal: 0, Fixed: 0, Mutable: 0 };
 
   const ascDegree = planets.Ascendant ? positionToAbsoluteDegree(planets.Ascendant) : 0;
   let angularCount = 0;
   let outerPersonalLinks = 0;
 
   const planetEntries = Object.entries(planets) as [string, NatalPlanetPosition | undefined][];
 
   for (const [name, pos] of planetEntries) {
     if (!pos) continue;
 
     const element = getElement(pos.sign);
     if (element in elements) elements[element as keyof typeof elements]++;
 
     const modality = getModality(pos.sign);
     if (modality in modalities) modalities[modality as keyof typeof modalities]++;
 
     const house = estimateHouse(positionToAbsoluteDegree(pos), ascDegree);
     if (ANGULAR_HOUSES.includes(house)) angularCount++;
   }
 
   const missingElements = Object.entries(elements)
     .filter(([_, count]) => count === 0)
     .map(([elem]) => elem);
 
   const missingModalities = Object.entries(modalities)
     .filter(([_, count]) => count === 0)
     .map(([mod]) => mod);
 
   return {
     missingElements,
     missingModalities,
     fewAngularPlanets: angularCount < 2,
     angularPlanetCount: angularCount,
     fewOuterPersonalLinks: outerPersonalLinks < 2
   };
 }
 
 // Get sign ruler
 function getSignRuler(sign: string): string {
   const rulers: Record<string, string> = {
     'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
     'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
     'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
   };
   return rulers[sign] || 'Sun';
 }
 
 /**
  * Verb dictionary for translating placements
  */
 export const VERB_DICTIONARY: Record<string, Record<string, string[]>> = {
   Moon: {
     Taurus: ['stabilizes', 'regulates', 'preserves', 'soothes through routine and consistency'],
     Cancer: ['nurtures', 'protects', 'remembers', 'feels deeply and attunes to others'],
     Virgo: ['analyzes feelings', 'serves', 'improves', 'processes emotion through practical care'],
     Scorpio: ['transforms', 'guards depths', 'bonds intensely', 'experiences emotion as power'],
     Capricorn: ['structures emotion', 'endures', 'provides', 'may suppress for productivity'],
     Pisces: ['absorbs', 'transcends', 'dreams', 'feels boundlessly and merges emotionally'],
     Aries: ['reacts quickly', 'asserts needs', 'leads with emotion', 'needs independence'],
     Leo: ['dramatizes', 'creates', 'needs recognition', 'expresses warmly'],
     Gemini: ['communicates feelings', 'adapts', 'intellectualizes', 'needs variety'],
     Libra: ['harmonizes', 'weighs', 'seeks balance', 'processes through relationship'],
     Sagittarius: ['explores', 'seeks meaning', 'needs freedom', 'emotionally adventurous'],
     Aquarius: ['detaches', 'observes', 'needs space', 'processes through ideas'],
   },
   Mars: {
     Aries: ['initiates', 'competes', 'acts directly', 'leads with courage'],
     Virgo: ['refines', 'optimizes', 'diagnoses', 'acts by improving systems'],
     Capricorn: ['strategizes', 'climbs', 'endures', 'builds through discipline'],
     Scorpio: ['penetrates', 'transforms', 'controls', 'acts with intensity'],
     Leo: ['performs', 'leads', 'creates', 'acts for recognition'],
     Taurus: ['persists', 'builds slowly', 'values stability', 'acts for security'],
     Gemini: ['multitasks', 'communicates action', 'adapts', 'acts through ideas'],
     Cancer: ['protects', 'defends home', 'acts emotionally', 'nurtures through action'],
     Libra: ['negotiates', 'partners', 'acts through others', 'seeks fairness'],
     Sagittarius: ['explores', 'preaches', 'acts on beliefs', 'seeks adventure'],
     Aquarius: ['rebels', 'innovates', 'acts for groups', 'seeks change'],
     Pisces: ['surrenders', 'acts intuitively', 'dissolves', 'sacrifices'],
   },
   Mercury: {
     Gemini: ['connects', 'questions', 'multitasks', 'thinks in networks'],
     Virgo: ['analyzes', 'categorizes', 'edits', 'thinks in details'],
     Libra: ['weighs', 'mediates', 'edits', 'thinks in consequences and fairness'],
     Scorpio: ['investigates', 'probes', 'keeps secrets', 'thinks in depths'],
     Sagittarius: ['synthesizes', 'philosophizes', 'generalizes', 'thinks big picture'],
     Capricorn: ['structures', 'plans', 'prioritizes', 'thinks strategically'],
     Aquarius: ['innovates', 'networks', 'detaches', 'thinks in systems'],
     Pisces: ['intuits', 'imagines', 'absorbs', 'thinks in symbols'],
     Aries: ['decides quickly', 'initiates', 'speaks directly', 'thinks competitively'],
     Taurus: ['deliberates', 'grounds', 'values', 'thinks practically'],
     Cancer: ['remembers', 'feels thoughts', 'protects', 'thinks emotionally'],
     Leo: ['dramatizes', 'creates', 'leads with words', 'thinks creatively'],
   },
   Venus: {
     Taurus: ['savors', 'stabilizes', 'values sensually', 'bonds through comfort'],
     Libra: ['harmonizes', 'partners', 'aestheticizes', 'bonds through balance'],
     Scorpio: ['bonds deeply', 'tests trust', 'values intensity', 'prefers depth over breadth'],
     Pisces: ['idealizes', 'sacrifices', 'loves unconditionally', 'bonds spiritually'],
     Cancer: ['nurtures love', 'protects bonds', 'values home', 'loves maternally'],
     Leo: ['dramatizes love', 'creates', 'needs admiration', 'loves generously'],
     Virgo: ['serves love', 'improves', 'values quality', 'loves through care'],
     Capricorn: ['commits', 'builds love', 'values status', 'loves responsibly'],
     Aries: ['pursues', 'conquers', 'loves passionately', 'values independence'],
     Gemini: ['communicates love', 'varies', 'values wit', 'loves through words'],
     Sagittarius: ['explores love', 'philosophizes', 'values freedom', 'loves adventurously'],
     Aquarius: ['friends first', 'values uniqueness', 'loves unconventionally', 'needs space'],
   },
   Saturn: {
     Aries: ['disciplines initiation', 'learns safe assertion', 'masters courage', 'fears rejection'],
     Capricorn: ['masters structure', 'builds authority', 'endures', 'fears failure'],
     Aquarius: ['systematizes', 'structures groups', 'fears conformity', 'masters innovation'],
     Cancer: ['protects boundaries', 'structures nurturing', 'fears abandonment', 'masters caregiving'],
     Leo: ['disciplines creativity', 'masters performance', 'fears invisibility', 'learns authentic expression'],
     Virgo: ['perfects systems', 'masters service', 'fears imperfection', 'learns good enough'],
     Libra: ['structures relationships', 'masters fairness', 'fears imbalance', 'learns commitment'],
     Scorpio: ['controls depths', 'masters transformation', 'fears vulnerability', 'learns trust'],
     Sagittarius: ['structures beliefs', 'masters teaching', 'fears limitation', 'learns discipline'],
     Pisces: ['structures spirituality', 'masters surrender', 'fears chaos', 'learns boundaries'],
     Taurus: ['builds value', 'masters resources', 'fears scarcity', 'learns sufficiency'],
     Gemini: ['structures thought', 'masters communication', 'fears superficiality', 'learns focus'],
   }
 };
 
 /**
  * Get verb description for a placement
  */
 export function getVerbsForPlacement(planet: string, sign: string): string[] {
   return VERB_DICTIONARY[planet]?.[sign] || [`expresses ${planet} energy through ${sign}`];
 }
 
 /**
  * Compute all signals from chart
  */
 export function computeAllSignals(chart: NatalChart): SignalsData {
   return {
     operatingMode: computeOperatingModeScores(chart),
     pressurePointsRanked: computePressurePoints(chart),
     absenceSignals: computeAbsenceSignals(chart)
   };
 }