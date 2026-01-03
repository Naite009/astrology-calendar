import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Plus, Users, RefreshCw, Check, Eye, ChevronDown, ChevronUp, ClipboardPaste, Upload, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { getPlanetSymbol, calculateNatalChart, detectTimezoneFromLocation, calculatePlacidusHouseCusps } from '@/lib/astrology';
import { getCoordinatesFromLocation } from '@/lib/placidusHouses';
import { NatalChartNarrative } from './NatalChartNarrative';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Grouped planets for organized display
const CORE_PLANETS = ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
const POINTS = ['NorthNode', 'SouthNode', 'Chiron', 'Lilith', 'PartOfFortune', 'Vertex'] as const;
const ASTEROIDS = ['Ceres', 'Pallas', 'Juno', 'Vesta'] as const;
const TNOS = ['Eris', 'Sedna', 'Makemake', 'Haumea', 'Quaoar', 'Orcus', 'Ixion', 'Varuna'] as const;

// All planets combined for data structure
const PLANETS = [...CORE_PLANETS, ...POINTS, ...ASTEROIDS, ...TNOS] as const;

const PLANET_LABELS: Record<string, string> = {
  NorthNode: 'North Node',
  SouthNode: 'South Node',
  Lilith: 'Black ☽ Lilith',
  Ceres: 'Ceres',
  Pallas: 'Pallas',
  Juno: 'Juno',
  Vesta: 'Vesta',
  Chiron: 'Chiron',
  PartOfFortune: 'Part of Fortune',
  Vertex: 'Vertex',
  Eris: 'Eris',
  Sedna: 'Sedna',
  Makemake: 'Makemake',
  Haumea: 'Haumea',
  Quaoar: 'Quaoar',
  Orcus: 'Orcus',
  Ixion: 'Ixion',
  Varuna: 'Varuna',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Ascendant: 'ASC',
  NorthNode: '☊',
  SouthNode: '☋',
  Chiron: '⚷',
  Lilith: '⚸',
  Ceres: '⚳',
  Pallas: '⚴',
  Juno: '⚵',
  Vesta: '⚶',
  PartOfFortune: '⊕',
  Vertex: 'Vx',
  Eris: '⯰',
  Sedna: '⯲',
  Makemake: '🜨',
  Haumea: '🜵',
  Quaoar: '🝾',
  Orcus: '🝿',
  Ixion: '⯳',
  Varuna: '⯴',
};

const TIMEZONE_OPTIONS = [
  { value: 0, label: 'UTC (0:00)' },
  { value: -5, label: 'EST (UTC-5)' },
  { value: -4, label: 'EDT (UTC-4)' },
  { value: -6, label: 'CST (UTC-6)' },
  { value: -5, label: 'CDT (UTC-5)' },
  { value: -7, label: 'MST (UTC-7)' },
  { value: -6, label: 'MDT (UTC-6)' },
  { value: -8, label: 'PST (UTC-8)' },
  { value: -7, label: 'PDT (UTC-7)' },
  { value: 1, label: 'CET (UTC+1)' },
  { value: 2, label: 'CEST (UTC+2)' },
  { value: 5.5, label: 'IST (UTC+5:30)' },
  { value: 8, label: 'CST China (UTC+8)' },
  { value: 9, label: 'JST (UTC+9)' },
  { value: 10, label: 'AEST (UTC+10)' },
];

// Planet name aliases for parsing astro.com data
const PLANET_ALIASES: Record<string, string> = {
  'sun': 'Sun', 'moon': 'Moon', 'asc': 'Ascendant', 'ascendant': 'Ascendant', 'ac': 'Ascendant',
  'mercury': 'Mercury', 'venus': 'Venus', 'mars': 'Mars', 'jupiter': 'Jupiter', 'saturn': 'Saturn',
  'uranus': 'Uranus', 'neptune': 'Neptune', 'pluto': 'Pluto',
  'north node': 'NorthNode', 'northnode': 'NorthNode', 'nn': 'NorthNode', 'true node': 'NorthNode', 'mean node': 'NorthNode',
  'south node': 'SouthNode', 'southnode': 'SouthNode', 'sn': 'SouthNode',
  'chiron': 'Chiron', 'lilith': 'Lilith', 'black moon lilith': 'Lilith', 'mean lilith': 'Lilith',
  'ceres': 'Ceres', 'pallas': 'Pallas', 'juno': 'Juno', 'vesta': 'Vesta',
  'part of fortune': 'PartOfFortune', 'pof': 'PartOfFortune', 'fortune': 'PartOfFortune', 'fortuna': 'PartOfFortune',
  'vertex': 'Vertex', 'vx': 'Vertex',
  'eris': 'Eris', 'sedna': 'Sedna', 'makemake': 'Makemake', 'haumea': 'Haumea',
  'quaoar': 'Quaoar', 'orcus': 'Orcus', 'ixion': 'Ixion', 'varuna': 'Varuna',
  'mc': 'MC', 'midheaven': 'MC', 'ic': 'IC', 'dc': 'Descendant', 'dsc': 'Descendant', 'descendant': 'Descendant',
};

