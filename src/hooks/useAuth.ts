import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { claimAnonymousChartsForUser } from '@/lib/claimAnonymousCharts';
import { waitForInitialSessionRestore } from '@/lib/sessionKeepAlive';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restorePendingRef = useRef(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user && restorePendingRef.current) {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // The moment we have a user, attach any anonymous charts on this
        // device to their account so charts persist across devices forever.
        // Fire-and-forget — never await inside onAuthStateChange.
        if (session?.user?.id) {
          void claimAnonymousChartsForUser(session.user.id);
        }
      }
    );

    // THEN check for existing session
    void (async () => {
      await waitForInitialSessionRestore();
      restorePendingRef.current = false;

      const { data: { session } } = await supabase.auth.getSession();
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
