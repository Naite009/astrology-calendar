// ============================================================================
// COMPLETE PROFESSIONAL TRANSIT ANALYSIS SYSTEM
// Shows: degree meaning, house activation, emotional impact, duration, 
// historical patterns, and journal tracking
// ============================================================================

import { useState } from 'react';
import { TransitAspect } from '@/lib/transitAspects';
import { NatalChart } from '@/hooks/useNatalChart';
import { getSabianSymbol } from '@/lib/sabianSymbols';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSymbol = (planet: string): string => {
  const symbols: Record<string, string> = {
    sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
    jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
    chiron: '⚷', lilith: '⚸', northnode: '☊', southnode: '☋',
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
    Chiron: '⚷', Lilith: '⚸', NorthNode: '☊', SouthNode: '☋',
    Ascendant: 'AC', Midheaven: 'MC',
  };
  return symbols[planet] || planet.charAt(0);
};

const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const HOUSE_MEANINGS: Record<number, { short: string; full: string; keywords: string }> = {
  1: { short: 'Self & Identity', full: 'Your sense of self, how you present to the world, personal initiatives, physical body, first impressions', keywords: 'identity, appearance, self-expression' },
  2: { short: 'Money & Values', full: 'Your finances, personal values, material security, self-worth, possessions, what you own and earn', keywords: 'finances, values, possessions' },
  3: { short: 'Communication', full: 'Daily communications, learning, siblings, local travel, mental processes, neighbors, short trips', keywords: 'communication, siblings, learning' },
  4: { short: 'Home & Family', full: 'Your home, family, emotional foundations, private life, ancestry, roots, mother, inner security', keywords: 'home, family, roots' },
  5: { short: 'Creativity & Romance', full: 'Creative expression, romance, children, pleasure, self-expression, hobbies, fun, dating, speculation', keywords: 'creativity, romance, children' },
  6: { short: 'Health & Work', full: 'Your health, daily work, routines, service, habits, pets, employees, day-to-day responsibilities', keywords: 'health, work, daily routine' },
  7: { short: 'Partnerships', full: 'Committed partnerships, marriage, one-on-one relationships, open enemies, contracts, negotiations', keywords: 'partnerships, marriage, others' },
  8: { short: 'Transformation', full: 'Shared finances, intimacy, transformation, inheritances, the occult, death/rebirth, sexuality, psychology', keywords: 'transformation, shared resources, depth' },
  9: { short: 'Philosophy & Travel', full: 'Higher learning, long-distance travel, philosophy, publishing, beliefs, foreign cultures, higher education', keywords: 'philosophy, travel, higher education' },
  10: { short: 'Career & Status', full: 'Your career, public reputation, achievements, authority figures, father, life direction, ambitions', keywords: 'career, public image, authority' },
  11: { short: 'Friends & Groups', full: 'Friendships, groups, social causes, hopes and dreams, the collective, community, organizations', keywords: 'friends, groups, hopes' },
  12: { short: 'Subconscious', full: 'Your subconscious, hidden matters, solitude, spirituality, self-undoing, dreams, karma, endings', keywords: 'subconscious, secrets, spirituality' },
};

const PLANET_ESSENCES: Record<string, { name: string; essence: string }> = {
  sun: { name: 'Sun', essence: 'Your core identity, vitality, and conscious self-expression. What makes you YOU.' },
  moon: { name: 'Moon', essence: 'Your emotional nature, instincts, and inner world. How you feel and nurture.' },
  mercury: { name: 'Mercury', essence: 'Your mind, communication style, and how you process information.' },
  venus: { name: 'Venus', essence: 'Your values, love nature, aesthetics, and what brings you pleasure.' },
  mars: { name: 'Mars', essence: 'Your drive, ambition, anger, and how you take action and assert yourself.' },
  jupiter: { name: 'Jupiter', essence: 'Your expansion, luck, beliefs, and where you seek growth and meaning.' },
  saturn: { name: 'Saturn', essence: 'Your structure, discipline, limits, and where you learn through challenge.' },
  uranus: { name: 'Uranus', essence: 'Your uniqueness, rebellion, and where you break free from convention.' },
  neptune: { name: 'Neptune', essence: 'Your spirituality, imagination, and where you transcend or escape.' },
  pluto: { name: 'Pluto', essence: 'Your power, transformation, and where you experience death and rebirth.' },
  chiron: { name: 'Chiron', essence: 'Your deepest wound and greatest healing gift.' },
  northnode: { name: 'North Node', essence: 'Your soul growth direction and karmic destiny.' },
  southnode: { name: 'South Node', essence: 'Your past life patterns and comfort zone.' },
  ascendant: { name: 'Ascendant', essence: 'Your rising sign, outer personality, and how others see you.' },
};

