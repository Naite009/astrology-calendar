import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Users, RefreshCw, Check, Eye, ChevronDown, ChevronUp, ClipboardPaste, Upload, Image, Loader2, Download, CloudOff, Cloud, LogIn, LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NatalChart, NatalPlanetPosition, HouseCusp, ProgressedChart, TransitChart, ProgressedPosition, ProfilePronouns } from '@/hooks/useNatalChart';
import { getPlanetSymbol } from '@/lib/astrology';
import { calculateNatalFromInputAsync, toStoredPosition, toStoredCusp } from '@/lib/natalChartCalculation';
import { storedMetadataFromPlace, type BirthInput, type DstFold, type StoredPlaceMetadata } from '@/lib/birthDataNormalization';
import { parseAstroComHeader, parseSourceCoordinates, stripCoordinateText, isRicherPlaceText, type AstroHeader } from '@/lib/geo/sourcePlace';
import { circularSeparation, signPositionToLongitude } from '@/lib/ephemerisEngine';
import { NatalChartNarrative } from './NatalChartNarrative';
import { ChartVerificationPanel } from './ChartVerificationPanel';
import type { VerifyPosition } from '@/lib/chartEphemerisVerify';
import { toast } from 'sonner';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Grouped planets for organized display
const CORE_PLANETS = ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
const POINTS = ['NorthNode', 'SouthNode', 'Chiron', 'Lilith', 'PartOfFortune', 'Vertex'] as const;
const GODDESS_ASTEROIDS = ['Ceres', 'Pallas', 'Juno', 'Vesta'] as const;
const ASTEROIDS = ['Psyche', 'Eros', 'Amor', 'Hygiea', 'Nessus', 'Pholus', 'Chariklo'] as const;
const TNOS = ['Eris', 'Sedna', 'Makemake', 'Haumea', 'Quaoar', 'Orcus', 'Ixion', 'Varuna', 'Gonggong', 'Salacia'] as const;

// All planets combined for data structure
const PLANETS = [...CORE_PLANETS, ...POINTS, ...GODDESS_ASTEROIDS, ...ASTEROIDS, ...TNOS] as const;

const PLANET_LABELS: Record<string, string> = {
  NorthNode: 'North Node',
  SouthNode: 'South Node',
  Lilith: 'Black ☽ Lilith',
  Ceres: 'Ceres (Goddess)',
  Pallas: 'Pallas (Goddess)',
  Juno: 'Juno (Goddess)',
  Vesta: 'Vesta (Goddess)',
  Psyche: 'Psyche',
  Eros: 'Eros',
  Amor: 'Amor',
  Hygiea: 'Hygiea',
  Nessus: 'Nessus',
  Pholus: 'Pholus',
  Chariklo: 'Chariklo',
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
  Gonggong: 'Gonggong',
  Salacia: 'Salacia',
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
  Psyche: 'Ψ',
  Eros: '♡',
  Amor: '❤',
  Hygiea: '⚕',
  Nessus: '⬡',
  Pholus: '⌖',
  Chariklo: '⟡',
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
  Gonggong: '🝻',
  Salacia: '🝼',
};


