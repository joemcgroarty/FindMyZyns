import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function RootLayout() {
  useSession();

  const { session, profile, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!profile?.username) {
      if (!inOnboarding) {
        router.replace('/(onboarding)/username');
      }
    } else {
      if (inAuthGroup || inOnboarding) {
        router.replace('/(tabs)/map');
      }
    }
  }, [session, profile, isLoading, segments]);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
