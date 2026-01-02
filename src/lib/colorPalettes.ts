// Astrology-inspired color palettes for signs, elements, and planets
export const ELEMENT_PALETTES: Record<string, string[]> = {
  Fire: ["#B23A2F", "#E76F51", "#F4A261", "#FCECC4", "#7A1E2C", "#F2C14E"],
  Earth: ["#2F5D50", "#6B705C", "#A5A58D", "#B7B7A4", "#3E3A2D", "#D6C7B8"],
  Air: ["#7A90A4", "#B8C4CC", "#DCE6F1", "#3B4A5A", "#A7B7C7", "#EAEFF5"],
  Water: ["#1D3557", "#2A6F97", "#457B9D", "#A8DADC", "#0B2545", "#6D597A"],
};

export const SIGN_PALETTES: Record<string, string[]> = {
  Aries: ["#C1121F", "#E85D04", "#F48C06", "#FDF0D5", "#3C0919", "#FFB703"],
  Taurus: ["#2D6A4F", "#40916C", "#B7E4C7", "#D8F3DC", "#6B705C", "#D4A373"],
  Gemini: ["#2D7DD2", "#97DFFC", "#F4F9FF", "#2A2D34", "#F9C74F", "#B8C4CC"],
  Cancer: ["#0B2545", "#134074", "#8DA9C4", "#EEF4ED", "#5C4D7D", "#A8DADC"],
  Leo: ["#D4A017", "#F2C14E", "#F9A826", "#FFF1CC", "#7A1E2C", "#C1121F"],
  Virgo: ["#386641", "#6A994E", "#A7C957", "#F2E8CF", "#6B705C", "#D6C7B8"],
  Libra: ["#B56576", "#E56B6F", "#EAAC8B", "#FFF1E6", "#6D597A", "#CDB4DB"],
  Scorpio: ["#2B2D42", "#6D597A", "#9A031E", "#0B2545", "#3C0919", "#A8DADC"],
  Sagittarius: ["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C", "#FCECC4"],
  Capricorn: ["#2F2E2B", "#3E3A2D", "#6B705C", "#2F5D50", "#A5A58D", "#D6C7B8"],
  Aquarius: ["#0F4C5C", "#2A9D8F", "#A8DADC", "#E0FBFC", "#3B4A5A", "#97DFFC"],
  Pisces: ["#355070", "#6D597A", "#B56576", "#E9D8FD", "#A8DADC", "#EEF4ED"],
};

export const PLANET_ACCENTS: Record<string, string[]> = {
  Sun: ["#D4A017", "#F2C14E"],
  Moon: ["#EEF4ED", "#B8C4CC"],
  Mercury: ["#2D7DD2", "#7A90A4"],
  Venus: ["#2D6A4F", "#B56576"],
  Mars: ["#C1121F", "#9A031E"],
  Jupiter: ["#5F0F40", "#FB8B24"],
  Saturn: ["#2F2E2B", "#6B705C"],
  Uranus: ["#2A9D8F", "#97DFFC"],
  Neptune: ["#355070", "#A8DADC"],
  Pluto: ["#0B2545", "#3C0919"],
  NorthNode: ["#7A90A4", "#EAEFF5"],
  SouthNode: ["#6B705C", "#D6C7B8"],
};

export const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