const ASPECT_MEANINGS: Record<string, { meaning: string; energy: string }> = {
  conjunction: { meaning: 'merges with', energy: 'Fusion - these energies become ONE. Intensity and focus.' },
  opposition: { meaning: 'opposes', energy: 'Polarity - awareness through contrast. Balance required.' },
  trine: { meaning: 'flows with', energy: 'Harmony - natural talent and ease. Gifts that come easily.' },
  square: { meaning: 'challenges', energy: 'Tension - friction that creates action. Growth through struggle.' },
  sextile: { meaning: 'supports', energy: 'Opportunity - potential that needs activation. Gentle gifts.' },
};

const getDegreeMeaning = (degree: number, sign: string): { symbol: string; meaning: string } => {
  return getSabianSymbol(degree, sign);
};

const getSignExpression = (planet: string, sign: string): string => {
  const expressions: Record<string, Record<string, string>> = {
    Sun: {
      Aries: 'Identity expressed through initiative, courage, and pioneering spirit.',
      Taurus: 'Identity rooted in stability, sensuality, and material security.',
      Gemini: 'Identity expressed through communication, curiosity, and adaptability.',
      Cancer: 'Identity rooted in nurturing, emotions, and family connections.',
      Leo: 'Identity expressed through creativity, leadership, and self-expression.',
      Virgo: 'Identity rooted in service, analysis, and practical improvement.',
      Libra: 'Identity expressed through relationships, harmony, and aesthetics.',
      Scorpio: 'Identity rooted in intensity, transformation, and depth.',
      Sagittarius: 'Identity expressed through adventure, philosophy, and expansion.',
      Capricorn: 'Identity rooted in ambition, structure, and achievement.',
      Aquarius: 'Identity expressed through innovation, individuality, and humanitarian ideals.',
      Pisces: 'Identity rooted in spirituality, compassion, and transcendence.',
    },
    Moon: {
      Aries: 'Emotions are quick, fiery, and need immediate expression.',
      Taurus: 'Emotions seek comfort, stability, and sensory pleasures.',
      Gemini: 'Emotions are processed through talking, thinking, and variety.',
      Cancer: 'Emotions run deep with strong nurturing and protective instincts.',
      Leo: 'Emotions need recognition, warmth, and creative expression.',
      Virgo: 'Emotions are analyzed, practical, and service-oriented.',
      Libra: 'Emotions seek harmony, beauty, and partnership.',
      Scorpio: 'Emotions are intense, transformative, and deeply felt.',
      Sagittarius: 'Emotions need freedom, adventure, and meaning.',
      Capricorn: 'Emotions are controlled, responsible, and achievement-focused.',
      Aquarius: 'Emotions are detached, unconventional, and group-oriented.',
      Pisces: 'Emotions are boundless, intuitive, and deeply empathic.',
    },
  };
  
  return expressions[planet]?.[sign] || `${planet} expresses through the lens of ${sign} energy.`;
};

const getHouseToHouseMeaning = (transitHouse: number, natalHouse: number, aspectType: string): string => {
  if (transitHouse === natalHouse) {
    return `Both energies are concentrated in the same life area, intensifying themes of ${HOUSE_MEANINGS[transitHouse].keywords}.`;
  }
  
  return `Energy flows between your ${HOUSE_MEANINGS[transitHouse].short.toLowerCase()} and ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}, connecting these life areas in ${aspectType} ways.`;
};

