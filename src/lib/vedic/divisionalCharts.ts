/**
 * Divisional (varga) charts derived from sidereal longitudes.
 *
 * Supported: D2 Hora (wealth), D7 Saptamsha (children and lineage),
 * D9 Navamsa (soul, marriage, durability), D10 Dashamsha (career),
 * D12 Dwadashamsha (parents, ancestry, lineage and inherited family patterns).
 *
 * All divisions use classical rules. Nothing here is estimated.
 */

import { VedicPlanet } from './nakshatras';
import { signFromIndex, vedicDignity, VedicDignity, wholeSignHouse } from './vedicDignity';
import { VedicChart } from './siderealChart';

export type VargaKey =
  | 'D2' | 'D3' | 'D4' | 'D6' | 'D7' | 'D9' | 'D10' | 'D12'
  | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';

/** The seven-chart set most Jyotishis read first. */
export const CORE_VARGAS: VargaKey[] = ['D9', 'D10', 'D12', 'D2', 'D7', 'D3', 'D4'];

/** The full shodashavarga set, sixteen charts. */
export const ALL_VARGAS: VargaKey[] = [
  'D2', 'D3', 'D4', 'D6', 'D7', 'D9', 'D10', 'D12',
  'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60',
];

export const VARGA_LABELS: Record<VargaKey, { name: string; reads: string; plain: string }> = {
  D2: {
    name: 'Hora (D2)',
    reads: 'resources, wealth patterns and material support',
    plain: 'A magnifying chart for resources and wealth patterns.',
  },
  D3: {
    name: 'Drekkana (D3)',
    reads: 'siblings, peers, courage and initiative',
    plain: 'A magnifying chart for siblings, peers and the nerve to act.',
  },
  D4: {
    name: 'Chaturthamsha (D4)',
    reads: 'home, property, land and inner stability',
    plain: 'A magnifying chart for home, property and feeling settled.',
  },
  D6: {
    name: 'Shashtamsha (D6)',
    reads: 'health strain, routine, obligation and conflict handling',
    plain: 'A magnifying chart for health habits, routine and the load you carry. Never read as a diagnosis.',
  },
  D7: {
    name: 'Saptamsha (D7)',
    reads: 'children, lineage and what gets passed on',
    plain: 'A magnifying chart for children and what continues after you.',
  },
  D9: {
    name: 'Navamsa (D9)',
    reads: 'partnership, dharma, maturation and what holds up over time',
    plain: 'A magnifying chart for partnership, maturation and what develops over time. It is not simply a marriage chart and not a soul chart.',
  },
  D10: {
    name: 'Dashamsha (D10)',
    reads: 'career, responsibility, public role and professional development',
    plain: 'A magnifying chart for work and public role.',
  },
  D12: {
    name: 'Dwadashamsha (D12)',
    reads: 'parents, ancestry, lineage and inherited family patterns',
    plain: 'A magnifying chart for parents, ancestry and inherited family patterns.',
  },
  D16: {
    name: 'Shodashamsha (D16)',
    reads: 'vehicles, comforts, pleasures and general contentment',
    plain: 'A magnifying chart for comfort, possessions and what makes life pleasant.',
  },
  D20: {
    name: 'Vimshamsha (D20)',
    reads: 'spiritual practice, devotion and inner discipline',
    plain: 'A magnifying chart for practice, devotion and inner life.',
  },
  D24: {
    name: 'Chaturvimshamsha (D24)',
    reads: 'learning, study, skill acquisition and formal education',
    plain: 'A magnifying chart for how you learn and what you can be trained in.',
  },
  D27: {
    name: 'Bhamsha (D27)',
    reads: 'physical and nervous strength, stamina and resilience',
    plain: 'A magnifying chart for stamina and how much load your system takes.',
  },
  D30: {
    name: 'Trimshamsha (D30)',
    reads: 'difficulty, vulnerability and where trouble tends to concentrate',
    plain: 'A magnifying chart for weak spots and recurring trouble. Used to locate strain, never to predict disaster.',
  },
  D40: {
    name: 'Khavedamsha (D40)',
    reads: 'inherited patterns through the maternal line',
    plain: 'A magnifying chart for what came down the mother\'s side.',
  },
  D45: {
    name: 'Akshavedamsha (D45)',
    reads: 'inherited patterns through the paternal line, character and conduct',
    plain: 'A magnifying chart for what came down the father\'s side, and general conduct.',
  },
  D60: {
    name: 'Shashtiamsha (D60)',
    reads: 'the fine-grained summary of everything the chart carries',
    plain: 'The most detailed division. Classical texts weigh it heavily, and it is also the most sensitive to birth-time error, so it is only shown when the birth time is exact.',
  },
};


