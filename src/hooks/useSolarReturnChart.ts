import { useState, useEffect, useCallback, useRef } from 'react';
import { NatalChart } from './useNatalChart';
import { supabase } from '@/integrations/supabase/client';

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
const DEVICE_ID_KEY = 'astro_device_id';

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item) as T;
  } catch (e) {
    console.error(`[SolarReturn] Failed to parse ${key}:`, e);
  }
  return fallback;
};

/** Sync a single SR chart to device_charts with sr_ prefix */
const syncSRToCloud = async (chart: SolarReturnChart, deviceId: string, userId: string | null) => {
  const chartId = `sr_${chart.id}`;
  try {
    const baseLookup = supabase
      .from('device_charts')
      .select('id')
      .eq('chart_id', chartId)
      .limit(1);

    const { data: existing } = userId
      ? await baseLookup.eq('user_id', userId)
      : await baseLookup.eq('device_id', deviceId);

    const chartData = JSON.parse(JSON.stringify(chart));

    if (existing && existing.length > 0) {
      await supabase
        .from('device_charts')
        .update({
          chart_data: chartData,
          chart_name: chart.name || `SR ${chart.solarReturnYear}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id);
    } else {
      const insertData: Record<string, unknown> = {
        device_id: deviceId,
        chart_id: chartId,
        chart_data: chartData,
        chart_name: chart.name || `SR ${chart.solarReturnYear}`,
      };
      if (userId) insertData.user_id = userId;
      await supabase.from('device_charts').insert(insertData as never);
    }
  } catch (e) {
    console.error('[SolarReturn] Cloud sync error:', e);
  }
};

const deleteSRFromCloud = async (chartLocalId: string, deviceId: string, userId: string | null) => {
  const chartId = `sr_${chartLocalId}`;
  try {
    const q = userId
      ? supabase.from('device_charts').delete().eq('user_id', userId).eq('chart_id', chartId)
      : supabase.from('device_charts').delete().eq('device_id', deviceId).eq('chart_id', chartId);
    await q;
  } catch (e) {
    console.error('[SolarReturn] Cloud delete error:', e);
  }
};

export const useSolarReturnChart = () => {
  const [solarReturnCharts, setSolarReturnCharts] = useState<SolarReturnChart[]>(() => {
    return safeParseJSON<SolarReturnChart[]>(SR_STORAGE_KEY, []);
  });

  const deviceId = useRef(getDeviceId());
  const userIdRef = useRef<string | null>(null);
  const cloudRestoreDone = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      userIdRef.current = session?.user?.id ?? null;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      userIdRef.current = session?.user?.id ?? null;
    });
    return () => subscription.unsubscribe();
  }, []);

  // Restore from cloud on mount
  useEffect(() => {
    if (cloudRestoreDone.current) return;
    cloudRestoreDone.current = true;

    const restore = async () => {
      try {
        // Wait for auth session to fully resolve (not just 500ms guess)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          userIdRef.current = session.user.id;
        }

        let query = supabase
          .from('device_charts')
          .select('*')
          .like('chart_id', 'sr_%')
          .order('updated_at', { ascending: false });

        if (userIdRef.current) {
          query = query.eq('user_id', userIdRef.current);
        } else {
          query = query.eq('device_id', deviceId.current);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) return;

        // De-dupe by chart_id
        const byId = new Map<string, SolarReturnChart>();
        for (const row of data) {
          const sr = row.chart_data as unknown as SolarReturnChart;
          const localId = (row.chart_id as string).replace(/^sr_/, '');
          if (!byId.has(localId)) {
            byId.set(localId, { ...sr, id: localId });
          }
        }

        const cloudSRs = Array.from(byId.values());
        if (cloudSRs.length === 0) return;

        // Merge with local: cloud wins for same IDs, add new ones
        setSolarReturnCharts(prev => {
          const localById = new Map(prev.map(c => [c.id, c]));
          for (const sr of cloudSRs) {
            localById.set(sr.id, sr); // cloud overwrites local
          }
          const merged = Array.from(localById.values());
          try {
            localStorage.setItem(SR_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          console.log('[SolarReturn] Restored', cloudSRs.length, 'SR charts from cloud');
          return merged;
        });
      } catch (e) {
        console.error('[SolarReturn] Cloud restore error:', e);
      }
    };

    restore();
  }, []);

  // Debounced sync to cloud whenever charts change
  useEffect(() => {
    if (!cloudRestoreDone.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      solarReturnCharts.forEach(chart => {
        syncSRToCloud(chart, deviceId.current, userIdRef.current);
      });
    }, 2000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [solarReturnCharts]);

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
    deleteSRFromCloud(id, deviceId.current, userIdRef.current);
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
