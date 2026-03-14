import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateEmail } from '@/lib/validators';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError(null);
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <View className="flex-1 bg-dark justify-center px-6">
        <Text className="text-white text-2xl font-bold text-center mb-4">
          Check your email
        </Text>
        <Text className="text-gray-400 text-center text-base mb-8">
          If an account exists for {email}, we sent a password reset link.
        </Text>
        <Button
          title="Back to Login"
          onPress={() => router.replace('/(auth)/login')}
          variant="outline"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Reset Password
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          Enter your email and we'll send a reset link
        </Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={error}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Button
          title="Send Reset Link"
          onPress={handleReset}
          loading={loading}
          className="mt-2"
        />

        <Button
          title="Back to Login"
          onPress={() => router.back()}
          variant="outline"
          className="mt-3"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
