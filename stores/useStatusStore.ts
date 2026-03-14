import { create } from 'zustand';
import { Product } from '@/types';

interface StatusState {
  status: 'offline' | 'sharing' | 'needing';
  sharingProduct: Product | null;
  setStatus: (status: 'offline' | 'sharing' | 'needing') => void;
  setSharingProduct: (product: Product | null) => void;
}

export const useStatusStore = create<StatusState>((set) => ({
  status: 'offline',
  sharingProduct: null,
  setStatus: (status) => set({ status }),
  setSharingProduct: (product) => set({ sharingProduct: product }),
}));
