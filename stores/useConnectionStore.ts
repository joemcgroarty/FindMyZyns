import { create } from 'zustand';
import { Connection, Message } from '@/types';

interface ConnectionState {
  activeConnection: Connection | null;
  pendingRequests: Connection[];
  messages: Message[];
  setActiveConnection: (connection: Connection | null) => void;
  setPendingRequests: (requests: Connection[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  activeConnection: null,
  pendingRequests: [],
  messages: [],
  setActiveConnection: (connection) => set({ activeConnection: connection }),
  setPendingRequests: (requests) => set({ pendingRequests: requests }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
}));
