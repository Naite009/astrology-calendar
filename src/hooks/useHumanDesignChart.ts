import { useState, useCallback, useEffect, useRef } from 'react';
import { HumanDesignChart } from '@/types/humanDesign';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'humanDesignCharts';
const BACKUP_VERSIONS = ['__backup_v1', '__backup_v2', '__backup_v3'];
const DEVICE_ID_KEY = 'astro_device_id';
const HD_CHART_PREFIX = 'hd_';

const getDeviceId = (): string => {
  return localStorage.getItem(DEVICE_ID_KEY) || 'unknown';
};

// Helper to safely parse JSON from localStorage
const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch (e) {
    console.error(`[HDChart] Failed to parse ${key}:`, e);
  }
  return fallback;
};

// Validate chart data - more permissive to allow partial charts
const isValidChart = (chart: HumanDesignChart | null): boolean => {
  if (!chart) return false;
  if (!chart.name || chart.name.trim() === '') return false;
  if (!chart.type) return false;
  return true;
};

// Validate chart array
const isValidChartArray = (charts: HumanDesignChart[] | null): boolean => {
  return Array.isArray(charts);
};

// Read with rolling backups
const readWithRollingBackups = <T,>(
  key: string,
  fallback: T,
  validator: (data: T | null) => boolean
): T => {
  const primary = safeParseJSON<T>(key, fallback);
  if (validator(primary)) {
    return primary;
  }

  for (const suffix of BACKUP_VERSIONS) {
    const backup = safeParseJSON<T>(`${key}${suffix}`, fallback);
    if (validator(backup)) {
      console.log(`[HDChart] Restored ${key} from ${suffix}`);
      try {
        localStorage.setItem(key, JSON.stringify(backup));
      } catch (e) {
        console.warn(`[HDChart] Failed to repair ${key}:`, e);
      }
      return backup;
    }
  }

  return fallback;
};

