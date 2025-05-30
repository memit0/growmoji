import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthService } from '../lib/auth/AuthService';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <NotificationsProvider>
              <RootNavigation />
            </NotificationsProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Deep link debugging
  useEffect(() => {
    console.log('[RootNavigation] Setting up deep link debugging');

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[RootNavigation] Initial URL detected:', url);
        if (url.includes('auth') || url.includes('callback')) {
          console.log('[RootNavigation] Auth-related URL - handling with AuthService');
          AuthService.handleAuthRedirect(url);
        }
      } else {
        console.log('[RootNavigation] No initial URL');
      }
    }).catch((error) => {
      console.error('[RootNavigation] Error getting initial URL:', error);
    });

    // Handle subsequent URLs while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('[RootNavigation] URL event received:', event.url);
      if (event.url.includes('auth') || event.url.includes('callback')) {
        console.log('[RootNavigation] Auth-related URL event - handling with AuthService');
        AuthService.handleAuthRedirect(event.url);
      }
    });

    return () => {
      console.log('[RootNavigation] Cleaning up deep link listeners');
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    console.log('[RootNavigation] Navigation effect triggered:', {
      loading,
      hasUser: !!user,
      userId: user?.id,
      segments,
      timestamp: new Date().toISOString()
    });

    if (loading) {
      console.log('[RootNavigation] Still loading, skipping navigation');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    console.log('[RootNavigation] Navigation state:', {
      inAuthGroup,
      hasUser: !!user,
      currentSegments: segments
    });

    // Add a small delay to prevent rapid navigation conflicts
    const timeoutId = setTimeout(() => {
      if (user && !inAuthGroup) {
        console.log('[RootNavigation] User authenticated, redirecting to main app');
        router.replace('/(tabs)');
      } else if (!user && inAuthGroup === false) {
        console.log('[RootNavigation] User not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [loading, user, segments]);

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