const SIGN_ALIASES: Record<string, string> = {
  'ari': 'Aries', 'aries': 'Aries', 'ar': 'Aries',
  'tau': 'Taurus', 'taurus': 'Taurus', 'ta': 'Taurus',
  'gem': 'Gemini', 'gemini': 'Gemini', 'ge': 'Gemini',
  'can': 'Cancer', 'cancer': 'Cancer', 'cn': 'Cancer',
  'leo': 'Leo', 'le': 'Leo',
  'vir': 'Virgo', 'virgo': 'Virgo', 'vi': 'Virgo',
  'lib': 'Libra', 'libra': 'Libra', 'li': 'Libra',
  'sco': 'Scorpio', 'scorpio': 'Scorpio', 'sc': 'Scorpio',
  'sag': 'Sagittarius', 'sagittarius': 'Sagittarius', 'sg': 'Sagittarius',
  'cap': 'Capricorn', 'capricorn': 'Capricorn', 'cp': 'Capricorn',
  'aqu': 'Aquarius', 'aquarius': 'Aquarius', 'aq': 'Aquarius',
  'pis': 'Pisces', 'pisces': 'Pisces', 'pi': 'Pisces',
};

// Parse astro.com text format
const parseAstroComData = (text: string): Partial<Record<string, NatalPlanetPosition>> => {
  const results: Partial<Record<string, NatalPlanetPosition>> = {};
  
  // Normalize text
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');
  
  // Common patterns:
  // "Sun 15°23' Aries" or "Sun 15 23 Aries" or "Sun in Aries 15°23'"
  // "Sun Ari 15°23'" or "☉ 15°23' Ari"
  // Also handle retrograde markers: (R) or ℞ or R
  
  const lines = text.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Find which planet this line is about
    let foundPlanet: string | null = null;
    for (const [alias, planet] of Object.entries(PLANET_ALIASES)) {
      if (lowerLine.includes(alias)) {
        foundPlanet = planet;
        break;
      }
    }
    if (!foundPlanet) continue;
    
    // Find the sign
    let foundSign: string | null = null;
    for (const [alias, sign] of Object.entries(SIGN_ALIASES)) {
      // Use word boundary to avoid partial matches
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lowerLine)) {
        foundSign = sign;
        break;
      }
    }
    if (!foundSign) continue;
    
    // Extract degrees and minutes
    // Patterns: "15°23'" or "15° 23'" or "15 23" (when near a sign)
    const degreePatterns = [
      /(\d{1,2})°\s*(\d{1,2})?['′]?/,           // 15°23' or 15°
      /(\d{1,2})\s*°\s*(\d{1,2})\s*['′]/,       // 15 ° 23 '
      /\b(\d{1,2})\s+(\d{1,2})\b/,              // 15 23 (simple space separated)
    ];
    
    let degree = 0;
    let minutes = 0;
    
    for (const pattern of degreePatterns) {
      const match = line.match(pattern);
      if (match) {
        degree = parseInt(match[1], 10);
        minutes = match[2] ? parseInt(match[2], 10) : 0;
        if (degree >= 0 && degree < 30) break; // Valid degree
      }
    }
    
    // Check for retrograde
    const isRetrograde = /\(r\)|℞|\br\b/i.test(line);
    
    if (foundPlanet && foundSign && degree >= 0 && degree < 30) {
      results[foundPlanet] = {
        sign: foundSign,
        degree,
        minutes,
        seconds: 0,
        isRetrograde,
      };
    }
  }
  
  return results;
};

const HOUSE_LABELS = [
  { num: 1, label: '1st House (ASC)', description: 'Self, Identity' },
  { num: 2, label: '2nd House', description: 'Money, Values' },
  { num: 3, label: '3rd House', description: 'Communication' },
  { num: 4, label: '4th House (IC)', description: 'Home, Family' },
  { num: 5, label: '5th House', description: 'Creativity, Romance' },
  { num: 6, label: '6th House', description: 'Health, Work' },
  { num: 7, label: '7th House (DSC)', description: 'Partnerships' },
  { num: 8, label: '8th House', description: 'Transformation' },
  { num: 9, label: '9th House', description: 'Philosophy, Travel' },
  { num: 10, label: '10th House (MC)', description: 'Career, Public' },
  { num: 11, label: '11th House', description: 'Friends, Groups' },
  { num: 12, label: '12th House', description: 'Subconscious' },
];

