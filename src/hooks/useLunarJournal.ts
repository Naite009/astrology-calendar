import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { formatLocalDateKey } from '@/lib/localDate';

export interface LunarJournalEntry {
  id?: string;
  user_id?: string;
  device_id: string;
  chart_id: string;
  
  // Cycle identification
  cycle_start_date: string;
  cycle_sign: string;
  cycle_degree?: number;
  
  // New Moon phase
  new_moon_date?: string;
  new_moon_feelings?: string;
  new_moon_showing_up?: string;
  new_moon_house_themes?: string;
  new_moon_intentions?: string;
  new_moon_body_sensations?: string;
  
  // First Quarter phase
  first_quarter_date?: string;
  first_quarter_showing_up?: string;
  first_quarter_obstacles?: string;
  first_quarter_adjustments?: string;
  
  // Full Moon phase
  full_moon_date?: string;
  full_moon_showing_up?: string;
  full_moon_gratitude?: string;
  full_moon_releasing?: string;
  
  // Last Quarter phase
  last_quarter_date?: string;
  last_quarter_showing_up?: string;
  last_quarter_letting_go?: string;
  last_quarter_patterns?: string;
  
  // Balsamic phase
  balsamic_date?: string;
  balsamic_reflections?: string;
  balsamic_evolved?: string;
  balsamic_different?: string;
  
  // Cycle completion
  cycle_wisdom?: string;
  cycle_next_stirrings?: string;
  
  // AI suggestions
  ai_suggested_intentions?: string;
  
  created_at?: string;
  updated_at?: string;
}

// Get or create a device ID
function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export const useLunarJournal = (chartId: string, cycleStartDate: Date, cycleSign: string) => {
  const { user } = useAuth();
  const [journal, setJournal] = useState<LunarJournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pastJournals, setPastJournals] = useState<LunarJournalEntry[]>([]);
  
  const deviceId = getDeviceId();
  const cycleKey = formatLocalDateKey(cycleStartDate);
  
  // Load journal for current cycle
  const loadJournal = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lunar_cycle_journals')
        .select('*')
        .eq('device_id', deviceId)
        .eq('chart_id', chartId)
        .eq('cycle_start_date', cycleKey)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading lunar journal:', error);
      } else if (data) {
        setJournal(data as LunarJournalEntry);
      } else {
        // Initialize empty journal
        setJournal({
          device_id: deviceId,
          chart_id: chartId,
          cycle_start_date: cycleKey,
          cycle_sign: cycleSign,
        });
      }
    } catch (err) {
      console.error('Failed to load lunar journal:', err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, chartId, cycleKey, cycleSign]);
  
  // Load past journals for this chart
  const loadPastJournals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lunar_cycle_journals')
        .select('*')
        .eq('device_id', deviceId)
        .eq('chart_id', chartId)
        .neq('cycle_start_date', cycleKey)
        .order('cycle_start_date', { ascending: false })
        .limit(12);
      
      if (error) {
        console.error('Error loading past journals:', error);
      } else if (data) {
        setPastJournals(data as LunarJournalEntry[]);
      }
    } catch (err) {
      console.error('Failed to load past journals:', err);
    }
  }, [deviceId, chartId, cycleKey]);
  
  useEffect(() => {
    loadJournal();
    loadPastJournals();
  }, [loadJournal, loadPastJournals]);
  
  // Save/update journal
  const saveJournal = useCallback(async (updates: Partial<LunarJournalEntry>) => {
    if (!journal) return;
    
    setIsSaving(true);
    try {
      const updatedJournal = { ...journal, ...updates };
      
      if (journal.id) {
        // Update existing
        const { error } = await supabase
          .from('lunar_cycle_journals')
          .update({
            ...updates,
            user_id: user?.id || null,
          })
          .eq('id', journal.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('lunar_cycle_journals')
          .insert({
            device_id: deviceId,
            chart_id: chartId,
            cycle_start_date: cycleKey,
            cycle_sign: cycleSign,
            user_id: user?.id || null,
            ...updates,
          })
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          updatedJournal.id = data.id;
        }
      }
      
      setJournal(updatedJournal);
    } catch (err) {
      console.error('Failed to save lunar journal:', err);
    } finally {
      setIsSaving(false);
    }
  }, [journal, deviceId, chartId, cycleKey, cycleSign, user?.id]);
  
  // Update a single field
  const updateField = useCallback((field: keyof LunarJournalEntry, value: string) => {
    saveJournal({ [field]: value });
  }, [saveJournal]);
  
  return {
    journal,
    isLoading,
    isSaving,
    pastJournals,
    updateField,
    saveJournal,
    loadJournal,
  };
};
