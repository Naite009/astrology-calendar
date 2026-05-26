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

// Progressed position (simpler - no seconds, no retrograde needed typically)
export interface ProgressedPosition {
  sign: string;
  degree: number;
  minutes: number;
}

// Progressed chart data extracted from chart images
export interface ProgressedChart {
  // Progressed planets
  Sun?: ProgressedPosition;
  Moon?: ProgressedPosition;
  Mercury?: ProgressedPosition;
  Venus?: ProgressedPosition;
  Mars?: ProgressedPosition;
  Jupiter?: ProgressedPosition;
  Saturn?: ProgressedPosition;
  Uranus?: ProgressedPosition;
  Neptune?: ProgressedPosition;
  Pluto?: ProgressedPosition;
  // Progressed angles
  AC?: ProgressedPosition; // AC pr - Progressed Ascendant
  MC?: ProgressedPosition; // MC pr - Progressed Midheaven
}

// Transit positions at time of chart creation
export interface TransitChart {
  Sun?: ProgressedPosition;
  Moon?: ProgressedPosition;
  Mercury?: ProgressedPosition;
  Venus?: ProgressedPosition;
  Mars?: ProgressedPosition;
  Jupiter?: ProgressedPosition;
  Saturn?: ProgressedPosition;
  Uranus?: ProgressedPosition;
  Neptune?: ProgressedPosition;
  Pluto?: ProgressedPosition;
  NorthNode?: ProgressedPosition;
  Chiron?: ProgressedPosition;
}

// Optional pronoun set for a profile. When present, the Portrait composer
// will use these instead of the name-safe singular fallback.
export interface ProfilePronouns {
  subject: string;     // she / he / they
  object: string;      // her / him / them
  possessive: string;  // her / his / their
  reflexive?: string;  // herself / himself / themself
}

export interface NatalChart {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezoneOffset?: number; // hours offset from UTC (e.g., -5 for EST)
  chartImageBase64?: string; // Original uploaded chart image
  // Optional pronouns for the person this chart describes. When omitted,
  // downstream copy falls back to name-safe singular phrasing.
  pronouns?: ProfilePronouns;
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
    Psyche?: NatalPlanetPosition;
    Eros?: NatalPlanetPosition;
    Amor?: NatalPlanetPosition;
    Hygiea?: NatalPlanetPosition;
    Nessus?: NatalPlanetPosition;
    Pholus?: NatalPlanetPosition;
    Chariklo?: NatalPlanetPosition;
    Gonggong?: NatalPlanetPosition;
    Salacia?: NatalPlanetPosition;
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
  // Progressions extracted from chart image
  progressions?: ProgressedChart;
  // Transits at time of chart creation (extracted from chart image)
  transits?: TransitChart;
  // Date the progressions/transits were calculated for (if visible on chart)
  progressionDate?: string;
}

// Versioned backup keys
const BACKUP_VERSIONS = ['__backup_v1', '__backup_v2', '__backup_v3'];
const SAVE_TIMESTAMP_SUFFIX = '__lastSaved';

// Helper to safely parse JSON from localStorage
const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item) as T;
      return parsed;
    }
  } catch (e) {
    console.error(`[NatalChart] Failed to parse ${key} from localStorage:`, e);
  }
  return fallback;
};

// Normalize Ascendant from houseCusps.house1 (source of truth).
// Fixes Asc/Desc sign-flip bugs where OCR or imports stored the Descendant
// in planets.Ascendant. house1 is always the true Ascendant.
const normalizeAscendantFromHouse1 = <T extends NatalChart | null>(chart: T): T => {
  if (!chart || !chart.planets) return chart;
  const h1 = chart.houseCusps?.house1;
  if (!h1?.sign) return chart;
  const asc = chart.planets.Ascendant;
  if (asc && asc.sign === h1.sign) return chart;
  const corrected: NatalPlanetPosition = {
    sign: h1.sign,
    degree: h1.degree ?? 0,
    minutes: h1.minutes ?? 0,
    seconds: (asc as any)?.seconds ?? 0,
  };
  if (asc?.sign && asc.sign !== h1.sign) {
    console.warn(`[NatalChart] Corrected Ascendant for "${chart.name}": planets.Ascendant was "${asc.sign}" but houseCusps.house1 is "${h1.sign}". Using house1.`);
  }
  return { ...chart, planets: { ...chart.planets, Ascendant: corrected } } as T;
};

// Validate chart data is not corrupt
const isValidChart = (chart: NatalChart | null): boolean => {
  if (!chart) return false;
  if (!chart.name || chart.name.trim() === '') return false;
  if (!chart.planets) return false;
  return true;
};

// Validate chart array is not corrupt
const isValidChartArray = (charts: NatalChart[] | null): boolean => {
  if (!Array.isArray(charts)) return false;
  return true; // Empty arrays are valid, just not "better" than backups
};