interface ChartLibraryProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  onSaveUserChart: (chart: NatalChart) => void;
  onAddChart: (chart: NatalChart) => NatalChart;
  onUpdateChart: (id: string, chart: Partial<NatalChart>) => void;
  onDeleteChart: (id: string) => void;
}

interface ChartFormData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezoneOffset: number;
  detectedTimezone?: string;
  planets: Record<string, NatalPlanetPosition>;
  houseCusps: Record<string, HouseCusp>;
  interceptedSigns: string[];
}

const emptyPlanets = (): Record<string, NatalPlanetPosition> => {
  const planets: Record<string, NatalPlanetPosition> = {};
  PLANETS.forEach(p => {
    planets[p] = { sign: '', degree: 0, minutes: 0, seconds: 0, isRetrograde: false };
  });
  return planets;
};

const emptyHouseCusps = (): Record<string, HouseCusp> => {
  const cusps: Record<string, HouseCusp> = {};
  for (let i = 1; i <= 12; i++) {
    cusps[`house${i}`] = { sign: '', degree: 0, minutes: 0 };
  }
  return cusps;
};

export const ChartLibrary = ({
  userNatalChart,
  savedCharts,
  onSaveUserChart,
  onAddChart,
  onUpdateChart,
  onDeleteChart,
}: ChartLibraryProps) => {
  const [editingChart, setEditingChart] = useState<'new' | 'user' | NatalChart | null>(null);
  const [viewingChart, setViewingChart] = useState<NatalChart | null>(null);
  const [showTransits, setShowTransits] = useState(true);
  // When true, the "Calculate from birth data" button will not overwrite a manually-entered Chiron.
  const [preserveManualChiron, setPreserveManualChiron] = useState(true);
  const [formData, setFormData] = useState<ChartFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    timezoneOffset: -5, // Default to EST
    planets: emptyPlanets(),
    houseCusps: emptyHouseCusps(),
    interceptedSigns: [],
  });
  const [showHousesSection, setShowHousesSection] = useState(false);
  const [showPointsSection, setShowPointsSection] = useState(false);
  const [showAsteroidsSection, setShowAsteroidsSection] = useState(false);
  const [showTNOsSection, setShowTNOsSection] = useState(false);
  const [showImportSection, setShowImportSection] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; total: number } | null>(null);
  const [imageImportStatus, setImageImportStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [imageImportError, setImageImportError] = useState<string | null>(null);
  const [imageImportResult, setImageImportResult] = useState<{ planets: number; houses: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNewChartRef = useRef(false);
  // Track if form has been explicitly opened to prevent auto-save on mount
  const hasFormOpenedRef = useRef(false);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    // Only auto-save if the form has been explicitly opened by user action
    if (!editingChart || !hasFormOpenedRef.current) return;
    
    // Don't auto-save new charts until they have a name
    if (editingChart === 'new' && !formData.name.trim()) return;
    
    // Don't auto-save user chart with empty name (prevents overwriting existing data)
    if (editingChart === 'user' && !formData.name.trim()) return;
    
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (editingChart === 'user') {
        onSaveUserChart({
          id: 'user',
          ...formData,
        });
      } else if (editingChart === 'new' && formData.name.trim()) {
        const newChart = onAddChart({
          id: '',
          ...formData,
        });
        isNewChartRef.current = false;
        setEditingChart(newChart);
      } else if (typeof editingChart === 'object') {
        onUpdateChart(editingChart.id, formData);
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 800);
  }, [editingChart, formData, onSaveUserChart, onAddChart, onUpdateChart]);

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (editingChart) {
      triggerAutoSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, triggerAutoSave]);

  const openEditForm = (chart: 'new' | 'user' | NatalChart) => {
    // Mark that the form has been explicitly opened by user action
    hasFormOpenedRef.current = true;
    isNewChartRef.current = chart === 'new';
    if (chart === 'new') {
      setFormData({
        name: '',
        birthDate: '',
        birthTime: '',
        birthLocation: '',
        timezoneOffset: -5,
        planets: emptyPlanets(),
        houseCusps: emptyHouseCusps(),
        interceptedSigns: [],
      });
    } else if (chart === 'user' && userNatalChart) {
      setFormData({
        name: userNatalChart.name,
        birthDate: userNatalChart.birthDate,
        birthTime: userNatalChart.birthTime,
        birthLocation: userNatalChart.birthLocation,
        timezoneOffset: userNatalChart.timezoneOffset ?? -5,
        planets: userNatalChart.planets as Record<string, NatalPlanetPosition>,
        houseCusps: (userNatalChart.houseCusps as Record<string, HouseCusp>) || emptyHouseCusps(),
        interceptedSigns: userNatalChart.interceptedSigns || [],
      });
    } else if (typeof chart === 'object') {
      setFormData({
        name: chart.name,
        birthDate: chart.birthDate,
        birthTime: chart.birthTime,
        birthLocation: chart.birthLocation,
        timezoneOffset: chart.timezoneOffset ?? -5,
        planets: chart.planets as Record<string, NatalPlanetPosition>,
        houseCusps: (chart.houseCusps as Record<string, HouseCusp>) || emptyHouseCusps(),
        interceptedSigns: chart.interceptedSigns || [],
      });
    }
    setEditingChart(chart);
    setSaveStatus('idle');
  };

  const updatePlanet = (planet: string, field: keyof NatalPlanetPosition, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      planets: {
        ...prev.planets,
        [planet]: {
          ...prev.planets[planet],
          [field]: field === 'sign' ? value : field === 'isRetrograde' ? Boolean(value) : Number(value),
        },
      },
    }));
  };

  const calculateFromBirthData = () => {
    if (!formData.birthDate) return;
    
    // Auto-detect timezone based on location and date
    let detectedTz: string | undefined;
    if (formData.birthLocation && formData.birthDate) {
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const tempDate = new Date(year, month - 1, day);
      const detected = detectTimezoneFromLocation(formData.birthLocation, tempDate);
      if (detected) {
        detectedTz = detected.abbrev;
        setFormData(prev => ({ 
          ...prev, 
          timezoneOffset: detected.offset,
          detectedTimezone: detected.abbrev
        }));
      }
    }
    
    const calculatedPositions = calculateNatalChart(
      formData.birthDate, 
      formData.birthTime || '12:00',
      formData.timezoneOffset,
      formData.birthLocation
    );

    // Try to calculate Placidus houses if we have coordinates
    const coords = getCoordinatesFromLocation(formData.birthLocation);
    
    const calculateHouseCusps = (): Record<string, HouseCusp> | null => {
      if (!coords) {
        // Fallback to Equal Houses from Ascendant if no coordinates found
        const asc = calculatedPositions.Ascendant;
        if (!asc?.sign) return null;
        const signIndex = ZODIAC_SIGNS.indexOf(asc.sign);
        if (signIndex === -1) return null;

        const ascLon = signIndex * 30 + asc.degree + (asc.minutes || 0) / 60;
        const cusps: Record<string, HouseCusp> = {};

        for (let i = 1; i <= 12; i++) {
          const lon = (ascLon + (i - 1) * 30) % 360;
          const si = Math.floor(lon / 30);
          const degFloat = lon % 30;
          const deg = Math.floor(degFloat);
          const min = Math.round((degFloat - deg) * 60);
          cusps[`house${i}`] = { sign: ZODIAC_SIGNS[si], degree: deg, minutes: min === 60 ? 59 : min };
        }
        return cusps;
      }
      
      // Use Placidus house calculation with coordinates
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const [hours, minutes] = (formData.birthTime || '12:00').split(':').map(Number);
      const utcHours = hours - formData.timezoneOffset;
      const birthDateTime = new Date(Date.UTC(year, month - 1, day, utcHours, minutes, 0));
      
      const placidusHouses = calculatePlacidusHouseCusps(birthDateTime, coords.lat, coords.lon);
      
      return {
        house1: placidusHouses.house1,
        house2: placidusHouses.house2,
        house3: placidusHouses.house3,
        house4: placidusHouses.house4,
        house5: placidusHouses.house5,
        house6: placidusHouses.house6,
        house7: placidusHouses.house7,
        house8: placidusHouses.house8,
        house9: placidusHouses.house9,
        house10: placidusHouses.house10,
        house11: placidusHouses.house11,
        house12: placidusHouses.house12,
      };
    };
    
    setFormData(prev => {
      const mergedPlanets = {
        ...prev.planets,
        ...calculatedPositions,
      };

      // Chiron is not calculated from the same ephemeris as the main planets in this app,
      // so if the user typed an astro.com-verified Chiron, keep it.
      if (preserveManualChiron && prev.planets.Chiron?.sign) {
        mergedPlanets.Chiron = prev.planets.Chiron;
      }

      // If user hasn't entered house cusps yet, auto-fill using Placidus (or Equal Houses as fallback).
      const shouldAutoFillHouses = !prev.houseCusps?.house1?.sign;
      const autoCusps = shouldAutoFillHouses ? calculateHouseCusps() : null;

      return {
        ...prev,
        planets: mergedPlanets,
        ...(autoCusps ? { houseCusps: { ...prev.houseCusps, ...autoCusps } } : {}),
        ...(detectedTz ? { detectedTimezone: detectedTz } : {}),
      };
    });
  };

  const handleClose = () => {
    // Save immediately on close if there are unsaved changes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Only save if form was opened and has valid data
    if (hasFormOpenedRef.current) {
      if (editingChart === 'user' && formData.name.trim()) {
        onSaveUserChart({ id: 'user', ...formData });
      } else if (editingChart === 'new' && formData.name.trim()) {
        onAddChart({ id: '', ...formData });
      } else if (typeof editingChart === 'object') {
        onUpdateChart(editingChart.id, formData);
      }
    }
    
    // Reset the form opened flag
    hasFormOpenedRef.current = false;
    setEditingChart(null);
    setImportText('');
    setImportResult(null);
    setShowImportSection(false);
  };

  const handleImportPaste = () => {
    if (!importText.trim()) return;
    
    const parsed = parseAstroComData(importText);
    const parsedCount = Object.keys(parsed).length;
    
    if (parsedCount > 0) {
      setFormData(prev => ({
        ...prev,
        planets: {
          ...prev.planets,
          ...parsed,
        },
      }));
      setImportResult({ success: parsedCount, total: parsedCount });
    } else {
      setImportResult({ success: 0, total: 0 });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setImageImportStatus('uploading');
    setImageImportError(null);
    setImageImportResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      setImageImportStatus('parsing');

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('parse-chart-image', {
        body: { imageBase64 },
      });

      if (error) {
        throw new Error(error.message || 'Failed to parse image');
      }

      if (!data?.data) {
        throw new Error('No chart data found in image. Try a clearer screenshot showing the planet positions table.');
      }

      const parsedData = data.data;
      let planetsImported = 0;
      let housesImported = 0;

      // Import planets
      if (parsedData.planets && typeof parsedData.planets === 'object') {
        const validPlanets: Record<string, NatalPlanetPosition> = {};
        
        for (const [planet, position] of Object.entries(parsedData.planets)) {
          const pos = position as any;
          if (pos?.sign && ZODIAC_SIGNS.includes(pos.sign)) {
            validPlanets[planet] = {
              sign: pos.sign,
              degree: Math.min(29, Math.max(0, parseInt(pos.degree) || 0)),
              minutes: Math.min(59, Math.max(0, parseInt(pos.minutes) || 0)),
              seconds: 0,
              isRetrograde: Boolean(pos.isRetrograde),
            };
            planetsImported++;
          }
        }

        if (planetsImported > 0) {
          setFormData(prev => ({
            ...prev,
            planets: {
              ...prev.planets,
              ...validPlanets,
            },
          }));
        }
      }

      // Import house cusps
      if (parsedData.houseCusps && typeof parsedData.houseCusps === 'object') {
        const validCusps: Record<string, HouseCusp> = {};
        
        for (const [house, cusp] of Object.entries(parsedData.houseCusps)) {
          const c = cusp as any;
          if (c?.sign && ZODIAC_SIGNS.includes(c.sign)) {
            validCusps[house] = {
              sign: c.sign,
              degree: Math.min(29, Math.max(0, parseInt(c.degree) || 0)),
              minutes: Math.min(59, Math.max(0, parseInt(c.minutes) || 0)),
            };
            housesImported++;
          }
        }

        if (housesImported > 0) {
          setFormData(prev => ({
            ...prev,
            houseCusps: {
              ...prev.houseCusps,
              ...validCusps,
            },
          }));
        }
      }

      if (planetsImported === 0 && housesImported === 0) {
        throw new Error('Could not extract any positions. Try a screenshot with a clear planet positions list.');
      }

      setImageImportResult({ planets: planetsImported, houses: housesImported });
      setImageImportStatus('success');
    } catch (err) {
      console.error('Image import error:', err);
      setImageImportError(err instanceof Error ? err.message : 'Failed to parse image');
      setImageImportStatus('error');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render a planet row
  const renderPlanetRow = (planet: string) => (
    <div key={planet} className="grid grid-cols-[40px_110px_1fr_70px_70px_70px_90px] gap-2 items-center">
      <span className="text-lg">{PLANET_SYMBOLS[planet] || getPlanetSymbol(planet.toLowerCase())}</span>
      <span className="text-sm text-foreground">{PLANET_LABELS[planet] || planet}</span>
      <select
        value={formData.planets[planet]?.sign || ''}
        onChange={e => updatePlanet(planet, 'sign', e.target.value)}
        className="border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
      >
        <option value="">Select Sign</option>
        {ZODIAC_SIGNS.map(sign => (
          <option key={sign} value={sign}>{sign}</option>
        ))}
      </select>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="29"
          placeholder="0"
          value={formData.planets[planet]?.degree ?? ''}
          onChange={e => updatePlanet(planet, 'degree', e.target.value)}
          className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">°</span>
      </div>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="59"
          placeholder="0"
          value={formData.planets[planet]?.minutes ?? ''}
          onChange={e => updatePlanet(planet, 'minutes', e.target.value)}
          className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">′</span>
      </div>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="59"
          placeholder="0"
          value={formData.planets[planet]?.seconds ?? ''}
          onChange={e => updatePlanet(planet, 'seconds', e.target.value)}
          className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">″</span>
      </div>
      <label className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={Boolean(formData.planets[planet]?.isRetrograde)}
          onChange={(e) => updatePlanet(planet, 'isRetrograde', e.target.checked)}
          className="rounded border-border"
        />
        ℞
      </label>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="text-primary" size={28} />
          <h2 className="font-serif text-2xl font-light text-foreground">Chart Library</h2>
        </div>
        <button
          onClick={() => openEditForm('new')}
          className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Add Chart
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* User's Personal Chart */}
        <div className="rounded-sm border-2 border-primary/30 bg-secondary p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
              {userNatalChart ? userNatalChart.name : 'Your Chart'}
              <span className="text-primary">★</span>
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-sm">
              Primary
            </span>
          </div>
          {userNatalChart ? (
            <>
              <div className="text-sm text-foreground mb-3 space-y-0.5">
                <p>☉ {userNatalChart.planets.Sun?.degree}° {userNatalChart.planets.Sun?.sign}</p>
                <p>☽ {userNatalChart.planets.Moon?.degree}° {userNatalChart.planets.Moon?.sign}</p>
                <p>
                  ASC {(userNatalChart.houseCusps?.house1?.degree ?? userNatalChart.planets.Ascendant?.degree)}°{' '}
                  {(userNatalChart.houseCusps?.house1?.sign ?? userNatalChart.planets.Ascendant?.sign)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingChart(userNatalChart)}
                  className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary hover:underline"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => openEditForm('user')}
                  className="text-[11px] uppercase tracking-widest text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => openEditForm('user')}
              className="text-sm text-primary hover:underline"
            >
              + Add your natal chart
            </button>
          )}
        </div>

        {/* Saved Charts */}
        {savedCharts.map(chart => (
          <div key={chart.id} className="rounded-sm border border-border bg-secondary p-5">
            <h3 className="font-serif text-lg font-medium text-foreground mb-2">{chart.name}</h3>
            <div className="text-sm text-foreground mb-3 space-y-0.5">
              <p>☉ {chart.planets.Sun?.degree}° {chart.planets.Sun?.sign}</p>
              <p>☽ {chart.planets.Moon?.degree}° {chart.planets.Moon?.sign}</p>
              <p>
                ASC {(chart.houseCusps?.house1?.degree ?? chart.planets.Ascendant?.degree)}°{' '}
                {(chart.houseCusps?.house1?.sign ?? chart.planets.Ascendant?.sign)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewingChart(chart)}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary hover:underline"
              >
                <Eye size={14} />
                View
              </button>
              <button
                onClick={() => openEditForm(chart)}
                className="text-[11px] uppercase tracking-widest text-primary hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteChart(chart.id)}
                className="text-[11px] uppercase tracking-widest text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form Modal */}
      {editingChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={handleClose}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm bg-background p-8 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-2xl font-light text-foreground">
                  {editingChart === 'new' ? 'Add New Chart' : editingChart === 'user' ? 'Your Natal Chart' : 'Edit Chart'}
                </h2>
                {/* Save status intentionally non-distracting (no blinking "Saving" indicator) */}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600">
                    <Check size={12} /> Saved
                  </span>
                )}
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Time</label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Timezone at Birth</label>
                  <select
                    value={formData.timezoneOffset}
                    onChange={e => setFormData({ ...formData, timezoneOffset: Number(e.target.value) })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    {TIMEZONE_OPTIONS.map((tz, i) => (
                      <option key={`${tz.value}-${i}`} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Location</label>
                  <input
                    type="text"
                    value={formData.birthLocation}
                    onChange={e => setFormData({ ...formData, birthLocation: e.target.value })}
                    placeholder="City, Country (for reference)"
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Astro.com Import Section */}
              <div className="border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowImportSection(!showImportSection)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <Image size={16} className="text-primary" />
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Import Chart Data
                  </h3>
                  {showImportSection ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </button>
                
                {showImportSection && (
                  <div className="mt-4 space-y-5">
                    {/* Image Upload */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Upload size={14} className="text-primary" />
                        <span className="text-[11px] uppercase tracking-widest text-foreground font-medium">
                          Upload Screenshot
                        </span>
                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">Recommended</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Upload a screenshot of your astro.com chart. AI will extract planet positions automatically.
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="chart-image-upload"
                      />
                      
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="chart-image-upload"
                          className={`flex items-center gap-2 border border-primary bg-primary/10 px-4 py-2 text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/20 cursor-pointer ${
                            imageImportStatus === 'uploading' || imageImportStatus === 'parsing' ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          {imageImportStatus === 'uploading' || imageImportStatus === 'parsing' ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              {imageImportStatus === 'uploading' ? 'Uploading...' : 'Analyzing...'}
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              Choose Image
                            </>
                          )}
                        </label>
                        
                        {imageImportStatus === 'success' && imageImportResult && (
                          <span className="text-[10px] text-green-600">
                            ✓ Imported {imageImportResult.planets} planet{imageImportResult.planets !== 1 ? 's' : ''}
                            {imageImportResult.houses > 0 && `, ${imageImportResult.houses} house cusp${imageImportResult.houses !== 1 ? 's' : ''}`}
                          </span>
                        )}
                        
                        {imageImportStatus === 'error' && imageImportError && (
                          <span className="text-[10px] text-destructive">
                            ✕ {imageImportError}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-border" />
                      <span className="text-[10px] text-muted-foreground uppercase">or paste text</span>
                      <div className="flex-1 border-t border-border" />
                    </div>

                    {/* Text Paste */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ClipboardPaste size={14} className="text-muted-foreground" />
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                          Paste Text
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Paste planet positions (e.g., "Sun 15°23' Aries, Moon 8°12' Cancer...").
                      </p>
                      <textarea
                        value={importText}
                        onChange={e => {
                          setImportText(e.target.value);
                          setImportResult(null);
                        }}
                        placeholder="Sun 15°23' Aries&#10;Moon 8°12' Cancer&#10;Mercury 22°45' Pisces (R)&#10;..."
                        className="w-full h-24 border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none font-mono"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleImportPaste}
                          disabled={!importText.trim()}
                          className="flex items-center gap-2 border border-border bg-background px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                        >
                          <ClipboardPaste size={14} />
                          Parse & Import
                        </button>
                        {importResult && (
                          <span className={`text-[10px] ${importResult.success > 0 ? 'text-green-600' : 'text-destructive'}`}>
                            {importResult.success > 0 
                              ? `✓ Imported ${importResult.success} position${importResult.success > 1 ? 's' : ''}`
                              : 'No positions found - check format'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Planet Positions - Core Planets (always visible) */}
              <div className="border-t border-border pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">Core Planets</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveManualChiron}
                        onChange={(e) => setPreserveManualChiron(e.target.checked)}
                        className="rounded border-border"
                      />
                      Keep my Chiron
                    </label>
                    {formData.detectedTimezone && (
                      <span className="text-[10px] text-green-600 bg-green-100 px-2 py-1 rounded">
                        Auto-detected: {formData.detectedTimezone}
                      </span>
                    )}
                    <button
                      onClick={calculateFromBirthData}
                      disabled={!formData.birthDate}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={12} />
                      Calculate from birth data
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic mb-4">
                  Click "Calculate" to auto-fill main planets including Ascendant (requires recognized city). ℞ indicates retrograde.
                </p>
                <div className="space-y-3">
                  {CORE_PLANETS.map(planet => renderPlanetRow(planet))}
                </div>
              </div>

              {/* Points Section (Collapsible) */}
              <div className="border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowPointsSection(!showPointsSection)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Points & Nodes
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    ({POINTS.filter(p => formData.planets[p]?.sign).length}/{POINTS.length} filled)
                  </span>
                  {showPointsSection ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </button>
                
                {showPointsSection && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[10px] text-muted-foreground italic mb-2">
                      North/South Node, Chiron, Lilith, Part of Fortune, Vertex
                    </p>
                    {POINTS.map(planet => renderPlanetRow(planet))}
                  </div>
                )}
              </div>

              {/* Asteroids Section (Collapsible) */}
              <div className="border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowAsteroidsSection(!showAsteroidsSection)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Asteroids
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    ({ASTEROIDS.filter(p => formData.planets[p]?.sign).length}/{ASTEROIDS.length} filled)
                  </span>
                  {showAsteroidsSection ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </button>
                
                {showAsteroidsSection && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[10px] text-muted-foreground italic mb-2">
                      Ceres, Pallas, Juno, Vesta (enter from astro.com)
                    </p>
                    {ASTEROIDS.map(planet => renderPlanetRow(planet))}
                  </div>
                )}
              </div>

              {/* TNOs Section (Collapsible) */}
              <div className="border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowTNOsSection(!showTNOsSection)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Trans-Neptunian Objects
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    ({TNOS.filter(p => formData.planets[p]?.sign).length}/{TNOS.length} filled)
                  </span>
                  {showTNOsSection ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </button>
                
                {showTNOsSection && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[10px] text-muted-foreground italic mb-2">
                      Eris, Sedna, Makemake, Haumea, Quaoar, Orcus, Ixion, Varuna (enter from astro.com)
                    </p>
                    {TNOS.map(planet => renderPlanetRow(planet))}
                  </div>
                )}
              </div>

              {/* Houses Section */}
              <div className="border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowHousesSection(!showHousesSection)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    House Cusps (Optional)
                  </h3>
                  {showHousesSection ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </button>
                 <p className="text-[10px] text-muted-foreground italic mt-2">
                   If blank, we auto-fill a baseline using Equal Houses from your Ascendant (then you can overwrite with Astro.com).
                 </p>
                
                {showHousesSection && (
                  <div className="mt-4 space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {HOUSE_LABELS.map(({ num, label, description }) => (
                      <div key={num} className="grid grid-cols-[120px_1fr_70px_70px] gap-2 items-center">
                        <div className="text-sm">
                          <span className="text-foreground">{label}</span>
                          <span className="text-[10px] text-muted-foreground block">{description}</span>
                        </div>
                        <select
                          value={formData.houseCusps[`house${num}`]?.sign || ''}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            houseCusps: {
                              ...prev.houseCusps,
                              [`house${num}`]: { ...prev.houseCusps[`house${num}`], sign: e.target.value }
                            }
                          }))}
                          className="border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="">Select Sign</option>
                          {ZODIAC_SIGNS.map(sign => (
                            <option key={sign} value={sign}>{sign}</option>
                          ))}
                        </select>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="29"
                            placeholder="0"
                            value={formData.houseCusps[`house${num}`]?.degree ?? ''}
                            onChange={e => setFormData(prev => ({
                              ...prev,
                              houseCusps: {
                                ...prev.houseCusps,
                                [`house${num}`]: { ...prev.houseCusps[`house${num}`], degree: Number(e.target.value) }
                              }
                            }))}
                            className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">°</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="0"
                            value={formData.houseCusps[`house${num}`]?.minutes ?? ''}
                            onChange={e => setFormData(prev => ({
                              ...prev,
                              houseCusps: {
                                ...prev.houseCusps,
                                [`house${num}`]: { ...prev.houseCusps[`house${num}`], minutes: Number(e.target.value) }
                              }
                            }))}
                            className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">′</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Intercepted Signs */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                        Intercepted Signs
                      </label>
                      <p className="text-[10px] text-muted-foreground italic mb-2">
                        Select any signs that are fully contained within a house (not on any cusp).
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ZODIAC_SIGNS.map(sign => (
                          <label key={sign} className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.interceptedSigns.includes(sign)}
                              onChange={e => {
                                setFormData(prev => ({
                                  ...prev,
                                  interceptedSigns: e.target.checked
                                    ? [...prev.interceptedSigns, sign]
                                    : prev.interceptedSigns.filter(s => s !== sign)
                                }));
                              }}
                              className="rounded border-border"
                            />
                            {sign}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleClose}
                  className="border border-primary bg-primary px-5 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Narrative Viewer Modal */}
      {viewingChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={() => setViewingChart(null)}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-sm bg-background shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="font-serif text-2xl font-light text-foreground">
                Natal Chart Analysis
              </h2>
              <button onClick={() => setViewingChart(null)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <NatalChartNarrative 
              natalChart={viewingChart} 
              currentDate={new Date()}
            />
          </div>
        </div>
      )}
    </div>
  );
};