import { CustomerInfo, Offering, Purchases } from '@revenuecat/purchases-js';

// Initialize RevenueCat on the client side
let purchasesInstance: Purchases | null = null;

export async function initializeRevenueCat(userId: string): Promise<void> {
  if (purchasesInstance) return;

  try {
    const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RevenueCat Web API key');
    }

    purchasesInstance = Purchases.configure(apiKey, userId);
    console.log('[RevenueCat Web] Initialized successfully');
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
    return await purchasesInstance.getCustomerInfo();
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
    return Object.values(offerings.all || {});
  } catch (error) {
    console.error('[RevenueCat Web] Failed to get offerings:', error);
    return null;
  }
}

export function checkPremiumStatus(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;

  // Check common entitlement patterns
  const activeEntitlements = customerInfo.entitlements.active;
  
  return (
    activeEntitlements['pro'] !== undefined ||
    activeEntitlements['premium'] !== undefined ||
    activeEntitlements['plus'] !== undefined ||
    activeEntitlements['Yearly'] !== undefined ||
    activeEntitlements['Monthly'] !== undefined ||
    activeEntitlements['yearly'] !== undefined ||
    activeEntitlements['monthly'] !== undefined ||
    activeEntitlements['Growmoji Premium'] !== undefined ||
    // Check if ANY entitlement is active (fallback)
    Object.keys(activeEntitlements).length > 0
  );
}

export async function purchasePackage(packageToPurchase: any): Promise<boolean> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }
    
    const result = await purchasesInstance.purchase({
      rcPackage: packageToPurchase,
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
    
    // RevenueCat web SDK doesn't have restorePurchases, but we can refresh customer info
    const customerInfo = await purchasesInstance.getCustomerInfo();
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