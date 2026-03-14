import { View, Text, Linking, Platform } from 'react-native';
import { StorePin } from '@/types';
import { Button } from '@/components/ui/Button';

interface StoreCardProps {
  store: StorePin;
  onClose: () => void;
}

export function StoreCard({ store, onClose }: StoreCardProps) {
  const handleDirections = () => {
    const url = Platform.select({
      ios: `maps://app?daddr=${store.latitude},${store.longitude}`,
      android: `google.navigation:q=${store.latitude},${store.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View className="absolute bottom-24 left-4 right-4 bg-dark-100 rounded-2xl p-4 shadow-lg">
      <Text
        className="absolute top-3 right-4 text-gray-500 text-lg"
        onPress={onClose}
      >
        {'\u2715'}
      </Text>

      <View className="flex-row items-center mb-3">
        <View className="bg-blue-500/20 w-10 h-10 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">{'\uD83D\uDECD\uFE0F'}</Text>
        </View>
        <View className="flex-1 pr-6">
          <Text className="text-white font-bold text-base">{store.name}</Text>
          <Text className="text-gray-400 text-xs mt-0.5">{store.address}</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3 gap-3">
        {store.rating !== null && (
          <View className="bg-dark-200 px-3 py-1.5 rounded-lg flex-row items-center">
            <Text className="text-yellow-400 text-sm mr-1">{'\u2B50'}</Text>
            <Text className="text-white text-sm font-medium">{store.rating.toFixed(1)}</Text>
          </View>
        )}
        {store.is_open !== null && (
          <View className={`px-3 py-1.5 rounded-lg ${store.is_open ? 'bg-primary/20' : 'bg-danger/20'}`}>
            <Text className={`text-sm font-medium ${store.is_open ? 'text-primary' : 'text-danger'}`}>
              {store.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        )}
      </View>

      <Button title="Get Directions" onPress={handleDirections} />
    </View>
  );
}
