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
  const [navigationInProgress, setNavigationInProgress] = useState(false);

  // Debug function to reset onboarding - accessible globally for debugging
  React.useEffect(() => {
    (global as any).resetOnboarding = async () => {
      try {
        await AsyncStorage.removeItem('hasSeenOnboarding');
        console.log('🔄 [DEBUG] Onboarding status reset! Restart the app to see onboarding.');
        setHasSeenOnboarding(false);
        // Force reload by navigating to onboarding
        router.replace('/onboarding');
      } catch (error) {
        console.error('❌ [DEBUG] Error resetting onboarding:', error);
      }
    };
    
    (global as any).checkOnboardingStatus = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        console.log('📊 [DEBUG] Current onboarding status:', seen);
        console.log('📊 [DEBUG] hasSeenOnboarding state:', hasSeenOnboarding);
      } catch (error) {
        console.error('❌ [DEBUG] Error checking onboarding status:', error);
      }
    };
    
    console.log('🛠️ [DEBUG] Debug functions available:');
    console.log('   - resetOnboarding() - Reset onboarding status');
    console.log('   - checkOnboardingStatus() - Check current status');
  }, [hasSeenOnboarding, router]);

  // Check if user has seen onboarding - only once on app start
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('[RootNavigation] ===== ONBOARDING STATUS CHECK =====');
      console.log('[RootNavigation] Checking onboarding status...');
      
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        console.log('[RootNavigation] Raw AsyncStorage value for hasSeenOnboarding:', seen);
        console.log('[RootNavigation] Type of value:', typeof seen);
        console.log('[RootNavigation] Value === "true":', seen === 'true');
        
        const hasSeenOnboarding = seen === 'true';
        console.log('[RootNavigation] Final hasSeenOnboarding value:', hasSeenOnboarding);
        
        // For debugging: show what will happen next
        if (hasSeenOnboarding) {
          console.log('[RootNavigation] 🚨 ONBOARDING WILL BE SKIPPED - User has seen onboarding before');
        } else {
          console.log('[RootNavigation] ✅ ONBOARDING WILL BE SHOWN - First time user or reset');
        }
        
        setHasSeenOnboarding(hasSeenOnboarding);
      } catch (error) {
        console.error('[RootNavigation] Error checking onboarding status:', error);
        // Default to false if there's an error - show onboarding to be safe
        console.log('[RootNavigation] Defaulting to hasSeenOnboarding: false due to error');
        setHasSeenOnboarding(false);
      } finally {
        console.log('[RootNavigation] Onboarding check complete, setting onboardingLoading to false');
        console.log('[RootNavigation] ===== END ONBOARDING STATUS CHECK =====');
        setOnboardingLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Deep link handling
  useEffect(() => {
    console.log('[RootNavigation] Setting up deep link handling');

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[RootNavigation] Initial URL detected:', url);
        if (url.includes('auth') || url.includes('callback')) {
          console.log('[RootNavigation] Auth-related URL - handling with AuthService');
          AuthService.handleAuthRedirect(url);
        }
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

  // Main navigation effect
  useEffect(() => {
    console.log('[RootNavigation] Navigation effect triggered:', {
      loading,
      onboardingLoading,
      hasUser: !!user,
      userId: user?.id,
      hasSeenOnboarding,
      segments,
      navigationInProgress,
      timestamp: new Date().toISOString()
    });

    // Wait for both loading states to complete and prevent navigation conflicts
    if (loading || onboardingLoading || navigationInProgress) {
      console.log('[RootNavigation] Still loading or navigation in progress, skipping navigation');
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

    if (!user) {
      // User is not authenticated
      if (!hasSeenOnboarding && !inOnboarding) {
        // First time user - show onboarding
        console.log('[RootNavigation] First time user, showing onboarding');
        setNavigationInProgress(true);
        router.replace('/onboarding');
        // Reset navigation guard after successful navigation
        setTimeout(() => setNavigationInProgress(false), 1000);
      } else if (hasSeenOnboarding && !inAuthGroup && !inOnboarding) {
        // Returning user who has seen onboarding - go to auth
        console.log('[RootNavigation] Returning user, redirecting to login');
        setNavigationInProgress(true);
        router.replace('/(auth)/login');
        // Reset navigation guard after successful navigation
        setTimeout(() => setNavigationInProgress(false), 1000);
      }
    } else {
      // User is authenticated - go to main app
      if (!inTabsGroup) {
        console.log('[RootNavigation] User authenticated, redirecting to main app');
        setNavigationInProgress(true);
        router.replace('/(tabs)');
        // Reset navigation guard after successful navigation
        setTimeout(() => setNavigationInProgress(false), 1000);
      }
    }
  }, [loading, onboardingLoading, user, hasSeenOnboarding, navigationInProgress]);

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