// Save with rolling backups
const saveWithRollingBackups = (key: string, data: unknown): void => {
  try {
    const v2 = localStorage.getItem(`${key}${BACKUP_VERSIONS[1]}`);
    if (v2) localStorage.setItem(`${key}${BACKUP_VERSIONS[2]}`, v2);

    const v1 = localStorage.getItem(`${key}${BACKUP_VERSIONS[0]}`);
    if (v1) localStorage.setItem(`${key}${BACKUP_VERSIONS[1]}`, v1);

    const current = localStorage.getItem(key);
    if (current) localStorage.setItem(`${key}${BACKUP_VERSIONS[0]}`, current);

    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[HDChart] Failed to save ${key}:`, e);
  }
};

export const useHumanDesignChart = () => {
  const [charts, setCharts] = useState<HumanDesignChart[]>(() => {
    return readWithRollingBackups<HumanDesignChart[]>(STORAGE_KEY, [], isValidChartArray);
  });

  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const cloudSyncDoneRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Cloud sync helpers ---

  const syncChartToCloud = useCallback(async (chart: HumanDesignChart) => {
    if (!chart.id || !chart.name) return;
    const chartId = `${HD_CHART_PREFIX}${chart.id}`;
    const deviceId = getDeviceId();

    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      const baseLookup = supabase
        .from('device_charts')
        .select('id')
        .eq('chart_id', chartId)
        .limit(1);

      const { data: existing } = userId
        ? await baseLookup.eq('user_id', userId)
        : await baseLookup.eq('device_id', deviceId);

      const payload = {
        chart_data: JSON.parse(JSON.stringify(chart)),
        chart_name: chart.name,
        updated_at: new Date().toISOString(),
      };

      if (existing && existing.length > 0) {
        await supabase.from('device_charts').update(payload).eq('id', existing[0].id);
        console.log('[HDChart] Cloud updated:', chart.name);
      } else {
        const insertData: Record<string, unknown> = {
          device_id: deviceId,
          chart_id: chartId,
          chart_name: chart.name,
          chart_data: payload.chart_data,
        };
        if (userId) insertData.user_id = userId;
        await supabase.from('device_charts').insert(insertData as never);
        console.log('[HDChart] Cloud inserted:', chart.name);
      }
    } catch (err) {
      console.error('[HDChart] Cloud sync error:', err);
    }
  }, []);

  const syncAllToCloud = useCallback(async (chartsToSync: HumanDesignChart[]) => {
    await Promise.all(chartsToSync.filter(c => c.name).map(syncChartToCloud));
    console.log('[HDChart] Cloud sync complete:', chartsToSync.length, 'charts');
  }, [syncChartToCloud]);

  const debouncedSync = useCallback((chartsToSync: HumanDesignChart[]) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => syncAllToCloud(chartsToSync), 2000);
  }, [syncAllToCloud]);

  // Restore HD charts from cloud
  const restoreFromCloud = useCallback(async (): Promise<HumanDesignChart[]> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      const deviceId = getDeviceId();

      let query = supabase
        .from('device_charts')
        .select('*')
        .like('chart_id', `${HD_CHART_PREFIX}%`)
        .order('updated_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('device_id', deviceId);
      }

      const { data, error } = await query;
      if (error || !data) {
        console.error('[HDChart] Cloud restore error:', error);
        return [];
      }

      // De-dupe by chart_id
      const byId = new Map<string, HumanDesignChart>();
      for (const row of data) {
        const hdId = (row.chart_id as string).replace(HD_CHART_PREFIX, '');
        if (!byId.has(hdId)) {
          const chartData = row.chart_data as unknown as HumanDesignChart;
          byId.set(hdId, { ...chartData, id: hdId });
        }
      }

      const restored = Array.from(byId.values()).filter(isValidChart);
      console.log('[HDChart] Restored', restored.length, 'HD charts from cloud');
      return restored;
    } catch (err) {
      console.error('[HDChart] Cloud restore exception:', err);
      return [];
    }
  }, []);

  // On mount: check cloud for HD charts
  useEffect(() => {
    if (cloudSyncDoneRef.current) return;
    cloudSyncDoneRef.current = true;

    const init = async () => {
      const cloudCharts = await restoreFromCloud();

      if (cloudCharts.length > 0) {
        // Merge: cloud charts take priority for same ID, add new ones
        const localMap = new Map(charts.map(c => [c.id, c]));
        let changed = false;

        for (const cc of cloudCharts) {
          if (!localMap.has(cc.id)) {
            localMap.set(cc.id, cc);
            changed = true;
          }
        }

        if (changed) {
          const merged = Array.from(localMap.values());
          saveWithRollingBackups(STORAGE_KEY, merged);
          setCharts(merged);
          console.log('[HDChart] Merged cloud charts, total:', merged.length);
        }
      }

      // Sync local to cloud
      if (charts.length > 0) {
        debouncedSync(charts);
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync on changes
  useEffect(() => {
    if (!cloudSyncDoneRef.current) return;
    debouncedSync(charts);
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [charts, debouncedSync]);

  const addChart = useCallback((chart: HumanDesignChart) => {
    if (!isValidChart(chart)) {
      console.warn('[HDChart] Attempted to add invalid chart, ignoring');
      return null;
    }

    const newChart = { ...chart, id: chart.id || Date.now().toString() };
    const updated = [...charts, newChart];

    saveWithRollingBackups(STORAGE_KEY, updated);
    setCharts(updated);
    return newChart;
  }, [charts]);

  const updateChart = useCallback((id: string, updates: Partial<HumanDesignChart>) => {
    const { id: _ignoredId, ...safeUpdates } = updates;

    const updated = charts.map(c =>
      c.id === id ? { ...c, ...safeUpdates, updatedAt: new Date().toISOString() } : c
    );

    saveWithRollingBackups(STORAGE_KEY, updated);
    setCharts(updated);
  }, [charts]);

  const deleteChart = useCallback(async (id: string) => {
    const updated = charts.filter(c => c.id !== id);
    saveWithRollingBackups(STORAGE_KEY, updated);
    setCharts(updated);

    if (selectedChartId === id) {
      setSelectedChartId(null);
    }

    // Also delete from cloud
    try {
      const chartId = `${HD_CHART_PREFIX}${id}`;
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      const deleteQuery = userId
        ? supabase.from('device_charts').delete().eq('user_id', userId).eq('chart_id', chartId)
        : supabase.from('device_charts').delete().eq('device_id', getDeviceId()).eq('chart_id', chartId);

      await deleteQuery;
      console.log('[HDChart] Deleted from cloud:', id);
    } catch (err) {
      console.error('[HDChart] Cloud delete error:', err);
    }
  }, [charts, selectedChartId]);

  const getChart = useCallback((id: string): HumanDesignChart | undefined => {
    return charts.find(c => c.id === id);
  }, [charts]);

  const selectChart = useCallback((id: string | null) => {
    setSelectedChartId(id);
  }, []);

  const selectedChart = selectedChartId ? getChart(selectedChartId) : null;

  return {
    charts,
    selectedChart,
    selectedChartId,
    addChart,
    updateChart,
    deleteChart,
    getChart,
    selectChart,
    setCharts,
  };
};
