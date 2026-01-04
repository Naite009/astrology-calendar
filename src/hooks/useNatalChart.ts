import { useState, useEffect } from 'react';

export interface NatalPlanetPosition {
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
  isRetrograde?: boolean;
}

// House cusp position (sign + degree)
export interface HouseCusp {
  sign: string;
  degree: number;
  minutes: number;
}

export interface NatalChart {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezoneOffset?: number; // hours offset from UTC (e.g., -5 for EST)
  planets: {
    Sun?: NatalPlanetPosition;
    Moon?: NatalPlanetPosition;
    Ascendant?: NatalPlanetPosition;
    Mercury?: NatalPlanetPosition;
    Venus?: NatalPlanetPosition;
    Mars?: NatalPlanetPosition;
    Jupiter?: NatalPlanetPosition;
    Saturn?: NatalPlanetPosition;
    Uranus?: NatalPlanetPosition;
    Neptune?: NatalPlanetPosition;
    Pluto?: NatalPlanetPosition;
    NorthNode?: NatalPlanetPosition;
    SouthNode?: NatalPlanetPosition;
    Chiron?: NatalPlanetPosition;
    Lilith?: NatalPlanetPosition;
    Ceres?: NatalPlanetPosition;
    Pallas?: NatalPlanetPosition;
    Juno?: NatalPlanetPosition;
    Vesta?: NatalPlanetPosition;
    PartOfFortune?: NatalPlanetPosition;
    Vertex?: NatalPlanetPosition;
    Eris?: NatalPlanetPosition;
    Sedna?: NatalPlanetPosition;
    Makemake?: NatalPlanetPosition;
    Haumea?: NatalPlanetPosition;
    Quaoar?: NatalPlanetPosition;
    Orcus?: NatalPlanetPosition;
    Ixion?: NatalPlanetPosition;
    Varuna?: NatalPlanetPosition;
  };
  // 12 house cusps (manual entry from astro.com)
  houseCusps?: {
    house1?: HouseCusp;
    house2?: HouseCusp;
    house3?: HouseCusp;
    house4?: HouseCusp;
    house5?: HouseCusp;
    house6?: HouseCusp;
    house7?: HouseCusp;
    house8?: HouseCusp;
    house9?: HouseCusp;
    house10?: HouseCusp;
    house11?: HouseCusp;
    house12?: HouseCusp;
  };
  // Signs that are intercepted (contained entirely within a house)
  interceptedSigns?: string[];
}

// Helper to safely parse JSON from localStorage
const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage:`, e);
  }
  return fallback;
};

// Read a primary key, but fall back to a backup key if the primary is missing/corrupt.
// If backup is used, we also repair the primary key.
const readWithBackup = <T,>(key: string, fallback: T): T => {
  const backupKey = `${key}__backup`;

  const primary = safeParseJSON<T>(key, fallback);

  // If primary looks empty, try backup (covers missing key, corrupted JSON, or accidental overwrite)
  const shouldTryBackup =
    primary === null ||
    (Array.isArray(primary) && primary.length === 0);

  if (!shouldTryBackup) return primary;

  const backup = safeParseJSON<T>(backupKey, fallback);

  // Repair primary if backup is better
  const backupIsBetter =
    backup !== null && (!Array.isArray(backup) || backup.length > 0);

  if (backupIsBetter) {
    try {
      localStorage.setItem(key, JSON.stringify(backup));
    } catch (e) {
      console.warn(`Failed to repair ${key} from backup:`, e);
    }
    return backup;
  }

  return primary;
};

export const useNatalChart = () => {
  // Initialize state directly from localStorage to avoid flash of empty state
  // Also keep a backup key to protect against rare corruption/overwrites.
  const [userNatalChart, setUserNatalChart] = useState<NatalChart | null>(() => {
    return readWithBackup<NatalChart | null>('userNatalChart', null);
  });
  const [savedCharts, setSavedCharts] = useState<NatalChart[]>(() => {
    return readWithBackup<NatalChart[]>('savedCharts', []);
  });
  const [selectedChartForTiming, setSelectedChartForTiming] = useState<string>(() => {
    return localStorage.getItem('selectedChartForTiming') || 'user';
  });

  const saveUserNatalChart = (chart: NatalChart) => {
    // Prevent saving empty/invalid chart data
    if (!chart || !chart.name || chart.name.trim() === '') {
      console.warn('Attempted to save invalid chart data, ignoring');
      return;
    }

    try {
      localStorage.setItem('userNatalChart', JSON.stringify(chart));
      localStorage.setItem('userNatalChart__backup', JSON.stringify(chart));
    } catch (e) {
      console.warn('Failed to persist user natal chart to local storage:', e);
    }

    setUserNatalChart(chart);
  };

  const addChart = (chart: NatalChart) => {
    const newChart = { ...chart, id: Date.now().toString() };
    const updated = [...savedCharts, newChart];

    try {
      localStorage.setItem('savedCharts', JSON.stringify(updated));
      localStorage.setItem('savedCharts__backup', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist saved charts to local storage:', e);
    }

    setSavedCharts(updated);
    return newChart;
  };

  const updateChart = (id: string, chart: Partial<NatalChart>) => {
    const updated = savedCharts.map((c) => (c.id === id ? { ...c, ...chart } : c));

    try {
      localStorage.setItem('savedCharts', JSON.stringify(updated));
      localStorage.setItem('savedCharts__backup', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist saved charts to local storage:', e);
    }

    setSavedCharts(updated);
  };

  const deleteChart = (id: string) => {
    const updated = savedCharts.filter((c) => c.id !== id);

    try {
      localStorage.setItem('savedCharts', JSON.stringify(updated));
      localStorage.setItem('savedCharts__backup', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist saved charts to local storage:', e);
    }

    setSavedCharts(updated);
  };

  const selectChartForTiming = (id: string) => {
    localStorage.setItem('selectedChartForTiming', id);
    setSelectedChartForTiming(id);
  };

  return {
    userNatalChart,
    savedCharts,
    selectedChartForTiming,
    saveUserNatalChart,
    addChart,
    updateChart,
    deleteChart,
    selectChartForTiming,
    setSavedCharts,
  };
};