// Count how many planets are in each sign
export function getSignEmphasis(positions: Array<{ sign: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  positions.forEach((p) => {
    const sign = p.sign;
    counts[sign] = (counts[sign] || 0) + 1;
  });
  return counts;
}

// Get top N dominant signs
export function getDominantSigns(emphasis: Record<string, number>, n: number = 2): string[] {
  return Object.entries(emphasis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([sign]) => sign);
}

// Blend two palettes with a given ratio
export function blendPalettes(
  palette1: string[],
  palette2: string[],
  ratio1: number = 0.65
): string[] {
  const count1 = Math.round(6 * ratio1);
  const count2 = 6 - count1;
  return [...palette1.slice(0, count1), ...palette2.slice(0, count2)];
}

// Get collective palette for the day
export function getCollectivePalette(
  positions: Array<{ name: string; sign: string }>,
  moonSign: string
): { palette: string[]; dominantSigns: string[]; reasoning: string } {
  const emphasis = getSignEmphasis(positions);
  const dominantSigns = getDominantSigns(emphasis, 2);

  // Get base palette from dominant signs
  const basePalette1 = SIGN_PALETTES[dominantSigns[0]] || SIGN_PALETTES.Capricorn;
  const basePalette2 = dominantSigns[1]
    ? SIGN_PALETTES[dominantSigns[1]] || SIGN_PALETTES.Aries
    : basePalette1;

  let palette = blendPalettes(basePalette1, basePalette2, 0.65);

  // Add planet accents (Mars and Venus)
  const mars = positions.find((p) => p.name === "Mars");
  const venus = positions.find((p) => p.name === "Venus");
  if (mars) {
    const marsAccent = PLANET_ACCENTS.Mars[0];
    if (!palette.includes(marsAccent)) {
      palette[palette.length - 1] = marsAccent;
    }
  }
  if (venus) {
    const venusAccent = PLANET_ACCENTS.Venus[1];
    if (!palette.includes(venusAccent)) {
      palette[palette.length - 2] = venusAccent;
    }
  }

  // Moon overlay - apply a slight tint from moon sign
  const moonPalette = SIGN_PALETTES[moonSign];
  if (moonPalette && !dominantSigns.includes(moonSign)) {
    palette[2] = moonPalette[0]; // subtle overlay
  }

  // Dedupe nearby colors (simple)
  palette = [...new Set(palette)].slice(0, 6);
  while (palette.length < 6) {
    palette.push(basePalette1[palette.length % basePalette1.length]);
  }

  const element1 = SIGN_ELEMENTS[dominantSigns[0]] || "Earth";
  const element2 = dominantSigns[1] ? SIGN_ELEMENTS[dominantSigns[1]] : element1;

  const reasoning =
    element1 === element2
      ? `${element1}-heavy day with ${dominantSigns.join(" & ")} emphasis. Grounded tones with planetary accents.`
      : `${dominantSigns.join(" + ")} blend: ${element1} meets ${element2}. Dynamic palette with planetary accents from Mars/Venus.`;

  return { palette, dominantSigns, reasoning };
}

// Transit explanation helper
const PLANET_KEYWORDS: Record<string, string> = {
  Sun: 'identity/vitality',
  Moon: 'emotions/instincts',
  Mercury: 'communication/thinking',
  Venus: 'love/beauty',
  Mars: 'action/energy',
  Jupiter: 'expansion/luck',
  Saturn: 'discipline/structure',
  Uranus: 'change/innovation',
  Neptune: 'dreams/intuition',
  Pluto: 'transformation/power',
  Ascendant: 'self-image/appearance',
  NorthNode: 'life path/destiny',
  Pallas: 'wisdom/strategy',
  Juno: 'partnership/commitment',
  Ceres: 'nurturing/self-care',
  Vesta: 'focus/devotion',
  Chiron: 'healing/wounds',
  Lilith: 'shadow/authenticity',
};

export interface TransitDetail {
  transitPlanet: string;
  natalPlanet: string;
  transitSign: string;
  transitDegree: number;
  natalSign: string;
  natalDegree: number;
  aspectType: string;
  aspectSymbol: string;
  orb: string;
  explanation: string;
  colorInfluence: string;
}

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Convert sign + degree to absolute longitude (0-360)
const toAbsoluteLongitude = (sign: string, degree: number, minutes: number = 0): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree + (minutes / 60);
};