// Get the best available data from primary and multiple backup versions
const readWithRollingBackups = <T,>(
  key: string, 
  fallback: T,
  validator: (data: T | null) => boolean
): T => {
  // Try primary first
  const primary = safeParseJSON<T>(key, fallback);
  if (validator(primary)) {
    console.log(`[NatalChart] Primary ${key} is valid`);
    return primary;
  }

  // Try each backup version
  for (const suffix of BACKUP_VERSIONS) {
    const backup = safeParseJSON<T>(`${key}${suffix}`, fallback);
    if (validator(backup)) {
      console.log(`[NatalChart] Restored ${key} from ${suffix}`);
      // Repair primary from valid backup
      try {
        localStorage.setItem(key, JSON.stringify(backup));
      } catch (e) {
        console.warn(`[NatalChart] Failed to repair ${key}:`, e);
      }
      return backup;
    }
  }

  // Also try legacy backup key
  const legacyBackup = safeParseJSON<T>(`${key}__backup`, fallback);
  if (validator(legacyBackup)) {
    console.log(`[NatalChart] Restored ${key} from legacy backup`);
    try {
      localStorage.setItem(key, JSON.stringify(legacyBackup));
    } catch (e) {
      console.warn(`[NatalChart] Failed to repair ${key}:`, e);
    }
    return legacyBackup;
  }

  console.log(`[NatalChart] No valid data found for ${key}, using fallback`);
  return fallback;
};

