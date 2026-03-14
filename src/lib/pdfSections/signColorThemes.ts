/**
 * Zodiac sign-specific color themes for PDF export — v3 Design System
 * Each sign gets a unique accent palette that tints the entire report.
 * Keyed to NATAL SUN SIGN (not SR, not Rising).
 */

type Color = [number, number, number];

export interface SignColorTheme {
  /** Dark indigo/deep — cover strip, pull quote bg, headings */
  deep: Color;
  /** Section accents, SR values, card bars */
  purple: Color;
  /** Section numbers, accent rules, card labels */
  gold: Color;
  /** Secondary labels, SR sign values */
  lilac: Color;
  /** Activation cards, pressure points, cautions */
  rust: Color;
  /** Page background */
  cream: Color;
  /** Cake image area background */
  warm: Color;
  /** Card borders */
  border: Color;
  /** Horizontal rules */
  rule: Color;
  /** Birth details, metadata */
  dimText: Color;
  /** Card body text */
  bodyText: Color;
  /** Headlines, card values */
  ink: Color;

  // Legacy aliases for backward compat with existing pdfContext consumers
  softGold: Color;
  deepBrown: Color;
  warmBorder: Color;
  creamBg: Color;
  accentGreen: Color;
  accentRust: Color;
  softBlue: Color;
  darkText: Color;
}

/** Build a full theme from the core 5 accent colors + neutrals */
function theme(
  deep: Color, purple: Color, gold: Color, lilac: Color, rust: Color,
  cream: Color, warm: Color, border: Color, rule: Color,
  dimText: Color, bodyText: Color, ink: Color,
): SignColorTheme {
  return {
    deep, purple, gold, lilac, rust,
    cream, warm, border, rule, dimText, bodyText, ink,
    // Legacy aliases
    softGold: warm,
    deepBrown: deep,
    warmBorder: border,
    creamBg: cream,
    accentGreen: purple,
    accentRust: rust,
    softBlue: [230, 240, 250],
    darkText: ink,
  };
}

export const signColorThemes: Record<string, SignColorTheme> = {
  Aries: theme(
    [100, 20, 20], [180, 60, 40], [200, 150, 60], [200, 120, 100],
    [196, 98, 45], [253, 250, 245], [245, 240, 232], [224, 216, 204],
    [216, 210, 200], [160, 144, 128], [92, 84, 80], [100, 20, 20],
  ),
  Taurus: theme(
    [30, 60, 30], [60, 120, 60], [180, 160, 60], [120, 160, 120],
    [160, 100, 50], [253, 252, 245], [240, 245, 232], [210, 220, 200],
    [216, 210, 200], [160, 144, 128], [92, 84, 80], [30, 60, 30],
  ),
  Gemini: theme(
    [40, 40, 70], [120, 120, 50], [200, 180, 60], [160, 160, 100],
    [196, 130, 45], [255, 252, 240], [245, 242, 228], [220, 214, 190],
    [216, 210, 200], [160, 144, 128], [92, 84, 80], [40, 40, 70],
  ),
  Cancer: theme(
    [20, 40, 70], [80, 100, 150], [180, 160, 80], [140, 155, 180],
    [180, 100, 70], [245, 248, 255], [238, 242, 250], [200, 210, 224],
    [210, 216, 224], [140, 148, 160], [80, 84, 92], [20, 40, 70],
  ),
  Leo: theme(
    [80, 50, 10], [180, 120, 30], [210, 170, 50], [200, 170, 100],
    [196, 98, 45], [255, 252, 240], [248, 242, 225], [225, 210, 170],
    [220, 210, 190], [160, 144, 128], [92, 84, 80], [80, 50, 10],
  ),
  Virgo: theme(
    [35, 50, 35], [90, 110, 80], [160, 150, 80], [130, 140, 120],
    [150, 110, 70], [250, 252, 248], [242, 245, 238], [210, 216, 206],
    [216, 214, 206], [150, 148, 140], [88, 84, 80], [35, 50, 35],
  ),
  Libra: theme(
    [60, 30, 50], [140, 90, 120], [190, 155, 80], [170, 140, 160],
    [170, 90, 90], [252, 250, 252], [245, 240, 245], [220, 210, 218],
    [216, 210, 214], [155, 144, 150], [90, 84, 88], [60, 30, 50],
  ),
  Scorpio: theme(
    [50, 15, 30], [130, 50, 70], [180, 140, 60], [140, 90, 110],
    [160, 50, 50], [252, 248, 250], [245, 238, 242], [218, 200, 210],
    [214, 206, 212], [155, 140, 148], [90, 80, 86], [50, 15, 30],
  ),
  Sagittarius: theme(
    [60, 35, 15], [160, 100, 50], [200, 160, 60], [180, 140, 100],
    [180, 80, 30], [255, 252, 245], [248, 242, 232], [224, 210, 190],
    [220, 210, 196], [160, 144, 128], [92, 84, 80], [60, 35, 15],
  ),
  Capricorn: theme(
    [30, 30, 40], [100, 100, 110], [160, 150, 90], [130, 130, 140],
    [140, 90, 70], [250, 250, 252], [242, 242, 248], [210, 210, 218],
    [214, 214, 220], [148, 148, 155], [86, 86, 92], [30, 30, 40],
  ),
  Aquarius: theme(
    [15, 40, 70], [60, 120, 180], [180, 160, 80], [100, 150, 190],
    [140, 90, 60], [245, 250, 255], [238, 244, 252], [200, 214, 228],
    [206, 216, 226], [140, 150, 160], [80, 86, 94], [15, 40, 70],
  ),
  Pisces: theme(
    [28, 20, 51], [107, 79, 160], [201, 168, 76], [155, 142, 196],
    [196, 98, 45], [253, 250, 245], [245, 240, 232], [224, 216, 204],
    [216, 210, 200], [160, 144, 128], [92, 84, 80], [28, 20, 51],
  ),
};