const calculateTransitDuration = (planet: string, aspect: string): { startDate: string; exactDate: string; endDate: string; totalDays: number } => {
  const speeds: Record<string, number> = {
    sun: 1, moon: 13, mercury: 1.5, venus: 1.2, mars: 0.5,
    jupiter: 0.08, saturn: 0.03, uranus: 0.01, neptune: 0.006, pluto: 0.004,
  };
  
  const orb = aspect === 'conjunction' || aspect === 'opposition' ? 8 : aspect === 'square' ? 7 : 6;
  const speed = speeds[planet.toLowerCase()] || 1;
  const daysToOrb = orb / speed;
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - Math.floor(daysToOrb));
  
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + Math.floor(daysToOrb));
  
  return {
    startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    exactDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    totalDays: Math.round(daysToOrb * 2),
  };
};

interface HistoricalMatch {
  date: Date;
  yearsAgo: number;
  transitPlanet: string;
  transitDegree: number;
  transitSign: string;
  natalPlanet: string;
  natalDegree: number;
  natalSign: string;
  aspect: string;
  journalEntry?: string;
}

const findHistoricalMatches = (aspect: TransitAspect, currentDate: Date): HistoricalMatch[] => {
  const transitSignature = `${aspect.transitPlanet.toLowerCase()}-${aspect.aspect}-${aspect.natalPlanet.toLowerCase()}`;
  const journalEntries = JSON.parse(localStorage.getItem('transitJournals') || '[]');
  
  const matches = journalEntries
    .filter((entry: { transitSignature: string }) => entry.transitSignature === transitSignature)
    .map((entry: { date: string; transitDegree: number; transitSign: string; natalDegree: number; natalSign: string; entry: string }) => ({
      date: new Date(entry.date),
      yearsAgo: Math.floor((currentDate.getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24 * 365)),
      transitPlanet: aspect.transitPlanet,
      transitDegree: entry.transitDegree,
      transitSign: entry.transitSign,
      natalPlanet: aspect.natalPlanet,
      natalDegree: entry.natalDegree,
      natalSign: entry.natalSign,
      aspect: aspect.aspect,
      journalEntry: entry.entry,
    }))
    .sort((a: HistoricalMatch, b: HistoricalMatch) => b.date.getTime() - a.date.getTime());
  
  return matches;
};

const getTransitCycle = (planet: string): string => {
  const cycles: Record<string, string> = {
    sun: 'The Sun completes a full cycle through your chart every year.',
    moon: 'The Moon completes a full cycle every 28 days.',
    mercury: 'Mercury completes a cycle every year, with retrogrades creating repeating patterns every 3-4 months.',
    venus: 'Venus completes a cycle every 1-1.5 years.',
    mars: 'Mars completes a cycle every 2 years.',
    jupiter: 'Jupiter completes a cycle every 12 years.',
    saturn: 'Saturn completes a cycle every 29 years.',
    uranus: 'Uranus completes a cycle every 84 years.',
    neptune: 'Neptune completes a cycle every 165 years.',
    pluto: 'Pluto completes a cycle every 248 years.',
  };
  return cycles[planet.toLowerCase()] || '';
};

const getNextOccurrence = (planet: string): string => {
  const nextTimes: Record<string, string> = {
    sun: '1 year',
    moon: '1 month',
    mercury: '1 year',
    venus: '1-1.5 years',
    mars: '2 years',
    jupiter: '12 years',
    saturn: '29 years',
    uranus: '84 years',
    neptune: '165 years',
    pluto: '248 years',
  };
  return nextTimes[planet.toLowerCase()] || 'several years';
};

interface FeelingData {
  title: string;
  feeling: string;
  body: string;
  emotional: string;
  where: string;
  duration: string;
}

