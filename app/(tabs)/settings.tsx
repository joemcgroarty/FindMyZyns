import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { SafetyGuidelinesModal } from '@/components/safety/SafetyGuidelinesModal';

const APP_VERSION = '1.0.0';
const TERMS_URL = 'https://findmyzyns.com/terms';
const PRIVACY_URL = 'https://findmyzyns.com/privacy';

export default function SettingsScreen() {
  const { signOut, profile } = useAuthStore();
  const router = useRouter();
  const [showSafety, setShowSafety] = useState(false);

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

  const SettingsRow = ({
    label,
    subtitle,
    onPress,
    showChevron = true,
  }: {
    label: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      className="bg-dark-100 rounded-xl p-4 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="text-white text-base font-medium">{label}</Text>
        {subtitle && (
          <Text className="text-gray-400 text-sm mt-0.5">{subtitle}</Text>
        )}
      </View>
      {showChevron && <Text className="text-gray-500 text-base">{'>'}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark" style={{ alignItems: 'center' }}>
      <View className="flex-1 px-6 pt-4" style={{ width: '100%', maxWidth: 480 } as any}>
        <Text className="text-white text-2xl font-bold mb-8">Settings</Text>

        <View className="bg-dark-100 rounded-xl p-4 mb-6">
          <Text className="text-gray-400 text-sm mb-1">Signed in as</Text>
          <Text className="text-white text-base font-medium">
            @{profile?.username ?? 'unknown'}
          </Text>
        </View>

        {/* Notification Preferences */}
        <SettingsRow
          label="Notification Preferences"
          subtitle="Coming soon"
          onPress={() => {}}
        />

        {/* Blocked Users */}
        <SettingsRow
          label="Blocked Users"
          subtitle="Manage blocked users"
          onPress={() => router.push('/settings/blocked')}
        />

        {/* Safety Tips */}
        <SettingsRow
          label="Safety Tips"
          subtitle="Review safety guidelines"
          onPress={() => setShowSafety(true)}
        />

        {/* Legal section */}
        <Text className="text-gray-500 text-xs uppercase font-semibold mt-4 mb-2 ml-1">
          Legal
        </Text>

        <SettingsRow
          label="Terms of Service"
          onPress={() => Linking.openURL(TERMS_URL)}
        />

        <SettingsRow
          label="Privacy Policy"
          onPress={() => Linking.openURL(PRIVACY_URL)}
        />

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

      <SafetyGuidelinesModal
        visible={showSafety}
        onAcknowledge={() => setShowSafety(false)}
      />
    </SafeAreaView>
  );
}
