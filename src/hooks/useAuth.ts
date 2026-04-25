import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { claimAnonymousChartsForUser } from '@/lib/claimAnonymousCharts';
import { getSessionSafely, readCachedSupabaseSession } from '@/lib/supabaseSessionRecovery';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restorePendingRef = useRef(true);
  const explicitSignOutRef = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user && restorePendingRef.current) {
          return;
        }

        const recoveredSession = session ?? readCachedSupabaseSession();

        if (!recoveredSession?.user && !explicitSignOutRef.current) {
          console.info('[useAuth] Ignoring transient null session event', event);
          setIsLoading(false);
          return;
        }

        setSession(recoveredSession);
        setUser(recoveredSession?.user ?? null);
        setIsLoading(false);
        explicitSignOutRef.current = false;

        // The moment we have a user, attach any anonymous charts on this
        // device to their account so charts persist across devices forever.
        // Fire-and-forget — never await inside onAuthStateChange.
        if (recoveredSession?.user?.id) {
          void claimAnonymousChartsForUser(recoveredSession.user.id);
        }
      }
    );

    // THEN check for existing session, but never let a flaky refresh request
    // keep the whole app stuck on "Reconnecting".
    void (async () => {
      const session = await getSessionSafely('app auth session restore');
      restorePendingRef.current = false;

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user?.id) {
        void claimAnonymousChartsForUser(session.user.id);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    explicitSignOutRef.current = true;
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
};
