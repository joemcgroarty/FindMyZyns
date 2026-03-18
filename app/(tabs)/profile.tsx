import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Product, getKarmaTier, getKarmaTierLabel } from '@/types';

interface UserStats {
  shares_given: number;
  shares_received: number;
}

export default function ProfileScreen() {
  const { profile, refreshProfile } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<UserStats>({ shares_given: 0, shares_received: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    const [productsRes, statsRes] = await Promise.all([
      supabase.from('products').select('*').eq('user_id', profile.id),
      supabase.rpc('get_user_stats', { target_user_id: profile.id }),
    ]);

    if (productsRes.data) {
      setProducts(productsRes.data as Product[]);
    }
    if (statsRes.data) {
      setStats(statsRes.data as UserStats);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  // Retry fetch if products came back empty (session may not have been ready)
  useEffect(() => {
    if (!loading && products.length === 0 && profile?.id) {
      const timer = setTimeout(() => fetchData(), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, products.length, profile?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), fetchData()]);
    setRefreshing(false);
  }, [refreshProfile, fetchData]);

  const karma = profile?.karma ?? 0;
  const tier = getKarmaTier(karma);
  const tierLabel = getKarmaTierLabel(tier);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${item.id}/edit`)}
      className="bg-dark-100 rounded-xl p-4 mb-3 flex-row items-center"
      activeOpacity={0.7}
    >
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
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Avatar and name */}
      <View className="items-center pt-6 pb-4">
        <TouchableOpacity onPress={() => router.push('/profile/edit')} activeOpacity={0.7}>
          <View className="w-24 h-24 rounded-full bg-dark-200 overflow-hidden mb-3">
            {profile?.avatar_url ? (
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
        </TouchableOpacity>

        <Text className="text-white text-xl font-bold">
          {profile?.display_name ?? 'User'}
        </Text>
        <Text className="text-gray-400 text-base mb-2">
          @{profile?.username ?? 'unknown'}
        </Text>

        {/* Karma */}
        <View className="flex-row items-center mb-4">
          <Text className="text-primary text-base font-semibold">{karma} karma</Text>
          <Text className="text-gray-500 mx-2">{'·'}</Text>
          <Text className="text-gray-400 text-base">{tierLabel}</Text>
        </View>

        <Button
          title="Edit Profile"
          onPress={() => router.push('/profile/edit')}
          variant="outline"
          className="w-full"
        />
      </View>

      {/* Stats row */}
      <View className="flex-row bg-dark-100 rounded-xl p-4 mb-6 mt-2">
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
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-lg font-bold">My Stash</Text>
        <TouchableOpacity onPress={() => router.push('/product/new')} activeOpacity={0.7}>
          <Text className="text-primary text-base font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyProducts = () => (
    <View className="items-center py-12">
      <Text className="text-gray-500 text-base mb-4">No products added yet</Text>
      <Button
        title="+ Add Product"
        onPress={() => router.push('/product/new')}
        variant="secondary"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark" style={{ alignItems: 'center' }}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={!loading ? EmptyProducts : null}
        contentContainerClassName="px-6 pb-8"
        style={{ width: '100%', maxWidth: 480 } as any}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      />
    </SafeAreaView>
  );
}
