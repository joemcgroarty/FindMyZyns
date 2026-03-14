import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { unblockUser } from '@/lib/moderation';
import { Profile } from '@/types';

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  profile: Profile;
}

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const fetchBlocked = useCallback(async () => {
    if (!session?.user) return;

    const { data } = await supabase
      .from('blocks')
      .select('id, blocked_id, created_at')
      .eq('blocker_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      setBlockedUsers([]);
      setLoading(false);
      return;
    }

    const blockedIds = data.map((b) => b.blocked_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', blockedIds);

    const profileMap = new Map<string, Profile>();
    (profiles ?? []).forEach((p) => profileMap.set(p.id, p as Profile));

    const merged = data
      .filter((b) => profileMap.has(b.blocked_id))
      .map((b) => ({
        ...b,
        profile: profileMap.get(b.blocked_id)!,
      }));

    setBlockedUsers(merged);
    setLoading(false);
  }, [session?.user]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const handleUnblock = (blockedId: string, username: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock @${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setUnblocking(blockedId);
            const success = await unblockUser(blockedId);
            if (success) {
              setBlockedUsers((prev) => prev.filter((b) => b.blocked_id !== blockedId));
            }
            setUnblocking(null);
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-primary text-base font-semibold">{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Blocked Users</Text>
        </View>

        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500 text-base">No blocked users</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-dark-100 rounded-xl p-4 mb-3 flex-row items-center">
              <View className="w-10 h-10 rounded-full overflow-hidden bg-dark-200 mr-3">
                {item.profile.avatar_url ? (
                  <Image
                    source={{ uri: item.profile.avatar_url }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-white font-bold">
                      {item.profile.username?.charAt(0)?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-white font-semibold">
                  @{item.profile.username ?? 'unknown'}
                </Text>
                <Text className="text-gray-500 text-xs">
                  Blocked {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  handleUnblock(item.blocked_id, item.profile.username ?? 'unknown')
                }
                disabled={unblocking === item.blocked_id}
                className="bg-dark-200 px-4 py-2 rounded-lg"
              >
                <Text className="text-danger text-sm font-medium">
                  {unblocking === item.blocked_id ? '...' : 'Unblock'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
