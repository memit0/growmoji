import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering[] | null;
  isPremium: boolean;
  purchasePackage: (packageToPurchase: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshOfferings: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  simulatePurchase: (entitlementName: string) => void;
  checkRevenueCatConfig: () => Promise<void>;
  error: string | null;
  // Debug features
  debugPremiumOverride: boolean;
  setDebugPremiumOverride: (override: boolean) => void;
  // Initialization state
  isInitialized: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth(); // Get the current user from AuthContext
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugPremiumOverride, setDebugPremiumOverride] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cache the last known premium status to prevent flickering
  const [lastKnownPremiumStatus, setLastKnownPremiumStatus] = useState<boolean | null>(null);

  // Load cached premium status on component mount
  useEffect(() => {
    const loadCachedPremiumStatus = async () => {
      try {
        const cached = await AsyncStorage.getItem(`premium_status_${user?.id}`);
        if (cached !== null) {
          setLastKnownPremiumStatus(JSON.parse(cached));
        }
      } catch (error) {
        console.warn('[SubscriptionContext] Failed to load cached premium status:', error);
      }
    };

    if (user?.id) {
      loadCachedPremiumStatus();
    }
  }, [user?.id]);

  // Check if user has premium subscription - only check for valid premium entitlements
  const isPremium =
    debugPremiumOverride ||
    // ACTUAL entitlement from your RevenueCat dashboard
    customerInfo?.entitlements.active['Growmoji Premium'] !== undefined;

  // Provide a stable premium status that doesn't flicker during loading
  const stablePremiumStatus = (() => {
    // If we're loading and have a cached status, use it to prevent flickering
    if (isLoading && lastKnownPremiumStatus !== null) {
      return lastKnownPremiumStatus;
    }
    // Otherwise use the current premium status
    return isPremium;
  })();

  // Enhanced logging for debugging
  useEffect(() => {
    if (customerInfo) {
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      const growmojiPremiumActive = customerInfo.entitlements.active['Growmoji Premium'];

      console.log('=== RevenueCat Debug Info ===');
      console.log('Active entitlements:', activeEntitlements);
      console.log('All entitlements (active):', customerInfo.entitlements.active);
      console.log('--- Main Entitlement Check ---');
      console.log('✓ Growmoji Premium:', growmojiPremiumActive ? 'ACTIVE' : 'INACTIVE');
      console.log('--- Final Result ---');
      console.log('Debug override:', debugPremiumOverride);
      console.log('Final isPremium:', isPremium);
      console.log('========================');

      // Update the cached premium status
      setLastKnownPremiumStatus(isPremium);

      // Persist to storage for next app launch
      if (user?.id) {
        AsyncStorage.setItem(`premium_status_${user.id}`, JSON.stringify(isPremium))
          .catch(error => console.warn('[SubscriptionContext] Failed to cache premium status:', error));
      }
    } else {
      console.log('=== RevenueCat Debug Info ===');
      console.log('No customer info available');
      console.log('Using cached premium status:', lastKnownPremiumStatus);
      console.log('========================');
    }
  }, [customerInfo, debugPremiumOverride, isPremium, lastKnownPremiumStatus]);

  useEffect(() => {
    // Wait for auth to complete before initializing RevenueCat
    // This prevents the flickering by ensuring we don't show free state prematurely
    if (authLoading) {
      // Keep loading true while auth is loading
      setIsLoading(true);
      return;
    }

    // Only initialize RevenueCat when we have a user
    if (user?.id) {
      initializeRevenueCat();
    } else {
      // If no user, we can safely show non-premium state
      setIsLoading(false);
      setIsInitialized(false);
      setCustomerInfo(null);
      setOfferings(null);
      setError(null);
    }
  }, [user?.id, authLoading]); // Re-initialize when user changes OR when auth loading completes

  const initializeRevenueCat = async () => {
    if (!user?.id) {
      console.log('[RevenueCat] No user ID available, skipping initialization');
      setIsLoading(false);
      return;
    }

    // If already initialized for this user, don't reinitialize
    if (isInitialized && customerInfo?.originalAppUserId === user.id) {
      console.log('[RevenueCat] Already initialized for this user');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Configure RevenueCat with user ID
      const apiKey = Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

      if (!apiKey) {
        throw new Error(`Missing RevenueCat API key for ${Platform.OS}`);
      }

      console.log(`[RevenueCat] Configuring for ${Platform.OS} with key: ${apiKey.substring(0, 10)}...`);
      console.log(`[RevenueCat] Using user ID: ${user.id}`);

      // IMPORTANT: Pass the user ID to RevenueCat so each user has their own subscription status
      await Purchases.configure({
        apiKey,
        appUserID: user.id // This ensures each user gets their own subscription status
      });

      console.log('[RevenueCat] Configuration successful with user ID:', user.id);

      // Get customer info and offerings
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings()
      ]);

      console.log('[RevenueCat] Customer info retrieved:', customerInfo.entitlements.active);
      console.log('[RevenueCat] Raw offerings response:', offerings);
      console.log('[RevenueCat] Available offerings count:', Object.keys(offerings.all || {}).length);
      console.log('[RevenueCat] Current offering:', offerings.current);

      // Log app identifier for debugging
      console.log('[RevenueCat] App bundle identifier:', Platform.OS === 'ios' ? 'com.mebattll.habittracker' : 'com.mebattll.habittracker');

      setCustomerInfo(customerInfo);
      setIsInitialized(true);

      // Handle offerings
      const offeringsArray = offerings.all ? Object.values(offerings.all) : [];
      setOfferings(offeringsArray);

      if (offeringsArray.length === 0) {
        console.warn('[RevenueCat] No offerings found. Possible reasons:');
        console.warn('1. Offering not created in RevenueCat dashboard');
        console.warn('2. Products not configured in App Store Connect/Google Play Console');
        console.warn('3. Bundle identifier mismatch between app and RevenueCat dashboard');
        console.warn('4. Offering configuration still propagating (can take up to 24 hours)');
        console.warn('5. API key might be for wrong project');
        setError('No subscription plans available. Please check RevenueCat dashboard configuration and ensure bundle identifiers match.');
      } else {
        console.log('[RevenueCat] Found offerings:', offeringsArray.length);
        offeringsArray.forEach((offering, index) => {
          console.log(`[RevenueCat] Offering ${index + 1}:`, {
            identifier: offering.identifier,
            serverDescription: offering.serverDescription,
            availablePackages: offering.availablePackages.length
          });
          offering.availablePackages.forEach((pkg, pkgIndex) => {
            console.log(`[RevenueCat] Package ${pkgIndex + 1}:`, {
              identifier: pkg.identifier,
              productId: pkg.product.identifier,
              price: pkg.product.priceString
            });
          });
        });
      }

      // Set up listener for customer info updates
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        console.log('[RevenueCat] Customer info updated:', customerInfo.entitlements.active);
        setCustomerInfo(customerInfo);
      });

    } catch (error: any) {
      console.error('Error initializing RevenueCat:', error);

      // More specific error handling
      if (error.message?.includes('Missing RevenueCat API key')) {
        setError(`Missing RevenueCat API key for ${Platform.OS}. Please check your environment variables.`);
      } else if (error.message?.includes('no products registered')) {
        setError('RevenueCat configuration incomplete. Please create an Offering in your dashboard.');
      } else if (error.message?.includes('API key')) {
        setError('Invalid RevenueCat API key. Please check your environment variables.');
      } else if (error.message?.includes('network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to initialize subscription system: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
    try {
      setError(null);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setCustomerInfo(customerInfo);
      return customerInfo.entitlements.active['Growmoji Premium'] !== undefined;
    } catch (error: any) {
      console.error('Error purchasing package:', error);
      if (error.userCancelled) {
        setError('Purchase cancelled');
      } else {
        setError('Purchase failed. Please try again.');
      }
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setError(null);
      const customerInfo = await Purchases.restorePurchases();
      setCustomerInfo(customerInfo);
      return customerInfo.entitlements.active['Growmoji Premium'] !== undefined;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      setError('Failed to restore purchases');
      return false;
    }
  };

  const refreshOfferings = async (): Promise<void> => {
    try {
      setError(null);
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings.all ? Object.values(offerings.all) : []);
    } catch (error: any) {
      console.error('Error refreshing offerings:', error);
      setError('Failed to refresh offerings');
    }
  };

  const refreshCustomerInfo = async (): Promise<void> => {
    try {
      setError(null);
      console.log('[RevenueCat] Manually refreshing customer info...');
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('[RevenueCat] Manual refresh - customer info retrieved:', customerInfo.entitlements.active);
      setCustomerInfo(customerInfo);
    } catch (error: any) {
      console.error('Error refreshing customer info:', error);
      setError('Failed to refresh customer info');
    }
  };

  const simulatePurchase = (entitlementName: string) => {
    // Create mock customer info with active entitlement for testing
    const mockCustomerInfo = {
      entitlements: {
        active: {
          [entitlementName]: {
            identifier: entitlementName,
            isActive: true,
            willRenew: true,
            periodType: 'NORMAL',
            latestPurchaseDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }
        },
        all: {
          [entitlementName]: {
            identifier: entitlementName,
            isActive: true,
            willRenew: true,
            periodType: 'NORMAL',
            latestPurchaseDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }
        }
      },
      activeSubscriptions: [],
      allPurchasedProductIdentifiers: [],
      latestExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      firstSeen: new Date().toISOString(),
      originalAppUserId: 'mock-user',
      originalApplicationVersion: '1.0.0',
      requestDate: new Date().toISOString(),
    } as unknown as CustomerInfo;

    console.log('[SubscriptionContext] Simulating purchase with entitlement:', entitlementName);
    setCustomerInfo(mockCustomerInfo);
  };

  const checkRevenueCatConfig = async (): Promise<void> => {
    try {
      console.log('=== COMPREHENSIVE REVENUECAT CONFIG CHECK ===');

      // 1. Check API configuration
      const apiKey = Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
      console.log('✓ API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
      console.log('✓ Platform:', Platform.OS);

      // 2. Get fresh customer info
      console.log('\n--- Fetching Fresh Customer Info ---');
      const freshCustomerInfo = await Purchases.getCustomerInfo();
      console.log('✓ Customer Info Retrieved Successfully');

      // 3. Log all entitlements
      console.log('\n--- ENTITLEMENT ANALYSIS ---');
      const allEntitlements = Object.keys(freshCustomerInfo.entitlements.all || {});
      const activeEntitlements = Object.keys(freshCustomerInfo.entitlements.active || {});

      console.log('📋 All Entitlements in System:', allEntitlements);
      console.log('🟢 Active Entitlements:', activeEntitlements);

      if (allEntitlements.length === 0) {
        console.warn('⚠️  NO ENTITLEMENTS FOUND! This means:');
        console.warn('   - No entitlements created in RevenueCat dashboard');
        console.warn('   - Bundle ID mismatch between app and dashboard');
        console.warn('   - Wrong API key being used');
      }

      // 4. Check each common entitlement pattern
      console.log('\n--- TESTING COMMON ENTITLEMENT PATTERNS ---');
      const patternsToCheck = ['pro', 'premium', 'plus', 'Yearly', 'Monthly', 'yearly', 'monthly'];
      patternsToCheck.forEach(pattern => {
        const isActive = freshCustomerInfo.entitlements.active[pattern] !== undefined;
        const exists = freshCustomerInfo.entitlements.all[pattern] !== undefined;
        console.log(`  ${pattern}: ${isActive ? '🟢 ACTIVE' : exists ? '🟡 EXISTS (inactive)' : '❌ NOT FOUND'}`);
      });

      // 5. Check offerings
      console.log('\n--- OFFERINGS CHECK ---');
      const offerings = await Purchases.getOfferings();
      const offeringsCount = Object.keys(offerings.all || {}).length;
      console.log('✓ Offerings Count:', offeringsCount);

      if (offeringsCount === 0) {
        console.warn('⚠️  NO OFFERINGS FOUND! Check:');
        console.warn('   - Offering created in RevenueCat dashboard');
        console.warn('   - Products attached to offering');
        console.warn('   - Bundle ID matches exactly');
      } else {
        Object.values(offerings.all || {}).forEach((offering, index) => {
          console.log(`  📦 Offering ${index + 1}: ${offering.identifier}`);
          offering.availablePackages.forEach((pkg, pkgIndex) => {
            console.log(`     Package ${pkgIndex + 1}: ${pkg.identifier} (${pkg.product.identifier})`);
          });
        });
      }

      // 6. Update local state
      setCustomerInfo(freshCustomerInfo);

      console.log('\n=== CONFIG CHECK COMPLETE ===');

    } catch (error: any) {
      console.error('❌ RevenueCat Config Check Failed:', error);
      setError(`Config check failed: ${error.message}`);
    }
  };

  const value: SubscriptionContextType = {
    isLoading,
    customerInfo,
    offerings,
    isPremium: stablePremiumStatus, // Use stable status instead of raw isPremium
    purchasePackage,
    restorePurchases,
    refreshOfferings,
    refreshCustomerInfo,
    simulatePurchase,
    checkRevenueCatConfig,
    error,
    // Debug features
    debugPremiumOverride,
    setDebugPremiumOverride,
    // Initialization state
    isInitialized,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};