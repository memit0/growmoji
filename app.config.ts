import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Growmoji',
  slug: 'growmoji',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: [
    '**/*'
  ],
  scheme: 'com.mebattll.habittracker',
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
      CFBundleURLTypes: [
        {
          CFBundleURLName: 'com.mebattll.habittracker',
          CFBundleURLSchemes: ['com.mebattll.habittracker']
        }
      ]
    }
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
    '@bacons/apple-targets',
    'expo-apple-authentication'
  ]
}); 