import { useState, useEffect } from 'react';

export interface NatalPlanetPosition {
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
}

export interface NatalChart {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
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
  };
}

export const useNatalChart = () => {
  const [userNatalChart, setUserNatalChart] = useState<NatalChart | null>(null);
  const [savedCharts, setSavedCharts] = useState<NatalChart[]>([]);
  const [selectedChartForTiming, setSelectedChartForTiming] = useState<string>('user');

  useEffect(() => {
    const savedUserChart = localStorage.getItem('userNatalChart');
    if (savedUserChart) {
      setUserNatalChart(JSON.parse(savedUserChart));
    }

    const savedChartsData = localStorage.getItem('savedCharts');
    if (savedChartsData) {
      setSavedCharts(JSON.parse(savedChartsData));
    }

    const savedSelection = localStorage.getItem('selectedChartForTiming');
    if (savedSelection) {
      setSelectedChartForTiming(savedSelection);
    }
  }, []);

  const saveUserNatalChart = (chart: NatalChart) => {
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
