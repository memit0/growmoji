import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for managing subscription cache
 * Used to optimize app loading performance by caching subscription status
 */

export interface CachedCustomerInfo {
  data: any;
  cachedAt: number;
}

export interface CacheMetrics {
  premiumStatus: boolean | null;
  customerInfoAge: number | null;
  isStale: boolean;
  cacheKeys: string[];
}

/**
 * Clear all subscription cache for a specific user
 */
export async function clearSubscriptionCache(userId: string): Promise<void> {
  try {
    const keysToRemove = [
      `premium_status_${userId}`,
      `customer_info_${userId}`,
      `welcome_shown_${userId}`,
      `app_walkthrough_seen_${userId}`
    ];

    await Promise.all(
      keysToRemove.map(key => AsyncStorage.removeItem(key))
    );

    console.log('[SubscriptionCache] Cleared cache for user:', userId);
  } catch (error) {
    console.error('[SubscriptionCache] Failed to clear cache:', error);
    throw error;
  }
}

/**
 * Get cache metrics for debugging
 */
export async function getCacheMetrics(userId: string): Promise<CacheMetrics> {
  try {
    const [premiumStatusCache, customerInfoCache] = await Promise.all([
      AsyncStorage.getItem(`premium_status_${userId}`),
      AsyncStorage.getItem(`customer_info_${userId}`)
    ]);

    let premiumStatus = null;
    let customerInfoAge = null;
    let isStale = false;

    if (premiumStatusCache) {
      premiumStatus = JSON.parse(premiumStatusCache);
    }

    if (customerInfoCache) {
      const customerInfoData: CachedCustomerInfo = JSON.parse(customerInfoCache);
      customerInfoAge = Date.now() - (customerInfoData.cachedAt || 0);
      isStale = customerInfoAge > 24 * 60 * 60 * 1000; // 24 hours
    }

    const cacheKeys = await AsyncStorage.getAllKeys();
    const userCacheKeys = cacheKeys.filter(key => key.includes(userId));

    return {
      premiumStatus,
      customerInfoAge,
      isStale,
      cacheKeys: userCacheKeys
    };
  } catch (error) {
    console.error('[SubscriptionCache] Failed to get cache metrics:', error);
    throw error;
  }
}

/**
 * Refresh subscription cache by clearing old data
 */
export async function refreshSubscriptionCache(userId: string): Promise<void> {
  try {
    // Only clear customer info cache to force refresh, keep premium status for instant UI
    await AsyncStorage.removeItem(`customer_info_${userId}`);
    console.log('[SubscriptionCache] Refreshed customer info cache for user:', userId);
  } catch (error) {
    console.error('[SubscriptionCache] Failed to refresh cache:', error);
    throw error;
  }
}

/**
 * Web version - Clear subscription cache using localStorage
 */
export function clearSubscriptionCacheWeb(userId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const prefix = userId || 'anonymous';
    const keysToRemove = [
      `premium_status_${prefix}`,
      `customer_info_${prefix}`
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('[SubscriptionCache Web] Cleared cache for user:', prefix);
  } catch (error) {
    console.error('[SubscriptionCache Web] Failed to clear cache:', error);
    throw error;
  }
}

/**
 * Web version - Get cache metrics
 */
export function getCacheMetricsWeb(userId?: string): CacheMetrics {
  if (typeof window === 'undefined') {
    return {
      premiumStatus: null,
      customerInfoAge: null,
      isStale: false,
      cacheKeys: []
    };
  }

  try {
    const prefix = userId || 'anonymous';
    const premiumStatusCache = localStorage.getItem(`premium_status_${prefix}`);
    const customerInfoCache = localStorage.getItem(`customer_info_${prefix}`);

    let premiumStatus = null;
    let customerInfoAge = null;
    let isStale = false;

    if (premiumStatusCache) {
      premiumStatus = JSON.parse(premiumStatusCache);
    }

    if (customerInfoCache) {
      const customerInfoData: CachedCustomerInfo = JSON.parse(customerInfoCache);
      customerInfoAge = Date.now() - (customerInfoData.cachedAt || 0);
      isStale = customerInfoAge > 24 * 60 * 60 * 1000; // 24 hours
    }

    // Get all localStorage keys that match the user pattern
    const cacheKeys = Object.keys(localStorage).filter(key => key.includes(prefix));

    return {
      premiumStatus,
      customerInfoAge,
      isStale,
      cacheKeys
    };
  } catch (error) {
    console.error('[SubscriptionCache Web] Failed to get cache metrics:', error);
    return {
      premiumStatus: null,
      customerInfoAge: null,
      isStale: false,
      cacheKeys: []
    };
  }
} 