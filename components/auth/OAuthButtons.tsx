import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleAppleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-dark-300" />
        <Text className="text-gray-500 mx-4 text-sm">or continue with</Text>
        <View className="flex-1 h-px bg-dark-300" />
      </View>

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          onPress={handleAppleSignIn}
          className="bg-white py-4 px-6 rounded-xl flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-black font-semibold text-base">
            Sign in with Apple
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        className="bg-dark-200 border border-dark-300 py-4 px-6 rounded-xl flex-row items-center justify-center"
        activeOpacity={0.7}
      >
        <Text className="text-white font-semibold text-base">
          Sign in with Google
        </Text>
      </TouchableOpacity>
    </View>
  );
}
