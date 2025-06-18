import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  // Check if user has seen onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(seen === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasSeenOnboarding(false);
      } finally {
        setOnboardingLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Re-check onboarding status when segments change (e.g., when returning from onboarding)
  useEffect(() => {
    const recheckOnboardingStatus = async () => {
      if (!onboardingLoading) {
        try {
          const seen = await AsyncStorage.getItem('hasSeenOnboarding');
          const currentStatus = seen === 'true';
          if (currentStatus !== hasSeenOnboarding) {
            console.log('[RootNavigation] Onboarding status changed:', { from: hasSeenOnboarding, to: currentStatus });
            setHasSeenOnboarding(currentStatus);
          }
        } catch (error) {
          console.error('Error rechecking onboarding status:', error);
        }
      }
    };

    // Only recheck if we're navigating away from onboarding
    if (segments[0] !== 'onboarding' && !onboardingLoading) {
      recheckOnboardingStatus();
    }
  }, [segments, onboardingLoading, hasSeenOnboarding]);

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
      onboardingLoading,
      hasUser: !!user,
      userId: user?.id,
      hasSeenOnboarding,
      segments,
      timestamp: new Date().toISOString()
    });

    if (loading || onboardingLoading) {
      console.log('[RootNavigation] Still loading, skipping navigation');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    
    console.log('[RootNavigation] Navigation state:', {
      inAuthGroup,
      inTabsGroup,
      inOnboarding,
      hasUser: !!user,
      hasSeenOnboarding,
      currentSegments: segments
    });

    // Add a small delay to prevent rapid navigation conflicts
    const timeoutId = setTimeout(() => {
      if (!user) {
        // User is not authenticated
        if (!hasSeenOnboarding && !inOnboarding) {
          // First time user - show onboarding
          console.log('[RootNavigation] First time user, showing onboarding');
          router.replace('/onboarding');
        } else if (hasSeenOnboarding && !inAuthGroup && !inOnboarding) {
          // Returning user who has seen onboarding - go to auth
          console.log('[RootNavigation] Returning user, redirecting to login');
          router.replace('/(auth)/login');
        }
        // Don't redirect if user is already in auth or onboarding
      } else {
        // User is authenticated
        if (!inTabsGroup) {
          console.log('[RootNavigation] User authenticated, redirecting to main app');
          router.replace('/(tabs)');
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [loading, onboardingLoading, user, hasSeenOnboarding, segments]);

  if (loading || onboardingLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
