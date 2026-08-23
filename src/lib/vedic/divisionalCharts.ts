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

export type VargaKey = 'D2' | 'D7' | 'D9' | 'D10' | 'D12';

export const VARGA_LABELS: Record<VargaKey, { name: string; reads: string; plain: string }> = {
  D2: {
    name: 'Hora (D2)',
    reads: 'resources, wealth patterns and material support',
    plain: 'A magnifying chart for resources and wealth patterns.',
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
