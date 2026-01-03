import { useState, useEffect } from 'react';

export interface NatalPlanetPosition {
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
  isRetrograde?: boolean;
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
    Chiron?: NatalPlanetPosition;
    Lilith?: NatalPlanetPosition;
    Ceres?: NatalPlanetPosition;
    Pallas?: NatalPlanetPosition;
    Juno?: NatalPlanetPosition;
    Vesta?: NatalPlanetPosition;
  };
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

export const useNatalChart = () => {
  // Initialize state directly from localStorage to avoid flash of empty state
  const [userNatalChart, setUserNatalChart] = useState<NatalChart | null>(() => {
    return safeParseJSON<NatalChart | null>('userNatalChart', null);
  });
  const [savedCharts, setSavedCharts] = useState<NatalChart[]>(() => {
    return safeParseJSON<NatalChart[]>('savedCharts', []);
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
    localStorage.setItem('userNatalChart', JSON.stringify(chart));
    setUserNatalChart(chart);
  };

  const addChart = (chart: NatalChart) => {
    const newChart = { ...chart, id: Date.now().toString() };
    const updated = [...savedCharts, newChart];
    localStorage.setItem('savedCharts', JSON.stringify(updated));
    setSavedCharts(updated);
    return newChart;
  };

  const updateChart = (id: string, chart: Partial<NatalChart>) => {
    const updated = savedCharts.map(c => c.id === id ? { ...c, ...chart } : c);
    localStorage.setItem('savedCharts', JSON.stringify(updated));
    setSavedCharts(updated);
  };

  const deleteChart = (id: string) => {
    const updated = savedCharts.filter(c => c.id !== id);
    localStorage.setItem('savedCharts', JSON.stringify(updated));
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
