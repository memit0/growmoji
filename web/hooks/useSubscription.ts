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
import { CustomerInfo, Offering } from '@revenuecat/purchases-js';
import { useCallback, useEffect, useState } from 'react';

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
  const { userId, isLoaded } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<Offering[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate premium status based on customer info
  const isPremium = checkPremiumStatus(customerInfo);

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
          offerings: offeringsResult?.length || 0,
          isPremium: checkPremiumStatus(customerInfoResult)
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

  const purchase = useCallback(async (packageToPurchase: any): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      setError(null);
      setIsLoading(true);

      const success = await purchasePackage(packageToPurchase);

      if (success) {
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
    isInitialized
  };
}