// Calculate aspect between two positions
const calculateAspect = (lon1: number, lon2: number): { type: string; symbol: string; orb: number } | null => {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  
  const aspects = [
    { angle: 0, type: 'conjunction', symbol: '☌', orb: 8 },
    { angle: 60, type: 'sextile', symbol: '⚹', orb: 6 },
    { angle: 90, type: 'square', symbol: '□', orb: 8 },
    { angle: 120, type: 'trine', symbol: '△', orb: 8 },
    { angle: 180, type: 'opposition', symbol: '☍', orb: 8 },
  ];
  
  for (const aspect of aspects) {
    const orbDiff = Math.abs(diff - aspect.angle);
    if (orbDiff <= aspect.orb) {
      return { type: aspect.type, symbol: aspect.symbol, orb: orbDiff };
    }
  }
  return null;
};

// Get personal palette based on natal chart + transits with actual aspect calculations
export function getPersonalPalette(
  natalPositions: Array<{ name: string; sign: string; degree?: number; minutes?: number }>,
  transitPositions: Array<{ name: string; sign: string; degree?: number }>,
  preferences: { moreNeutral?: boolean; moreBold?: boolean; altPalette?: number } = {}
): {
  palette: string[];
  topTransits: string[];
  transitDetails: TransitDetail[];
  reasoning: string;
} {
  // Get natal Sun/Moon/Asc signs
  const natalSun = natalPositions.find((p) => p.name === "Sun");
  const natalMoon = natalPositions.find((p) => p.name === "Moon");
  const natalAsc = natalPositions.find((p) => p.name === "Ascendant");

  // Base from natal chart
  const sunPalette = natalSun ? SIGN_PALETTES[natalSun.sign] || [] : [];
  const moonPalette = natalMoon ? SIGN_PALETTES[natalMoon.sign] || [] : [];
  const ascPalette = natalAsc ? SIGN_PALETTES[natalAsc.sign] || [] : [];

  let basePalette = [
    ...sunPalette.slice(0, 2),
    ...moonPalette.slice(0, 2),
    ...ascPalette.slice(0, 2),
  ].slice(0, 4);

  // Find transits making actual aspects to natal planets
  const topTransits: string[] = [];
  const transitDetails: TransitDetail[] = [];
  const transitAccents: string[] = [];

  // Check each transit planet against each natal planet
  for (const transit of transitPositions) {
    if (transit.degree === undefined) continue;
    const transitLon = toAbsoluteLongitude(transit.sign, transit.degree);
    
    for (const natal of natalPositions) {
      if (natal.degree === undefined || natal.name === transit.name) continue;
      const natalLon = toAbsoluteLongitude(natal.sign, natal.degree, natal.minutes);
      
      const aspect = calculateAspect(transitLon, natalLon);
      if (aspect) {
        const transitKeyword = PLANET_KEYWORDS[transit.name] || transit.name;
        const natalKeyword = PLANET_KEYWORDS[natal.name] || natal.name;
        
        const aspectDesc = aspect.type === 'conjunction' ? 'joining with' :
                          aspect.type === 'trine' ? 'flowing harmoniously to' :
                          aspect.type === 'sextile' ? 'supporting' :
                          aspect.type === 'square' ? 'challenging' :
                          aspect.type === 'opposition' ? 'opposing' : 'aspecting';
        
        topTransits.push(`${transit.name} ${aspect.symbol} your ${natal.name} (${aspect.orb.toFixed(1)}° orb)`);
        transitDetails.push({
          transitPlanet: transit.name,
          natalPlanet: natal.name,
          transitSign: transit.sign,
          transitDegree: transit.degree,
          natalSign: natal.sign,
          natalDegree: natal.degree,
          aspectType: aspect.type,
          aspectSymbol: aspect.symbol,
          orb: aspect.orb.toFixed(1),
          explanation: `Today's ${transit.name} at ${transit.degree}° ${transit.sign} (${transitKeyword}) is ${aspectDesc} your natal ${natal.name} at ${natal.degree}° ${natal.sign} (${natalKeyword}). This ${aspect.type} creates a ${aspect.orb.toFixed(1)}° orb aspect that energizes themes of ${natalKeyword.split('/')[0]} in your life.`,
          colorInfluence: `Adding ${transit.name} accent colors to your palette.`
        });
        
        const accent = PLANET_ACCENTS[transit.name];
        if (accent) transitAccents.push(accent[0]);
      }
    }
  }

  // Sort by tightest orb (most exact aspects first)
  transitDetails.sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));

  // Add transit accents
  let palette = [...basePalette, ...transitAccents.slice(0, 2)];

  // Alt palette variations
  if (preferences.altPalette && preferences.altPalette > 0) {
    const altIndex = preferences.altPalette % 3;
    if (altIndex === 1) {
      // Use element palette instead
      const sunElement = natalSun ? SIGN_ELEMENTS[natalSun.sign] : 'Earth';
      const elementPalette = ELEMENT_PALETTES[sunElement] || ELEMENT_PALETTES.Earth;
      palette = [...elementPalette.slice(0, 4), ...transitAccents.slice(0, 2)];
    } else if (altIndex === 2) {
      // Use planet accents more prominently
      const moonAccents = PLANET_ACCENTS.Moon || [];
      const venusAccents = PLANET_ACCENTS.Venus || [];
      palette = [
        ...moonAccents,
        ...venusAccents,
        ...transitAccents.slice(0, 2),
      ].slice(0, 6);
    }
  }

  // Preference adjustments
  if (preferences.moreNeutral) {
    palette = palette.map((c) => desaturate(c, 0.12));
    palette.push("#B7B7A4"); // add neutral
  }
  if (preferences.moreBold) {
    palette = palette.map((c) => saturate(c, 0.12));
    if (transitAccents[0]) palette.push(transitAccents[0]);
  }

  // Limit & dedupe
  palette = [...new Set(palette)].slice(0, 6);
  while (palette.length < 6) {
    palette.push(sunPalette[palette.length % sunPalette.length] || "#6B705C");
  }

  const reasoning =
    transitDetails.length > 0
      ? `Based on your natal Sun in ${natalSun?.sign || "?"}, Moon in ${natalMoon?.sign || "?"}, with ${transitDetails.length} active aspect${transitDetails.length > 1 ? 's' : ''} today.`
      : `Based on your natal Sun in ${natalSun?.sign || "?"} and Moon in ${natalMoon?.sign || "?"}. No major aspects today.`;

  return { palette, topTransits: topTransits.slice(0, 4), transitDetails: transitDetails.slice(0, 5), reasoning };
}

