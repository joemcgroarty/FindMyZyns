import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  error: null,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearError: () => set({ error: null }),

  signUp: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      const message = error.message === 'User already registered'
        ? 'An account with this email already exists'
        : error.message;
      set({ error: message });
      return { success: false, error: message };
    }
    return { success: true };
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const message = error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message;
      set({ error: message });
      return { success: false, error: message };
    }
    if (data.session) {
      set({ session: data.session });
      await get().refreshProfile();
    }
    return { success: true };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, error: null });
  },

  refreshProfile: async () => {
    const session = get().session;
    if (!session?.user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (data) {
      set({ profile: data as Profile });
    }
  },
}));
