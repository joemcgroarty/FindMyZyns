import '../global.css';
import { Platform } from 'react-native';

// Load Leaflet CSS on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}
import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { NetworkBanner } from '@/components/ui/NetworkBanner';
import {
  registerForPushNotifications,
  addNotificationResponseListener,
} from '@/lib/notifications';

export default function RootLayout() {
  useSession();

  const { session, profile, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const notificationListenerRef = useRef<ReturnType<typeof addNotificationResponseListener>>();

  // Auth routing
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
  }, [session, profile, isLoading]);

  // Push notification registration (FMZ-701)
  useEffect(() => {
    if (!session?.user?.id || !profile?.username) return;

    registerForPushNotifications(session.user.id).catch((err) => {
      console.warn('Push registration failed:', err);
    });
  }, [session?.user?.id, profile?.username]);

  // Push notification deep link handler (FMZ-702)
  useEffect(() => {
    notificationListenerRef.current = addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.connectionId) {
          router.push(`/connection/${data.connectionId}`);
        }
      },
    );

    return () => {
      notificationListenerRef.current?.remove();
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </ErrorBoundary>
  );
}
