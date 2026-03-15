import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FindMyZyns',
  slug: 'FindMyZyns',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'findmyzyns',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0A',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.findmyzyns.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'FindMyZyns needs your location to find nicotine sharers and stores near you.',
      NSCameraUsageDescription:
        'FindMyZyns uses your camera to take a profile photo.',
      NSPhotoLibraryUsageDescription:
        'FindMyZyns accesses your photos to set a profile picture.',
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'single',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0A0A',
    },
    package: 'com.findmyzyns.app',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
    ],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-image-picker', { photosPermission: 'Allow FindMyZyns to access your photos for your profile picture.' }],
    'expo-font',
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'your-eas-project-id',
    },
  },
});
