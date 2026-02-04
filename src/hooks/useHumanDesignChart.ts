import { useState, useCallback } from 'react';
import { HumanDesignChart } from '@/types/humanDesign';

const STORAGE_KEY = 'humanDesignCharts';
const BACKUP_VERSIONS = ['__backup_v1', '__backup_v2', '__backup_v3'];

// Helper to safely parse JSON from localStorage
const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch (e) {
    console.error(`[HDChart] Failed to parse ${key}:`, e);
  }
  return fallback;
};

// Validate chart data - more permissive to allow partial charts
const isValidChart = (chart: HumanDesignChart | null): boolean => {
  if (!chart) return false;
  if (!chart.name || chart.name.trim() === '') return false;
  // Allow charts without full birth data if they have gate activations
  if (!chart.type) return false;
  return true;
};

// Validate chart array
const isValidChartArray = (charts: HumanDesignChart[] | null): boolean => {
  return Array.isArray(charts);
};

// Read with rolling backups
const readWithRollingBackups = <T,>(
  key: string,
  fallback: T,
  validator: (data: T | null) => boolean
): T => {
  const primary = safeParseJSON<T>(key, fallback);
  if (validator(primary)) {
    return primary;
  }

  for (const suffix of BACKUP_VERSIONS) {
    const backup = safeParseJSON<T>(`${key}${suffix}`, fallback);
    if (validator(backup)) {
      console.log(`[HDChart] Restored ${key} from ${suffix}`);
      try {
        localStorage.setItem(key, JSON.stringify(backup));
      } catch (e) {
        console.warn(`[HDChart] Failed to repair ${key}:`, e);
      }
      return backup;
    }
  }

  return fallback;
};

// Save with rolling backups
const saveWithRollingBackups = (key: string, data: unknown): void => {
  try {
    const v2 = localStorage.getItem(`${key}${BACKUP_VERSIONS[1]}`);
    if (v2) localStorage.setItem(`${key}${BACKUP_VERSIONS[2]}`, v2);

    const v1 = localStorage.getItem(`${key}${BACKUP_VERSIONS[0]}`);
    if (v1) localStorage.setItem(`${key}${BACKUP_VERSIONS[1]}`, v1);

    const current = localStorage.getItem(key);
    if (current) localStorage.setItem(`${key}${BACKUP_VERSIONS[0]}`, current);

    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[HDChart] Failed to save ${key}:`, e);
  }
};

export const useHumanDesignChart = () => {
  const [charts, setCharts] = useState<HumanDesignChart[]>(() => {
    return readWithRollingBackups<HumanDesignChart[]>(STORAGE_KEY, [], isValidChartArray);
  });

  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  const addChart = useCallback((chart: HumanDesignChart) => {
    if (!isValidChart(chart)) {
      console.warn('[HDChart] Attempted to add invalid chart, ignoring');
      return null;
    }

    // Preserve a provided id (e.g. when coming from the HD image parser flow)
    // so downstream references remain stable. Fall back to a timestamp id.
    const newChart = { ...chart, id: chart.id || Date.now().toString() };
    const updated = [...charts, newChart];

    saveWithRollingBackups(STORAGE_KEY, updated);
    setCharts(updated);
    return newChart;
  }, [charts]);

  const updateChart = useCallback((id: string, updates: Partial<HumanDesignChart>) => {
    // Never allow updates to mutate the chart's identity.
    const { id: _ignoredId, ...safeUpdates } = updates;

    const updated = charts.map(c =>
      c.id === id ? { ...c, ...safeUpdates, updatedAt: new Date().toISOString() } : c
    );

    saveWithRollingBackups(STORAGE_KEY, updated);
    setCharts(updated);
  }, [charts]);

  const deleteChart = useCallback((id: string) => {
    const updated = charts.filter(c => c.id !== id);
    saveWithRollingBackups(STORAGE_KEY, updated);
    setCharts(updated);

    if (selectedChartId === id) {
      setSelectedChartId(null);
    }
  }, [charts, selectedChartId]);

  const getChart = useCallback((id: string): HumanDesignChart | undefined => {
    return charts.find(c => c.id === id);
  }, [charts]);

  const selectChart = useCallback((id: string | null) => {
    setSelectedChartId(id);
  }, []);

  const selectedChart = selectedChartId ? getChart(selectedChartId) : null;

  return {
    charts,
    selectedChart,
    selectedChartId,
    addChart,
    updateChart,
    deleteChart,
    getChart,
    selectChart,
    setCharts,
  };
};
