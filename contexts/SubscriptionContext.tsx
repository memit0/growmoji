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
  // Quick cache state for instant UI
  isQuickCacheLoaded: boolean;
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
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false); // Start with false for better UX
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugPremiumOverride, setDebugPremiumOverride] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isQuickCacheLoaded, setIsQuickCacheLoaded] = useState(false);

  // Cache the last known premium status to prevent flickering
  const [lastKnownPremiumStatus, setLastKnownPremiumStatus] = useState<boolean | null>(null);
  const [lastKnownCustomerInfo, setLastKnownCustomerInfo] = useState<CustomerInfo | null>(null);

  // Load cached data immediately on mount for instant UI
  useEffect(() => {
    const loadCachedData = async () => {
      if (!user?.id) {
        setIsQuickCacheLoaded(true);
        return;
      }
      
      try {
        const [cachedPremiumStatus, cachedCustomerInfo] = await Promise.all([
          AsyncStorage.getItem(`premium_status_${user.id}`),
          AsyncStorage.getItem(`customer_info_${user.id}`)
        ]);

        if (cachedPremiumStatus !== null) {
          const premiumStatus = JSON.parse(cachedPremiumStatus);
          setLastKnownPremiumStatus(premiumStatus);
          if (process.env.NODE_ENV === 'development') {
            console.log('[SubscriptionContext] Loaded cached premium status:', premiumStatus);
          }
        }

        if (cachedCustomerInfo !== null) {
          try {
            const customerInfoData = JSON.parse(cachedCustomerInfo);
            // Only use cached customer info if it's recent (within last 24 hours)
            const cacheAge = Date.now() - (customerInfoData.cachedAt || 0);
            const isStale = cacheAge > 24 * 60 * 60 * 1000; // 24 hours
            
            if (!isStale) {
              setLastKnownCustomerInfo(customerInfoData.data);
              setCustomerInfo(customerInfoData.data);
              if (process.env.NODE_ENV === 'development') {
                console.log('[SubscriptionContext] Loaded cached customer info');
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.log('[SubscriptionContext] Cached customer info is stale, will refresh');
            }
          } catch (error) {
            console.warn('[SubscriptionContext] Failed to parse cached customer info:', error);
          }
        }
      } catch (error) {
        console.warn('[SubscriptionContext] Failed to load cached data:', error);
      } finally {
        // Always set cache as loaded to avoid blocking UI
        setIsQuickCacheLoaded(true);
      }
    };

    loadCachedData();
  }, [user?.id]);

  // Check if user has premium subscription - only check for valid premium entitlements
  const isPremium =
    debugPremiumOverride ||
    // ACTUAL entitlement from your RevenueCat dashboard
    customerInfo?.entitlements.active['Growmoji Premium'] !== undefined;

  // Provide a stable premium status that doesn't flicker during loading
  const stablePremiumStatus = (() => {
    // If we have real customer info, use that
    if (customerInfo) {
      return isPremium;
    }
    
    // If we're still loading but have cached status, use it (but be conservative)
    if (isLoading && lastKnownPremiumStatus !== null) {
      // Only trust cached premium status if it's false (free)
      // For premium cached status, wait for confirmation unless we're initializing for the first time
      return lastKnownPremiumStatus === false ? false : (isInitialized ? isPremium : false);
    }
    
    // Default to false (free) to ensure buttons work during initialization
    return false;
  })();

  // Cache management - save data when updated
  useEffect(() => {
    if (customerInfo && user?.id) {
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      const growmojiPremiumActive = customerInfo.entitlements.active['Growmoji Premium'];

      // Simplified logging for production
      console.log('[SubscriptionContext] Premium status updated:', {
        isPremium,
        isInitialized,
        hasCustomerInfo: !!customerInfo
      });

      // Update the cached premium status
      setLastKnownPremiumStatus(isPremium);

      // Persist both premium status and customer info to storage for next app launch
      Promise.all([
        AsyncStorage.setItem(`premium_status_${user.id}`, JSON.stringify(isPremium)),
        AsyncStorage.setItem(`customer_info_${user.id}`, JSON.stringify({
          data: customerInfo,
          cachedAt: Date.now()
        }))
      ]).catch(error => console.warn('[SubscriptionContext] Failed to cache data:', error));
    }
  }, [customerInfo, debugPremiumOverride, isPremium, stablePremiumStatus, isLoading, isInitialized, user?.id]);

  // Background initialization - don't block UI
  useEffect(() => {
    // Don't initialize until auth is complete and cache is loaded
    if (authLoading || !isQuickCacheLoaded) {
      return;
    }

    // Only initialize RevenueCat when we have a user
    if (user?.id) {
      // Initialize in background without blocking UI
      initializeRevenueCatInBackground();
    } else {
      // If no user, we can safely show non-premium state
      setIsLoading(false);
      setIsInitialized(false);
      setCustomerInfo(null);
      setOfferings(null);
      setError(null);
      setLastKnownPremiumStatus(null);
      setLastKnownCustomerInfo(null);
    }
  }, [user?.id, authLoading, isQuickCacheLoaded]);

  const initializeRevenueCatInBackground = async () => {
    if (!user?.id) {
      console.log('[RevenueCat] No user ID available, skipping initialization');
      return;
    }

    // If already initialized for this user, don't reinitialize
    if (isInitialized && customerInfo?.originalAppUserId === user.id) {
      console.log('[RevenueCat] Already initialized for this user');
      return;
    }

    try {
      // Only show loading if we don't have cached data - minimize UI blocking
      if (!lastKnownCustomerInfo && !isQuickCacheLoaded) {
        setIsLoading(true);
      }
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
      setIsInitialized(true);

      // Get customer info and offerings in parallel for better performance
      const [freshCustomerInfo, freshOfferings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings()
      ]);

      console.log('[RevenueCat] Customer info retrieved:', freshCustomerInfo.entitlements.active);
      console.log('[RevenueCat] Raw offerings response:', freshOfferings);
      console.log('[RevenueCat] Available offerings count:', Object.keys(freshOfferings.all || {}).length);
      console.log('[RevenueCat] Current offering:', freshOfferings.current);

      // Update state with fresh data
      setCustomerInfo(freshCustomerInfo);
      setOfferings(freshOfferings.current ? [freshOfferings.current] : []);

      console.log('[RevenueCat] Initialization complete');

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

      // Don't block UI functionality even if RevenueCat fails
      // Users should still be able to use free features
      setIsInitialized(false);
      setCustomerInfo(null);
      setOfferings(null);
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
    // Quick cache state for instant UI
    isQuickCacheLoaded,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};