import { CustomerInfo, Offering, Purchases } from '@revenuecat/purchases-js';

// Initialize RevenueCat on the client side
let purchasesInstance: Purchases | null = null;

export async function initializeRevenueCat(userId: string): Promise<void> {
  if (purchasesInstance) return;

  try {
    const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RevenueCat Web API key - check NEXT_PUBLIC_REVENUECAT_WEB_API_KEY environment variable');
    }

    console.log('[RevenueCat Web] Initializing with API key:', apiKey.substring(0, 10) + '...');
    console.log('[RevenueCat Web] User ID:', userId);

    purchasesInstance = Purchases.configure(apiKey, userId);
    console.log('[RevenueCat Web] Initialized successfully');
    
    // Test the connection immediately
    const testCustomerInfo = await purchasesInstance.getCustomerInfo();
    console.log('[RevenueCat Web] Initial customer info:', {
      userId: testCustomerInfo.originalAppUserId,
      activeEntitlements: Object.keys(testCustomerInfo.entitlements.active),
      allEntitlements: Object.keys(testCustomerInfo.entitlements.all)
    });
  } catch (error) {
    console.error('[RevenueCat Web] Initialization failed:', error);
    throw error;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }
    const customerInfo = await purchasesInstance.getCustomerInfo();
    console.log('[RevenueCat Web] Customer info retrieved:', {
      userId: customerInfo.originalAppUserId,
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
      allEntitlements: Object.keys(customerInfo.entitlements.all),
      entitlementDetails: customerInfo.entitlements.active
    });
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat Web] Failed to get customer info:', error);
    return null;
  }
}

export async function getOfferings(): Promise<Offering[] | null> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }
    const offerings = await purchasesInstance.getOfferings();
    const offeringsArray = Object.values(offerings.all || {});
    console.log('[RevenueCat Web] Offerings retrieved:', {
      count: offeringsArray.length,
      offerings: offeringsArray.map(o => ({
        identifier: o.identifier,
        packagesCount: o.availablePackages.length
      }))
    });
    return offeringsArray;
  } catch (error) {
    console.error('[RevenueCat Web] Failed to get offerings:', error);
    return null;
  }
}

export function checkPremiumStatus(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) {
    console.log('[RevenueCat Web] No customer info - not premium');
    return false;
  }

  // Check common entitlement patterns
  const activeEntitlements = customerInfo.entitlements.active;
  const entitlementKeys = Object.keys(activeEntitlements);
  
  console.log('[RevenueCat Web] Checking premium status:', {
    activeEntitlements: entitlementKeys,
    entitlementDetails: activeEntitlements
  });

  const isPremium = (
    activeEntitlements['pro'] !== undefined ||
    activeEntitlements['premium'] !== undefined ||
    activeEntitlements['plus'] !== undefined ||
    activeEntitlements['Yearly'] !== undefined ||
    activeEntitlements['Monthly'] !== undefined ||
    activeEntitlements['yearly'] !== undefined ||
    activeEntitlements['monthly'] !== undefined ||
    activeEntitlements['Growmoji Premium'] !== undefined ||
    activeEntitlements['growmoji_premium'] !== undefined ||
    activeEntitlements['premium_yearly'] !== undefined ||
    activeEntitlements['premium_monthly'] !== undefined ||
    // Check if ANY entitlement is active (fallback)
    entitlementKeys.length > 0
  );

  console.log('[RevenueCat Web] Premium status result:', isPremium);
  return isPremium;
}

// Add a debug function to manually check entitlements
export function debugEntitlements(customerInfo: CustomerInfo | null): void {
  if (!customerInfo) {
    console.log('[RevenueCat Debug] No customer info available');
    return;
  }

  console.log('[RevenueCat Debug] Full entitlements analysis:');
  console.log('Active entitlements:', customerInfo.entitlements.active);
  console.log('All entitlements:', customerInfo.entitlements.all);
  
  Object.entries(customerInfo.entitlements.active).forEach(([key, entitlement]) => {
    console.log(`[RevenueCat Debug] Active entitlement "${key}":`, {
      isActive: entitlement.isActive,
      willRenew: entitlement.willRenew,
      productIdentifier: entitlement.productIdentifier,
      expirationDate: entitlement.expirationDate
    });
  });
}

export async function purchasePackage(packageToPurchase: Offering['availablePackages'][number]): Promise<boolean> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }
    
    console.log('[RevenueCat Web] Attempting purchase:', packageToPurchase.identifier);
    
    const result = await purchasesInstance.purchase({
      rcPackage: packageToPurchase,
    });
    
    console.log('[RevenueCat Web] Purchase result:', {
      success: true,
      customerInfo: result.customerInfo.originalAppUserId
    });
    
    return checkPremiumStatus(result.customerInfo);
  } catch (error) {
    console.error('[RevenueCat Web] Purchase failed:', error);
    throw error;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }
    
    console.log('[RevenueCat Web] Restoring purchases...');
    
    // RevenueCat web SDK doesn't have restorePurchases, but we can refresh customer info
    const customerInfo = await purchasesInstance.getCustomerInfo();
    
    console.log('[RevenueCat Web] Restore complete');
    debugEntitlements(customerInfo);
    
    return checkPremiumStatus(customerInfo);
  } catch (error) {
    console.error('[RevenueCat Web] Restore failed:', error);
    throw error;
  }
}

// Paywall utility function
export async function presentPaywall(): Promise<boolean> {
  try {
    // For web, we'll use a modal instead of RevenueCat's native paywall
    // This function returns true if the user successfully subscribes
    return new Promise((resolve) => {
      // This will be handled by our custom PaywallModal component
      window.dispatchEvent(new CustomEvent('showPaywall', { 
        detail: { resolve } 
      }));
    });
  } catch (error) {
    console.error('[RevenueCat Web] Paywall presentation failed:', error);
    return false;
  }
} 