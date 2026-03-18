import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { getKarmaTier, getKarmaTierLabel } from '@/types';

interface LeaderboardUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  karma: number;
}

const tierColors: Record<string, string> = {
  mooch: '#EF4444',
  balanced: '#6B7280',
  giver: '#10B981',
};

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, karma')
      .not('username', 'is', null)
      .order('karma', { ascending: false });
    if (data) {
      setUsers(data as LeaderboardUser[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Retry after 3s in case auth wasn't ready
  useEffect(() => {
    if (!loading && users.length === 0) {
      const timer = setTimeout(() => fetchLeaderboard(), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, users.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  }, [fetchLeaderboard]);

  const getRankDisplay = (index: number) => {
    if (index === 0) return { emoji: '\uD83E\uDD47', color: '#FFD700' };
    if (index === 1) return { emoji: '\uD83E\uDD48', color: '#C0C0C0' };
    if (index === 2) return { emoji: '\uD83E\uDD49', color: '#CD7F32' };
    return { emoji: `${index + 1}`, color: '#6B7280' };
  };

  const renderUser = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const rank = getRankDisplay(index);
    const tier = getKarmaTier(item.karma);
    const tierLabel = getKarmaTierLabel(tier);
    const isYou = item.id === profile?.id;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          marginBottom: 8,
          backgroundColor: isYou ? '#1a2e1a' : '#1A1A1A',
          borderRadius: 12,
          borderWidth: isYou ? 1 : 0,
          borderColor: '#10B981',
        }}
      >
        {/* Rank */}
        <View style={{ width: 36, alignItems: 'center' }}>
          {index < 3 ? (
            <Text style={{ fontSize: 22 }}>{rank.emoji}</Text>
          ) : (
            <Text style={{ color: rank.color, fontSize: 16, fontWeight: '700' }}>{rank.emoji}</Text>
          )}
        </View>

        {/* Avatar */}
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#2A2A2A',
          overflow: 'hidden',
          marginRight: 12,
        }}>
          {item.avatar_url ? (
            <Image
              source={{ uri: item.avatar_url }}
              style={{ width: 40, height: 40 }}
              contentFit="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {item.username?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Name and tier */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              @{item.username}
            </Text>
            {isYou && (
              <Text style={{ color: '#10B981', fontSize: 11, marginLeft: 6, fontWeight: '600' }}>YOU</Text>
            )}
          </View>
          <Text style={{ color: tierColors[tier] ?? '#6B7280', fontSize: 12, fontWeight: '600', marginTop: 1 }}>
            {tierLabel}
          </Text>
        </View>

        {/* Karma */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            color: item.karma >= 0 ? '#10B981' : '#EF4444',
            fontSize: 20,
            fontWeight: '900',
          }}>
            {item.karma >= 0 ? '+' : ''}{item.karma}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 10 }}>karma</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 480, flex: 1 } as any}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          Leaderboard
        </Text>
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
          ListEmptyComponent={
            loading ? (
              <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 40 }}>Loading...</Text>
            ) : (
              <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 40 }}>No users yet</Text>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
