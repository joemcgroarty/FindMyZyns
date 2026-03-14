import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ProfileScreen() {
  const { profile } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl mb-4">{'\uD83D\uDC64'}</Text>
        <Text className="text-white text-xl font-bold mb-2">
          @{profile?.username ?? 'unknown'}
        </Text>
        <Text className="text-gray-400 text-base mb-1">
          Karma: {profile?.karma ?? 0}
        </Text>
        <Text className="text-gray-500 text-sm">
          Full profile coming in Sprint 2
        </Text>
      </View>
    </SafeAreaView>
  );
}
