// ─── Childbirth Indicators in Solar Returns ─────────────────────────
// Source: CosmiTec Research — "Childbirth In Solar Returns"
// Based on analysis of 865 female solar return charts for the year of childbirth.
// Chi-Square values indicate statistical significance (higher = more significant).

export interface ChildbirthIndicator {
  description: string;
  chiSquare: number;
  orb: string;
  category: 'primary' | 'secondary' | 'supporting';
  detectable: boolean; // Whether this can be detected from standard chart data
}

export const CHILDBIRTH_INDICATORS: ChildbirthIndicator[] = [
  // PRIMARY indicators (chi-square >= 30)
  {
    description: 'Moon sextile or trine Mars',
    chiSquare: 64.0,
    orb: '1° (30 at 3°)',
    category: 'primary',
    detectable: true,
  },
  {
    description: 'Ruler of the 5th house is in the 5th house',
    chiSquare: 60.0,
    orb: '',
    category: 'primary',
    detectable: true,
  },
  {
    description: 'Jupiter semi-sextile the Mean North Node',
    chiSquare: 40.0,
    orb: '1°',
    category: 'primary',
    detectable: true,
  },
  {
    description: 'Mercury semi-square Mars',
    chiSquare: 40.0,
    orb: '1°',
    category: 'primary',
    detectable: true,
  },
  {
    description: 'Ceres in a water sign',
    chiSquare: 36.0,
    orb: '',
    category: 'primary',
    detectable: true,
  },

  // SECONDARY indicators (chi-square 20-30)
  {
    description: 'Venus semi-square Uranus (especially waning phase)',
    chiSquare: 24.8,
    orb: '3° (54 at 1°)',
    category: 'secondary',
    detectable: true,
  },
  {
    description: 'Mars opposite or inconjunct Jupiter',
    chiSquare: 23.0,
    orb: '3°',
    category: 'secondary',
    detectable: true,
  },
  {
    description: 'Any direct planet sextile retrograde Jupiter',
    chiSquare: 22.0,
    orb: '3°',
    category: 'secondary',
    detectable: true,
  },
  {
    description: 'Ruler of the 5th house in Aquarius or Sagittarius',
    chiSquare: 22.0,
    orb: '',
    category: 'secondary',
    detectable: true,
  },
  {
    description: 'Moon semi-square the Sun',
    chiSquare: 22.0,
    orb: '3°',
    category: 'secondary',
    detectable: true,
  },

  // SUPPORTING indicators (chi-square 10-20)
  {
    description: 'Pluto in the 1st house',
    chiSquare: 18.0,
    orb: '',
    category: 'supporting',
    detectable: true,
  },
  {
    description: 'Moon trine Mercury (especially waning 240° phase)',
    chiSquare: 18.0,
    orb: '1°',
    category: 'supporting',
    detectable: true,
  },
  {
    description: 'Ascendant in Sagittarius',
    chiSquare: 16.0,
    orb: '',
    category: 'supporting',
    detectable: true,
  },
  {
    description: 'Moon in the 4th house',
    chiSquare: 10.0,
    orb: '',
    category: 'supporting',
    detectable: true,
  },
  {
    description: 'Moon in Taurus or Sagittarius',
    chiSquare: 8.0,
    orb: '',
    category: 'supporting',
    detectable: true,
  },
  {
    description: 'Pluto in an angular house (1, 4, 7, or 10)',
    chiSquare: 8.0,
    orb: '',
    category: 'supporting',
    detectable: true,
  },
  {
    description: 'Mercury or Jupiter conjunct an angle (ASC, IC, DSC, or MC)',
    chiSquare: 8.0,
    orb: '15°',
    category: 'supporting',
    detectable: true,
  },
  {
    description: 'Pluto in the 5th house',
    chiSquare: 5.0,
    orb: '',
    category: 'supporting',
    detectable: true,
  },
];

export const CHILDBIRTH_DISCLAIMER = 'These are statistical correlations from astrological research (CosmiTec, N=865), NOT predictions. The presence of these indicators does not mean childbirth will occur, and their absence does not prevent it. Astrology describes patterns of energy, not deterministic outcomes. Always consult medical professionals for family planning guidance.';

export const CHILDBIRTH_METHODOLOGY = 'This analysis is based on research by CosmiTec examining 865 female solar return charts for the year of childbirth. Chi-Square values indicate statistical significance — higher values represent stronger correlations. The researchers note: "The more data we have, the more reliable our astrological conditions become. Start with the configurations in bold (highest chi-square) and check for further confirmation in progressed charts."';
