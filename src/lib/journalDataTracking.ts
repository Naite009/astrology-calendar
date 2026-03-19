/**
 * Data Tracking Hooks for Lunar Cycle Journals
 * 
 * Auto-tags journal entries with:
 * 1. Current moon phase (from Sun-Moon elongation)
 * 2. Eclipse proximity (within 2 weeks of a solar/lunar eclipse)
 * 3. Active SR transit hits from activation windows
 */

import * as Astronomy from 'astronomy-engine';
import { SRActivationData, TransitHit } from './solarReturnActivationWindows';

// ─── Moon Phase ─────────────────────────────────────────────────────

export interface MoonPhaseTag {
  phase: string;         // "New Moon", "Waxing Crescent", etc.
  emoji: string;
  illumination: number;  // 0-100
  angle: number;         // Sun-Moon elongation 0-360
  description: string;
}

const PHASES: { name: string; emoji: string; min: number; max: number }[] = [
  { name: 'New Moon',        emoji: '🌑', min: 0,     max: 22.5 },
  { name: 'Waxing Crescent', emoji: '🌒', min: 22.5,  max: 67.5 },
  { name: 'First Quarter',   emoji: '🌓', min: 67.5,  max: 112.5 },
  { name: 'Waxing Gibbous',  emoji: '🌔', min: 112.5, max: 157.5 },
  { name: 'Full Moon',       emoji: '🌕', min: 157.5, max: 202.5 },
  { name: 'Waning Gibbous',  emoji: '🌖', min: 202.5, max: 247.5 },
  { name: 'Last Quarter',    emoji: '🌗', min: 247.5, max: 292.5 },
  { name: 'Balsamic',        emoji: '🌘', min: 292.5, max: 360 },
];

export function getMoonPhaseForDate(date: Date): MoonPhaseTag {
  const astroDate = Astronomy.MakeTime(date);
  const sunLon = Astronomy.EclipticGeoMoon(astroDate); // we need Sun too
  const sun = Astronomy.SunPosition(astroDate);
  const moon = Astronomy.EclipticGeoMoon(astroDate);
  
  let angle = moon.lon - sun.elon;
  if (angle < 0) angle += 360;
  
  const illumination = Math.round(Astronomy.Illumination('Moon', astroDate).phase_fraction * 100);
  
  const phaseInfo = PHASES.find(p => angle >= p.min && angle < p.max) || PHASES[0];
  
  const descriptions: Record<string, string> = {
    'New Moon': 'Time for setting intentions and planting seeds. Energy is internal and reflective.',
    'Waxing Crescent': 'Emerging momentum. Initial steps toward your intentions begin to take shape.',
    'First Quarter': 'Action and decision point. Challenges arise that test your commitment.',
    'Waxing Gibbous': 'Refinement phase. Adjust, edit, and prepare for the culmination ahead.',
    'Full Moon': 'Culmination and illumination. What was hidden becomes visible. Release what no longer serves.',
    'Waning Gibbous': 'Gratitude and sharing. Harvest the wisdom from what has been revealed.',
    'Last Quarter': 'Release and let go. Clear space for the next cycle by shedding the old.',
    'Balsamic': 'Rest and surrender. The quietest phase — dream, reflect, and trust the void.',
  };
  
  return {
    phase: phaseInfo.name,
    emoji: phaseInfo.emoji,
    illumination,
    angle: Math.round(angle * 100) / 100,
    description: descriptions[phaseInfo.name] || '',
  };
}

// ─── Eclipse Proximity ──────────────────────────────────────────────

export interface EclipseProximityTag {
  isNearEclipse: boolean;
  eclipseType?: 'solar' | 'lunar';
  eclipseDate?: Date;
  daysUntil?: number;        // negative = days after
  sign?: string;
  description?: string;
}

