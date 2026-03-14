import { create } from 'zustand';
import { SharerPin, StorePin } from '@/types';

interface MapState {
  nearbySharers: SharerPin[];
  nearbyStores: StorePin[];
  selectedPin: SharerPin | StorePin | null;
  setNearbySharers: (sharers: SharerPin[]) => void;
  setNearbyStores: (stores: StorePin[]) => void;
  selectPin: (pin: SharerPin | StorePin | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  nearbySharers: [],
  nearbyStores: [],
  selectedPin: null,
  setNearbySharers: (sharers) => set({ nearbySharers: sharers }),
  setNearbyStores: (stores) => set({ nearbyStores: stores }),
  selectPin: (pin) => set({ selectedPin: pin }),
}));