// Simple desaturate (hex)
function desaturate(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const gray = (rgb.r + rgb.g + rgb.b) / 3;
  return rgbToHex(
    Math.round(rgb.r + (gray - rgb.r) * amount),
    Math.round(rgb.g + (gray - rgb.g) * amount),
    Math.round(rgb.b + (gray - rgb.b) * amount)
  );
}

// Simple saturate (hex)
function saturate(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const gray = (rgb.r + rgb.g + rgb.b) / 3;
  return rgbToHex(
    Math.round(rgb.r + (rgb.r - gray) * amount),
    Math.round(rgb.g + (rgb.g - gray) * amount),
    Math.round(rgb.b + (rgb.b - gray) * amount)
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  return (
    "#" +
    [r, g, b]
      .map((x) => clamp(x).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Get color name approximation
export function getColorName(hex: string): string {
  const colors: Record<string, string> = {
    "#C1121F": "Crimson",
    "#E85D04": "Flame",
    "#F48C06": "Tangerine",
    "#2D6A4F": "Emerald",
    "#40916C": "Jade",
    "#2D7DD2": "Azure",
    "#97DFFC": "Sky",
    "#0B2545": "Midnight",
    "#134074": "Navy",
    "#D4A017": "Gold",
    "#F2C14E": "Honey",
    "#2F2E2B": "Charcoal",
    "#6B705C": "Sage",
    "#B56576": "Rose",
    "#9A031E": "Burgundy",
    "#355070": "Slate",
    "#6D597A": "Plum",
    "#A8DADC": "Seafoam",
    "#2A9D8F": "Teal",
  };
  return colors[hex] || "Custom";
}
