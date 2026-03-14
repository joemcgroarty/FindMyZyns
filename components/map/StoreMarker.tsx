import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { StorePin } from '@/types';

interface StoreMarkerProps {
  store: StorePin;
  onPress: (store: StorePin) => void;
}

export function StoreMarker({ store, onPress }: StoreMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: store.latitude,
        longitude: store.longitude,
      }}
      onPress={() => onPress(store)}
      tracksViewChanges={false}
    >
      <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center border-2 border-blue-300">
        <Text className="text-white text-xs">{'\uD83D\uDECD\uFE0F'}</Text>
      </View>
    </Marker>
  );
}
