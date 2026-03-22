import React, { useState, useEffect, useCallback } from 'react';
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
  
  // ★ What Is Surfacing (first thing user sees)
  what_is_surfacing?: string;
  
  // New Moon phase
  new_moon_date?: string;
  new_moon_feelings?: string;
  new_moon_showing_up?: string;
  new_moon_house_themes?: string;
  new_moon_intentions?: string;
  new_moon_body_sensations?: string;
  
  // Intention delay logic
  intention_status?: string; // 'unclear' | 'forming' | 'ready'
  
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
  
  // Balsamic phase (expanded)
  balsamic_date?: string;
  balsamic_reflections?: string;
  balsamic_evolved?: string;
  balsamic_different?: string;
  balsamic_dreams?: string;
  balsamic_morning_thoughts?: string;
  balsamic_fatigue?: number | null;
  balsamic_withdrawal?: number | null;
  balsamic_needs_to_end?: string;
  balsamic_what_feels_complete?: string;
  balsamic_off_plate?: string;
  
  // Surprise tracker
  surprise_event?: string;
  
  // Real life event log
  real_life_what_happened?: string;
  real_life_surprises?: string;
  real_life_body_signals?: string;
  real_life_synchronicities?: string;
  real_life_conversations?: string;
  real_life_emotional_reactions?: string;
  real_life_repeated?: string;
  
  // Cycle completion
  cycle_wisdom?: string;
  cycle_next_stirrings?: string;
  
  // AI suggestions
  ai_suggested_intentions?: string;
  
  // Tarot card
  tarot_card_name?: string;
  tarot_card_notes?: string;
  tarot_ai_interpretation?: string;
  
  // Oracle card
  oracle_card_name?: string;
  oracle_deck_name?: string;
  oracle_card_notes?: string;
  oracle_ai_interpretation?: string;
  
  // Tracking metrics
  mood?: number | null;
  energy?: number | null;
  clarity?: number | null;
  stress?: number | null;
  sleep_quality?: number | null;
  communication_quality?: number | null;
  social_ease?: number | null;
  intuition?: number | null;
  productivity?: number | null;
  conflict_level?: number | null;
  dream_intensity?: number | null;
  body_sensitivity?: number | null;
  tags?: string[];
  journal_text?: string;
  moon_house?: number | null;
  house_system?: string;
  simple_mode?: boolean;
  
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
  
  // Use a ref to always have the latest journal for saves
  const journalRef = React.useRef(journal);
  useEffect(() => { journalRef.current = journal; }, [journal]);

  // Save/update journal using upsert to avoid race conditions
  const saveJournal = useCallback(async (updates: Partial<LunarJournalEntry>) => {
    const currentJournal = journalRef.current;
    if (!currentJournal) return;
    
    setIsSaving(true);
    try {
      const updatedJournal = { ...currentJournal, ...updates };
      
      if (currentJournal.id) {
        // Update existing
        const { error } = await supabase
          .from('lunar_cycle_journals')
          .update({
            ...updates,
            user_id: user?.id || null,
          })
          .eq('id', currentJournal.id);
        
        if (error) throw error;
      } else {
        // Upsert: try insert, on conflict update
        const payload = {
          device_id: deviceId,
          chart_id: chartId,
          cycle_start_date: cycleKey,
          cycle_sign: cycleSign,
          user_id: user?.id || null,
          ...updates,
        };
        
        // First try to find if one was created by a concurrent save
        const { data: existing } = await supabase
          .from('lunar_cycle_journals')
          .select('id')
          .eq('device_id', deviceId)
          .eq('chart_id', chartId)
          .eq('cycle_start_date', cycleKey)
          .maybeSingle();
        
        if (existing) {
          // Row exists now, update it
          const { error } = await supabase
            .from('lunar_cycle_journals')
            .update({ ...updates, user_id: user?.id || null })
            .eq('id', existing.id);
          if (error) throw error;
          updatedJournal.id = existing.id;
        } else {
          const { data, error } = await supabase
            .from('lunar_cycle_journals')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          if (data) updatedJournal.id = data.id;
        }
      }
      
      setJournal(updatedJournal);
      journalRef.current = updatedJournal;
    } catch (err) {
      console.error('Failed to save lunar journal:', err);
    } finally {
      setIsSaving(false);
    }
  }, [deviceId, chartId, cycleKey, cycleSign, user?.id]);
  
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
