import { TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export function ActiveConnectionBanner() {
  const { activeConnection } = useConnectionStore();
  const { session } = useAuthStore();
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!activeConnection || !session?.user) return;
    const otherId =
      activeConnection.requester_id === session.user.id
        ? activeConnection.responder_id
        : activeConnection.requester_id;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', otherId)
      .single()
      .then(({ data }) => {
        if (data) setOtherUser(data as Profile);
      });
  }, [activeConnection]);

  if (!activeConnection || activeConnection.status !== 'accepted') return null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/connection/${activeConnection.id}`)}
      className="absolute top-14 left-4 right-4 z-20 bg-primary rounded-xl px-4 py-3 flex-row items-center"
      activeOpacity={0.8}
    >
      {otherUser?.avatar_url ? (
        <Image
          source={{ uri: otherUser.avatar_url }}
          className="w-8 h-8 rounded-full mr-3"
          contentFit="cover"
        />
      ) : (
        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">
            {otherUser?.username?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">
          Active connection with @{otherUser?.username ?? '...'}
        </Text>
        <Text className="text-white/70 text-xs">Tap to open chat</Text>
      </View>
    </TouchableOpacity>
  );
}
