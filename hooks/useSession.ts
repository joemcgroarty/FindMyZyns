import { useEffect } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

async function ensureProfile(userId: string) {
  let { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // If profile doesn't exist (trigger may have failed), create it
  if (!data) {
    await supabase.from('profiles').insert({ id: userId });
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    data = result.data;
  }

  return data;
}

export function useSession() {
  const { setSession, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          const profile = await ensureProfile(session.user.id);
          if (mounted) setProfile(profile);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          const profile = await ensureProfile(session.user.id);
          if (mounted) setProfile(profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
    );

    const appStateSubscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);
}