const getFeeling = (transitPlanet: string, natalPlanet: string, aspect: string, natalHouse: number | null): FeelingData => {
  const feelingsDatabase: Record<string, FeelingData> = {
    'sun-square-pluto': {
      title: 'Power Struggle with Self',
      feeling: 'You feel like your identity is being challenged by deep, buried power. It is uncomfortable. Your ego (Sun) is being forced to confront your shadow (Pluto). You might feel controlling or controlled. Authority issues surface.',
      body: 'Physically: tension in solar plexus, feeling of being watched or judged, power surging through you that you do not know how to direct.',
      emotional: 'Emotionally: intense, confrontational, like you are being tested. Might feel paranoid or deeply suspicious. Anger at people in authority. Desire to control situations.',
      where: natalHouse ? `This is playing out in your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} - so the power dynamics are specifically around ${HOUSE_MEANINGS[natalHouse].keywords.toLowerCase()}.` : 'Pay attention to where power dynamics are surfacing.',
      duration: 'Squares feel URGENT - like you MUST do something. The discomfort peaks at exact but you feel it building 3 days before and releasing 3 days after.',
    },
    'moon-trine-mars': {
      title: 'Emotions Empower Action',
      feeling: 'You feel energized and clear. Your emotions (Moon) and your drive (Mars) are working together perfectly. What you FEEL and what you WANT are aligned. You are motivated without being aggressive.',
      body: 'Physically: energy flowing smoothly, vitality, feeling strong but not tense. Easy movement. Good for physical activity.',
      emotional: 'Emotionally: confident, decisive, passionate but not overwhelming. Emotions fuel you rather than drain you. Courage feels natural.',
      where: natalHouse ? `This flows through your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}.` : 'Notice where action feels effortless.',
      duration: 'Trines feel EASY - you might not even notice them. The gift is subtle. Lasts about 1-2 days for Moon transits.',
    },
    'sun-conjunction-pluto': {
      title: 'Identity Transformation',
      feeling: 'Your core self is being completely transformed. This is a death and rebirth of who you are. Ego confronts ultimate power.',
      body: 'Physically: intense energy, possible exhaustion, feeling of being stripped down to essentials.',
      emotional: 'Emotionally: powerful, potentially overwhelming. Old identity must die for the new to emerge.',
      where: natalHouse ? `This transformation affects your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}.` : 'Your entire sense of self is being remade.',
      duration: 'Conjunctions are the most powerful aspect. Effects linger for the entire transit period.',
    },
    'saturn-square-saturn': {
      title: 'Saturn Square - Life Structure Test',
      feeling: 'Your life structures are being tested. What you built is being challenged. This is the mid-point of your Saturn cycle - a crisis of maturity.',
      body: 'Physically: possible fatigue, feeling of weight or burden, needing more rest.',
      emotional: 'Emotionally: serious, possibly depressed, questioning your life direction. Heavy responsibilities.',
      where: natalHouse ? `The pressure is on your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} themes.` : 'Look at what structures need to change.',
      duration: 'Saturn transits last MONTHS. The exact hit is just the peak - you feel this for weeks before and after.',
    },
    'jupiter-conjunction-sun': {
      title: 'Expansion of Self',
      feeling: 'You feel larger than life! Confidence soars. Opportunities find you. Your identity is expanding in positive ways.',
      body: 'Physically: high energy, possibly weight gain, feeling of abundance and vitality.',
      emotional: 'Emotionally: optimistic, generous, confident. Belief in yourself is strong. Might overdo it.',
      where: natalHouse ? `Growth and luck flow to your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}.` : 'Expansion touches your core identity.',
      duration: 'Jupiter transits are relatively brief but powerful. Make the most of this lucky period!',
    },
  };
  
  const key = `${transitPlanet.toLowerCase()}-${aspect}-${natalPlanet.toLowerCase()}`;
  
  if (feelingsDatabase[key]) {
    return feelingsDatabase[key];
  }
  
  // Generic feeling based on aspect type
  const aspectInfo = ASPECT_MEANINGS[aspect] || { meaning: 'aspects', energy: 'planetary interaction' };
  const transitInfo = PLANET_ESSENCES[transitPlanet.toLowerCase()] || { name: transitPlanet, essence: '' };
  const natalInfo = PLANET_ESSENCES[natalPlanet.toLowerCase()] || { name: natalPlanet, essence: '' };
  
  return {
    title: `${transitInfo.name} ${aspectInfo.meaning} ${natalInfo.name}`,
    feeling: `Transit ${transitInfo.name} ${aspectInfo.meaning} your natal ${natalInfo.name}. ${aspectInfo.energy}`,
    body: 'Physical sensations vary by person. Notice where you feel tension or ease in your body.',
    emotional: 'Emotional responses depend on your personal relationship with these planetary energies.',
    where: natalHouse ? `This affects your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} themes.` : 'Notice which life area is activated.',
    duration: 'Duration varies by planet speed. Faster planets = shorter transits.',
  };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const DegreeMeaning = ({ degree, sign, house, natalChart }: { 
  degree: number; 
  sign: string; 
  house: number | null; 
  natalChart: NatalChart;
}) => {
  // Check what else is at this degree in natal chart
  const natalPlanetsAtDegree = Object.entries(natalChart.planets)
    .filter(([, planet]) => {
      if (!planet?.degree) return false;
      const planetDegree = Math.floor(planet.degree);
      return planetDegree >= degree - 2 && planetDegree <= degree + 2;
    });
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
      borderRadius: '8px',
      border: '1px solid #2196F3'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#1565C0'
      }}>
        📍 What {degree}° {sign} Means in YOUR Chart
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        {house && (
          <div style={{ marginBottom: '12px' }}>
            <strong>This degree falls in your {house}{getOrdinal(house)} house:</strong>
            {' '}{HOUSE_MEANINGS[house].full}
          </div>
        )}
        
        {natalPlanetsAtDegree.length > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '4px',
            borderLeft: '3px solid #2196F3'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1565C0' }}>
              ⚡ SENSITIVE POINT - You have natal planets near this degree:
            </div>
            {natalPlanetsAtDegree.map(([planetKey, planetData], i) => (
              <div key={i} style={{ fontSize: '13px', color: '#424242', marginBottom: '4px' }}>
                • {getSymbol(planetKey)} {PLANET_ESSENCES[planetKey.toLowerCase()]?.name || planetKey} at {planetData?.degree}° {planetData?.sign}
              </div>
            ))}
            <div style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '8px', fontStyle: 'italic' }}>
              This area of your chart is already loaded with planetary energy - transits here are EXTRA significant!
            </div>
          </div>
        )}
        
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#1565C0' }}>
            Degree Symbolism ({Math.floor(degree) + 1}° {sign}):
          </div>
          <div style={{ fontSize: '13px', color: '#424242', fontStyle: 'italic', marginBottom: '4px' }}>
            "{getDegreeMeaning(degree, sign).symbol}"
          </div>
          <div style={{ fontSize: '12px', color: '#616161' }}>
            {getDegreeMeaning(degree, sign).meaning}
          </div>
        </div>
      </div>
    </div>
  );
};