// Planet name aliases for parsing astro.com data
const PLANET_ALIASES: Record<string, string> = {
  'sun': 'Sun', 'moon': 'Moon', 'asc': 'Ascendant', 'ascendant': 'Ascendant', 'ac': 'Ascendant',
  'mercury': 'Mercury', 'venus': 'Venus', 'mars': 'Mars', 'jupiter': 'Jupiter', 'saturn': 'Saturn',
  'uranus': 'Uranus', 'neptune': 'Neptune', 'pluto': 'Pluto',
  'north node': 'NorthNode', 'northnode': 'NorthNode', 'nn': 'NorthNode', 'true node': 'NorthNode', 'mean node': 'NorthNode',
  'south node': 'SouthNode', 'southnode': 'SouthNode', 'sn': 'SouthNode',
  'chiron': 'Chiron', 'lilith': 'Lilith', 'black moon lilith': 'Lilith', 'mean lilith': 'Lilith',
  'ceres': 'Ceres', 'pallas': 'Pallas', 'juno': 'Juno', 'vesta': 'Vesta',
  'psyche': 'Psyche', 'eros': 'Eros', 'amor': 'Amor', 'hygiea': 'Hygiea', 'hygeia': 'Hygiea',
  'nessus': 'Nessus', 'pholus': 'Pholus', 'chariklo': 'Chariklo',
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

/**
 * Which definitions a pasted table declares for the bodies that have more
 * than one. Astro.com prints "True Node" or "Mean Node" and "Lilith" (mean)
 * or "osc. Lilith"; comparing a mean node against the app's true node without
 * recording that is a 1.75 degree error that looks like a bad import.
 */
const detectImportVariants = (text: string): { node?: 'true' | 'mean'; lilith?: 'mean' | 'true' } => {
  const t = text.toLowerCase();
  const out: { node?: 'true' | 'mean'; lilith?: 'mean' | 'true' } = {};
  if (/\bmean\s+node\b/.test(t)) out.node = 'mean';
  else if (/\btrue\s+node\b/.test(t)) out.node = 'true';
  if (/\b(osc\.?|osculating|true)\s+(black\s+moon\s+)?lilith\b/.test(t)) out.lilith = 'true';
  else if (/\blilith\b/.test(t)) out.lilith = 'mean';
  return out;
};

// Parse astro.com text format
const parseAstroComData = (text: string): Partial<Record<string, NatalPlanetPosition>> => {
  const results: Partial<Record<string, NatalPlanetPosition>> = {};
  
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
    
    // Motion marker. Only an explicit "(R)", "℞", "Rx" or a standalone "R"
    // token marks the body retrograde. When no marker is printed the field is
    // left undefined: the source may simply not print motion for that body
    // (Astro.com omits it on some node rows), so absence is not evidence of
    // direct motion and the verifier never flags it.
    const hasMarker = /\(r\)|℞|\brx\b|(?:^|[\s,;])r(?=$|[\s,;])/i.test(line);
    
    if (foundPlanet && foundSign && degree >= 0 && degree < 30) {
      results[foundPlanet] = {
        sign: foundSign,
        degree,
        minutes,
        seconds: 0,
        ...(hasMarker ? { isRetrograde: true } : {}),
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

interface CloudBackupState {
  isLoading: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  cloudChartCount: number;
  hasCloudData: boolean;
  isAuthenticated: boolean;
  user?: { id: string; email?: string } | null;
  deviceId: string;
  syncNow: () => Promise<void>;
  restoreFromCloud: () => Promise<boolean>;
  deleteFromCloud: (chartId: string) => Promise<void>;
  exportAllCharts: () => string;
  importFromJson: (jsonString: string) => { success: boolean; count: number; error?: string };
}

interface ChartLibraryProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  onSaveUserChart: (chart: NatalChart) => void;
  onAddChart: (chart: NatalChart) => NatalChart;
  onUpdateChart: (id: string, chart: Partial<NatalChart>) => void;
  onDeleteChart: (id: string) => void;
  cloudBackup?: CloudBackupState;
}

interface ChartFormData {
  name: string;
  /** Local civil date at the birthplace, YYYY-MM-DD. */
  birthDate: string;
  /** Local civil time at the birthplace, HH:MM or HH:MM:SS. */
  birthTime: string;
  birthLocation: string;
  /** Legacy whole-hour offset kept for old records; display only, never used to calculate. */
  timezoneOffset?: number;
  /** Resolved birthplace metadata (IANA zone + precise coordinates). */
  timezoneId?: string;
  latitude?: number;
  longitude?: number;
  placeName?: string;
  placeConfidence?: NatalChart['placeConfidence'];
  placeSource?: NatalChart['placeSource'];
  /** Coordinates printed by the imported source; authoritative when present. */
  sourceLatitude?: number;
  sourceLongitude?: number;
  sourceCoordinatesText?: string;
  /** Universal time printed by the source (HH:MM), for the zone cross-check. */
  sourceUniversalTime?: string;
  /** Which reading applies when the birth time fell inside a fall-back overlap. */
  dstFold?: DstFold;
  houseSystem?: NatalChart['houseSystem'];
  nodeVariant?: NatalChart['nodeVariant'];
  chartImageBase64?: string;
  pronouns?: ProfilePronouns;
  planets: Record<string, NatalPlanetPosition>;
  houseCusps: Record<string, HouseCusp>;
  interceptedSigns: string[];
  progressions?: ProgressedChart;
  transits?: TransitChart;
  progressionDate?: string;
}

/** The birth-related slice of the form, in the shape every calculator takes. */
const birthInputFromForm = (f: ChartFormData): BirthInput => ({
  birthDate: f.birthDate,
  birthTime: f.birthTime || null,
  birthLocation: f.birthLocation || null,
  timezoneId: f.timezoneId,
  latitude: f.latitude,
  longitude: f.longitude,
  placeName: f.placeName,
  placeConfidence: f.placeConfidence,
  placeSource: f.placeSource,
  sourceLatitude: f.sourceLatitude,
  sourceLongitude: f.sourceLongitude,
  sourceCoordinatesText: f.sourceCoordinatesText,
  sourceUniversalTime: f.sourceUniversalTime,
  dstFold: f.dstFold,
  timezoneOffset: f.timezoneOffset,
  houseSystem: f.houseSystem,
  nodeVariant: f.nodeVariant,
});

/**
 * Merge what an imported header says about when/where into the form.
 *
 *   - Empty fields are filled.
 *   - A birthplace with MORE qualifiers than the current text replaces it
 *     ("Franklin (Sussex County), NJ (US)" over "Franklin"), and any stored
 *     coordinates for the old text are dropped so they cannot win.
 *   - Printed coordinates and universal time are always recorded; printed
 *     coordinates are authoritative for every calculation.
 */
const applyImportedHeader = (prev: ChartFormData, header: AstroHeader): ChartFormData => {
  const next: ChartFormData = { ...prev };
  if (header.name && !prev.name) next.name = header.name;
  if (header.birthDate && !prev.birthDate) next.birthDate = header.birthDate;
  if (header.birthTime && !prev.birthTime) next.birthTime = header.birthTime;
  // Only the systems the engine calculates; Koch/Regiomontanus/Campanus fall through as "not read".
  if (header.houseSystem && !prev.houseSystem &&
      (header.houseSystem === 'placidus' || header.houseSystem === 'whole-sign' || header.houseSystem === 'equal' || header.houseSystem === 'porphyry')) {
    next.houseSystem = header.houseSystem;
  }

  if (header.placeText && (!prev.birthLocation || isRicherPlaceText(header.placeText, prev.birthLocation))) {
    next.birthLocation = header.placeText;
    next.timezoneId = undefined;
    next.latitude = undefined;
    next.longitude = undefined;
    next.placeName = undefined;
    next.placeConfidence = undefined;
    next.placeSource = undefined;
    next.dstFold = undefined;
  }
  if (header.coordinates) {
    next.sourceLatitude = header.coordinates.latitude;
    next.sourceLongitude = header.coordinates.longitude;
    next.sourceCoordinatesText = header.coordinates.text;
    // Stored lookup results for the town name must not compete with the
    // source's own coordinates.
    next.timezoneId = undefined;
    next.latitude = undefined;
    next.longitude = undefined;
    next.placeName = undefined;
    next.placeConfidence = undefined;
    next.placeSource = undefined;
  }
  if (header.universalTime) next.sourceUniversalTime = header.universalTime;
  return next;
};

/** A pending offer to replace values the user typed or imported with calculated ones. */
interface ReplaceOffer {
  planets: Record<string, NatalPlanetPosition>;
  houseCusps: Record<string, HouseCusp>;
  details: string[];
}

const emptyForm = (): ChartFormData => ({
  name: '',
  birthDate: '',
  birthTime: '',
  birthLocation: '',
  planets: emptyPlanets(),
  houseCusps: emptyHouseCusps(),
  interceptedSigns: [],
});

const formFromChart = (chart: NatalChart): ChartFormData => ({
  name: chart.name,
  birthDate: chart.birthDate,
  birthTime: chart.birthTime,
  birthLocation: chart.birthLocation,
  timezoneOffset: chart.timezoneOffset,
  timezoneId: chart.timezoneId,
  latitude: chart.latitude,
  longitude: chart.longitude,
  placeName: chart.placeName,
  placeConfidence: chart.placeConfidence,
  placeSource: chart.placeSource,
  sourceLatitude: chart.sourceLatitude,
  sourceLongitude: chart.sourceLongitude,
  sourceCoordinatesText: chart.sourceCoordinatesText,
  sourceUniversalTime: chart.sourceUniversalTime,
  dstFold: chart.dstFold,
  houseSystem: chart.houseSystem,
  nodeVariant: chart.nodeVariant,
  chartImageBase64: chart.chartImageBase64,
  pronouns: chart.pronouns,
  // Merge stored planets with emptyPlanets() so every key (including TNOs) exists.
  planets: { ...emptyPlanets(), ...(chart.planets as Record<string, NatalPlanetPosition>) },
  houseCusps: (chart.houseCusps as Record<string, HouseCusp>) || emptyHouseCusps(),
  interceptedSigns: chart.interceptedSigns || [],
  progressions: chart.progressions,
  transits: chart.transits,
  progressionDate: chart.progressionDate,
});

const positionLongitude = (p?: { sign?: string; degree?: number; minutes?: number; seconds?: number }): number | null =>
  p?.sign ? signPositionToLongitude({ sign: p.sign, degree: p.degree || 0, minutes: p.minutes || 0, seconds: p.seconds || 0 }) : null;

const fmtPos = (p: { sign: string; degree: number; minutes: number }): string =>
  `${p.sign} ${p.degree}\u00b0${String(p.minutes).padStart(2, '0')}'`;

// Preset pronoun sets surfaced in the chart edit form. Custom sets can
// still be authored by editing chart.pronouns directly.
type PronounPresetKey = "unspecified" | "she" | "he" | "they";
const PRONOUN_PRESETS: Record<PronounPresetKey, { label: string; value?: ProfilePronouns }> = {
  unspecified: { label: "Not specified", value: undefined },
  she: { label: "she / her", value: { subject: "she", object: "her", possessive: "her", reflexive: "herself" } },
  he:  { label: "he / him",  value: { subject: "he",  object: "him", possessive: "his", reflexive: "himself" } },
  they:{ label: "they / them",value:{ subject: "they",object: "them",possessive: "their",reflexive: "themself"} },
};
const pronounKeyFor = (p?: ProfilePronouns): PronounPresetKey => {
  if (!p?.subject) return "unspecified";
  const s = p.subject.toLowerCase();
  if (s === "she") return "she";
  if (s === "he")  return "he";
  return "they";
};

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

/** Auto-detect intercepted signs from house cusps.
 *  Signs that appear on zero cusps are intercepted (always in opposite pairs). */
const detectInterceptedSigns = (cusps: Record<string, HouseCusp>): string[] => {
  const cuspSigns = new Set<string>();
  for (let i = 1; i <= 12; i++) {
    const cusp = cusps[`house${i}`];
    if (cusp?.sign) cuspSigns.add(cusp.sign);
  }
  // Any sign not on a cusp is intercepted
  return ZODIAC_SIGNS.filter(s => !cuspSigns.has(s));
};

export const ChartLibrary = ({
  userNatalChart,
  savedCharts,
  onSaveUserChart,
  onAddChart,
  onUpdateChart,
  onDeleteChart,
  cloudBackup,
}: ChartLibraryProps) => {
  const navigate = useNavigate();
  const [editingChart, setEditingChart] = useState<'new' | 'user' | NatalChart | null>(null);
  const [viewingChart, setViewingChart] = useState<NatalChart | null>(null);
  const [showTransits, setShowTransits] = useState(true);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ChartFormData>(emptyForm());
  const [calculating, setCalculating] = useState(false);
  // Values the user typed or imported that disagree with the calculation.
  // They are never replaced silently; the user decides.
  const [replaceOffer, setReplaceOffer] = useState<ReplaceOffer | null>(null);
  const [showHousesSection, setShowHousesSection] = useState(false);
  const [showPointsSection, setShowPointsSection] = useState(false);
  const [showGoddessSection, setShowGoddessSection] = useState(false);
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [cardDragOver, setCardDragOver] = useState<string | null>(null); // Track which card has drag-over
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNewChartRef = useRef(false);
  // Track if form has been explicitly opened to prevent auto-save on mount
  const hasFormOpenedRef = useRef(false);
  // Track pending file to process after form opens
  const pendingFileRef = useRef<File | null>(null);
  // Auto-detect intercepted signs whenever house cusps change
  // Use a ref to track previous value and avoid infinite save loops
  const prevInterceptedRef = useRef<string>('');
  useEffect(() => {
    const hasAnyCusp = Object.values(formData.houseCusps).some((c: any) => c?.sign);
    if (!hasAnyCusp) return;
    const detected = detectInterceptedSigns(formData.houseCusps);
    const key = [...detected].sort().join(',');
    if (key === prevInterceptedRef.current) return;
    prevInterceptedRef.current = key;
    setFormData(prev => ({ ...prev, interceptedSigns: detected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.houseCusps]);

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
      setFormData(emptyForm());
    } else if (chart === 'user' && userNatalChart) {
      setFormData(formFromChart(userNatalChart));
    } else if (typeof chart === 'object') {
      setFormData(formFromChart(chart));
    }
    setReplaceOffer(null);
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

  /** Persist the resolved place (zone id + coordinates) on the record. */
  const applyPlaceMetadata = useCallback((meta: StoredPlaceMetadata) => {
    setFormData(prev => ({
      ...prev,
      timezoneId: meta.timezoneId,
      latitude: meta.latitude,
      longitude: meta.longitude,
      placeName: meta.placeName,
      placeConfidence: meta.placeConfidence,
      placeSource: meta.placeSource,
    }));
  }, []);

  /** Copy one calculated body into the form (the panel only offers this when inputs are trustworthy). */
  const applyVerifiedValue = useCallback((body: string, position: VerifyPosition, opts?: { silent?: boolean }) => {
    setFormData(prev => ({
      ...prev,
      planets: {
        ...prev.planets,
        [body]: {
          sign: position.sign,
          degree: Math.floor(position.degree || 0),
          minutes: Math.floor(position.minutes || 0),
          seconds: Math.round(position.seconds || 0),
          isRetrograde: Boolean(position.isRetrograde),
        },
      },
    }));
    if (!opts?.silent) toast.success(`${PLANET_LABELS[body] || body} set to the calculated value.`);
  }, []);

  /** Copy one calculated house cusp into the form. */
  const applyVerifiedCusp = useCallback((house: string, position: VerifyPosition, opts?: { silent?: boolean }) => {
    setFormData(prev => ({
      ...prev,
      houseCusps: {
        ...prev.houseCusps,
        [house]: {
          sign: position.sign,
          degree: Math.floor(position.degree || 0),
          minutes: Math.floor(position.minutes || 0),
        },
      },
    }));
    if (!opts?.silent) toast.success(`${house.replace('house', 'House ')} cusp set to the calculated value.`);
  }, []);


  /**
   * Calculate from birth data. Empty fields are filled straight away. Anything
   * the user typed or imported is left alone; if it disagrees with the
   * calculation, a replace offer is shown and nothing changes until they accept.
   */
  const calculateFromBirthData = async () => {
    if (!formData.birthDate || calculating) return;
    setCalculating(true);
    setReplaceOffer(null);
    try {
      const calc = await calculateNatalFromInputAsync(birthInputFromForm(formData));
      const moment = calc.moment;

      if (moment.status !== 'ok' || !moment.utc) {
        toast.error(moment.warnings[0] || 'The birth date, time or place could not be interpreted.');
        return;
      }
      if (moment.place && moment.place.source !== 'stored') {
        applyPlaceMetadata(storedMetadataFromPlace(moment.place));
      }

      const filledPlanets: Record<string, NatalPlanetPosition> = {};
      const offerPlanets: Record<string, NatalPlanetPosition> = {};
      const details: string[] = [];

      for (const [key, pos] of Object.entries(calc.positions)) {
        const stored = toStoredPosition(pos);
        const existing = formData.planets[key];
        if (!existing?.sign) {
          filledPlanets[key] = stored;
          continue;
        }
        const existingLon = positionLongitude(existing);
        if (existingLon === null) continue;
        const delta = circularSeparation(existingLon, pos.longitude);
        const tolerance = key === 'Ascendant' || key === 'Vertex' || key === 'PartOfFortune' ? 0.5 : 0.1;
        if (delta > tolerance) {
          offerPlanets[key] = stored;
          details.push(`${PLANET_LABELS[key] || key}: you have ${fmtPos(existing)}, calculated ${fmtPos(stored)}`);
        }
      }

      // House cusps: fill when empty. If the user typed an Ascendant that
      // disagrees with the calculated one by more than 2 degrees, the
      // calculated cusps would contradict it, so they are offered, not filled.
      const filledCusps: Record<string, HouseCusp> = {};
      const offerCusps: Record<string, HouseCusp> = {};
      let cuspNote: string | null = null;
      if (calc.houseCusps && calc.angles) {
        const typedAscLon = positionLongitude(formData.planets.Ascendant);
        const ascAgrees = typedAscLon === null || circularSeparation(typedAscLon, calc.angles.ascendant) <= 2;
        const hasCusps = !!formData.houseCusps?.house1?.sign;
        for (let h = 1; h <= 12; h++) {
          const key = `house${h}` as const;
          const c = calc.houseCusps[key];
          const stored = toStoredCusp(c);
          const cusp: HouseCusp = { sign: stored.sign, degree: stored.degree, minutes: stored.minutes };
          const existing = formData.houseCusps[key];
          if (!existing?.sign) {
            if (ascAgrees) filledCusps[key] = cusp;
            else offerCusps[key] = cusp;
            continue;
          }
          const existingLon = positionLongitude(existing);
          if (existingLon !== null && circularSeparation(existingLon, c.longitude) > 0.1) {
            offerCusps[key] = cusp;
          }
        }
        if (!ascAgrees && !hasCusps) {
          cuspNote = `Your typed Ascendant is more than 2\u00b0 from the calculated one, so house cusps were not filled automatically.`;
        }
        if (Object.keys(offerCusps).length && hasCusps) {
          details.push(`${Object.keys(offerCusps).length} house cusp${Object.keys(offerCusps).length === 1 ? '' : 's'} differ from the ${calc.settings.houseSystem} calculation`);
        }
      }

      const filledCount = Object.keys(filledPlanets).length + (Object.keys(filledCusps).length ? 1 : 0);
      setFormData(prev => ({
        ...prev,
        planets: { ...prev.planets, ...filledPlanets },
        houseCusps: { ...prev.houseCusps, ...filledCusps },
        houseSystem: prev.houseSystem || calc.settings.houseSystem,
        nodeVariant: prev.nodeVariant || calc.settings.nodeVariant,
      }));

      if (Object.keys(offerPlanets).length || Object.keys(offerCusps).length) {
        setReplaceOffer({ planets: offerPlanets, houseCusps: offerCusps, details: cuspNote ? [cuspNote, ...details] : details });
      }

      const unavailable = calc.unavailable.filter(u => !['SouthNode'].includes(u.key));
      if (filledCount > 0) {
        toast.success(`Filled ${Object.keys(filledPlanets).length} position${Object.keys(filledPlanets).length === 1 ? '' : 's'}${Object.keys(filledCusps).length ? ' and the house cusps' : ''} from the ephemeris.`);
      } else if (!Object.keys(offerPlanets).length && !Object.keys(offerCusps).length) {
        toast.success('Everything already matches the ephemeris.');
      }
      if (calc.anglesReason) toast.info(calc.anglesReason);
      if (unavailable.length) {
        toast.info(`Not calculated: ${unavailable.map(u => PLANET_LABELS[u.key] || u.key).join(', ')}. ${unavailable[0].reason}`);
      }
    } catch (err) {
      console.error('[ChartLibrary] calculateFromBirthData failed', err);
      toast.error('The calculation could not be completed. Check the birth date, time and place.');
    } finally {
      setCalculating(false);
    }
  };

  const acceptReplaceOffer = () => {
    if (!replaceOffer) return;
    setFormData(prev => ({
      ...prev,
      planets: { ...prev.planets, ...replaceOffer.planets },
      houseCusps: { ...prev.houseCusps, ...replaceOffer.houseCusps },
    }));
    const n = Object.keys(replaceOffer.planets).length + Object.keys(replaceOffer.houseCusps).length;
    toast.success(`Replaced ${n} value${n === 1 ? '' : 's'} with the calculated ones.`);
    setReplaceOffer(null);
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
    const variants = detectImportVariants(importText);
    // The header line (name, date, time, full place, printed coordinates,
    // universal time, house system) is as important as the planet rows.
    const header = parseAstroComHeader(importText);
    const headerHasData = !!(header.birthDate || header.birthTime || header.placeText || header.coordinates || header.universalTime || header.name);
    
    if (parsedCount > 0 || headerHasData) {
      setFormData(prev => {
        const withHeader = applyImportedHeader(prev, header);
        return {
          ...withHeader,
          planets: {
            ...withHeader.planets,
            ...parsed,
          },
          // Keep the source's node definition with the numbers so verification
          // compares like with like.
          nodeVariant: variants.node ?? withHeader.nodeVariant,
        };
      });
      setImportResult({ success: parsedCount, total: parsedCount });
      if (header.coordinates) {
        toast(`Using the coordinates printed in the source (${header.coordinates.text}) for the birthplace.`);
      }
      if (variants.node === 'mean') {
        toast('This table lists the Mean Node. It was saved as mean node so the check compares the same definition.');
      }
      if (variants.lilith === 'true' && parsed.Lilith) {
        toast.warning('This table lists the true (osculating) Lilith. The app calculates mean Lilith, so the verification row for Lilith can differ by several degrees; that is a definition difference, not an error.');
      }
    } else {
      setImportResult({ success: 0, total: 0 });
    }
  };

  const processUploadedFile = async (
    file: File,
    options?: {
      overwriteExisting?: boolean;
    }
  ) => {
    const overwriteExisting = options?.overwriteExisting === true;

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
      const fileBase64 = await base64Promise;

      setImageImportStatus('parsing');

      // Determine file type and call appropriate handler
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      // Check if it's a PDF or document
      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
      const isWord = fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc');
      const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|heic|heif)$/i.test(fileName);

      // Call the backend function with file info
      const { data, error } = await supabase.functions.invoke('parse-chart-image', {
        body: {
          imageBase64: fileBase64,
          fileType: isPDF ? 'pdf' : isWord ? 'word' : 'image',
          fileName: file.name,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to parse file');
      }

      if (!data?.data) {
        throw new Error('No chart data found in file. Try a clearer document or screenshot showing the planet positions.');
      }

      const parsedData = data.data;
      let planetsImported = 0;
      let housesImported = 0;

      // Extract birth info if available. Everything the source printed about
      // the place is kept: the full qualified place text, printed coordinates
      // and universal time. Coordinates in any of the text fields are lifted
      // out so a "Franklin, NJ, 74w35 41n07" never becomes a name-only lookup.
      const birthInfo = parsedData.birthInfo;
      const birthInfoUpdates: Partial<ChartFormData> = {};

      if (birthInfo) {
        if (birthInfo.name && typeof birthInfo.name === 'string') {
          birthInfoUpdates.name = birthInfo.name;
        }
        if (birthInfo.birthDate && typeof birthInfo.birthDate === 'string') {
          // Validate date format (YYYY-MM-DD)
          if (/^\d{4}-\d{2}-\d{2}$/.test(birthInfo.birthDate)) {
            birthInfoUpdates.birthDate = birthInfo.birthDate;
          }
        }
        if (birthInfo.birthTime && typeof birthInfo.birthTime === 'string') {
          // Validate time format (HH:MM)
          if (/^\d{1,2}:\d{2}$/.test(birthInfo.birthTime)) {
            birthInfoUpdates.birthTime = birthInfo.birthTime;
          }
        }
        const placeText = typeof birthInfo.birthLocation === 'string' ? birthInfo.birthLocation.trim() : '';
        const coordText = typeof birthInfo.coordinates === 'string' ? birthInfo.coordinates : '';
        const numericCoords =
          typeof birthInfo.latitude === 'number' && typeof birthInfo.longitude === 'number' &&
          Number.isFinite(birthInfo.latitude) && Number.isFinite(birthInfo.longitude) &&
          Math.abs(birthInfo.latitude) <= 90 && Math.abs(birthInfo.longitude) <= 180
            ? { latitude: birthInfo.latitude as number, longitude: birthInfo.longitude as number, text: `${birthInfo.latitude}, ${birthInfo.longitude}` }
            : null;
        const printed = parseSourceCoordinates(coordText) || parseSourceCoordinates(placeText) || numericCoords;
        if (placeText) {
          // Keep every qualifier the source printed; only lift coordinates out.
          birthInfoUpdates.birthLocation = stripCoordinateText(placeText) || placeText;
        }
        if (printed) {
          birthInfoUpdates.sourceLatitude = printed.latitude;
          birthInfoUpdates.sourceLongitude = printed.longitude;
          birthInfoUpdates.sourceCoordinatesText = printed.text;
        }
        if (typeof birthInfo.universalTime === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(birthInfo.universalTime.trim())) {
          birthInfoUpdates.sourceUniversalTime = birthInfo.universalTime.trim();
        }
        if (typeof birthInfo.houseSystem === 'string') {
          const hs = birthInfo.houseSystem.toLowerCase().replace(/\s+/g, '-');
          if (hs === 'placidus' || hs === 'whole-sign' || hs === 'equal' || hs === 'porphyry') birthInfoUpdates.houseSystem = hs;
        }
      }

      // Import planets
      if (parsedData.planets && typeof parsedData.planets === 'object') {
        const validPlanets: Record<string, NatalPlanetPosition> = {};
        let newPlanetsAdded = 0;
        let planetsSkipped = 0;

        for (const [planet, position] of Object.entries(parsedData.planets)) {
          const pos = position as any;
          if (pos?.sign && ZODIAC_SIGNS.includes(pos.sign)) {
            const existingPlanet = formData.planets[planet];
            const hasExistingData = existingPlanet?.sign && existingPlanet.sign !== '';

            if (hasExistingData && !overwriteExisting) {
              planetsSkipped++;
              console.log(`[Import] Skipping ${planet} - already has data (${existingPlanet.degree}° ${existingPlanet.sign})`);
            } else {
              validPlanets[planet] = {
                sign: pos.sign,
                degree: Math.min(29, Math.max(0, parseInt(pos.degree) || 0)),
                minutes: Math.min(59, Math.max(0, parseInt(pos.minutes) || 0)),
                seconds: 0,
                // Only an explicit marker read from the image counts; a missing
                // marker is unknown motion, not direct motion.
                ...(pos.isRetrograde === true ? { isRetrograde: true } : {}),
              };
              newPlanetsAdded++;
              planetsImported++;
              console.log(`[Import] ${overwriteExisting ? 'Overwriting' : 'Adding'} ${planet}: ${pos.degree}° ${pos.sign}`);
            }
          }
        }

        if (newPlanetsAdded > 0 || Object.keys(birthInfoUpdates).length > 0) {
          setFormData(prev => ({
            ...prev,
            // Only update birth info if fields are empty
            name: birthInfoUpdates.name && !prev.name ? birthInfoUpdates.name : prev.name,
            birthDate: birthInfoUpdates.birthDate && !prev.birthDate ? birthInfoUpdates.birthDate : prev.birthDate,
            birthTime: birthInfoUpdates.birthTime && !prev.birthTime ? birthInfoUpdates.birthTime : prev.birthTime,
            birthLocation: birthInfoUpdates.birthLocation && !prev.birthLocation ? birthInfoUpdates.birthLocation : prev.birthLocation,
            chartImageBase64: isImage ? fileBase64 : prev.chartImageBase64,
            planets: {
              ...prev.planets,
              ...validPlanets,
            },
          }));

          if (planetsSkipped > 0) {
            toast.info(`Added ${newPlanetsAdded} new positions, kept ${planetsSkipped} existing positions unchanged.`);
          } else if (overwriteExisting && newPlanetsAdded > 0) {
            toast.info(`Updated ${newPlanetsAdded} planet positions from the uploaded chart.`);
          }
        } else if (isImage) {
          setFormData(prev => ({
            ...prev,
            chartImageBase64: fileBase64,
          }));
        }
      } else if (Object.keys(birthInfoUpdates).length > 0) {
        // Even if no planets found, still update birth info if we have it (only empty fields)
        setFormData(prev => ({
          ...prev,
          name: birthInfoUpdates.name && !prev.name ? birthInfoUpdates.name : prev.name,
          birthDate: birthInfoUpdates.birthDate && !prev.birthDate ? birthInfoUpdates.birthDate : prev.birthDate,
          birthTime: birthInfoUpdates.birthTime && !prev.birthTime ? birthInfoUpdates.birthTime : prev.birthTime,
          birthLocation: birthInfoUpdates.birthLocation && !prev.birthLocation ? birthInfoUpdates.birthLocation : prev.birthLocation,
          chartImageBase64: isImage ? fileBase64 : prev.chartImageBase64,
        }));
      }

      // Import house cusps
      if (parsedData.houseCusps && typeof parsedData.houseCusps === 'object') {
        const validCusps: Record<string, HouseCusp> = {};
        let housesSkipped = 0;

        for (const [house, cusp] of Object.entries(parsedData.houseCusps)) {
          const c = cusp as any;
          if (c?.sign && ZODIAC_SIGNS.includes(c.sign)) {
            const existingCusp = formData.houseCusps[house];
            const hasExistingData = existingCusp?.sign && existingCusp.sign !== '';

            if (hasExistingData && !overwriteExisting) {
              housesSkipped++;
              continue;
            }

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

          if (overwriteExisting) {
            toast.info(`Updated ${housesImported} house cusps from the uploaded chart.`);
          } else if (housesSkipped > 0) {
            toast.info(`Added ${housesImported} house cusps, kept ${housesSkipped} existing cusps unchanged.`);
          }
        }
      }

      // Import progressions (AC pr, MC pr, progressed planets)
      let progressionsImported = 0;
      if (parsedData.progressions && typeof parsedData.progressions === 'object') {
        const validProgressions: ProgressedChart = {};
        
        for (const [key, position] of Object.entries(parsedData.progressions)) {
          const pos = position as any;
          if (pos?.sign && ZODIAC_SIGNS.includes(pos.sign)) {
            validProgressions[key as keyof ProgressedChart] = {
              sign: pos.sign,
              degree: Math.min(29, Math.max(0, parseInt(pos.degree) || 0)),
              minutes: Math.min(59, Math.max(0, parseInt(pos.minutes) || 0)),
            };
            progressionsImported++;
            console.log(`[Import] Progression ${key}: ${pos.degree}° ${pos.sign}`);
          }
        }

        if (progressionsImported > 0) {
          setFormData(prev => ({
            ...prev,
            progressions: {
              ...prev.progressions,
              ...validProgressions,
            },
            // Also capture the progression date if available
            progressionDate: parsedData.birthInfo?.progressionDate || prev.progressionDate,
          }));
          toast.info(`Imported ${progressionsImported} progressed positions (including AC pr/MC pr).`);
        }
      }

      // Import transits
      let transitsImported = 0;
      if (parsedData.transits && typeof parsedData.transits === 'object') {
        const validTransits: TransitChart = {};
        
        for (const [planet, position] of Object.entries(parsedData.transits)) {
          const pos = position as any;
          if (pos?.sign && ZODIAC_SIGNS.includes(pos.sign)) {
            validTransits[planet as keyof TransitChart] = {
              sign: pos.sign,
              degree: Math.min(29, Math.max(0, parseInt(pos.degree) || 0)),
              minutes: Math.min(59, Math.max(0, parseInt(pos.minutes) || 0)),
            };
            transitsImported++;
            console.log(`[Import] Transit ${planet}: ${pos.degree}° ${pos.sign}`);
          }
        }

        if (transitsImported > 0) {
          setFormData(prev => ({
            ...prev,
            transits: {
              ...prev.transits,
              ...validTransits,
            },
          }));
          toast.info(`Imported ${transitsImported} transit positions.`);
        }
      }

      if (planetsImported === 0 && housesImported === 0 && progressionsImported === 0 && transitsImported === 0) {
        throw new Error('Could not extract any positions. Try a file with clear tables (planet positions / house cusps / progressions) visible.');
      }

      setImageImportResult({ planets: planetsImported, houses: housesImported });
      setImageImportStatus('success');
    } catch (err) {
      console.error('File import error:', err);
      setImageImportError(err instanceof Error ? err.message : 'Failed to parse file');
      setImageImportStatus('error');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await processUploadedFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await processUploadedFile(file);
  };

  // Handle drop directly on a chart card - opens that chart and processes the file
  const handleCardDragOver = (e: React.DragEvent, chartId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCardDragOver(chartId);
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCardDragOver(null);
  };

  const handleCardDrop = async (e: React.DragEvent, chartOrUser: 'user' | NatalChart) => {
    e.preventDefault();
    e.stopPropagation();
    setCardDragOver(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Store the file to process after form opens
    pendingFileRef.current = file;
    
    // Open the chart for editing
    openEditForm(chartOrUser);
    
    // Toast to let user know what's happening
    toast.info(`Parsing chart image for ${chartOrUser === 'user' ? 'your chart' : chartOrUser.name}...`);
  };

  // Process pending file when form opens
  useEffect(() => {
    if (editingChart && pendingFileRef.current) {
      const file = pendingFileRef.current;
      pendingFileRef.current = null;
      // When dropping onto a specific chart card, treat it as a re-upload intended to correct data.
      processUploadedFile(file, { overwriteExisting: true });
    }
  }, [editingChart]);

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

  // Handle JSON export
  const handleExport = () => {
    if (!cloudBackup) return;
    const jsonData = cloudBackup.exportAllCharts();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astro-charts-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Charts exported successfully');
  };

  // Handle JSON import
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !cloudBackup) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = cloudBackup.importFromJson(content);
      if (!result.success) {
        toast.error(result.error || 'Failed to import charts');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (jsonImportInputRef.current) {
      jsonImportInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cloud Sync Status Banner */}
      {cloudBackup && (
        <div className="mb-6 flex flex-col gap-3 rounded-sm border border-border bg-secondary/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {cloudBackup.isLoading ? (
                <RefreshCw size={16} className="animate-spin text-primary" />
              ) : cloudBackup.isAuthenticated ? (
                <User size={16} className="text-primary" />
              ) : cloudBackup.isSyncing ? (
                <RefreshCw size={16} className="animate-spin text-primary" />
              ) : cloudBackup.hasCloudData ? (
                <Cloud size={16} className="text-primary" />
              ) : (
                <CloudOff size={16} className="text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {cloudBackup.isLoading
                  ? 'Reconnecting to your account...'
                  : cloudBackup.isAuthenticated 
                  ? 'Signed in — charts sync across all devices'
                  : cloudBackup.isSyncing 
                    ? 'Syncing...' 
                    : cloudBackup.lastSync 
                      ? `Last synced ${cloudBackup.lastSync.toLocaleTimeString()}` 
                      : 'Not synced yet'
                }
              </span>
              {cloudBackup.cloudChartCount > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {cloudBackup.cloudChartCount} chart{cloudBackup.cloudChartCount !== 1 ? 's' : ''} backed up
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => cloudBackup.syncNow()}
                disabled={cloudBackup.isSyncing}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw size={12} />
                Sync Now
              </button>
              {cloudBackup.isLoading ? null : !cloudBackup.isAuthenticated ? (
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-1.5 border border-primary bg-primary px-3 py-1.5 text-[10px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 rounded-sm"
                >
                  <LogIn size={12} />
                  Sign In to Sync Across Devices
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const { supabase } = await import('@/integrations/supabase/client');
                    await supabase.auth.signOut();
                    toast('Signed out');
                  }}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              )}
            </div>
          </div>
          {cloudBackup.isLoading ? null : !cloudBackup.isAuthenticated ? (
            <p className="text-xs text-muted-foreground">
              Your charts are currently saved to this device only. Sign in to access them from any computer.
            </p>
          ) : cloudBackup.user?.email && (
            <p className="text-xs text-muted-foreground">
              Signed in as {cloudBackup.user.email}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="text-primary" size={28} />
          <h2 className="font-serif text-2xl font-light text-foreground">Chart Library</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Export/Import Buttons */}
          {cloudBackup && (
            <>
              <input
                ref={jsonImportInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="json-import-input"
              />
              <label
                htmlFor="json-import-input"
                className="flex items-center gap-2 border border-border bg-transparent px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-foreground cursor-pointer"
              >
                <Upload size={14} />
                Import
              </label>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 border border-border bg-transparent px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Download size={14} />
                Export
              </button>
            </>
          )}
          <button
            onClick={() => openEditForm('new')}
            className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            Add Chart
          </button>
        </div>
      </div>

      {/* Alphabetical Quick Navigation - shows when 2+ saved charts */}
      {savedCharts.length >= 2 && (() => {
        const sortedCharts = [...savedCharts].sort((a, b) => a.name.localeCompare(b.name));
        const availableLetters = Array.from(new Set(sortedCharts.map(c => c.name.charAt(0).toUpperCase()))).sort();
        return (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {availableLetters.map(letter => (
              <button
                key={letter}
                onClick={() => {
                  const el = document.getElementById(`chart-letter-${letter}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="w-7 h-7 flex items-center justify-center text-xs font-medium border border-border rounded-sm hover:border-primary hover:bg-primary/10 transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
        );
      })()}

      <div className="grid gap-4 md:grid-cols-2">
        {/* User's Personal Chart - Always First */}
        <div 
          className={`rounded-sm border-2 bg-secondary p-5 transition-all cursor-pointer ${
            cardDragOver === 'user' 
              ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
              : 'border-primary/30 hover:border-primary/50'
          }`}
          onDragOver={(e) => handleCardDragOver(e, 'user')}
          onDragLeave={handleCardDragLeave}
          onDrop={(e) => handleCardDrop(e, 'user')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
              {userNatalChart ? userNatalChart.name : 'Your Chart'}
              <span className="text-primary">★</span>
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-sm">
              Primary
            </span>
          </div>
          {cardDragOver === 'user' ? (
            <div className="flex items-center justify-center py-4 text-primary">
              <Upload size={24} className="mr-2" />
              <span className="text-sm">Drop to update chart</span>
            </div>
          ) : userNatalChart ? (
            <>
              <div className="text-sm text-foreground mb-3 space-y-0.5">
                <p>☉ {userNatalChart.planets.Sun?.degree}° {userNatalChart.planets.Sun?.sign}</p>
                <p>☽ {userNatalChart.planets.Moon?.degree}° {userNatalChart.planets.Moon?.sign}</p>
                <p>
                  ASC {(userNatalChart.houseCusps?.house1?.degree ?? userNatalChart.planets.Ascendant?.degree)}°{' '}
                  {(userNatalChart.houseCusps?.house1?.sign ?? userNatalChart.planets.Ascendant?.sign)}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2 italic">Drag chart image here to update</p>
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

        {/* Saved Charts - Alphabetically Sorted */}
        {[...savedCharts].sort((a, b) => a.name.localeCompare(b.name)).map((chart, index, sortedArr) => {
          const currentLetter = chart.name.charAt(0).toUpperCase();
          const isFirstOfLetter = index === 0 || sortedArr[index - 1].name.charAt(0).toUpperCase() !== currentLetter;
          
          return (
            <div 
              key={chart.id}
              id={isFirstOfLetter ? `chart-letter-${currentLetter}` : undefined}
              className={`rounded-sm border bg-secondary p-5 transition-all cursor-pointer ${
                cardDragOver === chart.id 
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={(e) => handleCardDragOver(e, chart.id)}
              onDragLeave={handleCardDragLeave}
              onDrop={(e) => handleCardDrop(e, chart)}
            >
              <h3 className="font-serif text-lg font-medium text-foreground mb-2">{chart.name}</h3>
              {cardDragOver === chart.id ? (
                <div className="flex items-center justify-center py-4 text-primary">
                  <Upload size={24} className="mr-2" />
                  <span className="text-sm">Drop to update chart</span>
                </div>
              ) : (
                <>
                  <div className="text-sm text-foreground mb-3 space-y-0.5">
                    {chart.planets ? (
                      <>
                        <p>☉ {chart.planets.Sun?.degree}° {chart.planets.Sun?.sign}</p>
                        <p>☽ {chart.planets.Moon?.degree}° {chart.planets.Moon?.sign}</p>
                        <p>
                          ASC {(chart.houseCusps?.house1?.degree ?? chart.planets.Ascendant?.degree)}°{' '}
                          {(chart.houseCusps?.house1?.sign ?? chart.planets.Ascendant?.sign)}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground italic">Human Design chart</p>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2 italic">Drag chart image here to update</p>
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
                </>
              )}
            </div>
          );
        })}
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
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Pronouns</label>
                  <select
                    value={pronounKeyFor(formData.pronouns)}
                    onChange={e => {
                      const key = e.target.value as PronounPresetKey;
                      setFormData({ ...formData, pronouns: PRONOUN_PRESETS[key].value });
                    }}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    {(Object.keys(PRONOUN_PRESETS) as PronounPresetKey[]).map(k => (
                      <option key={k} value={k}>{PRONOUN_PRESETS[k].label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Time (local clock time)</label>
                  <input
                    type="time"
                    step={1}
                    value={formData.birthTime}
                    // A fold decision only applies to one clock time; clear it when the time changes.
                    onChange={e => setFormData({ ...formData, birthTime: e.target.value, dstFold: undefined })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Time zone at birth</label>
                  <div className="w-full border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    {formData.timezoneId
                      ? <span className="text-foreground">{formData.timezoneId}</span>
                      : 'Found from the birthplace'}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Historical clock rules for the birthplace (including daylight saving) are applied automatically.
                  </p>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Location</label>
                  <input
                    type="text"
                    value={formData.birthLocation}
                    // New text means a new place: drop stored lookup results so
                    // they are re-resolved. Coordinates typed into the field
                    // ("Franklin, NJ 41n07 74w35") become the authoritative
                    // source coordinates; previously imported ones are kept and
                    // shown below with a way to clear them.
                    onChange={e => {
                      const text = e.target.value;
                      const typed = parseSourceCoordinates(text);
                      setFormData({
                        ...formData,
                        birthLocation: text,
                        timezoneId: undefined,
                        latitude: undefined,
                        longitude: undefined,
                        placeName: undefined,
                        placeConfidence: undefined,
                        placeSource: undefined,
                        dstFold: undefined,
                        ...(typed ? { sourceLatitude: typed.latitude, sourceLongitude: typed.longitude, sourceCoordinatesText: typed.text } : {}),
                      });
                    }}
                    placeholder="Town (County), State or Region, Country"
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  {typeof formData.sourceLatitude === 'number' && typeof formData.sourceLongitude === 'number' && (
                    <p className="text-[10px] text-muted-foreground">
                      Using the coordinates printed by the source
                      {formData.sourceCoordinatesText ? <> (<span className="text-foreground">{formData.sourceCoordinatesText}</span>)</> : ''}
                      {` = ${formData.sourceLatitude.toFixed(4)}, ${formData.sourceLongitude.toFixed(4)}`}. The town name is not looked up over them.{' '}
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => setFormData({
                          ...formData,
                          sourceLatitude: undefined,
                          sourceLongitude: undefined,
                          sourceCoordinatesText: undefined,
                          timezoneId: undefined,
                          latitude: undefined,
                          longitude: undefined,
                          placeName: undefined,
                          placeConfidence: undefined,
                          placeSource: undefined,
                        })}
                      >
                        Clear and look up the town instead
                      </button>
                    </p>
                  )}
                  {formData.placeName && (
                    <p className="text-[10px] text-muted-foreground">
                      Resolved as <span className="text-foreground">{formData.placeName}</span>
                      {typeof formData.latitude === 'number' && typeof formData.longitude === 'number'
                        ? ` (${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)})`
                        : ''}
                      {formData.placeConfidence && formData.placeConfidence !== 'high' ? `, ${formData.placeConfidence} confidence` : ''}
                      {formData.placeSource === 'confirmed' ? ', confirmed by you' : ''}
                    </p>
                  )}
                  {formData.sourceUniversalTime && (
                    <p className="text-[10px] text-muted-foreground">
                      Source printed Univ.Time <span className="text-foreground">{formData.sourceUniversalTime}</span>; the verifier checks the zone conversion against it.
                    </p>
                  )}
                </div>
              </div>

              {/* Import Chart Data Section */}
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
                    {/* Clear Data Button */}
                    <div className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Clear All Positions</p>
                        <p className="text-xs text-muted-foreground">Wipe all planet & house data so you can reimport fresh</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Clear ALL planet positions and house cusps? This cannot be undone.')) {
                            setFormData(prev => ({
                              ...prev,
                              planets: emptyPlanets(),
                              houseCusps: emptyHouseCusps(),
                            }));
                            toast.success('All positions cleared. You can now reimport your chart.');
                          }
                        }}
                        className="px-3 py-1.5 text-xs uppercase tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Drag and Drop Upload Box */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Upload size={14} className="text-primary" />
                        <span className="text-[11px] uppercase tracking-widest text-foreground font-medium">
                          Upload Chart File
                        </span>
                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">Auto-Extract</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Import only fills empty slots. Use "Clear All" above first if you want to fully replace your chart.
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="chart-file-upload"
                      />
                      
                      {/* Prominent Drag & Drop Box */}
                      <label
                        htmlFor="chart-file-upload"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          relative flex flex-col items-center justify-center w-full min-h-[160px] 
                          border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
                          ${isDragOver 
                            ? 'border-primary bg-primary/10 scale-[1.02]' 
                            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
                          }
                          ${imageImportStatus === 'uploading' || imageImportStatus === 'parsing' 
                            ? 'pointer-events-none opacity-70' 
                            : ''
                          }
                        `}
                      >
                        {imageImportStatus === 'uploading' || imageImportStatus === 'parsing' ? (
                          <div className="flex flex-col items-center gap-3 text-primary">
                            <Loader2 size={32} className="animate-spin" />
                            <span className="text-sm font-medium">
                              {imageImportStatus === 'uploading' ? 'Uploading...' : 'Reading chart data...'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 p-6">
                            <div className={`p-4 rounded-full transition-colors ${isDragOver ? 'bg-primary/20' : 'bg-muted'}`}>
                              <Upload size={28} className={`${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                {isDragOver ? 'Drop your file here' : 'Drag & drop your chart file here'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                or click to browse
                              </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">PNG</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">JPG</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">PDF</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">DOCX</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">Screenshots</span>
                            </div>
                          </div>
                        )}
                      </label>
                      
                      {/* Status Messages */}
                      {imageImportStatus === 'success' && imageImportResult && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <Check size={16} className="text-green-600" />
                          <span className="text-sm text-green-700 dark:text-green-400">
                            Successfully imported {imageImportResult.planets} planet{imageImportResult.planets !== 1 ? 's' : ''}
                            {imageImportResult.houses > 0 && ` and ${imageImportResult.houses} house cusp${imageImportResult.houses !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      )}
                      
                      {imageImportStatus === 'error' && imageImportError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                          <X size={16} className="text-destructive" />
                          <span className="text-sm text-destructive">{imageImportError}</span>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-muted-foreground italic text-center">
                        AI will automatically extract planet positions from your astrology chart document or screenshot
                      </p>
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
                    <button
                      onClick={calculateFromBirthData}
                      disabled={!formData.birthDate || calculating}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {calculating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      {calculating ? 'Calculating' : 'Calculate from birth data'}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic mb-3">
                  "Calculate" fills every empty position (planets, points, Ascendant and houses when the birthplace is a
                  recognized town) from the birth date, local time and place. Values you typed or imported are never replaced
                  without asking. ℞ indicates retrograde.
                </p>

                {replaceOffer && (
                  <div className="mb-4 rounded-sm border border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-amber-700">Some entered values differ from the calculation</p>
                    <ul className="text-[11px] text-muted-foreground list-disc pl-5 space-y-0.5">
                      {replaceOffer.details.slice(0, 8).map((d, i) => <li key={i}>{d}</li>)}
                      {replaceOffer.details.length > 8 && <li>and {replaceOffer.details.length - 8} more</li>}
                    </ul>
                    <p className="text-[11px] text-muted-foreground">
                      Your values are kept as they are. If the birth time and place above are right, the calculated values are
                      usually the accurate ones; if the source chart is what you trust, keep yours.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={acceptReplaceOffer}
                        className="text-[10px] uppercase tracking-widest border border-primary text-primary px-3 py-1 hover:bg-primary/10"
                      >
                        Replace with calculated values
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplaceOffer(null)}
                        className="text-[10px] uppercase tracking-widest border border-border text-muted-foreground px-3 py-1 hover:bg-muted"
                      >
                        Keep mine
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4 rounded-sm border border-primary/20 bg-primary/5 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">You only need the basics</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Enter the 10 core planets, the Ascendant, the house cusps, North Node and Chiron. On save, everything else
                    (South Node, Lilith, Ceres, Pallas, Juno, Vesta, Eris, Vertex, Part of Fortune, and house cusps if you skip them)
                    is calculated from the birth date, local time and place, so every tab and report stays complete. Anything you type in
                    by hand is always kept exactly as entered.
                  </p>
                </div>

                {formData.birthDate && (
                  <div className="mb-4">
                    <ChartVerificationPanel
                      birth={birthInputFromForm(formData)}
                      planets={formData.planets}
                      houseCusps={formData.houseCusps}
                      onApplyValue={applyVerifiedValue}
                      onApplyCusp={applyVerifiedCusp}
                      onPlaceResolved={applyPlaceMetadata}
                      onChooseFold={(fold) => setFormData(prev => ({ ...prev, dstFold: fold }))}
                      onSuggestTime={(time) => setFormData(prev => ({ ...prev, birthTime: time, dstFold: undefined }))}
                    />
                  </div>
                )}

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

              {/* Goddess Asteroids Section (Collapsible) */}
              <div className="border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowGoddessSection(!showGoddessSection)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Goddess Asteroids
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    ({GODDESS_ASTEROIDS.filter(p => formData.planets[p]?.sign).length}/{GODDESS_ASTEROIDS.length} filled)
                  </span>
                  {showGoddessSection ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </button>
                
                {showGoddessSection && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[10px] text-muted-foreground italic mb-2">
                      Ceres, Pallas, Juno, Vesta — the feminine archetypes
                    </p>
                    {GODDESS_ASTEROIDS.map(planet => renderPlanetRow(planet))}
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
                      Psyche, Eros, Amor, Hygiea, Nessus, Pholus, Chariklo — deeper psychological & karmic layers
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
                    
                    {/* Intercepted Signs - Auto-detected */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                        Intercepted Signs
                      </label>
                      {formData.interceptedSigns.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {formData.interceptedSigns.map(sign => (
                              <span key={sign} className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-medium">
                                {sign}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground italic">
                            Auto-detected from house cusps — {formData.interceptedSigns.length === 2 
                              ? `${formData.interceptedSigns[0]}/${formData.interceptedSigns[1]} axis is intercepted`
                              : 'these signs appear on no house cusp'}. 
                            Doubled signs: {ZODIAC_SIGNS.filter(s => {
                              let count = 0;
                              for (let i = 1; i <= 12; i++) {
                                if (formData.houseCusps[`house${i}`]?.sign === s) count++;
                              }
                              return count >= 2;
                            }).join(', ') || 'none'}.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic">
                          {Object.values(formData.houseCusps).some((c: any) => c?.sign)
                            ? 'No intercepted signs detected — each sign appears on a house cusp.'
                            : 'Enter house cusps above to auto-detect interceptions.'}
                        </p>
                      )}
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