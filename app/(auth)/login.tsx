import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { validateEmail, validatePassword } from '@/lib/validators';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const { signIn, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }
    setErrors({});
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-white text-3xl font-bold text-center mb-2">
            FindMyZyns
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            Welcome back
          </Text>

          {error && (
            <View className="bg-danger/10 border border-danger/30 rounded-xl p-3 mb-4">
              <Text className="text-danger text-sm text-center">{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            textContentType="password"
          />

          <Link href="/(auth)/forgot-password" asChild>
            <Text className="text-primary text-sm text-right mb-6">
              Forgot password?
            </Text>
          </Link>

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={loading}
          />

          <OAuthButtons />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-400">Don't have an account? </Text>
            <Link href="/(auth)/signup">
              <Text className="text-primary font-semibold">Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