const TransitActivation = ({
  transitPlanet, transitDegree, transitSign, transitHouse,
  natalPlanet, natalDegree, natalSign, natalHouse, aspect
}: {
  transitPlanet: string;
  transitDegree: number;
  transitSign: string;
  transitHouse: number | null;
  natalPlanet: string;
  natalDegree: number;
  natalSign: string;
  natalHouse: number | null;
  aspect: string;
}) => {
  const transitInfo = PLANET_ESSENCES[transitPlanet.toLowerCase()] || { name: transitPlanet, essence: '' };
  const natalInfo = PLANET_ESSENCES[natalPlanet.toLowerCase()] || { name: natalPlanet, essence: '' };
  const aspectInfo = ASPECT_MEANINGS[aspect] || { meaning: 'aspects', energy: '' };
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      borderRadius: '8px',
      border: '1px solid #66BB6A'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#1B5E20'
      }}>
        ⚡ What This Transit Activates
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '600', color: '#1B5E20', marginBottom: '6px' }}>
            Transit {transitInfo.name} at {transitDegree}° {transitSign}{transitHouse ? ` (your ${transitHouse}${getOrdinal(transitHouse)} house)` : ''}:
          </div>
          <div>
            {transitHouse ? `Your ${HOUSE_MEANINGS[transitHouse].short.toLowerCase()} area is being energized by` : 'Your chart is being activated by'}
            {' '}{transitInfo.name.toLowerCase()} energy. {transitInfo.essence}
          </div>
          <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#2E7D32' }}>
            {getSignExpression(transitInfo.name, transitSign)}
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '4px',
          borderLeft: '4px solid #66BB6A'
        }}>
          <div style={{ fontWeight: '600', color: '#1B5E20', marginBottom: '6px' }}>
            This {aspectInfo.meaning}s your Natal {natalInfo.name} at {natalDegree}° {natalSign}{natalHouse ? ` (your ${natalHouse}${getOrdinal(natalHouse)} house)` : ''}:
          </div>
          <div>
            Your natal {natalInfo.name.toLowerCase()} represents {natalInfo.essence.toLowerCase()}
            {natalHouse && ` It lives in your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} (${natalHouse}${getOrdinal(natalHouse)} house).`}
          </div>
          <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#2E7D32' }}>
            {getSignExpression(natalInfo.name, natalSign)}
          </div>
        </div>
        
        {transitHouse && natalHouse && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,235,59,0.2)', borderRadius: '4px' }}>
            <div style={{ fontWeight: '600', marginBottom: '6px' }}>
              🎯 THE CONNECTION:
            </div>
            <div>
              {getHouseToHouseMeaning(transitHouse, natalHouse, aspectInfo.meaning)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HowItFeels = ({ transitPlanet, natalPlanet, aspect, natalHouse }: {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  natalHouse: number | null;
}) => {
  const feelings = getFeeling(transitPlanet, natalPlanet, aspect, natalHouse);
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
      borderRadius: '8px',
      border: '1px solid #FFA726'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#E65100'
      }}>
        💭 How This FEELS
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#E65100'
        }}>
          {feelings.title}
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>General Feeling:</strong> {feelings.feeling}
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>In Your Body:</strong> {feelings.body}
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>Emotionally:</strong> {feelings.emotional}
        </div>
        
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px',
          borderLeft: '3px solid #FFA726'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#E65100' }}>
            Where You Will Feel This:
          </div>
          <div style={{ fontSize: '13px' }}>
            {feelings.where}
          </div>
        </div>
        
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#E65100' }}>
            Duration of This Feeling:
          </div>
          <div style={{ fontSize: '13px' }}>
            {feelings.duration}
          </div>
        </div>
      </div>
    </div>
  );
};

