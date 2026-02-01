import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, FileImage, Loader2, UserCheck, Edit3 } from 'lucide-react';
import { 
  calculateHumanDesignChart,
  calculateDefinedChannels,
  calculateDefinedCenters,
  calculateDefinitionType,
  determineType,
  determineAuthority,
  determineStrategy
} from '@/lib/humanDesignCalculator';
import { HumanDesignChart, HDPlanetaryActivation, HDGateActivation } from '@/types/humanDesign';
import { getTimezoneInfoForDate, lookupTimezone } from '@/lib/timezoneUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserData } from '@/hooks/useUserData';
import { namesMatch } from '@/lib/nameMatching';
import { HDGateEditor } from './HDGateEditor';
import { BirthMomentPreview } from './BirthMomentPreview';
import { IncarnationCrossCombobox } from './IncarnationCrossCombobox';
import heic2any from 'heic2any';

interface HDChartInputFormProps {
  onSave: (chart: HumanDesignChart) => void;
  onClose: () => void;
  initialData?: Partial<HumanDesignChart>;
  mainUserData?: UserData | null;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
];

export const HDChartInputForm = ({ onSave, onClose, initialData, mainUserData }: HDChartInputFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    birthDate: initialData?.birthDate || '',
    birthTime: initialData?.birthTime || '',
    birthLocation: initialData?.birthLocation || '',
    timezone: initialData?.timezone || '',
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timezoneAutoDetected, setTimezoneAutoDetected] = useState(false);
  const [isMainUser, setIsMainUser] = useState(false);
  
  // Parsed HD data for editing
  const [showGateEditor, setShowGateEditor] = useState(!!initialData?.personalityActivations?.length);
  const [parsedPersonality, setParsedPersonality] = useState<HDPlanetaryActivation[]>(
    initialData?.personalityActivations || []
  );
  const [parsedDesign, setParsedDesign] = useState<HDPlanetaryActivation[]>(
    initialData?.designActivations || []
  );
  const [parsedHDData, setParsedHDData] = useState<{
    hdType?: string;
    profile?: string;
    strategy?: string;
    authority?: string;
    definition?: string;
    incarnationCross?: string;
    definedCenters?: string[];
    definedChannels?: string[];
  } | null>(initialData ? {
    hdType: initialData.type,
    profile: initialData.profile,
    authority: initialData.authority,
    definition: initialData.definitionType,
    incarnationCross: initialData.incarnationCross?.name,
    definedCenters: initialData.definedCenters,
    definedChannels: initialData.definedChannels,
  } : null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const isEditMode = !!initialData?.id;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check if main user data is available and can be used
  const canUseMainUserData = mainUserData && mainUserData.name && mainUserData.birthDate && mainUserData.birthTime;

  // Auto-detect if this is the main user based on name match
  useEffect(() => {
    if (mainUserData?.name && formData.name) {
      setIsMainUser(namesMatch(formData.name, mainUserData.name));
    } else {
      setIsMainUser(false);
    }
  }, [formData.name, mainUserData?.name]);

  // Fill form with main user data
  const useMainUserData = () => {
    if (!mainUserData) return;
    
    setFormData({
      name: mainUserData.name,
      birthDate: mainUserData.birthDate,
      birthTime: mainUserData.birthTime,
      birthLocation: mainUserData.birthLocation,
      timezone: mainUserData.timezone || '',
    });
    setIsMainUser(true);
    toast.success('Filled with your profile data');
  };

  // Auto-detect timezone when location or birth date changes
  useEffect(() => {
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
    }

    if (formData.birthLocation) {
      locationDebounceRef.current = setTimeout(() => {
        const result = lookupTimezone(formData.birthLocation, formData.birthDate || undefined);
        if (result) {
          setFormData(prev => ({ ...prev, timezone: result.timezone }));
          setTimezoneAutoDetected(true);
        }
      }, 500); // Debounce 500ms
    }

    return () => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
    };
  }, [formData.birthLocation, formData.birthDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCalculating(true);

    try {
      const offset = getTimezoneInfoForDate(formData.timezone || 'America/New_York', formData.birthDate).offset;

      const chart = calculateHumanDesignChart(
        formData.name,
        formData.birthDate,
        formData.birthTime,
        formData.birthLocation,
        formData.timezone || 'America/New_York',
        offset
      );

      onSave(chart);
      onClose();
    } catch (err) {
      console.error('Failed to calculate chart:', err);
      setError('Failed to calculate chart. Please check your birth data.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Save chart using the parsed gate data (not recalculating from birth data)
  const handleSaveFromParsedData = () => {
    console.log('[HD] handleSaveFromParsedData called', { 
      name: formData.name, 
      personalityCount: parsedPersonality.length,
      parsedHDData 
    });
    
    if (!formData.name || parsedPersonality.length === 0) {
      toast.error('Name and gate data are required');
      return;
    }

    try {
      // Build chart from parsed data
      const allGates = new Set<number>();
      [...parsedPersonality, ...parsedDesign].forEach(a => allGates.add(a.gate));

      // ALWAYS calculate from gates for accuracy
      const definedChannels = calculateDefinedChannels(allGates);
      const definedCenters = calculateDefinedCenters(definedChannels);
      
      console.log('[HD Authority Debug] All gates:', Array.from(allGates));
      console.log('[HD Authority Debug] Defined channels:', definedChannels);
      console.log('[HD Authority Debug] Defined centers:', definedCenters);
      console.log('[HD Authority Debug] Has SolarPlexus:', definedCenters.includes('SolarPlexus'));
      
      // Calculate type and authority from calculated centers (not parsed)
      const calculatedDefinitionType = calculateDefinitionType(definedCenters, definedChannels);
      const calculatedHdType = determineType(definedCenters, definedChannels);
      const calculatedAuthority = determineAuthority(definedCenters, calculatedHdType, definedChannels);
      const strategy = determineStrategy(parsedHDData?.hdType as any || calculatedHdType);
      
      console.log('[HD Authority Debug] Calculated type:', calculatedHdType);
      console.log('[HD Authority Debug] Calculated authority:', calculatedAuthority);
      console.log('[HD Authority Debug] Parsed authority (ignored if centers exist):', parsedHDData?.authority);

      // ALWAYS use calculated values - they're computed from gate data which is accurate
      // The parsed text labels from AI can be wrong (e.g., "Split" instead of "Triple Split")
      const finalType = calculatedHdType;
      const finalDefinition = calculatedDefinitionType;
      const finalAuthority = calculatedAuthority;
      
      console.log('[HD Definition Debug] Calculated definition:', calculatedDefinitionType);
      console.log('[HD Definition Debug] Parsed definition (ignored):', parsedHDData?.definition);
      console.log('[HD Definition Debug] FINAL definition being saved:', finalDefinition);

      // Get profile from parsed data FIRST, then fallback to Sun lines
      const pSun = parsedPersonality.find(a => a.planet === 'Sun');
      const dSun = parsedDesign.find(a => a.planet === 'Sun');
      const calculatedProfile = `${pSun?.line || 1}/${dSun?.line || 1}`;
      const finalProfile = parsedHDData?.profile || calculatedProfile;
      
      console.log('[HD] Final values:', { finalType, finalProfile, finalAuthority, finalDefinition });

      // Build all centers list
      const allCenters = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'SolarPlexus', 'Sacral', 'Spleen', 'Root'] as const;
      const undefinedCenters = allCenters.filter(c => !definedCenters.includes(c as any));

      // Build activated gates array with proper type
      const activatedGates: HDGateActivation[] = [...parsedPersonality, ...parsedDesign].map(a => ({
        gate: a.gate,
        line: a.line,
        planet: a.planet,
        isConscious: a.isConscious,
      }));

      // Determine cross type based on profile (conscious line)
      // Lines 1-3 = Right Angle, Line 4 = Juxtaposition, Lines 5-6 = Left Angle
      const consciousLine = parseInt(finalProfile.split('/')[0]) || 1;
      let crossType: 'Right Angle' | 'Left Angle' | 'Juxtaposition';
      if (consciousLine <= 3) {
        crossType = 'Right Angle';
      } else if (consciousLine === 4) {
        crossType = 'Juxtaposition';
      } else {
        crossType = 'Left Angle';
      }
      
      // Build incarnation cross - use parsed name if available, otherwise generate
      const crossGates = {
        consciousSun: pSun?.gate || 1,
        consciousEarth: parsedPersonality.find(a => a.planet === 'Earth')?.gate || 2,
        unconsciousSun: dSun?.gate || 1,
        unconsciousEarth: parsedDesign.find(a => a.planet === 'Earth')?.gate || 2,
      };
      
      // If we have a parsed cross name, use it but fix the type based on profile
      let incarnationCrossName = parsedHDData?.incarnationCross;
      if (incarnationCrossName) {
        // Replace incorrect angle type in parsed name with correct one based on profile
        incarnationCrossName = incarnationCrossName
          .replace(/^(Right Angle|Left Angle|Juxtaposition)\s+/i, '')
          .replace(/^Cross of\s+/i, '');
        incarnationCrossName = `${crossType} Cross of ${incarnationCrossName}`;
      } else {
        incarnationCrossName = `${crossType} Cross of Gate ${pSun?.gate || 'Unknown'}`;
      }

      const chart: HumanDesignChart = {
        id: crypto.randomUUID(),
        name: formData.name,
        birthDate: formData.birthDate || '',
        birthTime: formData.birthTime || '',
        birthLocation: formData.birthLocation || '',
        timezone: formData.timezone || 'America/New_York',
        timezoneOffset: 0,
        personalityDateTime: new Date(),
        designDateTime: new Date(),
        type: finalType as any,
        profile: finalProfile as any,
        authority: finalAuthority as any,
        strategy: strategy,
        definitionType: finalDefinition as any,
        personalityActivations: parsedPersonality,
        designActivations: parsedDesign,
        definedCenters: definedCenters, // Always use calculated centers (proper HDCenterName format)
        undefinedCenters: undefinedCenters as any[],
        definedChannels: definedChannels, // Always use calculated channels
        activatedGates: activatedGates,
        incarnationCross: {
          name: incarnationCrossName,
          type: crossType,
          gates: crossGates,
          quarter: 'Initiation',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('[HD] Final chart to save:', chart);
      onSave(chart);
      toast.success(`Chart saved! Type: ${finalType}, Profile: ${finalProfile}`);
      onClose();
    } catch (err) {
      console.error('[HD] Save error:', err);
      toast.error('Failed to save chart: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      });
      
      const resultBlob = Array.isArray(blob) ? blob[0] : blob;
      const newFileName = file.name.replace(/\.heic$/i, '.jpg');
      return new File([resultBlob], newFileName, { type: 'image/jpeg' });
    } catch (err) {
      console.error('HEIC conversion failed:', err);
      throw new Error('Failed to convert HEIC file. Please convert to JPG manually.');
    }
  };

  const parseHDChart = async (file: File) => {
    setIsParsing(true);
    setError(null);
    setParseWarnings([]);

    try {
      // Handle HEIC files - convert to JPEG first
      let processedFile = file;
      const isHeic = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');
      
      if (isHeic) {
        toast.info('Converting HEIC to JPEG...');
        processedFile = await convertHeicToJpeg(file);
      }

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(processedFile);
      const imageBase64 = await base64Promise;

      // Determine file type
      let fileType = 'image';
      if (processedFile.type === 'application/pdf') {
        fileType = 'pdf';
      } else if (processedFile.type.includes('word') || processedFile.name.endsWith('.docx') || processedFile.name.endsWith('.doc')) {
        fileType = 'word';
      }

      // Call the edge function
      const { data, error: fnError } = await supabase.functions.invoke('parse-hd-chart', {
        body: {
          imageBase64,
          fileType,
          fileName: processedFile.name,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to parse chart');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.data) {
        const parsed = data.data;
        
        // Fill in form data from parsed results
        if (parsed.birthInfo) {
          setFormData(prev => ({
            ...prev,
            name: parsed.birthInfo.name || prev.name,
            birthDate: parsed.birthInfo.birthDate || prev.birthDate,
            birthTime: parsed.birthInfo.birthTime || prev.birthTime,
            birthLocation: parsed.birthInfo.birthLocation || prev.birthLocation,
          }));
        }

        // Store parsed HD data for display/editing
        if (parsed.hdType || parsed.profile) {
          setParsedHDData({
            hdType: parsed.hdType,
            profile: parsed.profile,
            strategy: parsed.strategy,
            authority: parsed.authority,
            definition: parsed.definition,
            incarnationCross: parsed.incarnationCross,
            definedCenters: parsed.definedCenters,
            definedChannels: parsed.definedChannels,
          });
        }

        // Normalize planet names to match our expected format
        const normalizePlanetName = (name: string): string => {
          const normalized = name.replace(/\s+/g, '').replace(/-/g, '');
          const mapping: Record<string, string> = {
            'northnode': 'NorthNode',
            'southnode': 'SouthNode',
            'sun': 'Sun',
            'earth': 'Earth',
            'moon': 'Moon',
            'mercury': 'Mercury',
            'venus': 'Venus',
            'mars': 'Mars',
            'jupiter': 'Jupiter',
            'saturn': 'Saturn',
            'uranus': 'Uranus',
            'neptune': 'Neptune',
            'pluto': 'Pluto',
          };
          return mapping[normalized.toLowerCase()] || name;
        };

        // Populate gate editor with parsed activations
        if (parsed.personalityActivations && Array.isArray(parsed.personalityActivations)) {
          const pActivations: HDPlanetaryActivation[] = parsed.personalityActivations.map((a: any) => ({
            planet: normalizePlanetName(a.planet),
            gate: a.gate,
            line: a.line,
            longitude: 0,
            isConscious: true,
          }));
          setParsedPersonality(pActivations);
        }

        if (parsed.designActivations && Array.isArray(parsed.designActivations)) {
          const dActivations: HDPlanetaryActivation[] = parsed.designActivations.map((a: any) => ({
            planet: normalizePlanetName(a.planet),
            gate: a.gate,
            line: a.line,
            longitude: 0,
            isConscious: false,
          }));
          setParsedDesign(dActivations);
        }

        // Collect warnings
        if (parsed.warnings && Array.isArray(parsed.warnings)) {
          setParseWarnings(parsed.warnings);
        }

        // Show gate editor if we got activations
        if ((parsed.personalityActivations?.length > 0) || (parsed.designActivations?.length > 0)) {
          setShowGateEditor(true);
          toast.success('Chart parsed! Review and correct the gates below, then click Generate Chart.');
        } else if (parsed.birthInfo) {
          toast.success('Birth data extracted. Fill in any missing fields.');
        } else {
          toast.info('Some data extracted. Please verify and complete the form.');
        }
      }
    } catch (err) {
      console.error('Failed to parse chart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse chart image';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'application/pdf'];
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !isHeic) {
        setError('Please upload an image (JPG, PNG, HEIC) or PDF file.');
        return;
      }
      await parseHDChart(file);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await parseHDChart(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/80 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center p-5 py-10">
        <div
        className="w-full max-w-lg rounded-sm bg-background p-8 shadow-xl md:p-12 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl">
            {isEditMode ? 'Edit Chart' : 'Human Design Chart'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-6 border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          } ${isParsing ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.heic,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isParsing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Parsing chart...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2 mb-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <FileImage className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Drag & drop HD chart image or PDF
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse • JPG, PNG, WebP, HEIC, PDF supported
              </p>
            </>
          )}
        </div>

        {/* Editable HD Core Data - show when we have parsed activations, parsed data, or in edit mode */}
        {(parsedHDData || isEditMode || parsedPersonality.length > 0) && (
          <div className="mb-6 rounded border border-primary/30 bg-primary/5 p-4">
            <h4 className="text-[10px] uppercase tracking-widest text-primary mb-3">
              {isEditMode ? 'Edit Chart Info' : 'Chart Info'}
            </h4>
            
            {/* Name field prominently at top */}
            <div className="mb-4">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter chart name"
                className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm rounded focus:border-primary focus:outline-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Type</label>
                <select
                  value={parsedHDData?.hdType || ''}
                  onChange={(e) => setParsedHDData(prev => ({ ...(prev || {}), hdType: e.target.value }))}
                  className="w-full border border-border bg-background px-2 py-1.5 text-sm rounded"
                >
                  <option value="">Select...</option>
                  <option value="Generator">Generator</option>
                  <option value="Manifesting Generator">Manifesting Generator</option>
                  <option value="Projector">Projector</option>
                  <option value="Manifestor">Manifestor</option>
                  <option value="Reflector">Reflector</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Profile</label>
                <select
                  value={parsedHDData?.profile || ''}
                  onChange={(e) => setParsedHDData(prev => ({ ...(prev || {}), profile: e.target.value }))}
                  className="w-full border border-border bg-background px-2 py-1.5 text-sm rounded"
                >
                  <option value="">Select...</option>
                  <option value="1/3">1/3</option>
                  <option value="1/4">1/4</option>
                  <option value="2/4">2/4</option>
                  <option value="2/5">2/5</option>
                  <option value="3/5">3/5</option>
                  <option value="3/6">3/6</option>
                  <option value="4/6">4/6</option>
                  <option value="4/1">4/1</option>
                  <option value="5/1">5/1</option>
                  <option value="5/2">5/2</option>
                  <option value="6/2">6/2</option>
                  <option value="6/3">6/3</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Authority</label>
                <select
                  value={parsedHDData?.authority || ''}
                  onChange={(e) => setParsedHDData(prev => ({ ...(prev || {}), authority: e.target.value }))}
                  className="w-full border border-border bg-background px-2 py-1.5 text-sm rounded"
                >
                  <option value="">Select...</option>
                  <option value="Emotional">Emotional (Solar Plexus)</option>
                  <option value="Sacral">Sacral</option>
                  <option value="Splenic">Splenic</option>
                  <option value="Ego Manifested">Ego Manifested</option>
                  <option value="Ego Projected">Ego Projected</option>
                  <option value="Self-Projected">Self-Projected</option>
                  <option value="Mental">Mental/Environmental</option>
                  <option value="Lunar">Lunar (None)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Definition</label>
                <select
                  value={parsedHDData?.definition || ''}
                  onChange={(e) => setParsedHDData(prev => ({ ...(prev || {}), definition: e.target.value }))}
                  className="w-full border border-border bg-background px-2 py-1.5 text-sm rounded"
                >
                  <option value="">Select...</option>
                  <option value="Single">Single Definition</option>
                  <option value="Split">Split Definition</option>
                  <option value="Triple Split">Triple Split</option>
                  <option value="Quadruple Split">Quadruple Split</option>
                  <option value="None">No Definition</option>
                </select>
              </div>
            </div>
            
            {/* Incarnation Cross Name */}
            <div className="mt-3">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Incarnation Cross</label>
              <IncarnationCrossCombobox
                value={parsedHDData?.incarnationCross || ''}
                onChange={(crossName, gates) => {
                  setParsedHDData(prev => ({ 
                    ...(prev || {}), 
                    incarnationCross: crossName 
                  }));
                  
                  // If gates are provided from database selection, update the relevant gate activations
                  if (gates) {
                    console.log('[HD Cross Selected] Updating gates:', gates);
                    
                    // Update personality Sun and Earth gates
                    setParsedPersonality(prev => {
                      const updated = [...prev];
                      const sunIdx = updated.findIndex(a => a.planet === 'Sun');
                      const earthIdx = updated.findIndex(a => a.planet === 'Earth');
                      
                      if (sunIdx >= 0) {
                        updated[sunIdx] = { ...updated[sunIdx], gate: gates.consciousSun };
                      }
                      if (earthIdx >= 0) {
                        updated[earthIdx] = { ...updated[earthIdx], gate: gates.consciousEarth };
                      }
                      return updated;
                    });
                    
                    // Update design Sun and Earth gates
                    setParsedDesign(prev => {
                      const updated = [...prev];
                      const sunIdx = updated.findIndex(a => a.planet === 'Sun');
                      const earthIdx = updated.findIndex(a => a.planet === 'Earth');
                      
                      if (sunIdx >= 0) {
                        updated[sunIdx] = { ...updated[sunIdx], gate: gates.unconsciousSun };
                      }
                      if (earthIdx >= 0) {
                        updated[earthIdx] = { ...updated[earthIdx], gate: gates.unconsciousEarth };
                      }
                      return updated;
                    });
                    
                    toast.success('Cross selected - Sun/Earth gates updated');
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Button to show gate editor in edit mode if hidden */}
        {!showGateEditor && (isEditMode || parsedPersonality.length > 0) && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowGateEditor(true)}
              className="w-full flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors rounded"
            >
              <Edit3 size={14} />
              {isEditMode ? 'Edit Gate Activations' : 'Show Gate Editor'}
            </button>
          </div>
        )}

        {/* Gate Editor Section */}
        {showGateEditor && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Edit3 size={12} />
                Review & Edit Gates
              </h4>
              <button
                type="button"
                onClick={() => setShowGateEditor(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Hide
              </button>
            </div>
            <HDGateEditor
              personalityActivations={parsedPersonality}
              designActivations={parsedDesign}
              onPersonalityChange={setParsedPersonality}
              onDesignChange={setParsedDesign}
              warnings={parseWarnings}
            />
            
            {/* Save from Parsed Data Button */}
            <button
              type="button"
              onClick={() => handleSaveFromParsedData()}
              disabled={!formData.name || parsedPersonality.length === 0}
              className="mt-4 w-full border-2 border-primary bg-primary px-5 py-4 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              ✓ {isEditMode ? 'Update Chart' : 'Save This Chart'}
            </button>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              {isEditMode ? 'Updates the chart with edited data' : 'Uses the parsed gate data above (not birth data calculation)'}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">or enter manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Use My Data Button */}
        {canUseMainUserData && !isMainUser && (
          <button
            type="button"
            onClick={useMainUserData}
            className="mb-4 w-full flex items-center justify-center gap-2 rounded border border-primary/50 bg-primary/5 px-4 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
          >
            <UserCheck size={16} />
            Use my profile data ({mainUserData?.name})
          </button>
        )}

        {isMainUser && (
          <div className="mb-4 flex items-center gap-2 rounded border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
            <UserCheck size={14} />
            Using your main profile data
          </div>
        )}

        {error && (
          <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Chart name"
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Birth Date
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Birth Time (Exact)
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              required
              step="60"
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Birth time accuracy is critical for Human Design. If unsure, use birth certificate time.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Birth Location
            </label>
            <input
              type="text"
              placeholder="City, State/Country"
              value={formData.birthLocation}
              onChange={(e) => {
                setFormData({ ...formData, birthLocation: e.target.value });
                setTimezoneAutoDetected(false);
              }}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Timezone will auto-detect based on location
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Timezone
              {timezoneAutoDetected && formData.timezone && (
                <span className="ml-2 text-primary normal-case">✓ Auto-detected</span>
              )}
            </label>

            {timezoneAutoDetected && formData.timezone && formData.birthDate && (
              <div className="rounded border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                Using <span className="font-medium text-foreground">{getTimezoneInfoForDate(formData.timezone, formData.birthDate).label}</span> for {formData.birthDate}
              </div>
            )}
            <select
              value={formData.timezone}
              onChange={(e) => {
                setFormData({ ...formData, timezone: e.target.value });
                setTimezoneAutoDetected(false);
              }}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              <option value="">Select timezone...</option>
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {(() => {
                    const info = formData.birthDate
                      ? getTimezoneInfoForDate(tz.value, formData.birthDate)
                      : getTimezoneInfoForDate(tz.value);
                    return `${tz.label} (${info.label})`;
                  })()}
                </option>
              ))}
            </select>
          </div>

          {/* Birth Moment Preview - shows computed UTC timestamp before saving */}
          {formData.birthDate && formData.birthTime && formData.timezone && (
            <BirthMomentPreview
              birthDate={formData.birthDate}
              birthTime={formData.birthTime}
              timezone={formData.timezone}
            />
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-border bg-transparent px-5 py-3 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCalculating || isParsing || !formData.timezone}
              className="border border-primary bg-primary px-5 py-3 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isCalculating ? 'Calculating...' : 'Generate Chart'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};
