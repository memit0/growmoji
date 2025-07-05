import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
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

// Loading screen component
function LoadingScreen() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Check if user has seen onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('[RootNavigation] Checking onboarding status...');
      
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        console.log('[RootNavigation] Onboarding check result:', seen);
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

  // Listen for onboarding completion - only for state sync, not navigation
  useEffect(() => {
    const checkOnboardingCompletion = async () => {
      if (segments[0] === 'onboarding' && !onboardingLoading && hasSeenOnboarding === false) {
        try {
          const seen = await AsyncStorage.getItem('hasSeenOnboarding');
          if (seen === 'true') {
            console.log('[RootNavigation] Onboarding completed, updating state only');
            setHasSeenOnboarding(true);
            // Don't navigate here - let the onboarding screen handle it
          }
        } catch (error) {
          console.error('[RootNavigation] Error checking onboarding completion:', error);
        }
      }
    };

    // Only check when on onboarding screen
    if (segments[0] === 'onboarding') {
      const interval = setInterval(checkOnboardingCompletion, 1000);
      return () => clearInterval(interval);
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

  // Main navigation effect - only for initial navigation
  useEffect(() => {
    console.log('[RootNavigation] Navigation effect triggered:', {
      loading,
      onboardingLoading,
      hasUser: !!user,
      userId: user?.id,
      hasSeenOnboarding,
      segments,
      hasNavigated,
      timestamp: new Date().toISOString()
    });

    // Wait for both loading states to complete before any navigation
    if (loading || onboardingLoading || hasNavigated) {
      console.log('[RootNavigation] Still loading or already navigated, skipping navigation');
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

    // Only navigate if we're not already in the correct place
    if (!user) {
      // User is not authenticated
      if (!hasSeenOnboarding && !inOnboarding) {
        // First time user - show onboarding
        console.log('[RootNavigation] First time user, showing onboarding');
        setHasNavigated(true);
        router.replace('/onboarding');
      } else if (hasSeenOnboarding && !inAuthGroup && !inOnboarding) {
        // Returning user who has seen onboarding - go to auth
        console.log('[RootNavigation] Returning user, redirecting to login');
        setHasNavigated(true);
        router.replace('/(auth)/login');
      }
      // Don't redirect if user is already in auth or onboarding
    } else {
      // User is authenticated
      if (!inTabsGroup) {
        console.log('[RootNavigation] User authenticated, redirecting to main app');
        setHasNavigated(true);
        router.replace('/(tabs)');
      }
    }
  }, [loading, onboardingLoading, user, hasSeenOnboarding, segments, router, hasNavigated]);

  // Reset navigation flag when segments change (user manually navigated)
  useEffect(() => {
    if (segments.length > 0) {
      setHasNavigated(false);
    }
  }, [segments]);

  // Show loading screen while initializing
  if (loading || onboardingLoading) {
    return <LoadingScreen />;
  }

  // Stack structure with proper route definitions
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