const TransitTimeline = ({ transitPlanet, aspect, currentDate }: {
  transitPlanet: string;
  aspect: string;
  currentDate: Date;
}) => {
  const duration = calculateTransitDuration(transitPlanet, aspect);
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
      borderRadius: '8px',
      border: '1px solid #AB47BC'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#6A1B9A'
      }}>
        ⏰ Timeline & Duration
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#6A1B9A' }}>First Contact:</div>
          <div>{duration.startDate}</div>
          
          <div style={{ fontWeight: '600', color: '#6A1B9A' }}>EXACT:</div>
          <div>{duration.exactDate} ⭐</div>
          
          <div style={{ fontWeight: '600', color: '#6A1B9A' }}>Separation:</div>
          <div>{duration.endDate}</div>
          
          <div style={{ fontWeight: '600', color: '#6A1B9A' }}>Total Duration:</div>
          <div>{duration.totalDays} days</div>
        </div>
        
        <div style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: '#6A1B9A' }}>
            What to Expect:
          </div>
          <div style={{ marginBottom: '6px' }}>
            • <strong>Building Phase</strong> ({duration.startDate} - {duration.exactDate}): 
            Energy increases. You start feeling it about 3 days before exact.
          </div>
          <div style={{ marginBottom: '6px' }}>
            • <strong>Peak</strong> ({duration.exactDate}): 
            Maximum intensity. This is when the aspect is most powerful.
          </div>
          <div>
            • <strong>Release Phase</strong> ({duration.exactDate} - {duration.endDate}): 
            Energy decreases. Integration period. Lasts about 3 days after exact.
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoricalPatterns = ({ matches, transitPlanet, natalPlanet, aspect }: {
  matches: HistoricalMatch[];
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
}) => {
  if (!matches || matches.length === 0) {
    return (
      <div style={{
        marginBottom: '24px',
        padding: '20px',
        background: '#F5F3EF',
        borderRadius: '8px',
        border: '1px solid #C8C4BC'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#6B6B6B'
        }}>
          📅 Historical Patterns
        </h4>
        <div style={{ fontSize: '14px', color: '#6B6B6B' }}>
          This exact transit ({transitPlanet} {aspect} {natalPlanet}) has no previous journal entries.
          Start journaling now to track the pattern for next time!
        </div>
        <div style={{ fontSize: '13px', color: '#8B7355', marginTop: '8px' }}>
          {getTransitCycle(transitPlanet)} This same aspect will happen again in approximately{' '}
          {getNextOccurrence(transitPlanet)}.
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
      borderRadius: '8px',
      border: '1px solid #26A69A'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#00695C'
      }}>
        📅 This SAME Transit Happened Before
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        <div style={{ marginBottom: '16px', fontSize: '13px', color: '#00796B' }}>
          Look for patterns in your journal from these dates. What was happening? 
          How did you feel? What themes emerged?
        </div>
        
        {matches.slice(0, 3).map((match, i) => (
          <div key={i} style={{
            marginBottom: '12px',
            padding: '16px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '4px',
            borderLeft: '4px solid #26A69A'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ fontWeight: '600', color: '#00695C' }}>
                {match.date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div style={{ fontSize: '12px', color: '#6B6B6B' }}>
                {match.yearsAgo > 0 ? `${match.yearsAgo} year${match.yearsAgo > 1 ? 's' : ''} ago` : 'This year'}
              </div>
            </div>
            
            <div style={{ fontSize: '13px', color: '#424242', marginBottom: '8px' }}>
              {getSymbol(match.transitPlanet)} {match.transitPlanet} at {match.transitDegree}° {match.transitSign}
              {' '}{aspect}{' '}
              {getSymbol(match.natalPlanet)} {match.natalPlanet} at {match.natalDegree}° {match.natalSign}
            </div>
            
            {match.journalEntry && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#E0F2F1',
                borderRadius: '4px',
                fontSize: '13px',
                fontStyle: 'italic'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '6px' }}>Your Journal Entry:</div>
                <div>{match.journalEntry}</div>
              </div>
            )}
          </div>
        ))}
        
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,235,59,0.2)',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: '#00695C' }}>
            🔮 Pattern Cycle:
          </div>
          <div>
            {getTransitCycle(transitPlanet)} This same aspect will happen again in approximately{' '}
            {getNextOccurrence(transitPlanet)}.
          </div>
        </div>
      </div>
    </div>
  );
};

