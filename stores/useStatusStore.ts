import { create } from 'zustand';
import { Platform } from 'react-native';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

// Persist status in localStorage on web so it survives refresh
function getSavedStatus(): 'offline' | 'sharing' | 'needing' {
  try {
    const saved = typeof window !== 'undefined' ? window.localStorage?.getItem('fmz_status') : null;
    if (saved === 'sharing' || saved === 'needing') return saved;
  } catch {}
  return 'offline';
}

interface StatusState {
  status: 'offline' | 'sharing' | 'needing';
  sharingProduct: Product | null;
  setStatus: (status: 'offline' | 'sharing' | 'needing', productId?: string) => Promise<void>;
  setSharingProduct: (product: Product | null) => void;
  updateLocation: (lat: number, lng: number) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  status: getSavedStatus(),
  sharingProduct: null,
  setSharingProduct: (product) => set({ sharingProduct: product }),

  setStatus: async (status, productId) => {
    const userId = useAuthStore.getState().session?.user?.id;
    if (!userId) return;

    const update: Record<string, unknown> = { status };
    if (status === 'sharing' && productId) {
      update.sharing_product_id = productId;
    }
    if (status === 'offline') {
      update.location = null;
      update.location_updated_at = null;
      update.sharing_product_id = null;
    }

    const { error } = await supabase.from('profiles').update(update).eq('id', userId);
    if (error) {
      console.error('Failed to update status:', error.message);
      return;
    }
    set({ status });
    // Persist to localStorage on web
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('fmz_status', status);
      }
    } catch {}
  },

  updateLocation: async (lat, lng) => {
    const userId = useAuthStore.getState().session?.user?.id;
    if (!userId) return;

    await supabase
      .from('profiles')
      .update({
        location: `POINT(${lng} ${lat})`,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  },
}));