/** Shown on every divisional chart so nobody reads a varga as a second personality. */
export const VARGA_NOTE =
  'This chart is not interpreted as a completely separate personality chart. It is used to examine a particular area of the main birth chart in greater detail.';

export const D1_LABEL = {
  name: 'Rashi (D1)',
  reads: 'the overall life pattern',
  plain: 'The main birth chart, the overall life pattern.',
};

const isOdd = (signIdx: number) => signIdx % 2 === 0; // Aries is index 0 and is odd in Jyotish
const MOVABLE = [0, 3, 6, 9];   // Aries, Cancer, Libra, Capricorn
const FIXED = [1, 4, 7, 10];    // Taurus, Leo, Scorpio, Aquarius

/** Divisional sign index (0-11) for one body in one varga. */
export function vargaSignIndex(longitude: number, varga: VargaKey): number {
  const lon = ((longitude % 360) + 360) % 360;
  const signIdx = Math.floor(lon / 30);
  const deg = lon % 30;

  switch (varga) {
    case 'D2': {
      // Odd signs: first half Leo, second half Cancer. Even signs reversed.
      const firstHalf = deg < 15;
      if (isOdd(signIdx)) return firstHalf ? 4 : 3;
      return firstHalf ? 3 : 4;
    }
    case 'D7': {
      const part = Math.floor(deg / (30 / 7));
      const start = isOdd(signIdx) ? signIdx : signIdx + 6;
      return ((start + part) % 12 + 12) % 12;
    }
    case 'D9': {
      // Continuous 3°20' division. Movable signs start from themselves, fixed
      // from the 9th, dual from the 5th, which the continuous form reproduces.
      return Math.floor(lon / (10 / 3)) % 12;
    }
    case 'D10': {
      const part = Math.floor(deg / 3);
      const start = isOdd(signIdx) ? signIdx : signIdx + 8;
      return ((start + part) % 12 + 12) % 12;
    }
    case 'D12': {
      const part = Math.floor(deg / 2.5);
      return ((signIdx + part) % 12 + 12) % 12;
    }
    case 'D3': {
      // Three parts of 10 degrees: the sign itself, the 5th, the 9th.
      const part = Math.floor(deg / 10);
      return (signIdx + part * 4) % 12;
    }
    case 'D4': {
      // Four parts of 7 degrees 30: the sign, the 4th, the 7th, the 10th.
      const part = Math.floor(deg / 7.5);
      return (signIdx + part * 3) % 12;
    }
    case 'D6': {
      // Six parts of 5 degrees: odd signs count from Aries, even from Libra.
      const part = Math.floor(deg / 5);
      return ((isOdd(signIdx) ? 0 : 6) + part) % 12;
    }
    case 'D16': {
      // Movable from Aries, fixed from Leo, dual from Sagittarius.
      const part = Math.floor(deg / (30 / 16));
      const start = MOVABLE.includes(signIdx) ? 0 : FIXED.includes(signIdx) ? 4 : 8;
      return (start + part) % 12;
    }
    case 'D20': {
      // Movable from Aries, fixed from Sagittarius, dual from Leo.
      const part = Math.floor(deg / 1.5);
      const start = MOVABLE.includes(signIdx) ? 0 : FIXED.includes(signIdx) ? 8 : 4;
      return (start + part) % 12;
    }
    case 'D24': {
      // Odd signs count from Leo, even signs from Cancer.
      const part = Math.floor(deg / 1.25);
      return ((isOdd(signIdx) ? 4 : 3) + part) % 12;
    }
    case 'D27': {
      // Fire from Aries, earth from Cancer, air from Libra, water from Capricorn.
      const part = Math.floor(deg / (30 / 27));
      const start = [0, 3, 6, 9][signIdx % 4];
      return (start + part) % 12;
    }
    case 'D30': {
      // Trimshamsha: unequal parts ruled by the five visible non-luminaries.
      const odd: [number, number][] = [[5, 0], [10, 10], [18, 8], [25, 2], [30, 6]];
      const even: [number, number][] = [[5, 1], [12, 5], [20, 11], [25, 9], [30, 7]];
      const table = isOdd(signIdx) ? odd : even;
      for (const [limit, target] of table) if (deg < limit) return target;
      return table[table.length - 1][1];
    }
    case 'D40': {
      // Odd signs count from Aries, even signs from Libra.
      const part = Math.floor(deg / 0.75);
      return ((isOdd(signIdx) ? 0 : 6) + part) % 12;
    }
    case 'D45': {
      // Movable from Aries, fixed from Leo, dual from Sagittarius.
      const part = Math.floor(deg / (30 / 45));
      const start = MOVABLE.includes(signIdx) ? 0 : FIXED.includes(signIdx) ? 4 : 8;
      return (start + part) % 12;
    }
    case 'D60': {
      // Sixty parts of half a degree, counted from the sign itself.
      const part = Math.floor(deg / 0.5);
      return (signIdx + part) % 12;
    }
  }
}