// Save with rolling backups (keeps last 3 versions)
const saveWithRollingBackups = (key: string, data: unknown): void => {
  try {
    const serialized = JSON.stringify(data);
    
    // Check if we have space — if data is large, skip backups to avoid quota issues
    const dataSize = serialized.length;
    const skipBackups = dataSize > 500_000; // >500KB, skip backup rotation
    
    if (!skipBackups) {
      try {
        // Rotate backups: v3 <- v2 <- v1 <- current
        const v2 = localStorage.getItem(`${key}${BACKUP_VERSIONS[1]}`);
        if (v2) localStorage.setItem(`${key}${BACKUP_VERSIONS[2]}`, v2);
        
        const v1 = localStorage.getItem(`${key}${BACKUP_VERSIONS[0]}`);
        if (v1) localStorage.setItem(`${key}${BACKUP_VERSIONS[1]}`, v1);
        
        const current = localStorage.getItem(key);
        if (current) localStorage.setItem(`${key}${BACKUP_VERSIONS[0]}`, current);
      } catch (backupErr) {
        // Backup rotation failed (quota) — clean up old backups to make room
        console.warn(`[NatalChart] Backup rotation failed, clearing old backups for ${key}`);
        for (const suffix of BACKUP_VERSIONS) {
          try { localStorage.removeItem(`${key}${suffix}`); } catch { /* ignore */ }
        }
        try { localStorage.removeItem(`${key}__backup`); } catch { /* ignore */ }
      }
    }
    
    // Save new primary
    localStorage.setItem(key, serialized);
    
    // Update timestamp
    localStorage.setItem(`${key}${SAVE_TIMESTAMP_SUFFIX}`, new Date().toISOString());
    
    console.log(`[NatalChart] Saved ${key}${skipBackups ? ' (backups skipped, data too large)' : ' with rolling backups'}`);
  } catch (e) {
    // Last resort: clear all backups and try again
    console.error(`[NatalChart] Failed to save ${key}, clearing backups:`, e);
    for (const suffix of BACKUP_VERSIONS) {
      try { localStorage.removeItem(`${key}${suffix}`); } catch { /* ignore */ }
    }
    try { localStorage.removeItem(`${key}__backup`); } catch { /* ignore */ }
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[NatalChart] Saved ${key} after clearing backups`);
    } catch (e2) {
      console.error(`[NatalChart] Still cannot save ${key}:`, e2);
    }
  }
};

// Legacy backup read for migration
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

const readSavedChartsWithRecovery = (): NatalChart[] => {
  const primary = safeParseJSON<NatalChart[]>('savedCharts', []);
  if (Array.isArray(primary) && primary.length > 0) return primary;

  const backupKeys = BACKUP_VERSIONS.map((suffix) => `savedCharts${suffix}`).concat('savedCharts__backup');
  for (const key of backupKeys) {
    const backup = safeParseJSON<NatalChart[]>(key, []);
    if (Array.isArray(backup) && backup.length > 0) {
      try {
        localStorage.setItem('savedCharts', JSON.stringify(backup));
      } catch (e) {
        console.warn('[NatalChart] Failed to restore savedCharts from backup:', e);
      }
      return backup;
    }
  }

  return [];
};

// ── Pronoun auto-seed by first name ──────────────────────────────────────────
// One-time backfill so the Family Portrait can render "she/her" / "he/him"
// for the user's known profiles without manual selection. Only applies when
// the chart has NO pronouns yet, so user edits via Chart Library always win.
const PRONOUN_SEED: Record<string, ProfilePronouns> = (() => {
  const she: ProfilePronouns = { subject: "she", object: "her", possessive: "her", reflexive: "herself" };
  const he:  ProfilePronouns = { subject: "he",  object: "him", possessive: "his", reflexive: "himself" };
  const map: Record<string, ProfilePronouns> = {};
  ["lauren", "erica", "hannah", "margie", "nicki", "shannon"].forEach(n => (map[n] = she));
  ["ben", "max", "ike", "nate"].forEach(n => (map[n] = he));
  return map;
})();
const applyAutoSeededPronouns = <T extends NatalChart | null>(chart: T): T => {
  if (!chart || chart.pronouns?.subject) return chart;
  const first = (chart.name ?? "").trim().split(/\s+/)[0]?.toLowerCase();
  const seeded = first ? PRONOUN_SEED[first] : undefined;
  return seeded ? ({ ...chart, pronouns: seeded } as T) : chart;
};

export const useNatalChart = () => {
  // Initialize state with rolling backup recovery
  const [userNatalChart, setUserNatalChart] = useState<NatalChart | null>(() => {
    const c = readWithRollingBackups<NatalChart | null>('userNatalChart', null, isValidChart);
    return applyAutoSeededPronouns(normalizeAscendantFromHouse1(c));
  });
  const [savedCharts, setSavedCharts] = useState<NatalChart[]>(() => {
    const raw = readSavedChartsWithRecovery()
      .map(normalizeAscendantFromHouse1)
      .map(applyAutoSeededPronouns);
    // Deduplicate by normalized name on load, keeping entries with more planet data
    // Also filter out solar return charts and HD-only charts
    const seen = new Map<string, NatalChart>();
    for (const c of raw) {
      if ((c as any).solarReturnYear) continue;
      if (c.id?.startsWith('hd_')) continue;
      const key = (c.name || '').toLowerCase().trim();
      if (!key) continue;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, c);
      } else {
        // Keep the one with more planet data
        const existingCount = existing.planets ? Object.keys(existing.planets).length : 0;
        const newCount = c.planets ? Object.keys(c.planets).length : 0;
        if (newCount > existingCount) {
          seen.set(key, c);
        }
      }
    }
    return Array.from(seen.values());
  });

  // Determine initial selection: prefer stored value, otherwise default to 'user' if chart exists
  const [selectedChartForTiming, setSelectedChartForTiming] = useState<string>(() => {
    const stored = localStorage.getItem('selectedChartForTiming');
    if (stored) return stored;
    
    // No stored selection - default to user chart if it exists
    const storedUserChart = safeParseJSON<NatalChart | null>('userNatalChart', null);
    return storedUserChart ? 'user' : 'general';
  });

  // Normalize invalid selections (e.g. deleted saved chart id)
  useEffect(() => {
    const isValidSelection =
      selectedChartForTiming === 'general' ||
      selectedChartForTiming === 'user' ||
      savedCharts.some(c => c.id === selectedChartForTiming);

    const waitingForSavedChartsToRestore =
      selectedChartForTiming !== 'general' &&
      selectedChartForTiming !== 'user' &&
      savedCharts.length === 0;

    if (!isValidSelection && waitingForSavedChartsToRestore) {
      return;
    }

    if (!isValidSelection) {
      const next = userNatalChart ? 'user' : 'general';
      localStorage.setItem('selectedChartForTiming', next);
      setSelectedChartForTiming(next);
    }
  }, [selectedChartForTiming, savedCharts, userNatalChart]);

  const replaceSavedCharts = (charts: NatalChart[]) => {
    const validCharts = charts
      .filter((c) => c && c.name && !(c as any).solarReturnYear && !c.id?.startsWith('hd_'))
      .map((c) => normalizeAscendantFromHouse1(c));
    saveWithRollingBackups('savedCharts', validCharts);
    setSavedCharts(validCharts);
  };

  const saveUserNatalChart = (chart: NatalChart) => {
    // Prevent saving empty/invalid chart data
    if (!isValidChart(chart)) {
      console.warn('[NatalChart] Attempted to save invalid chart data, ignoring');
      return;
    }

    const normalized = normalizeAscendantFromHouse1(chart);
    saveWithRollingBackups('userNatalChart', normalized);
    setUserNatalChart(normalized);
  };

  const addChart = (chart: NatalChart) => {
    // Validate before adding
    if (!chart || !chart.name || chart.name.trim() === '') {
      console.warn('[NatalChart] Attempted to add invalid chart, ignoring');
      return chart;
    }

    const newChart = { ...chart, id: Date.now().toString() };
    const updated = [...savedCharts, newChart];

    replaceSavedCharts(updated);
    return newChart;
  };

  const updateChart = (id: string, chartUpdate: Partial<NatalChart>) => {
    const updated = savedCharts.map((c) => (c.id === id ? { ...c, ...chartUpdate } : c));
    
    // Validate the updated array isn't corrupt
    if (updated.length === 0 && savedCharts.length > 0) {
      console.warn('[NatalChart] Update would result in data loss, ignoring');
      return;
    }

    replaceSavedCharts(updated);
  };

  const deleteChart = (id: string) => {
    const updated = savedCharts.filter((c) => c.id !== id);

    replaceSavedCharts(updated);
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
    setSavedCharts: replaceSavedCharts,
  };
};
