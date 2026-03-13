/**
 * Zodiac sign-specific color themes for PDF export
 * Each sign gets a unique accent palette that tints the entire report
 */

type Color = [number, number, number];

export interface SignColorTheme {
  gold: Color;        // Primary accent (replaces default gold)
  softGold: Color;    // Light background tint
  deepBrown: Color;   // Heading accent
  warmBorder: Color;  // Card borders
  creamBg: Color;     // Page background tint
  accentGreen: Color; // "How it feels" labels
  accentRust: Color;  // "Watch for" labels
  softBlue: Color;    // Secondary boxes
}

export const signColorThemes: Record<string, SignColorTheme> = {
  Aries: {
    gold: [180, 60, 40],       // Warm crimson-red
    softGold: [255, 240, 235],
    deepBrown: [120, 40, 30],
    warmBorder: [220, 180, 170],
    creamBg: [255, 248, 245],
    accentGreen: [140, 80, 30],
    accentRust: [180, 50, 30],
    softBlue: [255, 235, 230],
  },
  Taurus: {
    gold: [90, 140, 70],       // Forest green
    softGold: [235, 248, 230],
    deepBrown: [60, 90, 45],
    warmBorder: [180, 210, 170],
    creamBg: [248, 252, 245],
    accentGreen: [70, 120, 55],
    accentRust: [150, 100, 50],
    softBlue: [230, 245, 225],
  },
  Gemini: {
    gold: [180, 160, 50],      // Bright golden yellow
    softGold: [255, 250, 225],
    deepBrown: [120, 100, 30],
    warmBorder: [220, 210, 170],
    creamBg: [255, 252, 240],
    accentGreen: [140, 130, 40],
    accentRust: [180, 120, 40],
    softBlue: [250, 248, 220],
  },
  Cancer: {
    gold: [140, 160, 190],     // Silver-blue moonlight
    softGold: [235, 242, 252],
    deepBrown: [70, 85, 110],
    warmBorder: [190, 200, 220],
    creamBg: [245, 248, 255],
    accentGreen: [80, 120, 150],
    accentRust: [150, 100, 80],
    softBlue: [230, 240, 255],
  },
  Leo: {
    gold: [200, 150, 40],      // Rich amber-gold
    softGold: [255, 245, 220],
    deepBrown: [140, 90, 20],
    warmBorder: [225, 200, 150],
    creamBg: [255, 250, 235],
    accentGreen: [170, 130, 30],
    accentRust: [190, 100, 30],
    softBlue: [255, 240, 210],
  },
  Virgo: {
    gold: [130, 140, 110],     // Sage green
    softGold: [240, 245, 235],
    deepBrown: [80, 90, 65],
    warmBorder: [200, 210, 190],
    creamBg: [248, 250, 245],
    accentGreen: [90, 120, 80],
    accentRust: [150, 110, 70],
    softBlue: [235, 242, 230],
  },
  Libra: {
    gold: [180, 140, 160],     // Dusty rose
    softGold: [250, 240, 245],
    deepBrown: [120, 80, 100],
    warmBorder: [220, 200, 210],
    creamBg: [252, 248, 250],
    accentGreen: [140, 100, 120],
    accentRust: [170, 90, 90],
    softBlue: [248, 238, 245],
  },
  Scorpio: {
    gold: [130, 50, 70],       // Deep burgundy
    softGold: [245, 235, 238],
    deepBrown: [90, 35, 50],
    warmBorder: [210, 180, 190],
    creamBg: [250, 245, 248],
    accentGreen: [100, 60, 80],
    accentRust: [160, 50, 50],
    softBlue: [242, 232, 238],
  },
  Sagittarius: {
    gold: [160, 100, 50],      // Warm burnt orange
    softGold: [252, 242, 228],
    deepBrown: [110, 65, 30],
    warmBorder: [220, 195, 165],
    creamBg: [255, 250, 242],
    accentGreen: [140, 90, 40],
    accentRust: [180, 80, 30],
    softBlue: [250, 240, 225],
  },
  Capricorn: {
    gold: [100, 100, 110],     // Cool charcoal-silver
    softGold: [240, 240, 245],
    deepBrown: [60, 60, 70],
    warmBorder: [200, 200, 210],
    creamBg: [248, 248, 252],
    accentGreen: [80, 90, 100],
    accentRust: [140, 90, 70],
    softBlue: [235, 238, 245],
  },
  Aquarius: {
    gold: [60, 120, 180],      // Electric blue
    softGold: [230, 242, 255],
    deepBrown: [40, 80, 130],
    warmBorder: [180, 200, 225],
    creamBg: [242, 248, 255],
    accentGreen: [50, 110, 160],
    accentRust: [140, 90, 60],
    softBlue: [225, 240, 255],
  },
  Pisces: {
    gold: [120, 100, 170],     // Soft lavender-purple
    softGold: [240, 235, 252],
    deepBrown: [80, 65, 120],
    warmBorder: [200, 195, 220],
    creamBg: [248, 245, 255],
    accentGreen: [100, 85, 150],
    accentRust: [150, 90, 100],
    softBlue: [238, 232, 252],
  },
};
