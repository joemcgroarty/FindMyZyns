import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 items-center justify-center">
        <Text className="text-4xl mb-4">{'\uD83D\uDDFA\uFE0F'}</Text>
        <Text className="text-white text-xl font-bold mb-2">Map</Text>
        <Text className="text-gray-400 text-base">Coming in Sprint 3</Text>
      </View>
    </SafeAreaView>
  );
}
