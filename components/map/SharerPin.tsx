import { View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SharerPin as SharerPinType, getKarmaTier } from '@/types';

const tierColors = {
  newcomer: '#EF4444',
  neutral: '#6B7280',
  contributor: '#C0C0C0',
  generous: '#FFD700',
  legend: '#60A5FA',
};

interface SharerPinProps {
  sharer: SharerPinType;
  onPress: (sharer: SharerPinType) => void;
}

export function SharerMarker({ sharer, onPress }: SharerPinProps) {
  const tier = getKarmaTier(sharer.karma);
  const borderColor = tierColors[tier];

  return (
    <Marker
      coordinate={{
        latitude: sharer.latitude,
        longitude: sharer.longitude,
      }}
      onPress={() => onPress(sharer)}
      tracksViewChanges={false}
    >
      <View className="items-center">
        <View
          style={{ borderColor, borderWidth: 3 }}
          className="w-10 h-10 rounded-full overflow-hidden bg-dark-200"
        >
          {sharer.avatar_url ? (
            <Image
              source={{ uri: sharer.avatar_url }}
              className="w-full h-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-white text-sm font-bold">
                {sharer.username?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Marker>
  );
}
