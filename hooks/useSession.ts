import { useEffect } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export function useSession() {
  const { setSession, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      },
    );

    // Refresh session on app foreground
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
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }
}
