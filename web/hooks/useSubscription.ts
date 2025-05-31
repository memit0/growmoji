'use client';

// Commented out unused imports since RevenueCat integration is disabled
// import { useAuth } from '@/hooks/useAuth';
// import {
//   checkPremiumStatus,
//   getCustomerInfo,
//   getOfferings,
//   initializeRevenueCat,
//   purchasePackage,
//   restorePurchases
// } from '@/lib/subscription';
// import { CustomerInfo, Offering } from '@revenuecat/purchases-js';
// import { useCallback, useEffect, useState } from 'react';

import { CustomerInfo, Offering } from '@revenuecat/purchases-js';

interface UseSubscriptionReturn {
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: Offering[] | null;
  error: string | null;
  refreshCustomerInfo: () => Promise<void>;
  refreshOfferings: () => Promise<void>;
  purchase: (packageToPurchase: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
  isInitialized: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  // TEMPORARY: Bypass RevenueCat integration - return premium status for all users
  // const { userId, isLoaded } = useAuth();
  // const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  // const [offerings, setOfferings] = useState<Offering[] | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [isInitialized, setIsInitialized] = useState(false);

  // Return premium status without RevenueCat initialization
  const customerInfo = null;
  const offerings = null;
  const isLoading = false;
  const error = null;
  const isInitialized = true;
  const isPremium = true; // Always return premium status

  // Comment out RevenueCat initialization
  /*
  // Initialize RevenueCat when user is available
  useEffect(() => {
    const initialize = async () => {
      if (!isLoaded || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        await initializeRevenueCat(userId);
        setIsInitialized(true);

        // Fetch initial data
        const [customerInfoResult, offeringsResult] = await Promise.all([
          getCustomerInfo(),
          getOfferings()
        ]);

        setCustomerInfo(customerInfoResult);
        setOfferings(offeringsResult);

        console.log('[useSubscription] Initialization complete', {
          customerInfo: customerInfoResult,
          offerings: offeringsResult?.length || 0
        });
      } catch (err) {
        console.error('[useSubscription] Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize subscription');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [userId, isLoaded]);
  */

  const refreshCustomerInfo = async () => {
    // No-op when RevenueCat is disabled
    console.log('[useSubscription] RefreshCustomerInfo called but RevenueCat is disabled');
  };

  const refreshOfferings = async () => {
    // No-op when RevenueCat is disabled
    console.log('[useSubscription] RefreshOfferings called but RevenueCat is disabled');
  };

  const purchase = async (packageToPurchase: any): Promise<boolean> => {
    // Always return success when RevenueCat is disabled
    console.log('[useSubscription] Purchase called but RevenueCat is disabled');
    return true;
  };

  const restore = async (): Promise<boolean> => {
    // Always return success when RevenueCat is disabled
    console.log('[useSubscription] Restore called but RevenueCat is disabled');
    return true;
  };

  /* Comment out original implementations
  const refreshCustomerInfo = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setError(null);
      const result = await getCustomerInfo();
      setCustomerInfo(result);
    } catch (err) {
      console.error('[useSubscription] Failed to refresh customer info:', err);
      setError('Failed to refresh customer info');
    }
  }, [isInitialized]);

  const refreshOfferings = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setError(null);
      const result = await getOfferings();
      setOfferings(result);
    } catch (err) {
      console.error('[useSubscription] Failed to refresh offerings:', err);
      setError('Failed to refresh offerings');
    }
  }, [isInitialized]);

  const purchase = useCallback(async (packageToPurchase: any): Promise<boolean> => {
    if (!isInitialized) {
      throw new Error('Subscription not initialized');
    }

    try {
      setError(null);
      const success = await purchasePackage(packageToPurchase);

      if (success) {
        // Refresh customer info after successful purchase
        await refreshCustomerInfo();
      }

      return success;
    } catch (err) {
      console.error('[useSubscription] Purchase failed:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      throw err;
    }
  }, [isInitialized, refreshCustomerInfo]);

  const restore = useCallback(async (): Promise<boolean> => {
    if (!isInitialized) {
      throw new Error('Subscription not initialized');
    }

    try {
      setError(null);
      const success = await restorePurchases();

      if (success) {
        // Refresh customer info after successful restore
        await refreshCustomerInfo();
      }

      return success;
    } catch (err) {
      console.error('[useSubscription] Restore failed:', err);
      setError(err instanceof Error ? err.message : 'Restore failed');
      throw err;
    }
  }, [isInitialized, refreshCustomerInfo]);

  const isPremium = checkPremiumStatus(customerInfo);
  */

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
  };
} 