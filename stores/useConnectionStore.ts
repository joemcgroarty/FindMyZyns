import { create } from 'zustand';
import { Connection, Message, Share } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ConnectionState {
  activeConnection: Connection | null;
  activeShare: Share | null;
  pendingRequests: Connection[];
  messages: Message[];
  isConnecting: boolean;
  isLoadingMessages: boolean;
  connectionChannel: RealtimeChannel | null;
  messagesChannel: RealtimeChannel | null;

  // Setters
  setActiveConnection: (connection: Connection | null) => void;
  setPendingRequests: (requests: Connection[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;

  // Connection actions (FMZ-501, FMZ-502, FMZ-504)
  createConnection: (responderId: string) => Promise<Connection | null>;
  respondToConnection: (
    connectionId: string,
    action: 'accept' | 'decline',
  ) => Promise<boolean>;
  cancelConnection: (connectionId: string) => Promise<boolean>;

  // Chat actions (FMZ-503)
  sendMessage: (connectionId: string, body: string) => Promise<Message | null>;
  fetchMessages: (connectionId: string) => Promise<void>;

  // Share actions (FMZ-601, FMZ-603)
  createShare: (
    connectionId: string,
    sharerId: string,
    receiverId: string,
    productId: string | null,
  ) => Promise<Share | null>;
  confirmShare: (shareId: string) => Promise<Share | null>;
  rateShare: (shareId: string, rating: 1 | -1) => Promise<boolean>;

  // Requests (FMZ-502)
  fetchPendingRequests: () => Promise<void>;

  // Realtime subscriptions
  subscribeToConnection: (connectionId: string) => () => void;
  subscribeToMessages: (connectionId: string) => () => void;

  // Cleanup
  cleanup: () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  activeConnection: null,
  activeShare: null,
  pendingRequests: [],
  messages: [],
  isConnecting: false,
  isLoadingMessages: false,
  connectionChannel: null,
  messagesChannel: null,

  setActiveConnection: (connection) => set({ activeConnection: connection }),
  setPendingRequests: (requests) => set({ pendingRequests: requests }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),

  // FMZ-501: Send Connection Request
  createConnection: async (responderId) => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return null;

    set({ isConnecting: true });
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: session.user.id,
          responder_id: responderId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating connection:', error);
        return null;
      }

      set({ activeConnection: data as Connection });
      return data as Connection;
    } finally {
      set({ isConnecting: false });
    }
  },

  // FMZ-502: Respond to Connection Request
  respondToConnection: async (connectionId, action) => {
    const status = action === 'accept' ? 'accepted' : 'declined';

    const { data, error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      console.error('Error responding to connection:', error);
      return false;
    }

    if (action === 'accept') {
      set({ activeConnection: data as Connection });
    }

    // Remove from pending requests
    set((state) => ({
      pendingRequests: state.pendingRequests.filter(
        (r) => r.id !== connectionId,
      ),
    }));

    return true;
  },

  // FMZ-504: Cancel Connection
  cancelConnection: async (connectionId) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'cancelled' })
      .eq('id', connectionId);

    if (error) {
      console.error('Error cancelling connection:', error);
      return false;
    }

    set({ activeConnection: null, activeShare: null, messages: [] });
    return true;
  },

  // FMZ-503: Send Chat Message
  sendMessage: async (connectionId, body) => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        connection_id: connectionId,
        sender_id: session.user.id,
        body,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data as Message;
  },

  // FMZ-503: Fetch existing messages
  fetchMessages: async (connectionId) => {
    set({ isLoadingMessages: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      set({ messages: (data as Message[]) ?? [] });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  // FMZ-601: Create Share
  createShare: async (connectionId, sharerId, receiverId, productId) => {
    const { data, error } = await supabase
      .from('shares')
      .insert({
        connection_id: connectionId,
        sharer_id: sharerId,
        receiver_id: receiverId,
        product_id: productId,
        sharer_confirmed: false,
        receiver_confirmed: false,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating share:', error);
      return null;
    }

    const share = data as Share;
    set({ activeShare: share });
    return share;
  },

  // FMZ-601: Confirm Share
  confirmShare: async (shareId) => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return null;

    const currentShare = get().activeShare;
    if (!currentShare) return null;

    const isSender = currentShare.sharer_id === session.user.id;
    const updateField = isSender ? 'sharer_confirmed' : 'receiver_confirmed';

    const otherConfirmed = isSender
      ? currentShare.receiver_confirmed
      : currentShare.sharer_confirmed;

    const updates: Record<string, unknown> = {
      [updateField]: true,
    };

    if (otherConfirmed) {
      updates.completed = true;
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('shares')
      .update(updates)
      .eq('id', shareId)
      .select()
      .single();

    if (error) {
      console.error('Error confirming share:', error);
      return null;
    }

    const updatedShare = data as Share;
    set({ activeShare: updatedShare });

    // If completed, update connection status too
    if (updatedShare.completed && currentShare.connection_id) {
      await supabase
        .from('connections')
        .update({ status: 'completed' })
        .eq('id', currentShare.connection_id);
    }

    return updatedShare;
  },

  // FMZ-603: Rate Share
  rateShare: async (shareId, rating) => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return false;

    const currentShare = get().activeShare;
    if (!currentShare) return false;

    const isSender = currentShare.sharer_id === session.user.id;
    const ratingField = isSender ? 'sharer_rating' : 'receiver_rating';
    const otherUserId = isSender
      ? currentShare.receiver_id
      : currentShare.sharer_id;

    const { error } = await supabase
      .from('shares')
      .update({ [ratingField]: rating })
      .eq('id', shareId);

    if (error) {
      console.error('Error rating share:', error);
      return false;
    }

    // Update the other user's karma
    if (rating === 1) {
      await supabase.rpc('increment_karma', { user_id: otherUserId, amount: 1 });
    } else {
      await supabase.rpc('increment_karma', { user_id: otherUserId, amount: -1 });
    }

    // Refresh own profile to get updated karma display
    await useAuthStore.getState().refreshProfile();

    return true;
  },

  // FMZ-502: Fetch Pending Requests
  fetchPendingRequests: async () => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('responder_id', session.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending requests:', error);
      return;
    }

    set({ pendingRequests: (data as Connection[]) ?? [] });
  },

  // Realtime: Subscribe to connection status changes
  subscribeToConnection: (connectionId) => {
    const channel = supabase
      .channel(`connection:${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connections',
          filter: `id=eq.${connectionId}`,
        },
        (payload) => {
          const updated = payload.new as Connection;
          set({ activeConnection: updated });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shares',
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          if (payload.new) {
            set({ activeShare: payload.new as Share });
          }
        },
      )
      .subscribe();

    set({ connectionChannel: channel });

    return () => {
      supabase.removeChannel(channel);
      set({ connectionChannel: null });
    };
  },

  // Realtime: Subscribe to new messages
  subscribeToMessages: (connectionId) => {
    const channel = supabase
      .channel(`messages:${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          set((state) => {
            // Avoid duplicates
            const exists = state.messages.some((m) => m.id === newMessage.id);
            if (exists) return state;
            return { messages: [...state.messages, newMessage] };
          });
        },
      )
      .subscribe();

    set({ messagesChannel: channel });

    return () => {
      supabase.removeChannel(channel);
      set({ messagesChannel: null });
    };
  },

  // Cleanup all subscriptions and state
  cleanup: () => {
    const { connectionChannel, messagesChannel } = get();
    if (connectionChannel) supabase.removeChannel(connectionChannel);
    if (messagesChannel) supabase.removeChannel(messagesChannel);
    set({
      activeConnection: null,
      activeShare: null,
      messages: [],
      connectionChannel: null,
      messagesChannel: null,
    });
  },
}));
