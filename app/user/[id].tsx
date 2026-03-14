import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Profile, Product, getKarmaTier, getKarmaTierLabel } from '@/types';
import { blockUser } from '@/lib/moderation';
import { ReportModal } from '@/components/moderation/ReportModal';

interface UserStats {
  shares_given: number;
  shares_received: number;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<UserStats>({ shares_given: 0, shares_received: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;

    const [profileRes, productsRes, statsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('products').select('*').eq('user_id', id),
      supabase.rpc('get_user_stats', { target_user_id: id }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data as Profile);
    }
    if (productsRes.data) {
      setProducts(productsRes.data as Product[]);
    }
    if (statsRes.data) {
      setStats(statsRes.data as UserStats);
    }
  }, [id]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleBlock = () => {
    if (!id || !profile) return;
    setShowMenu(false);
    Alert.alert(
      'Block User',
      `Are you sure you want to block @${profile.username ?? 'this user'}? They won't be able to see your profile or connect with you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            const success = await blockUser(id);
            if (success) {
              Alert.alert('User Blocked', 'This user has been blocked.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            }
          },
        },
      ],
    );
  };

  const handleReport = () => {
    setShowMenu(false);
    setShowReport(true);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center px-6">
        <Text className="text-white text-lg mb-4">User not found</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text className="text-primary text-base font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const karma = profile.karma ?? 0;
  const tier = getKarmaTier(karma);
  const tierLabel = getKarmaTierLabel(tier);

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  const renderProduct = ({ item }: { item: Product }) => (
    <View className="bg-dark-100 rounded-xl p-4 mb-3 flex-row items-center">
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          className="w-12 h-12 rounded-lg mr-3"
          contentFit="cover"
        />
      ) : (
        <View className="w-12 h-12 rounded-lg bg-dark-200 items-center justify-center mr-3">
          <Text className="text-gray-500 text-lg">{'📦'}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-white text-base font-semibold">{item.name}</Text>
        <Text className="text-gray-400 text-sm">
          {[item.brand, item.type, item.flavor].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Header with back button and overflow menu */}
      <View className="flex-row items-center justify-between pt-4 mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text className="text-primary text-base font-semibold">{'< Back'}</Text>
        </TouchableOpacity>

        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            activeOpacity={0.7}
            className="px-2 py-1"
          >
            <Text className="text-gray-400 text-xl font-bold">{'\u22EF'}</Text>
          </TouchableOpacity>

          {showMenu && (
            <View className="absolute top-8 right-0 bg-dark-200 rounded-xl overflow-hidden z-50 w-44 shadow-lg">
              <TouchableOpacity
                onPress={handleBlock}
                className="px-4 py-3 border-b border-dark-300"
              >
                <Text className="text-white text-sm">Block User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReport}
                className="px-4 py-3"
              >
                <Text className="text-danger text-sm">Report User</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Avatar and name */}
      <View className="items-center pb-4">
        <View className="w-24 h-24 rounded-full bg-dark-200 overflow-hidden mb-3">
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="w-full h-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-4xl">{'👤'}</Text>
            </View>
          )}
        </View>

        <Text className="text-white text-xl font-bold">
          {profile.display_name ?? 'User'}
        </Text>
        <Text className="text-gray-400 text-base mb-2">
          @{profile.username ?? 'unknown'}
        </Text>

        {/* Karma */}
        <View className="flex-row items-center mb-4">
          <Text className="text-primary text-base font-semibold">{karma} karma</Text>
          <Text className="text-gray-500 mx-2">{'·'}</Text>
          <Text className="text-gray-400 text-base">{tierLabel}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View className="flex-row bg-dark-100 rounded-xl p-4 mb-6">
        <View className="flex-1 items-center">
          <Text className="text-white text-lg font-bold">{stats.shares_given}</Text>
          <Text className="text-gray-400 text-xs">Given</Text>
        </View>
        <View className="w-px bg-dark-300" />
        <View className="flex-1 items-center">
          <Text className="text-white text-lg font-bold">{stats.shares_received}</Text>
          <Text className="text-gray-400 text-xs">Received</Text>
        </View>
        <View className="w-px bg-dark-300" />
        <View className="flex-1 items-center">
          <Text className="text-white text-lg font-bold">{memberSince}</Text>
          <Text className="text-gray-400 text-xs">Member since</Text>
        </View>
      </View>

      {/* Products header */}
      <Text className="text-white text-lg font-bold mb-3">Products</Text>
    </View>
  );

  const EmptyProducts = () => (
    <View className="items-center py-12">
      <Text className="text-gray-500 text-base">No products added yet</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyProducts}
        contentContainerClassName="px-6 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      />

      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        reportedUserId={id ?? ''}
        reportedUsername={profile.username ?? 'unknown'}
      />
    </SafeAreaView>
  );
}
