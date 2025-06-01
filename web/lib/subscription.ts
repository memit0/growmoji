// RevenueCat Web SDK integration
import { CustomerInfo, Offering, Purchases } from '@revenuecat/purchases-js';
import { getRevenueCatApiKey } from './env';

let purchasesInstance: Purchases | null = null;

export async function initializeRevenueCat(userId: string): Promise<void> {
  try {
    const apiKey = getRevenueCatApiKey();

    console.log('[RevenueCat Web] Initializing with user ID:', userId);
    // More detailed API key logging for production
    if (process.env.NODE_ENV === 'production') {
      console.log('[RevenueCat Web] Production API Key being used (first 5, last 5):', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));
    } else {
      console.log('[RevenueCat Web] API Key prefix:', apiKey.substring(0, 10) + '...');
    }
    console.log('[RevenueCat Web] Environment:', process.env.NODE_ENV);

    // Initialize RevenueCat with user ID - correct API for web SDK
    await Purchases.configure(apiKey, userId);

    purchasesInstance = Purchases.getSharedInstance();
    console.log('[RevenueCat Web] Successfully initialized');
  } catch (error) {
    console.error('[RevenueCat Web] Initialization failed:', error);
    throw error;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    if (!purchasesInstance) {
      console.warn('[RevenueCat Web] Not initialized, returning null customer info');
      return null;
    }

    const customerInfo = await purchasesInstance.getCustomerInfo();
    console.log('[RevenueCat Web] Customer info retrieved:', customerInfo.entitlements.active);
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat Web] Failed to get customer info:', error);
    return null;
  }
}

export async function getOfferings(): Promise<Offering[] | null> {
  try {
    if (!purchasesInstance) {
      console.warn('[RevenueCat Web] Not initialized, returning empty offerings');
      return [];
    }

    const offeringsResponse = await purchasesInstance.getOfferings();
    console.log('[RevenueCat Web] Raw Offerings API Response:', JSON.stringify(offeringsResponse, null, 2)); // Log the raw response
    console.log('[RevenueCat Web] Offerings retrieved:', Object.keys(offeringsResponse.all || {}).length);
    if (Object.keys(offeringsResponse.all || {}).length === 0) {
      console.warn('[RevenueCat Web] No offerings found in the response. Current offering:', offeringsResponse.current?.identifier);
      console.warn('[RevenueCat Web] All offerings object:', offeringsResponse.all);
    }
    return Object.values(offeringsResponse.all || {});
  } catch (error) {
    console.error('[RevenueCat Web] Failed to get offerings:', error);
    return [];
  }
}

export function checkPremiumStatus(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) {
    console.log('[RevenueCat Web] No customer info, user is not premium');
    return false;
  }

  const activeEntitlements = customerInfo.entitlements.active;

  // Check for various entitlement patterns (matching iOS app logic)
  const hasEntitlement = (
    activeEntitlements['Growmoji Premium'] !== undefined ||
    activeEntitlements['pro'] !== undefined ||
    activeEntitlements['premium'] !== undefined ||
    activeEntitlements['plus'] !== undefined ||
    activeEntitlements['Yearly'] !== undefined ||
    activeEntitlements['Monthly'] !== undefined ||
    activeEntitlements['yearly'] !== undefined ||
    activeEntitlements['monthly'] !== undefined
  );

  console.log('[RevenueCat Web] Premium status check:', {
    hasEntitlement,
    activeEntitlements: Object.keys(activeEntitlements)
  });

  return hasEntitlement;
}

export async function purchasePackage(packageToPurchase: Offering['availablePackages'][number]): Promise<boolean> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }

    console.log('[RevenueCat Web] Purchasing package:', packageToPurchase.identifier);
    const { customerInfo } = await purchasesInstance.purchasePackage(packageToPurchase);

    const isPremium = checkPremiumStatus(customerInfo);
    console.log('[RevenueCat Web] Purchase completed, premium status:', isPremium);

    return isPremium;
  } catch (error) {
    console.error('[RevenueCat Web] Purchase failed:', error);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }

    console.log('[RevenueCat Web] Restoring purchases');
    const customerInfo = await purchasesInstance.getCustomerInfo();

    const isPremium = checkPremiumStatus(customerInfo);
    console.log('[RevenueCat Web] Restore completed, premium status:', isPremium);

    return isPremium;
  } catch (error) {
    console.error('[RevenueCat Web] Restore failed:', error);
    return false;
  }
}

// Paywall utility function
export async function presentPaywall(): Promise<boolean> {
  try {
    if (!purchasesInstance) {
      throw new Error('RevenueCat not initialized');
    }

    // This is handled by the PaywallModal component
    console.log('[RevenueCat Web] Paywall presentation requested');
    return true;
  } catch (error) {
    console.error('[RevenueCat Web] Paywall presentation failed:', error);
    return false;
  }
}