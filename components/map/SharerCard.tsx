import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SharerPin, getKarmaTier, getKarmaTierLabel } from '@/types';
import { Button } from '@/components/ui/Button';
import { useStatusStore } from '@/stores/useStatusStore';
import { useConnectionStore } from '@/stores/useConnectionStore';

const tierColors = {
  newcomer: '#EF4444',
  neutral: '#6B7280',
  contributor: '#C0C0C0',
  generous: '#FFD700',
  legend: '#60A5FA',
};

interface SharerCardProps {
  sharer: SharerPin;
  onClose: () => void;
}

export function SharerCard({ sharer, onClose }: SharerCardProps) {
  const router = useRouter();
  const { status } = useStatusStore();
  const { createConnection, isConnecting } = useConnectionStore();
  const [requestSent, setRequestSent] = useState(false);
  const tier = getKarmaTier(sharer.karma);
  const tierLabel = getKarmaTierLabel(tier);

  const distanceText =
    sharer.distance_meters < 1000
      ? `${Math.round(sharer.distance_meters)}m away`
      : `${(sharer.distance_meters / 1000).toFixed(1)}km away`;

  return (
    <View className="absolute bottom-24 left-4 right-4 bg-dark-100 rounded-2xl p-4 shadow-lg">
      <TouchableOpacity
        onPress={onClose}
        className="absolute top-3 right-3 z-10"
      >
        <Text className="text-gray-500 text-lg">{'\u2715'}</Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-3">
        <View
          style={{ borderColor: tierColors[tier], borderWidth: 2 }}
          className="w-12 h-12 rounded-full overflow-hidden bg-dark-200 mr-3"
        >
          {sharer.avatar_url ? (
            <Image
              source={{ uri: sharer.avatar_url }}
              className="w-full h-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-white text-lg font-bold">
                {sharer.username?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-white font-bold text-base">
            @{sharer.username}
          </Text>
          <View className="flex-row items-center">
            <Text style={{ color: tierColors[tier] }} className="text-sm font-medium">
              {sharer.karma} karma {'\u00B7'} {tierLabel}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-dark-200 rounded-xl p-3 mb-3">
        <Text className="text-gray-400 text-xs mb-1">Sharing</Text>
        <Text className="text-white font-medium">
          {sharer.product_name}
          {sharer.product_brand ? ` \u00B7 ${sharer.product_brand}` : ''}
        </Text>
        <Text className="text-gray-500 text-xs mt-0.5">
          {sharer.product_type} {'\u00B7'} {distanceText}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            title="View Profile"
            onPress={() => {
              onClose();
              router.push(`/user/${sharer.id}`);
            }}
            variant="outline"
          />
        </View>
        {status === 'needing' && (
          <View className="flex-1">
            <Button
              title={requestSent ? 'Request Sent' : 'Connect'}
              onPress={async () => {
                const conn = await createConnection(sharer.id);
                if (conn) setRequestSent(true);
              }}
              loading={isConnecting}
              disabled={requestSent || isConnecting}
            />
          </View>
        )}
      </View>
    </View>
  );
}