export interface VargaPlacement {
  name: VedicPlanet;
  sign: string;
  house: number | null;
  dignity: VedicDignity;
}

export interface VargaChart {
  key: VargaKey;
  label: string;
  reads: string;
  /** Beginner-facing one-liner for what this magnifying chart is for. */
  plain: string;
  lagnaSign: string | null;
  placements: VargaPlacement[];
  byName: Partial<Record<VedicPlanet, VargaPlacement>>;
}

export function buildVarga(chart: VedicChart, key: VargaKey): VargaChart {
  const lagnaLon = chart.lagnaSign !== null && chart.lagnaDegree !== null
    ? ((VARGA_SIGN_BASE(chart.lagnaSign) * 30) + chart.lagnaDegree)
    : null;
  const lagnaSign = lagnaLon === null ? null : signFromIndex(vargaSignIndex(lagnaLon, key));

  const placements: VargaPlacement[] = chart.bodies.map(b => {
    const sign = signFromIndex(vargaSignIndex(b.longitude, key));
    return {
      name: b.name,
      sign,
      house: lagnaSign ? wholeSignHouse(sign, lagnaSign) : null,
      dignity: vedicDignity(b.name, sign),
    };
  });

  const byName: Partial<Record<VedicPlanet, VargaPlacement>> = {};
  placements.forEach(p => { byName[p.name] = p; });

  return {
    key,
    label: VARGA_LABELS[key].name,
    reads: VARGA_LABELS[key].reads,
    plain: VARGA_LABELS[key].plain,
    lagnaSign,
    placements,
    byName,
  };
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function VARGA_SIGN_BASE(sign: string): number {
  const i = SIGNS.indexOf(sign);
  return i === -1 ? 0 : i;
}

/**
 * Vargottama: same sign in D1 and D9. Classically the strongest single mark of
 * durability, so it is worth surfacing wherever it happens.
 */
export function isVargottama(chart: VedicChart, navamsa: VargaChart, name: VedicPlanet): boolean {
  const d1 = chart.byName[name];
  const d9 = navamsa.byName[name];
  return !!d1 && !!d9 && d1.sign === d9.sign;
}

export { MOVABLE, FIXED };
