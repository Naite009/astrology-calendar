import { useCallback, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { NatalChart } from './useNatalChart';
import { toast } from 'sonner';
import { getCachedUserId, getSessionSafely, readCachedSupabaseSession } from '@/lib/supabaseSessionRecovery';

const DEVICE_ID_KEY = 'astro_device_id';
const LAST_SYNC_KEY = 'astro_last_cloud_sync';
const CLOUD_REQUEST_TIMEOUT_MS = 8_000;
const RESTORE_RETRY_DELAYS_MS = [0, 1_500, 3_000];

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
};

// Generate a unique device ID on first visit (fallback for anonymous users)
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
  user_id: string | null;
}

interface CloudBackupState {
  isLoading: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  cloudChartCount: number;
  hasCloudData: boolean;
  isAuthenticated: boolean;
}

export const useCloudBackup = (
  userNatalChart: NatalChart | null,
  savedCharts: NatalChart[],
  setSavedCharts: (charts: NatalChart[]) => void,
  saveUserNatalChart: (chart: NatalChart) => void
) => {
  const deviceId = useRef<string>(getOrCreateDeviceId());
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<CloudBackupState>({
    isLoading: true,
    isSyncing: false,
    lastSync: null,
    cloudChartCount: 0,
    hasCloudData: false,
    isAuthenticated: false,
  });
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialCheckDoneRef = useRef(false);
  const hasShownRestoreToastRef = useRef(false);
  const restorePendingRef = useRef(true);
  // Gate: don't run the initial cloud check until we've actually resolved
  // whether there's a session. Otherwise we race getSession() and end up
  // querying by device_id even though the user IS signed in — which makes
  // their profiles appear to vanish on every reload.
  const [authChecked, setAuthChecked] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const hydrateFromCachedSession = (session = readCachedSupabaseSession()) => {
      setUser(session?.user ?? null);
      setState(prev => ({ ...prev, isAuthenticated: !!session?.user }));
      setAuthChecked(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user && restorePendingRef.current) {
          return;
        }

        const recoveredSession = session ?? readCachedSupabaseSession();
        setUser(recoveredSession?.user ?? null);
        setState(prev => ({ ...prev, isAuthenticated: !!recoveredSession?.user }));
        setAuthChecked(true);

        // When user logs in, trigger a sync to fetch their charts
        if (event === 'SIGNED_IN' && recoveredSession?.user) {
          initialCheckDoneRef.current = false; // Reset to allow re-check
        }
      }
    );

    void (async () => {
      const session = await getSessionSafely('cloud backup session restore');
      restorePendingRef.current = false;
      hydrateFromCachedSession(session);
    })();

    return () => subscription.unsubscribe();
  }, []);

  // Fetch charts from cloud - by user_id if authenticated, else by device_id
  const fetchCloudCharts = useCallback(async (): Promise<CloudChart[]> => {
    const cachedUserId = user?.id ?? getCachedUserId();

    for (const [attemptIndex, delayMs] of RESTORE_RETRY_DELAYS_MS.entries()) {
      if (delayMs > 0) await wait(delayMs);

      try {
        let query = supabase
          .from('device_charts')
          .select('*')
          .order('updated_at', { ascending: false });
        
        // If authenticated, fetch by user_id; otherwise by device_id
        if (cachedUserId) {
          query = query.eq('user_id', cachedUserId);
        } else {
          query = query.eq('device_id', deviceId.current);
        }
        
        const { data, error } = await withTimeout(query, CLOUD_REQUEST_TIMEOUT_MS, 'device_charts fetch');

        if (error) {
          console.error('[CloudBackup] Error fetching cloud charts:', error);
          continue;
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
          user_id: (row as unknown as CloudChart).user_id,
        })) as CloudChart[];
      } catch (err) {
        console.error(`[CloudBackup] Exception fetching cloud charts (attempt ${attemptIndex + 1}):`, err);
      }
    }

    return [];
  }, [user]);

  // Sync a single chart to cloud
  const syncChartToCloud = useCallback(async (chart: NatalChart) => {
    if (!chart.id || !chart.name) return;

    try {
      // Find existing rows (there may be duplicates if a previous bug inserted multiple rows)
      const baseLookup = supabase
        .from('device_charts')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10);

      const { data: existingRows, error: lookupError } = user?.id
        ? await baseLookup.eq('user_id', user.id).eq('chart_id', chart.id)
        : await baseLookup.eq('device_id', deviceId.current).eq('chart_id', chart.id);

      if (lookupError) {
        console.error('[CloudBackup] Error looking up existing chart rows:', chart.name, lookupError);
        return;
      }

      const keepRowId = existingRows?.[0]?.id;

      // If duplicates exist, delete extras so we stop compounding duplicates on refresh/sync
      if (existingRows && existingRows.length > 1) {
        const extraIds = existingRows.slice(1).map(r => r.id);
        const deleteQuery = supabase.from('device_charts').delete().in('id', extraIds);
        const { error: deleteError } = await deleteQuery;
        if (deleteError) {
          console.warn('[CloudBackup] Failed to delete duplicate cloud rows:', deleteError);
        } else {
          console.log('[CloudBackup] Deleted duplicate cloud rows:', extraIds.length);
        }
      }

      if (keepRowId) {
        // Update the kept record
        const { error } = await supabase
          .from('device_charts')
          .update({
            chart_data: JSON.parse(JSON.stringify(chart)),
            chart_name: chart.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', keepRowId);

        if (error) {
          console.error('[CloudBackup] Error updating chart:', chart.name, error);
        } else {
          console.log('[CloudBackup] Updated chart:', chart.name);
        }
      } else {
        // Insert new record
        const insertData: Record<string, unknown> = {
          device_id: deviceId.current,
          chart_id: chart.id,
          chart_data: JSON.parse(JSON.stringify(chart)),
          chart_name: chart.name,
        };

        // Add user_id if authenticated
        if (user?.id) {
          insertData.user_id = user.id;
        }

        const { error } = await supabase.from('device_charts').insert(insertData as never);

        if (error) {
          console.error('[CloudBackup] Error inserting chart:', chart.name, error);
        } else {
          console.log('[CloudBackup] Inserted chart:', chart.name);
        }
      }
    } catch (err) {
      console.error('[CloudBackup] Exception syncing chart:', err);
    }
  }, [user]);

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

      // De-dupe by chart_id (keep the most recently updated row)
      const byChartId = new Map<string, CloudChart>();
      for (const cc of cloudCharts) {
        const existing = byChartId.get(cc.chart_id);
        if (!existing || new Date(cc.updated_at).getTime() > new Date(existing.updated_at).getTime()) {
          byChartId.set(cc.chart_id, cc);
        }
      }

      const deduped = Array.from(byChartId.values());

      // CRITICAL: read the LATEST local saved charts directly from storage.
      // Reading from the `savedCharts` closure variable risks wiping a chart
      // the user just added (e.g., between auth-check and cloud-fetch) because
      // the closure captures a stale value. Storage is the source of truth.
      let localCharts: NatalChart[] = [];
      try {
        const raw = localStorage.getItem('savedCharts');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localCharts = parsed.filter(c => c && c.name);
        }
      } catch {
        localCharts = savedCharts;
      }

      // Build a merged map keyed by normalized name. Local-only charts are
      // preserved; cloud charts fill in missing names; if both exist, prefer
      // the entry with more planet data (otherwise the cloud copy).
      const mergedByName = new Map<string, NatalChart>();

      const planetCount = (c: NatalChart): number => {
        if (!c?.planets) return 0;
        try {
          return Object.values(c.planets).filter((p: any) => p && p.sign).length;
        } catch {
          return 0;
        }
      };

      // Seed with local saved charts first so they survive even if cloud
      // dedup would otherwise drop them.
      for (const lc of localCharts) {
        if ((lc as any).solarReturnYear) continue;
        if (lc.id?.startsWith('hd_')) continue;
        const key = (lc.name || '').toLowerCase().trim();
        if (!key) continue;
        mergedByName.set(key, lc);
      }

      for (const cloudChart of deduped) {
        const chartData = cloudChart.chart_data as unknown as NatalChart;

        // Skip solar return charts that may have leaked into device_charts
        if ((chartData as any).solarReturnYear) continue;
        // Skip HD-only charts
        if (cloudChart.chart_id.startsWith('hd_')) continue;

        if (cloudChart.chart_id === 'user') {
          saveUserNatalChart(chartData);
          restoredCount++;
          continue;
        }

        const normName = (chartData.name || '').toLowerCase().trim();
        if (!normName) continue;

        const cloudVersion: NatalChart = {
          ...chartData,
          id: cloudChart.chart_id,
        };

        const existing = mergedByName.get(normName);
        if (!existing) {
          mergedByName.set(normName, cloudVersion);
          restoredCount++;
        } else if (planetCount(cloudVersion) > planetCount(existing)) {
          // Cloud has richer data — prefer it.
          mergedByName.set(normName, cloudVersion);
        }
        // else: keep local copy (preserves locally-added charts not yet synced)
      }

      const restoredSavedCharts = Array.from(mergedByName.values());

      if (restoredSavedCharts.length > 0) {
        setSavedCharts(restoredSavedCharts);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasCloudData: true,
        cloudChartCount: deduped.length,
      }));

      if (restoredCount > 0 && !hasShownRestoreToastRef.current) {
        hasShownRestoreToastRef.current = true;
        // Silent restore - no toast needed
      }

      console.log('[CloudBackup] Restored', restoredCount, 'charts from cloud (deduped from', cloudCharts.length, ')');
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
      const deleteQuery = user?.id
        ? supabase.from('device_charts').delete().eq('user_id', user.id).eq('chart_id', chartId)
        : supabase.from('device_charts').delete().eq('device_id', deviceId.current).eq('chart_id', chartId);
      
      const { error } = await deleteQuery;

      if (error) {
        console.error('[CloudBackup] Error deleting from cloud:', error);
      } else {
        console.log('[CloudBackup] Deleted chart from cloud:', chartId);
      }
    } catch (err) {
      console.error('[CloudBackup] Exception deleting from cloud:', err);
    }
  }, [user]);

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

  // Initial check on mount - restore from cloud if local is empty.
  // CRITICAL: wait until authChecked === true so we query by user_id (not device_id)
  // when the user is actually signed in. Otherwise their profiles appear to vanish
  // on every reload because we fetch the wrong scope.
  useEffect(() => {
    if (!authChecked) return;
    if (initialCheckDoneRef.current) return;
    initialCheckDoneRef.current = true;

    let cancelled = false;
    const checkAndRestore = async () => {
      // Check if local storage is empty
      const hasLocalUser = userNatalChart && userNatalChart.name;
      const hasLocalSaved = savedCharts.length > 0;
      const localSavedCount = savedCharts.length;
      
      // Always check cloud to see if there are more charts than local
      console.log('[CloudBackup] Checking cloud for charts...', { authedAs: user?.id ?? getCachedUserId() ?? 'device' });
      const cloudCharts = await fetchCloudCharts();
      if (cancelled) return;
      
      // Count non-user charts in cloud
      const cloudSavedCount = cloudCharts.filter(c => c.chart_id !== 'user' && !c.chart_id.startsWith('sr_')).length;
      
      if (!hasLocalUser && !hasLocalSaved && cloudCharts.length > 0) {
        // Local is completely empty, restore everything from cloud
        console.log('[CloudBackup] Local storage empty, restoring', cloudCharts.length, 'charts from cloud...');
        await restoreFromCloud();
      } else if (cloudSavedCount > localSavedCount) {
        // Cloud has more saved charts than local - merge them in
        console.log('[CloudBackup] Cloud has more charts (' + cloudSavedCount + ') than local (' + localSavedCount + '), restoring...');
        await restoreFromCloud();
      } else if (hasLocalUser || hasLocalSaved) {
        // Local has data and cloud doesn't have more, sync local to cloud
        console.log('[CloudBackup] Local has data, syncing to cloud...');
        setState(prev => ({ ...prev, isLoading: false }));
        triggerSync();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    void checkAndRestore();
    return () => {
      cancelled = true;
    };
  }, [authChecked, user?.id, userNatalChart, savedCharts, fetchCloudCharts, restoreFromCloud, triggerSync]);

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

  // When user changes (login/logout), re-check cloud data - but only once per user
  const lastFetchedUserIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    const fetchOnAuthChange = async () => {
      // Skip if we already fetched for this user
      if (user?.id && user.id === lastFetchedUserIdRef.current) {
        return;
      }
      
      if (user?.id) {
        console.log('[CloudBackup] User logged in, fetching their charts...');
        lastFetchedUserIdRef.current = user.id;
        
        // Fetch charts for this user
        const cloudCharts = await fetchCloudCharts();
        if (cloudCharts.length > 0) {
          console.log('[CloudBackup] Found', cloudCharts.length, 'charts for user, restoring...');
          await restoreFromCloud();
        }
      } else {
        // User logged out, reset
        lastFetchedUserIdRef.current = null;
      }
    };
    
    fetchOnAuthChange();
  }, [user?.id, fetchCloudCharts, restoreFromCloud]);

  return {
    ...state,
    user,
    deviceId: deviceId.current,
    syncNow: syncAllToCloud,
    restoreFromCloud,
    deleteFromCloud,
    exportAllCharts,
    importFromJson,
  };
};
