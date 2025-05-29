'use client';

import {
    checkPremiumStatus,
    getCustomerInfo,
    getOfferings,
    initializeRevenueCat,
    purchasePackage,
    restorePurchases
} from '@/lib/subscription';
import { useAuth } from '@clerk/nextjs';
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

  // Initialize RevenueCat when user is available
  useEffect(() => {
    const initialize = async () => {
      if (!isLoaded) {
        // Still loading Clerk auth
        return;
      }
      
      if (!userId) {
        // User not authenticated
        setIsLoading(false);
        setIsInitialized(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('[useSubscription] Initializing RevenueCat for user:', userId);
        
        await initializeRevenueCat(userId);
        setIsInitialized(true);
        
        // Fetch initial data with proper error handling
        const [customerInfoResult, offeringsResult] = await Promise.allSettled([
          getCustomerInfo(),
          getOfferings()
        ]);
        
        if (customerInfoResult.status === 'fulfilled') {
          setCustomerInfo(customerInfoResult.value);
        } else {
          console.warn('[useSubscription] Failed to get customer info:', customerInfoResult.reason);
        }
        
        if (offeringsResult.status === 'fulfilled') {
          setOfferings(offeringsResult.value);
        } else {
          console.warn('[useSubscription] Failed to get offerings:', offeringsResult.reason);
        }
        
        console.log('[useSubscription] Initialization complete', {
          customerInfo: customerInfoResult.status === 'fulfilled' ? customerInfoResult.value : null,
          offerings: offeringsResult.status === 'fulfilled' ? offeringsResult.value?.length || 0 : 0
        });
      } catch (err) {
        console.error('[useSubscription] Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize subscription');
        setIsInitialized(false);
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
      console.warn('[useSubscription] Purchase attempted before initialization');
      throw new Error('Subscription not initialized');
    }
    
    try {
      setError(null);
      console.log('[useSubscription] Starting purchase process:', packageToPurchase?.identifier);
      
      const success = await purchasePackage(packageToPurchase);
      
      if (success) {
        console.log('[useSubscription] Purchase successful, refreshing customer info');
        // Refresh customer info after successful purchase
        await refreshCustomerInfo();
      }
      
      return success;
    } catch (err) {
      console.error('[useSubscription] Purchase failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
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