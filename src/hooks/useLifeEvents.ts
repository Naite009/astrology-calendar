import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface LifeEvent {
  id: string;
  chartId: string;
  eventDate: Date;
  eventType: string;
  eventLabel?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LifeEventInput {
  chartId: string;
  eventDate: Date;
  eventType: string;
  eventLabel?: string;
  notes?: string;
}

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('astro_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('astro_device_id', deviceId);
  }
  return deviceId;
};

export const useLifeEvents = () => {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const deviceId = getDeviceId();

  // Fetch events from database
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('life_events')
        .select('*')
        .eq('device_id', deviceId)
        .order('event_date', { ascending: false });

      if (error) throw error;

      const parsed: LifeEvent[] = (data || []).map(row => ({
        id: row.id,
        chartId: row.chart_id,
        eventDate: new Date(row.event_date),
        eventType: row.event_type,
        eventLabel: row.event_label || undefined,
        notes: row.notes || undefined,
        createdAt: new Date(row.created_at || Date.now()),
        updatedAt: new Date(row.updated_at || Date.now())
      }));

      setEvents(parsed);
    } catch (error) {
      console.error('Error fetching life events:', error);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Add a new event
  const addEvent = useCallback(async (input: LifeEventInput): Promise<LifeEvent | null> => {
    try {
      const { data, error } = await supabase
        .from('life_events')
        .insert({
          user_id: user?.id || null,
          device_id: deviceId,
          chart_id: input.chartId,
          event_date: input.eventDate.toISOString().split('T')[0],
          event_type: input.eventType,
          event_label: input.eventLabel || null,
          notes: input.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: LifeEvent = {
        id: data.id,
        chartId: data.chart_id,
        eventDate: new Date(data.event_date),
        eventType: data.event_type,
        eventLabel: data.event_label || undefined,
        notes: data.notes || undefined,
        createdAt: new Date(data.created_at || Date.now()),
        updatedAt: new Date(data.updated_at || Date.now())
      };

      setEvents(prev => [newEvent, ...prev]);
      toast({
        title: "Event saved",
        description: "Life event has been recorded to your history."
      });

      return newEvent;
    } catch (error) {
      console.error('Error adding life event:', error);
      toast({
        title: "Failed to save",
        description: "Could not save life event. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [user, deviceId]);

  // Update an existing event
  const updateEvent = useCallback(async (id: string, updates: Partial<LifeEventInput>): Promise<boolean> => {
    try {
      const updatePayload: Record<string, unknown> = {};
      if (updates.eventDate) updatePayload.event_date = updates.eventDate.toISOString().split('T')[0];
      if (updates.eventType) updatePayload.event_type = updates.eventType;
      if (updates.eventLabel !== undefined) updatePayload.event_label = updates.eventLabel || null;
      if (updates.notes !== undefined) updatePayload.notes = updates.notes || null;

      const { error } = await supabase
        .from('life_events')
        .update(updatePayload)
        .eq('id', id)
        .eq('device_id', deviceId);

      if (error) throw error;

      setEvents(prev => prev.map(e => {
        if (e.id !== id) return e;
        return {
          ...e,
          ...(updates.eventDate && { eventDate: updates.eventDate }),
          ...(updates.eventType && { eventType: updates.eventType }),
          ...(updates.eventLabel !== undefined && { eventLabel: updates.eventLabel || undefined }),
          ...(updates.notes !== undefined && { notes: updates.notes || undefined }),
          updatedAt: new Date()
        };
      }));

      toast({
        title: "Event updated",
        description: "Life event has been updated."
      });

      return true;
    } catch (error) {
      console.error('Error updating life event:', error);
      toast({
        title: "Failed to update",
        description: "Could not update life event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [deviceId]);

  // Delete an event
  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('life_events')
        .delete()
        .eq('id', id)
        .eq('device_id', deviceId);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Event deleted",
        description: "Life event has been removed."
      });

      return true;
    } catch (error) {
      console.error('Error deleting life event:', error);
      toast({
        title: "Failed to delete",
        description: "Could not delete life event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [deviceId]);

  // Get events for a specific chart
  const getEventsForChart = useCallback((chartId: string): LifeEvent[] => {
    return events.filter(e => e.chartId === chartId);
  }, [events]);

  // Get all events across all charts (for unified timeline)
  const getAllEvents = useCallback((): LifeEvent[] => {
    return events;
  }, [events]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForChart,
    getAllEvents,
    refetch: fetchEvents
  };
};
