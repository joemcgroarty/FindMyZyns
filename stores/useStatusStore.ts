import { create } from 'zustand';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

interface StatusState {
  status: 'offline' | 'sharing' | 'needing';
  sharingProduct: Product | null;
  setStatus: (status: 'offline' | 'sharing' | 'needing', productId?: string) => Promise<void>;
  setSharingProduct: (product: Product | null) => void;
  updateLocation: (lat: number, lng: number) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  status: 'offline',
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

    await supabase.from('profiles').update(update).eq('id', userId);
    set({ status });
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
