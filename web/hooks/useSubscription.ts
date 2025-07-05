'use client';

import { useAuth } from '@/hooks/useAuth';
import {
    checkPremiumStatus,
    getCustomerInfo,
    getOfferings,
    initializeRevenueCat,
    purchasePackage,
    restorePurchases
} from '@/lib/subscription';
import { CustomerInfo, Offering, Purchases } from '@revenuecat/purchases-js';
import { useCallback, useEffect, useState } from 'react';

interface UseSubscriptionReturn {
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: Offering[] | null;
  error: string | null;
  refreshCustomerInfo: () => Promise<void>;
  refreshOfferings: () => Promise<void>;
  purchase: (packageToPurchase: Offering['availablePackages'][number]) => Promise<boolean>;
  restore: () => Promise<boolean>;
  isInitialized: boolean;
  isQuickCacheLoaded: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<Offering[] | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false for better UX
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isQuickCacheLoaded, setIsQuickCacheLoaded] = useState(false);
  const [appUserIDForRC, setAppUserIDForRC] = useState<string | null>(null);
  
  // Cache for faster loading
  const [cachedPremiumStatus, setCachedPremiumStatus] = useState<boolean | null>(null);
  const [lastKnownCustomerInfo, setLastKnownCustomerInfo] = useState<CustomerInfo | null>(null);
  
  // Track recent purchase completion to ensure immediate UI updates
  const [recentPurchaseCompleted, setRecentPurchaseCompleted] = useState(false);

  // Calculate premium status based on customer info
  const isPremium = customerInfo ? checkPremiumStatus(customerInfo) : (recentPurchaseCompleted || cachedPremiumStatus || false);

  // Load cached data immediately on mount for instant UI
  useEffect(() => {
    const loadCachedData = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const cacheKey = userId ? `premium_status_${userId}` : 'premium_status_anonymous';
        const customerInfoKey = userId ? `customer_info_${userId}` : 'customer_info_anonymous';
        
        const cachedStatus = localStorage.getItem(cacheKey);
        const cachedCustomerInfo = localStorage.getItem(customerInfoKey);

        if (cachedStatus !== null) {
          const premiumStatus = JSON.parse(cachedStatus);
          setCachedPremiumStatus(premiumStatus);
          console.log('[useSubscription Web] Loaded cached premium status:', premiumStatus);
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
              console.log('[useSubscription Web] Loaded cached customer info');
            } else {
              console.log('[useSubscription Web] Cached customer info is stale, will refresh');
            }
          } catch (error) {
            console.warn('[useSubscription Web] Failed to parse cached customer info:', error);
          }
        }

        setIsQuickCacheLoaded(true);
      } catch (error) {
        console.warn('[useSubscription Web] Failed to load cached data:', error);
        setIsQuickCacheLoaded(true);
      }
    };

    if (isLoaded) {
      loadCachedData();
    }
  }, [isLoaded, userId]);

  // Cache management - save data when updated
  useEffect(() => {
    if (typeof window === 'undefined' || !customerInfo) return;

    const cacheKey = userId ? `premium_status_${userId}` : 'premium_status_anonymous';
    const customerInfoKey = userId ? `customer_info_${userId}` : 'customer_info_anonymous';
    const premium = checkPremiumStatus(customerInfo);

    try {
      localStorage.setItem(cacheKey, JSON.stringify(premium));
      localStorage.setItem(customerInfoKey, JSON.stringify({
        data: customerInfo,
        cachedAt: Date.now()
      }));
      setCachedPremiumStatus(premium);
    } catch (error) {
      console.warn('[useSubscription Web] Failed to cache data:', error);
    }
  }, [customerInfo, userId]);

  // Initialize RevenueCat when user is available or for anonymous users
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && userId) {
        setAppUserIDForRC(userId);
      } else if (!isSignedIn) {
        // For anonymous users, generate and set an RC anonymous ID
        // This ID is generated once and reused for the session by RevenueCat SDK's internal storage
        // if browser privacy settings allow.
        const anonymousId = Purchases.generateRevenueCatAnonymousAppUserId();
        console.log('[useSubscription Web] Generated anonymous ID for RevenueCat:', anonymousId);
        setAppUserIDForRC(anonymousId);
      }
    }
  }, [isLoaded, isSignedIn, userId]);

  // Background initialization - don't block UI
  useEffect(() => {
    const initialize = async () => {
      if (!isLoaded || !appUserIDForRC || !isQuickCacheLoaded) {
        return;
      }

      try {
        // Only show loading if we don't have cached data
        if (!lastKnownCustomerInfo) {
          setIsLoading(true);
        }
        setError(null);

        await initializeRevenueCat(appUserIDForRC);
        setIsInitialized(true);

        // Fetch initial data in parallel
        const [customerInfoResult, offeringsResult] = await Promise.all([
          getCustomerInfo(),
          getOfferings()
        ]);

        setCustomerInfo(customerInfoResult);
        setOfferings(offeringsResult);

        console.log('[useSubscription Web] Initialization complete', {
          customerInfo: customerInfoResult,
          offerings: offeringsResult?.length || 0,
          isPremium: checkPremiumStatus(customerInfoResult)
        });
      } catch (err) {
        console.error('[useSubscription Web] Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize subscription');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [appUserIDForRC, isLoaded, isSignedIn, isQuickCacheLoaded]);

  const refreshCustomerInfo = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setError(null);
      const customerInfoResult = await getCustomerInfo();
      setCustomerInfo(customerInfoResult);
      console.log('[useSubscription] Customer info refreshed', customerInfoResult);
    } catch (err) {
      console.error('[useSubscription] Failed to refresh customer info:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh customer info');
    }
  }, [isInitialized]);

  const refreshOfferings = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setError(null);
      const offeringsResult = await getOfferings();
      setOfferings(offeringsResult);
      console.log('[useSubscription] Offerings refreshed', offeringsResult?.length || 0);
    } catch (err) {
      console.error('[useSubscription] Failed to refresh offerings:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh offerings');
    }
  }, [isInitialized]);

  const purchase = useCallback(async (packageToPurchase: Offering['availablePackages'][number]): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      setError(null);
      setIsLoading(true);

      const success = await purchasePackage(packageToPurchase);

      if (success) {
        // Immediately show premium status in UI
        setRecentPurchaseCompleted(true);
        
        // Clear the flag after a short delay to allow UI to update
        setTimeout(() => {
          setRecentPurchaseCompleted(false);
        }, 2000);
        
        // Refresh customer info to get updated entitlements
        await refreshCustomerInfo();
      }

      return success;
    } catch (err) {
      console.error('[useSubscription] Purchase failed:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, refreshCustomerInfo]);

  const restore = useCallback(async (): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      setError(null);
      setIsLoading(true);

      const success = await restorePurchases();

      if (success) {
        // Immediately show premium status in UI
        setRecentPurchaseCompleted(true);
        
        // Clear the flag after a short delay to allow UI to update
        setTimeout(() => {
          setRecentPurchaseCompleted(false);
        }, 2000);
        
        // Refresh customer info to get updated entitlements
        await refreshCustomerInfo();
      }

      return success;
    } catch (err) {
      console.error('[useSubscription] Restore failed:', err);
      setError(err instanceof Error ? err.message : 'Restore failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, refreshCustomerInfo]);

  return {
    isPremium,
    isLoading,
    customerInfo,
    offerings,
    error,
    refreshCustomerInfo,
    refreshOfferings,
    purchase,
    restore,
    isInitialized,
    isQuickCacheLoaded
  };
}