export function getEclipseProximity(date: Date): EclipseProximityTag {
  const astroDate = Astronomy.MakeTime(date);
  
  // Search for nearest solar eclipse (within ~30 days either direction)
  const searchWindowDays = 21; // 3 weeks
  
  try {
    // Find next solar eclipse from 3 weeks before the date
    const searchStart = Astronomy.MakeTime(new Date(date.getTime() - searchWindowDays * 86400000));
    const solarEclipse = Astronomy.SearchGlobalSolarEclipse(searchStart);
    
    if (solarEclipse && solarEclipse.peak) {
      const eclDate = solarEclipse.peak.date;
      const diffMs = eclDate.getTime() - date.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      
      if (Math.abs(diffDays) <= 14) {
        const sunPos = Astronomy.SunPosition(solarEclipse.peak);
        const signIndex = Math.floor(sunPos.elon / 30);
        const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
        
        return {
          isNearEclipse: true,
          eclipseType: 'solar',
          eclipseDate: eclDate,
          daysUntil: diffDays,
          sign: signs[signIndex] || 'Unknown',
          description: diffDays > 0
            ? `Solar eclipse in ${signs[signIndex]} approaching in ${diffDays} days — amplified new beginnings.`
            : `Solar eclipse in ${signs[signIndex]} occurred ${Math.abs(diffDays)} days ago — seeds planted are activating.`,
        };
      }
    }
    
    // Check lunar eclipse too
    const lunarEclipse = Astronomy.SearchLunarEclipse(searchStart);
    if (lunarEclipse && lunarEclipse.peak) {
      const eclDate = lunarEclipse.peak.date;
      const diffMs = eclDate.getTime() - date.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      
      if (Math.abs(diffDays) <= 14) {
        const moonPos = Astronomy.EclipticGeoMoon(lunarEclipse.peak);
        const signIndex = Math.floor(moonPos.lon / 30);
        const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
        
        return {
          isNearEclipse: true,
          eclipseType: 'lunar',
          eclipseDate: eclDate,
          daysUntil: diffDays,
          sign: signs[signIndex] || 'Unknown',
          description: diffDays > 0
            ? `Lunar eclipse in ${signs[signIndex]} approaching in ${diffDays} days — emotional revelations incoming.`
            : `Lunar eclipse in ${signs[signIndex]} occurred ${Math.abs(diffDays)} days ago — deep emotional processing active.`,
        };
      }
    }
  } catch (e) {
    console.error('[DataTracking] Eclipse search error:', e);
  }
  
  return { isNearEclipse: false };
}

// ─── Active SR Transit Hits ─────────────────────────────────────────

export interface ActiveTransitTag {
  isActive: boolean;
  hits: {
    transitPlanet: string;
    srTarget: string;
    aspect: string;
    exactDate: Date;
    daysFromNow: number;
    significance: 'high' | 'medium' | 'low';
    interpretation: string;
  }[];
  summary?: string;
}

export function getActiveTransitHits(date: Date, activationData: SRActivationData | null): ActiveTransitTag {
  if (!activationData) return { isActive: false, hits: [] };
  
  const windowDays = 7; // show transits within 7 days
  const dateMs = date.getTime();
  
  const activeHits = activationData.transitHits
    .filter(hit => {
      const hitMs = hit.exactDate.getTime();
      const diffDays = Math.abs(hitMs - dateMs) / 86400000;
      return diffDays <= windowDays;
    })
    .map(hit => ({
      transitPlanet: hit.transitPlanet,
      srTarget: hit.srTarget,
      aspect: hit.aspect,
      exactDate: hit.exactDate,
      daysFromNow: Math.round((hit.exactDate.getTime() - dateMs) / 86400000),
      significance: hit.significance,
      interpretation: hit.interpretation,
    }))
    .sort((a, b) => Math.abs(a.daysFromNow) - Math.abs(b.daysFromNow));
  
  if (activeHits.length === 0) return { isActive: false, hits: [] };
  
  const highHits = activeHits.filter(h => h.significance === 'high');
  const summary = highHits.length > 0
    ? `${highHits.length} significant transit(s) active: ${highHits.map(h => `${h.transitPlanet} ${h.aspect} ${h.srTarget}`).join(', ')}`
    : `${activeHits.length} transit(s) within this week`;
  
  return { isActive: true, hits: activeHits, summary };
}

// ─── Combined Tag ───────────────────────────────────────────────────

export interface JournalContextTags {
  moonPhase: MoonPhaseTag;
  eclipse: EclipseProximityTag;
  transits: ActiveTransitTag;
}

export function getJournalContextTags(
  date: Date,
  activationData: SRActivationData | null
): JournalContextTags {
  return {
    moonPhase: getMoonPhaseForDate(date),
    eclipse: getEclipseProximity(date),
    transits: getActiveTransitHits(date, activationData),
  };
}
