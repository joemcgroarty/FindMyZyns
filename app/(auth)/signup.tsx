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
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/validators';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp, error, clearError } = useAuthStore();

  const handleSignUp = async () => {
    clearError();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const matchError = validatePasswordMatch(password, confirmPassword);
    if (emailError || passwordError || matchError) {
      setErrors({
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
        confirmPassword: matchError ?? undefined,
      });
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-dark justify-center px-6">
        <Text className="text-white text-2xl font-bold text-center mb-4">
          Check your email
        </Text>
        <Text className="text-gray-400 text-center text-base mb-8">
          We sent a verification link to {email}. Please verify your email to continue.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Button title="Back to Login" onPress={() => {}} variant="outline" />
        </Link>
      </View>
    );
  }

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
            Create Account
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            Join the nicotine community
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
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            textContentType="newPassword"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            className="mt-2"
          />

          <OAuthButtons />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-400">Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text className="text-primary font-semibold">Log In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
