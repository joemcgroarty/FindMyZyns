import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Index() {
  const { session, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.username) {
    return <Redirect href="/(onboarding)/username" />;
  }

  return <Redirect href="/(tabs)/map" />;
}
