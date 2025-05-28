import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
// import * as WebBrowser from 'expo-web-browser'; // Keep if other parts of your app use it, remove if only for Supabase OAuth
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { AuthProvider, useAuth } from '../contexts/AuthContext'; // Remove old AuthProvider
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import * as SecureStore from 'expo-secure-store';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// WebBrowser.maybeCompleteAuthSession(); // Likely not needed if not using Clerk for web OAuth redirects handled by it

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Publishable Key - ensure this is set in your environment variables
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Make sure it\'s set in your .env file");
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <SubscriptionProvider>
            <NotificationsProvider>
              <RootNavigation />
            </NotificationsProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}

function RootNavigation() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    if (isSignedIn) {
      if (!inAppGroup) {
        router.replace('/(tabs)');
      } else if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (inAppGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