const JournalWithPatterns = ({ aspect, currentDate }: {
  aspect: TransitAspect;
  currentDate: Date;
}) => {
  const [journalEntry, setJournalEntry] = useState('');
  const [saved, setSaved] = useState(false);
  
  const saveJournal = () => {
    const transitSignature = `${aspect.transitPlanet.toLowerCase()}-${aspect.aspect}-${aspect.natalPlanet.toLowerCase()}`;
    const journalData = {
      date: currentDate.toISOString(),
      transitSignature,
      transitDegree: aspect.transitDegree,
      transitSign: aspect.transitSign,
      natalDegree: aspect.natalDegree,
      natalSign: aspect.natalSign,
      entry: journalEntry,
    };
    
    const existingJournals = JSON.parse(localStorage.getItem('transitJournals') || '[]');
    existingJournals.push(journalData);
    localStorage.setItem('transitJournals', JSON.stringify(existingJournals));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
      borderRadius: '8px',
      border: '1px solid #FBC02D'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#F57F17'
      }}>
        📔 Journal This Transit - Track the Pattern
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C', marginBottom: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          Write about how you are experiencing this transit. In {getNextOccurrence(aspect.transitPlanet)}, 
          when this same aspect happens again, you will see your entry here and recognize the pattern.
        </div>
        
        <div style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px',
          fontSize: '13px',
          marginBottom: '12px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#F57F17' }}>
            Reflection Prompts:
          </div>
          <div>• How are you feeling in your body right now?</div>
          <div>• What themes are coming up{aspect.natalHouse ? ` in your ${HOUSE_MEANINGS[aspect.natalHouse].short.toLowerCase()}` : ''}?</div>
          <div>• What power dynamics are you noticing?</div>
          <div>• What wants to transform?</div>
          <div>• What are you learning?</div>
        </div>
      </div>
      
      <textarea
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        placeholder="Write your experience of this transit here..."
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '16px',
          border: '1px solid #FBC02D',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'Lato, sans-serif',
          resize: 'vertical',
          marginBottom: '12px',
          boxSizing: 'border-box',
        }}
      />
      
      <button
        onClick={saveJournal}
        disabled={!journalEntry.trim()}
        style={{
          padding: '12px 24px',
          background: journalEntry.trim() ? '#FBC02D' : '#E0E0E0',
          color: journalEntry.trim() ? '#2C2C2C' : '#9E9E9E',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: journalEntry.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        {saved ? '✓ Saved!' : '💾 Save Journal Entry'}
      </button>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ComprehensiveTransitAnalysisProps {
  aspect: TransitAspect;
  natalChart: NatalChart;
  currentDate: Date;
}

export const ComprehensiveTransitAnalysis = ({ 
  aspect, 
  natalChart, 
  currentDate 
}: ComprehensiveTransitAnalysisProps) => {
  const historicalMatches = findHistoricalMatches(aspect, currentDate);
  
  return (
    <div style={{
      marginBottom: '32px',
      padding: '28px',
      background: '#FFFFFF',
      borderRadius: '12px',
      border: `3px solid ${aspect.color}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '20px',
        color: aspect.color,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '28px' }}>
          {getSymbol(aspect.transitPlanet)}{aspect.symbol}{getSymbol(aspect.natalPlanet)}
        </span>
        <span>
          Transit {aspect.transitPlanet}
          {' '}{aspect.aspect}s{' '}
          Natal {aspect.natalPlanet}
        </span>
        {aspect.isExact && <span style={{ fontSize: '24px' }}>⭐</span>}
      </div>
      
      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        background: '#F5F3EF',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>TRANSIT</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {aspect.transitDegree}° {aspect.transitSign}
          </div>
          {aspect.transitHouse && (
            <div style={{ fontSize: '12px', color: '#8B7355' }}>
              in your {aspect.transitHouse}{getOrdinal(aspect.transitHouse)} house
            </div>
          )}
        </div>
        
        <div>
          <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>NATAL</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {aspect.natalDegree}° {aspect.natalSign}
          </div>
          {aspect.natalHouse && (
            <div style={{ fontSize: '12px', color: '#8B7355' }}>
              in your {aspect.natalHouse}{getOrdinal(aspect.natalHouse)} house
            </div>
          )}
        </div>
        
        <div>
          <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>ORB</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {aspect.isExact ? 'EXACT!' : `${aspect.orb}°`}
          </div>
          <div style={{ fontSize: '12px', color: '#8B7355' }}>
            {aspect.meaning}
          </div>
        </div>
      </div>
      
      {/* Section 1: What This Degree Means in YOUR Chart */}
      <DegreeMeaning
        degree={aspect.transitDegree}
        sign={aspect.transitSign}
        house={aspect.transitHouse}
        natalChart={natalChart}
      />
      
      {/* Section 2: What the Transit Activates */}
      <TransitActivation
        transitPlanet={aspect.transitPlanet}
        transitDegree={aspect.transitDegree}
        transitSign={aspect.transitSign}
        transitHouse={aspect.transitHouse}
        natalPlanet={aspect.natalPlanet}
        natalDegree={aspect.natalDegree}
        natalSign={aspect.natalSign}
        natalHouse={aspect.natalHouse}
        aspect={aspect.aspect}
      />
      
      {/* Section 3: How This FEELS */}
      <HowItFeels
        transitPlanet={aspect.transitPlanet}
        natalPlanet={aspect.natalPlanet}
        aspect={aspect.aspect}
        natalHouse={aspect.natalHouse}
      />
      
      {/* Section 4: Timeline & Duration */}
      <TransitTimeline
        transitPlanet={aspect.transitPlanet}
        aspect={aspect.aspect}
        currentDate={currentDate}
      />
      
      {/* Section 5: Historical Patterns */}
      <HistoricalPatterns
        matches={historicalMatches}
        transitPlanet={aspect.transitPlanet}
        natalPlanet={aspect.natalPlanet}
        aspect={aspect.aspect}
      />
      
      {/* Section 6: Journal Prompt with Pattern Tracking */}
      <JournalWithPatterns
        aspect={aspect}
        currentDate={currentDate}
      />
    </div>
  );
};

export default ComprehensiveTransitAnalysis;
