import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ChatBubble } from '@/components/connection/ChatBubble';
import { Profile, Message } from '@/types';

export default function ConnectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuthStore();
  const {
    activeConnection,
    activeShare,
    messages,
    sendMessage,
    fetchMessages,
    cancelConnection,
    createShare,
    confirmShare,
    rateShare,
    subscribeToConnection,
    subscribeToMessages,
    cleanup,
  } = useConnectionStore();

  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const connectionId = id ?? '';
  const userId = session?.user?.id;

  // Load connection, other user profile, messages, and existing share
  useEffect(() => {
    if (!connectionId || !userId) return;

    (async () => {
      // Fetch connection details
      const { data: conn } = await supabase
        .from('connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (conn) {
        useConnectionStore.getState().setActiveConnection(conn);

        // Fetch other user profile
        const otherId =
          conn.requester_id === userId ? conn.responder_id : conn.requester_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherId)
          .single();
        if (profile) setOtherUser(profile as Profile);
      }

      // Fetch existing share
      const { data: share } = await supabase
        .from('shares')
        .select('*')
        .eq('connection_id', connectionId)
        .maybeSingle();
      if (share) {
        useConnectionStore.setState({ activeShare: share });
      }

      // Load messages
      await fetchMessages(connectionId);
    })();
  }, [connectionId, userId]);

  // Realtime subscriptions
  useEffect(() => {
    if (!connectionId) return;

    const unsubConn = subscribeToConnection(connectionId);
    const unsubMsgs = subscribeToMessages(connectionId);

    return () => {
      unsubConn();
      unsubMsgs();
    };
  }, [connectionId]);

  // Show rating prompt when share completes
  useEffect(() => {
    if (activeShare?.completed && !hasRated) {
      setShowRating(true);
    }
  }, [activeShare?.completed]);

  // Navigate back if connection is cancelled
  useEffect(() => {
    if (
      activeConnection?.status === 'cancelled' ||
      activeConnection?.status === 'declined'
    ) {
      Alert.alert('Connection Ended', 'This connection has been cancelled.', [
        { text: 'OK', onPress: () => handleGoBack() },
      ]);
    }
  }, [activeConnection?.status]);

  const handleGoBack = () => {
    cleanup();
    router.back();
  };

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !connectionId) return;

    setIsSending(true);
    setInputText('');
    try {
      await sendMessage(connectionId, text);
    } finally {
      setIsSending(false);
    }
  }, [inputText, connectionId]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Connection',
      'Are you sure you want to cancel this connection?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            await cancelConnection(connectionId);
            setIsCancelling(false);
            handleGoBack();
          },
        },
      ],
    );
  };

  const handleCompleteShare = async () => {
    if (!activeConnection || !userId) return;

    setIsConfirming(true);
    try {
      let share = activeShare;

      // Create share record if it doesn't exist
      if (!share) {
        const isRequester = activeConnection.requester_id === userId;
        // Requester is the one who needs, responder is the sharer
        const sharerId = isRequester
          ? activeConnection.responder_id
          : activeConnection.requester_id;
        const receiverId = isRequester
          ? activeConnection.requester_id
          : activeConnection.responder_id;

        // Get the sharer's product
        const { data: sharerProfile } = await supabase
          .from('profiles')
          .select('sharing_product_id')
          .eq('id', sharerId)
          .single();

        share = await createShare(
          connectionId,
          sharerId,
          receiverId,
          sharerProfile?.sharing_product_id ?? null,
        );
      }

      if (share) {
        await confirmShare(share.id);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRate = async (rating: 1 | -1) => {
    if (!activeShare) return;
    setIsRating(true);
    try {
      await rateShare(activeShare.id, rating);
      setHasRated(true);
      setShowRating(false);

      // Navigate back after a brief moment
      setTimeout(() => handleGoBack(), 1500);
    } finally {
      setIsRating(false);
    }
  };

  const userConfirmed = (() => {
    if (!activeShare || !userId) return false;
    const isSender = activeShare.sharer_id === userId;
    return isSender
      ? activeShare.sharer_confirmed
      : activeShare.receiver_confirmed;
  })();

  const otherConfirmed = (() => {
    if (!activeShare || !userId) return false;
    const isSender = activeShare.sharer_id === userId;
    return isSender
      ? activeShare.receiver_confirmed
      : activeShare.sharer_confirmed;
  })();

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble message={item} />
  );

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-dark-200">
          <TouchableOpacity onPress={handleGoBack} className="mr-3">
            <Text className="text-primary text-base font-medium">
              {'\u2190'} Back
            </Text>
          </TouchableOpacity>

          {otherUser && (
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full overflow-hidden bg-dark-200 mr-2">
                {otherUser.avatar_url ? (
                  <Image
                    source={{ uri: otherUser.avatar_url }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-white text-sm font-bold">
                      {otherUser.username?.charAt(0)?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-white font-bold text-base">
                @{otherUser.username}
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={handleCancel} disabled={isCancelling}>
            <Text className="text-danger text-sm font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Share completion banner */}
        {activeShare?.completed && (
          <View className="bg-primary/20 px-4 py-3">
            <Text className="text-primary text-center font-bold">
              Share Completed! +1 Karma
            </Text>
          </View>
        )}

        {/* Waiting for other user banner */}
        {userConfirmed && !otherConfirmed && !activeShare?.completed && (
          <View className="bg-secondary/20 px-4 py-3">
            <Text className="text-secondary text-center text-sm font-medium">
              Waiting for {otherUser?.display_name ?? 'other user'} to
              confirm...
            </Text>
          </View>
        )}

        {/* Rating prompt */}
        {showRating && !hasRated && (
          <View className="bg-dark-100 px-4 py-4 mx-4 mt-3 rounded-xl">
            <Text className="text-white text-center font-bold mb-1">
              How was your experience?
            </Text>
            <Text className="text-gray-400 text-center text-sm mb-3">
              Rate your interaction with {otherUser?.display_name ?? 'them'}
            </Text>
            <View className="flex-row justify-center gap-4">
              <TouchableOpacity
                onPress={() => handleRate(-1)}
                disabled={isRating}
                className="bg-dark-200 rounded-xl px-8 py-3"
              >
                <Text className="text-2xl text-center">{'\uD83D\uDC4E'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRate(1)}
                disabled={isRating}
                className="bg-dark-200 rounded-xl px-8 py-3"
              >
                <Text className="text-2xl text-center">{'\uD83D\uDC4D'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Messages list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={{
            flexDirection: 'column-reverse',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-sm">
                No messages yet. Say hello!
              </Text>
            </View>
          }
        />

        {/* Bottom area: Complete Share + Input */}
        {!activeShare?.completed && (
          <View className="border-t border-dark-200">
            {/* Complete Share button */}
            {!userConfirmed && (
              <View className="px-4 pt-3">
                <Button
                  title="Complete Share"
                  onPress={handleCompleteShare}
                  variant="secondary"
                  loading={isConfirming}
                />
              </View>
            )}

            {/* Message input */}
            <View className="flex-row items-end px-4 py-3 gap-2">
              <View className="flex-1">
                <TextInput
                  className="bg-dark-200 text-white px-4 py-3 rounded-2xl text-base max-h-24"
                  placeholder="Message..."
                  placeholderTextColor="#6B7280"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  returnKeyType="default"
                />
              </View>
              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim() || isSending}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  inputText.trim() ? 'bg-primary' : 'bg-dark-300'
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {'\u2191'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* After completion, just show rating was submitted */}
        {activeShare?.completed && hasRated && (
          <View className="px-4 py-6">
            <Text className="text-primary text-center font-bold text-lg">
              Thanks for rating!
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
