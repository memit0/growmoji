import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Habit Tracker',
  slug: 'habittracker',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mebattll.habittracker',
    buildNumber: '1',
    appleTeamId: 'RQPPB76S95',
    config: {
      usesNonExemptEncryption: false
    },
    infoPlist: {
      NSUserTrackingUsageDescription: 'This app uses tracking to provide personalized habit tracking experience.',
      NSCameraUsageDescription: 'This app uses camera to capture progress photos for habits.',
      NSPhotoLibraryUsageDescription: 'This app accesses photo library to save and view habit progress photos.'
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.mebattll.habittracker',
    versionCode: 1
  },
  web: {
    favicon: './assets/images/favicon.png'
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: '3fb45759-94dc-4b63-a52d-5c30d89fa6a5'
    }
  },
  plugins: [
    'expo-router',
    '@bacons/apple-targets'
  ]
}); 