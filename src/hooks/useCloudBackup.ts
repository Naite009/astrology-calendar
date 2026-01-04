import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NatalChart } from './useNatalChart';
import { toast } from 'sonner';

const DEVICE_ID_KEY = 'astro_device_id';
const LAST_SYNC_KEY = 'astro_last_cloud_sync';

// Generate a unique device ID on first visit
const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    console.log('[CloudBackup] Created new device ID:', deviceId);
  }
  return deviceId;
};

interface CloudChart {
  id: string;
  device_id: string;
  chart_id: string;
  chart_data: NatalChart;
  chart_name: string;
  created_at: string;
  updated_at: string;
}

interface CloudBackupState {
  isLoading: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  cloudChartCount: number;
  hasCloudData: boolean;
}

export const useCloudBackup = (
  userNatalChart: NatalChart | null,
  savedCharts: NatalChart[],
  setSavedCharts: (charts: NatalChart[]) => void,
  saveUserNatalChart: (chart: NatalChart) => void
) => {
  const deviceId = useRef<string>(getOrCreateDeviceId());
  const [state, setState] = useState<CloudBackupState>({
    isLoading: true,
    isSyncing: false,
    lastSync: null,
    cloudChartCount: 0,
    hasCloudData: false,
  });
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialCheckDoneRef = useRef(false);

  // Fetch charts from cloud for this device
  const fetchCloudCharts = useCallback(async (): Promise<CloudChart[]> => {
    try {
      const { data, error } = await supabase
        .from('device_charts')
        .select('*')
        .eq('device_id', deviceId.current)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[CloudBackup] Error fetching cloud charts:', error);
        return [];
      }

      // Transform database response to CloudChart type
      return (data || []).map(row => ({
        id: row.id,
        device_id: row.device_id,
        chart_id: row.chart_id,
        chart_data: row.chart_data as unknown as NatalChart,
        chart_name: row.chart_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as CloudChart[];
    } catch (err) {
      console.error('[CloudBackup] Exception fetching cloud charts:', err);
      return [];
    }
  }, []);

  // Sync a single chart to cloud
  const syncChartToCloud = useCallback(async (chart: NatalChart) => {
    if (!chart.id || !chart.name) return;

    try {
      // First check if record exists
      const { data: existing } = await supabase
        .from('device_charts')
        .select('id')
        .eq('device_id', deviceId.current)
        .eq('chart_id', chart.id)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('device_charts')
          .update({
            chart_data: JSON.parse(JSON.stringify(chart)),
            chart_name: chart.name,
            updated_at: new Date().toISOString(),
          })
          .eq('device_id', deviceId.current)
          .eq('chart_id', chart.id);

        if (error) {
          console.error('[CloudBackup] Error updating chart:', chart.name, error);
        } else {
          console.log('[CloudBackup] Updated chart:', chart.name);
        }
      } else {
        // Insert new record using raw query to bypass type checking
        const insertData = {
          device_id: deviceId.current,
          chart_id: chart.id,
          chart_data: JSON.parse(JSON.stringify(chart)),
          chart_name: chart.name,
        };
        
        const { error } = await supabase
          .from('device_charts')
          .insert(insertData as never);

        if (error) {
          console.error('[CloudBackup] Error inserting chart:', chart.name, error);
        } else {
          console.log('[CloudBackup] Inserted chart:', chart.name);
        }
      }
    } catch (err) {
      console.error('[CloudBackup] Exception syncing chart:', err);
    }
  }, []);

  // Sync all charts to cloud (debounced)
  const syncAllToCloud = useCallback(async () => {
    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const chartsToSync: NatalChart[] = [];
      
      if (userNatalChart?.name) {
        chartsToSync.push({ ...userNatalChart, id: 'user' });
      }
      
      savedCharts.forEach(chart => {
        if (chart.name) {
          chartsToSync.push(chart);
        }
      });

      // Sync all charts in parallel
      await Promise.all(chartsToSync.map(syncChartToCloud));

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: now,
        cloudChartCount: chartsToSync.length,
        hasCloudData: chartsToSync.length > 0,
      }));
      
      console.log('[CloudBackup] Full sync complete:', chartsToSync.length, 'charts');
    } catch (err) {
      console.error('[CloudBackup] Sync failed:', err);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [userNatalChart, savedCharts, syncChartToCloud]);

  // Debounced sync trigger
  const triggerSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      syncAllToCloud();
    }, 2000); // Wait 2 seconds after last change before syncing
  }, [syncAllToCloud]);

  // Restore from cloud (called when local data is empty but cloud has data)
  const restoreFromCloud = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const cloudCharts = await fetchCloudCharts();
      
      if (cloudCharts.length === 0) {
        setState(prev => ({ ...prev, isLoading: false, hasCloudData: false }));
        return false;
      }

      let restoredCount = 0;
      const restoredSavedCharts: NatalChart[] = [];

      for (const cloudChart of cloudCharts) {
        const chartData = cloudChart.chart_data as unknown as NatalChart;
        
        if (cloudChart.chart_id === 'user') {
          saveUserNatalChart(chartData);
          restoredCount++;
        } else {
          restoredSavedCharts.push({
            ...chartData,
            id: cloudChart.chart_id,
          });
          restoredCount++;
        }
      }

      if (restoredSavedCharts.length > 0) {
        setSavedCharts(restoredSavedCharts);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasCloudData: true,
        cloudChartCount: cloudCharts.length,
      }));

      if (restoredCount > 0) {
        toast.success(`Restored ${restoredCount} chart${restoredCount > 1 ? 's' : ''} from cloud backup`);
      }
      
      console.log('[CloudBackup] Restored', restoredCount, 'charts from cloud');
      return restoredCount > 0;
    } catch (err) {
      console.error('[CloudBackup] Restore failed:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [fetchCloudCharts, saveUserNatalChart, setSavedCharts]);

  // Delete a chart from cloud
  const deleteFromCloud = useCallback(async (chartId: string) => {
    try {
      const { error } = await supabase
        .from('device_charts')
        .delete()
        .eq('device_id', deviceId.current)
        .eq('chart_id', chartId);

      if (error) {
        console.error('[CloudBackup] Error deleting from cloud:', error);
      } else {
        console.log('[CloudBackup] Deleted chart from cloud:', chartId);
      }
    } catch (err) {
      console.error('[CloudBackup] Exception deleting from cloud:', err);
    }
  }, []);

  // Export all charts as JSON
  const exportAllCharts = useCallback((): string => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      deviceId: deviceId.current,
      userChart: userNatalChart,
      savedCharts: savedCharts,
    };
    return JSON.stringify(exportData, null, 2);
  }, [userNatalChart, savedCharts]);

  // Import charts from JSON
  const importFromJson = useCallback((jsonString: string): { success: boolean; count: number; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      let importCount = 0;

      if (data.userChart && data.userChart.name) {
        saveUserNatalChart(data.userChart);
        importCount++;
      }

      if (Array.isArray(data.savedCharts) && data.savedCharts.length > 0) {
        const validCharts = data.savedCharts.filter((c: NatalChart) => c && c.name);
        if (validCharts.length > 0) {
          setSavedCharts([...savedCharts, ...validCharts.map((c: NatalChart) => ({
            ...c,
            id: c.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
          }))]);
          importCount += validCharts.length;
        }
      }

      toast.success(`Imported ${importCount} chart${importCount > 1 ? 's' : ''}`);
      return { success: true, count: importCount };
    } catch (err) {
      console.error('[CloudBackup] Import failed:', err);
      return { success: false, count: 0, error: 'Invalid JSON format' };
    }
  }, [userNatalChart, savedCharts, saveUserNatalChart, setSavedCharts]);

  // Initial check on mount - restore from cloud if local is empty
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    initialCheckDoneRef.current = true;

    const checkAndRestore = async () => {
      // Check if local storage is empty
      const hasLocalUser = userNatalChart && userNatalChart.name;
      const hasLocalSaved = savedCharts.length > 0;
      
      if (!hasLocalUser && !hasLocalSaved) {
        // Local is empty, check cloud
        console.log('[CloudBackup] Local storage empty, checking cloud...');
        const cloudCharts = await fetchCloudCharts();
        
        if (cloudCharts.length > 0) {
          console.log('[CloudBackup] Found', cloudCharts.length, 'charts in cloud, restoring...');
          await restoreFromCloud();
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        // Local has data, sync to cloud
        console.log('[CloudBackup] Local has data, syncing to cloud...');
        setState(prev => ({ ...prev, isLoading: false }));
        triggerSync();
      }
    };

    checkAndRestore();
  }, [userNatalChart, savedCharts, fetchCloudCharts, restoreFromCloud, triggerSync]);

  // Sync whenever charts change
  useEffect(() => {
    if (!initialCheckDoneRef.current) return;
    triggerSync();
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [userNatalChart, savedCharts, triggerSync]);

  return {
    ...state,
    deviceId: deviceId.current,
    syncNow: syncAllToCloud,
    restoreFromCloud,
    deleteFromCloud,
    exportAllCharts,
    importFromJson,
  };
};
