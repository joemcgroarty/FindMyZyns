import { create } from 'zustand';
import { SharerPin, StorePin } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';
import { fetchNearbyStores as fetchStoresFromApi } from '@/lib/stores';

interface MapState {
  nearbySharers: SharerPin[];
  nearbyStores: StorePin[];
  selectedPin: SharerPin | StorePin | null;
  setNearbySharers: (sharers: SharerPin[]) => void;
  setNearbyStores: (stores: StorePin[]) => void;
  selectPin: (pin: SharerPin | StorePin | null) => void;
  fetchNearbySharers: (lat: number, lng: number) => Promise<void>;
  fetchNearbyStores: (lat: number, lng: number) => Promise<void>;
  subscribeToMapUpdates: () => () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  nearbySharers: [],
  nearbyStores: [],
  selectedPin: null,
  setNearbySharers: (sharers) => set({ nearbySharers: sharers }),
  setNearbyStores: (stores) => set({ nearbyStores: stores }),
  selectPin: (pin) => set({ selectedPin: pin }),

  fetchNearbySharers: async (lat, lng) => {
    const userId = useAuthStore.getState().session?.user?.id;
    const { data } = await supabase.rpc('get_nearby_sharers', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: 5000,
    });
    if (data) {
      // Filter out self
      const filtered = (data as SharerPin[]).filter((s) => s.id !== userId);
      set({ nearbySharers: filtered });
    }
  },

  fetchNearbyStores: async (lat, lng) => {
    const stores = await fetchStoresFromApi(lat, lng);
    set({ nearbyStores: stores });
  },

  subscribeToMapUpdates: () => {
    const channel = supabase
      .channel('map-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>;
          const userId = useAuthStore.getState().session?.user?.id;

          if (updated.id === userId) return;

          if (updated.status === 'sharing' && updated.location) {
            // Update or add this sharer
            set((state) => {
              const existing = state.nearbySharers.findIndex(
                (s) => s.id === updated.id,
              );
              if (existing >= 0) {
                const newSharers = [...state.nearbySharers];
                newSharers[existing] = {
                  ...newSharers[existing]!,
                  latitude: updated.latitude as number,
                  longitude: updated.longitude as number,
                  karma: updated.karma as number,
                };
                return { nearbySharers: newSharers };
              }
              // New sharer — will be picked up on next fetch
              return state;
            });
          } else {
            // User went offline or needing — remove from map
            set((state) => ({
              nearbySharers: state.nearbySharers.filter(
                (s) => s.id !== updated.id,
              ),
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
