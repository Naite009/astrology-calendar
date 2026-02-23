import { useState } from 'react';
import { NatalChart } from './useNatalChart';

export interface SolarReturnChart extends NatalChart {
  /** The solar return year (birthday year the SR is cast for) */
  solarReturnYear: number;
  /** Location where the SR was cast (may differ from birth location for relocation) */
  solarReturnLocation?: string;
  /** The exact moment the Sun returns to natal degree */
  solarReturnDateTime?: string;
  /** The natal chart ID this SR belongs to */
  natalChartId?: string;
}

const SR_STORAGE_KEY = 'solarReturnCharts';

const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item) as T;
  } catch (e) {
    console.error(`[SolarReturn] Failed to parse ${key}:`, e);
  }
  return fallback;
};

export const useSolarReturnChart = () => {
  const [solarReturnCharts, setSolarReturnCharts] = useState<SolarReturnChart[]>(() => {
    return safeParseJSON<SolarReturnChart[]>(SR_STORAGE_KEY, []);
  });

  const saveSolarReturnCharts = (charts: SolarReturnChart[]) => {
    try {
      localStorage.setItem(SR_STORAGE_KEY, JSON.stringify(charts));
    } catch (e) {
      console.error('[SolarReturn] Failed to save:', e);
    }
    setSolarReturnCharts(charts);
  };

  const addSolarReturn = (chart: SolarReturnChart): SolarReturnChart => {
    const newChart = { ...chart, id: Date.now().toString() };
    const updated = [...solarReturnCharts, newChart];
    saveSolarReturnCharts(updated);
    return newChart;
  };

  const updateSolarReturn = (id: string, update: Partial<SolarReturnChart>) => {
    const updated = solarReturnCharts.map(c => c.id === id ? { ...c, ...update } : c);
    saveSolarReturnCharts(updated);
  };

  const deleteSolarReturn = (id: string) => {
    saveSolarReturnCharts(solarReturnCharts.filter(c => c.id !== id));
  };

  /** Get SR charts for a specific natal chart */
  const getSolarReturnsForChart = (natalChartId: string) => {
    return solarReturnCharts.filter(c => c.natalChartId === natalChartId);
  };

  /** Get the SR chart for a specific year and natal chart */
  const getSolarReturnForYear = (natalChartId: string, year: number) => {
    return solarReturnCharts.find(c => c.natalChartId === natalChartId && c.solarReturnYear === year);
  };

  return {
    solarReturnCharts,
    addSolarReturn,
    updateSolarReturn,
    deleteSolarReturn,
    getSolarReturnsForChart,
    getSolarReturnForYear,
  };
};
