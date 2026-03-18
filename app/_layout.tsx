import '../global.css';
import { Platform } from 'react-native';

// Load Leaflet CSS on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

  // Custom popup styles
  const style = document.createElement('style');
  style.textContent = `
    .leaflet-popup-content-wrapper { background: #fff !important; color: #000 !important; border-radius: 12px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important; border: none !important; padding: 0 !important; }
    .leaflet-popup-content { margin: 10px 12px !important; font-size: 13px !important; line-height: 1.5 !important; }
    .leaflet-popup-tip { background: #fff !important; }
    .leaflet-popup-close-button { color: #999 !important; font-size: 18px !important; top: 4px !important; right: 6px !important; width: 20px !important; height: 20px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
    .custom-marker { background: none !important; border: none !important; }
  `;
  document.head.appendChild(style);
}
import { useEffect, useRef, useState } from 'react';
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

  // Timeout fallback — never show loading for more than 3 seconds
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !timedOut) {
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
