import { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateUsername } from '@/lib/validators';

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session, refreshProfile } = useAuthStore();

  const checkAvailability = useCallback(
    async (value: string) => {
      const validationError = validateUsername(value);
      if (validationError) {
        setError(validationError);
        setAvailable(null);
        return;
      }
      setError(null);
      setChecking(true);
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', value)
        .maybeSingle();
      setChecking(false);
      if (data) {
        setError('Username is taken');
        setAvailable(false);
      } else {
        setAvailable(true);
      }
    },
    [],
  );

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    setAvailable(null);
    if (cleaned.length >= 3) {
      const timeout = setTimeout(() => checkAvailability(cleaned), 500);
      return () => clearTimeout(timeout);
    }
  };

  const handleNext = async () => {
    if (!available || !session?.user) return;
    setLoading(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username, display_name: username })
      .eq('id', session.user.id);
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    await refreshProfile();
    setLoading(false);
    router.push('/(onboarding)/avatar');
  };

  return (
    <View className="flex-1 bg-dark justify-center px-6">
      <View className="mb-8">
        <Text className="text-gray-500 text-sm mb-2">Step 1 of 3</Text>
        <Text className="text-white text-2xl font-bold mb-2">
          Choose a username
        </Text>
        <Text className="text-gray-400 text-base">
          This is how others will find you on the map
        </Text>
      </View>

      <Input
        label="Username"
        placeholder="cool_user_42"
        value={username}
        onChangeText={handleUsernameChange}
        error={error}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {checking && (
        <Text className="text-gray-500 text-sm mb-4">Checking availability...</Text>
      )}
      {available && !checking && (
        <Text className="text-primary text-sm mb-4">Username is available!</Text>
      )}

      <Button
        title="Next"
        onPress={handleNext}
        loading={loading}
        disabled={!available}
      />
    </View>
  );
}
