// Chart Data Validation & Self-Correction Utilities
// Provides sanity checks to catch data inconsistencies before they reach the UI

import { NatalChart } from "@/hooks/useNatalChart";

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

interface ValidationResult {
  isValid: boolean;
  correctedValue: string;
  warnings: string[];
}

/**
 * Get the validated Ascendant sign from a chart.
 * Prioritizes houseCusps.house1 and cross-checks against planets.Ascendant.
 * Uses zodiacal logic (6th house sign relationship) as additional validation.
 */
/**
 * Returns the reliable Ascendant position data, always preferring houseCusps.house1.
 * Use this instead of chart.planets.Ascendant anywhere you need Ascendant sign/degree/minutes.
 */
export function getReliableAscendant(chart: NatalChart): { sign: string; degree: number; minutes: number; seconds?: number; isRetrograde?: boolean } | null {
  const h1 = chart.houseCusps?.house1;
  if (h1?.sign) {
    return { sign: h1.sign, degree: h1.degree, minutes: h1.minutes || 0 };
  }
  const pa = chart.planets?.Ascendant;
  if (pa?.sign) {
    return { sign: pa.sign, degree: pa.degree, minutes: pa.minutes || 0 };
  }
  return null;
}

export function getValidatedAscendant(chart: NatalChart): ValidationResult {
  const warnings: string[] = [];
  
  const house1Sign = chart.houseCusps?.house1?.sign;
  const planetsAscSign = chart.planets?.Ascendant?.sign;
  const house6Sign = chart.houseCusps?.house6?.sign;
  
  // Primary source: house1 cusp
  let correctedValue = house1Sign || planetsAscSign || 'Unknown';
  
  // Check #1: house1 vs planets.Ascendant mismatch
  if (house1Sign && planetsAscSign && house1Sign !== planetsAscSign) {
    warnings.push(
      `Ascendant mismatch: house1 says "${house1Sign}" but planets.Ascendant says "${planetsAscSign}". Using house1.`
    );
    correctedValue = house1Sign;
  }
  
  // Check #2: Zodiacal sanity check with 6th house
  // In whole-sign houses, 6th house is 5 signs after Asc
  // In Placidus, it can vary but should never be the SAME sign as Asc (except edge cases)
  if (house6Sign && correctedValue && house6Sign === correctedValue) {
    warnings.push(
      `Zodiacal anomaly: 6th house (${house6Sign}) matches Ascendant (${correctedValue}). This is extremely rare - please verify chart data.`
    );
  }
  
  // Check #3: If planets.Ascendant matches 6th house sign, it's likely a 180° flip error
  if (planetsAscSign && house6Sign && planetsAscSign === house6Sign && house1Sign && house1Sign !== planetsAscSign) {
    warnings.push(
      `Detected likely Asc/Desc flip: planets.Ascendant "${planetsAscSign}" matches 6th house. Using house1 "${house1Sign}" instead.`
    );
    correctedValue = house1Sign;
  }
  
  // Check #4: Validate that Asc makes sense relative to 6th house (should be ~5-6 signs apart)
  if (house6Sign && correctedValue && correctedValue !== 'Unknown') {
    const ascIndex = ZODIAC_ORDER.indexOf(correctedValue);
    const h6Index = ZODIAC_ORDER.indexOf(house6Sign);
    if (ascIndex !== -1 && h6Index !== -1) {
      // In whole-sign, 6th house is exactly 5 signs after Asc
      // In Placidus, it can be 4-6 signs apart depending on interceptions
      const expectedH6Index = (ascIndex + 5) % 12;
      const distance = Math.abs(h6Index - expectedH6Index);
      // Allow 1 sign variance for Placidus interceptions
      if (distance > 1 && distance < 11) {
        warnings.push(
          `Zodiacal distance check: Asc "${correctedValue}" and 6th house "${house6Sign}" seem misaligned. Expected ~5 signs apart.`
        );
      }
    }
  }
  
  // Log warnings in development
  if (warnings.length > 0) {
    console.warn('[Chart Validation]', warnings.join(' | '));
  }
  
  return {
    isValid: warnings.length === 0,
    correctedValue,
    warnings
  };
}

/**
 * Get validated planet house placement.
 * Uses exact degree/minute comparison against house cusps.
 */
export function getValidatedPlanetHouse(
  planetDegree: number,
  planetMinutes: number,
  houseCusps: NatalChart['houseCusps']
): number {
  if (!houseCusps) return 1;
  
  const planetLongitude = planetDegree + (planetMinutes / 60);
  
  // Build array of house cusp longitudes
  const cusps: { house: number; longitude: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}` as keyof typeof houseCusps;
    const cusp = houseCusps[key];
    if (cusp) {
      const signIndex = ZODIAC_ORDER.indexOf(cusp.sign);
      if (signIndex !== -1) {
        const longitude = (signIndex * 30) + cusp.degree + ((cusp.minutes || 0) / 60);
        cusps.push({ house: i, longitude: longitude % 360 });
      }
    }
  }
  
  if (cusps.length !== 12) return 1;
  
  // Sort by longitude
  cusps.sort((a, b) => a.longitude - b.longitude);
  
  // Find which house contains the planet
  for (let i = 0; i < 12; i++) {
    const current = cusps[i];
    const next = cusps[(i + 1) % 12];
    
    let start = current.longitude;
    let end = next.longitude;
    
    // Handle wrap-around (e.g., Pisces to Aries)
    if (end < start) end += 360;
    
    let testLong = planetLongitude;
    if (testLong < start && start > 270) testLong += 360;
    
    if (testLong >= start && testLong < end) {
      return current.house;
    }
  }
  
  return 1;
}

/**
 * Validates entire chart data and returns a summary of issues found.
 */
export function validateChartData(chart: NatalChart): {
  hasIssues: boolean;
  issues: string[];
  corrections: Record<string, string>;
} {
  const issues: string[] = [];
  const corrections: Record<string, string> = {};
  
  // Validate Ascendant
  const ascResult = getValidatedAscendant(chart);
  if (!ascResult.isValid) {
    issues.push(...ascResult.warnings);
    corrections['Ascendant'] = ascResult.correctedValue;
  }
  
  // Validate that Sun/Moon have valid signs
  const sunSign = chart.planets?.Sun?.sign;
  const moonSign = chart.planets?.Moon?.sign;
  
  if (sunSign && !ZODIAC_ORDER.includes(sunSign)) {
    issues.push(`Invalid Sun sign: "${sunSign}"`);
  }
  
  if (moonSign && !ZODIAC_ORDER.includes(moonSign)) {
    issues.push(`Invalid Moon sign: "${moonSign}"`);
  }
  
  // Check for house cusp continuity
  if (chart.houseCusps) {
    const h1 = chart.houseCusps.house1?.sign;
    const h7 = chart.houseCusps.house7?.sign;
    
    if (h1 && h7) {
      const h1Index = ZODIAC_ORDER.indexOf(h1);
      const h7Index = ZODIAC_ORDER.indexOf(h7);
      
      // 7th house should be opposite 1st (6 signs apart)
      const expectedH7 = (h1Index + 6) % 12;
      if (h7Index !== expectedH7) {
        issues.push(
          `1st/7th house axis mismatch: 1st is ${h1}, 7th should be ${ZODIAC_ORDER[expectedH7]} but is ${h7}`
        );
      }
    }
  }
  
  return {
    hasIssues: issues.length > 0,
    issues,
    corrections
  };
}
