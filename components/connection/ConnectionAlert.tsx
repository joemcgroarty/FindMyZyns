import { useEffect, useState } from 'react';
import { View, Text, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Profile, getKarmaTier, getKarmaTierLabel } from '@/types';

const tierColors: Record<string, string> = {
  mooch: '#EF4444',
  balanced: '#6B7280',
  giver: '#10B981',
};

export function ConnectionAlert() {
  const router = useRouter();
  const { pendingRequests, respondToConnection, fetchPendingRequests } =
    useConnectionStore();
  const { session } = useAuthStore();
  const [requesterProfile, setRequesterProfile] = useState<Profile | null>(
    null,
  );
  const [isResponding, setIsResponding] = useState(false);
  const [productName, setProductName] = useState<string | null>(null);

  const currentRequest = pendingRequests[0] ?? null;

  // Fetch requester profile when a pending request appears
  useEffect(() => {
    if (!currentRequest) {
      setRequesterProfile(null);
      setProductName(null);
      return;
    }

    (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentRequest.requester_id)
        .single();

      if (profile) {
        setRequesterProfile(profile as Profile);

        // Fetch the requester's wanted product if they have one set
        if ((profile as Profile).sharing_product_id) {
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', (profile as Profile).sharing_product_id)
            .single();
          if (product) setProductName(product.name);
        }
      }
    })();
  }, [currentRequest?.id]);

  // Subscribe to new incoming connections
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('incoming-connections')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `responder_id=eq.${session.user.id}`,
        },
        () => {
          fetchPendingRequests();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const handleRespond = async (action: 'accept' | 'decline') => {
    if (!currentRequest) return;
    setIsResponding(true);
    try {
      const success = await respondToConnection(currentRequest.id, action);
      if (success && action === 'accept') {
        router.push(`/connection/${currentRequest.id}`);
      }
    } finally {
      setIsResponding(false);
    }
  };

  if (!currentRequest || !requesterProfile) return null;

  const tier = getKarmaTier(requesterProfile.karma);
  const tierLabel = getKarmaTierLabel(tier);

  return (
    <Modal
      transparent
      visible
      animationType="slide"
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-dark-100 rounded-t-3xl p-6 pb-10">
          <Text className="text-white text-lg font-bold text-center mb-4">
            Connection Request
          </Text>

          <View className="items-center mb-4">
            <View
              style={{ borderColor: tierColors[tier], borderWidth: 2 }}
              className="w-16 h-16 rounded-full overflow-hidden bg-dark-200 mb-2"
            >
              {requesterProfile.avatar_url ? (
                <Image
                  source={{ uri: requesterProfile.avatar_url }}
                  className="w-full h-full"
                  contentFit="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-white text-2xl font-bold">
                    {requesterProfile.username?.charAt(0)?.toUpperCase() ??
                      '?'}
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-white font-bold text-base">
              @{requesterProfile.username}
            </Text>
            <Text
              style={{ color: tierColors[tier] }}
              className="text-sm font-medium"
            >
              {requesterProfile.karma} karma {'\u00B7'} {tierLabel}
            </Text>
          </View>

          {productName && (
            <View className="bg-dark-200 rounded-xl p-3 mb-4">
              <Text className="text-gray-400 text-xs mb-1">
                Looking for
              </Text>
              <Text className="text-white font-medium text-center">
                {productName}
              </Text>
            </View>
          )}

          <Text className="text-gray-400 text-center text-sm mb-5">
            {requesterProfile.display_name} wants to connect with you.
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Decline"
                onPress={() => handleRespond('decline')}
                variant="outline"
                loading={isResponding}
                disabled={isResponding}
              />
            </View>
            <View className="flex-1">
              <Button
                title="Accept"
                onPress={() => handleRespond('accept')}
                loading={isResponding}
                disabled={isResponding}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
