import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { signOut, profile } = useAuthStore();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? All your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This action is irreversible. Your profile, products, and all associated data will be permanently deleted.',
              [
                { text: 'Keep Account', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    await supabase.rpc('delete_user_account');
                    await signOut();
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

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

        {/* Notification Preferences */}
        <TouchableOpacity
          className="bg-dark-100 rounded-xl p-4 mb-6 flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View>
            <Text className="text-white text-base font-medium">Notification Preferences</Text>
            <Text className="text-gray-400 text-sm mt-0.5">Coming soon</Text>
          </View>
          <Text className="text-gray-500 text-base">{'>'}</Text>
        </TouchableOpacity>

        <View className="mt-auto pb-12">
          <Button
            title="Log Out"
            onPress={signOut}
            variant="outline"
          />

          <View className="mt-3">
            <Button
              title="Delete Account"
              onPress={handleDeleteAccount}
              variant="danger"
            />
          </View>

          <Text className="text-gray-600 text-xs text-center mt-6">
            FindMyZyns v{APP_VERSION}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
