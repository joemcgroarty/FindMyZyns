import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const { signOut, profile } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-white text-2xl font-bold mb-8">Settings</Text>

        <View className="bg-dark-100 rounded-xl p-4 mb-6">
          <Text className="text-gray-400 text-sm mb-1">Signed in as</Text>
          <Text className="text-white text-base font-medium">
            @{profile?.username ?? 'unknown'}
          </Text>
        </View>

        <View className="mt-auto pb-12">
          <Button
            title="Log Out"
            onPress={signOut}
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
