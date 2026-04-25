import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_SESSION_TIMEOUT_MS = 8_000;

const timeout = (ms: number, label: string) =>
  new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });

const candidateAuthKeys = (): string[] => {
  const keys = new Set<string>();
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (projectId) keys.add(`sb-${projectId}-auth-token`);

  try {
    const ref = new URL(supabaseUrl).hostname.split('.')[0];
    if (ref) keys.add(`sb-${ref}-auth-token`);
  } catch {
    // ignore malformed env values
  }

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith('sb-') && key.endsWith('-auth-token')) {
        keys.add(key);
      }
    }
  } catch {
    // localStorage can throw in restricted browser modes
  }

  return Array.from(keys);
};

const asSession = (value: unknown): Session | null => {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  const nested = raw.currentSession && typeof raw.currentSession === 'object'
    ? raw.currentSession as Record<string, unknown>
    : raw;

  const user = nested.user as { id?: unknown } | undefined;
  if (typeof nested.access_token !== 'string') return null;
  if (typeof nested.refresh_token !== 'string') return null;
  if (!user || typeof user.id !== 'string') return null;

  return nested as unknown as Session;
};

export const readCachedSupabaseSession = (): Session | null => {
  for (const key of candidateAuthKeys()) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const session = asSession(parsed);
      if (session) return session;
    } catch {
      // Try the next storage key.
    }
  }

  return null;
};

export const getSessionSafely = async (
  label = 'session lookup',
  timeoutMs = DEFAULT_SESSION_TIMEOUT_MS,
): Promise<Session | null> => {
  try {
    const { data } = await Promise.race([
      supabase.auth.getSession(),
      timeout(timeoutMs, label),
    ]);
    return data.session ?? readCachedSupabaseSession();
  } catch (err) {
    console.warn(`[authRecovery] ${label} failed; using cached session if available`, err);
    return readCachedSupabaseSession();
  }
};

export const getCachedUserId = (): string | null => {
  return readCachedSupabaseSession()?.user?.id ?? null;
};
