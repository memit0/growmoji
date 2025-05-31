// TEMPORARY: RevenueCat integration disabled for web version
// All premium checks bypassed - users get immediate access

// Commented out RevenueCat imports since integration is disabled
// import { CustomerInfo, Offering, Purchases } from '@revenuecat/purchases-js';
import { CustomerInfo, Offering } from '@revenuecat/purchases-js';

// RevenueCat instance disabled for web version
// let purchasesInstance: Purchases | null = null;

export async function initializeRevenueCat(userId: string): Promise<void> {
  // TEMPORARY: RevenueCat initialization disabled for web version
  console.log('[RevenueCat Web] Initialization bypassed - premium access granted to all users');
  return Promise.resolve();
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  // TEMPORARY: Return null since RevenueCat is disabled
  console.log('[RevenueCat Web] getCustomerInfo bypassed - RevenueCat disabled');
  return null;
}

export async function getOfferings(): Promise<Offering[] | null> {
  // TEMPORARY: Return empty array since RevenueCat is disabled
  console.log('[RevenueCat Web] getOfferings bypassed - RevenueCat disabled');
  return [];
}

export function checkPremiumStatus(customerInfo: CustomerInfo | null): boolean {
  // TEMPORARY: Always return true for premium status
  console.log('[RevenueCat Web] checkPremiumStatus bypassed - always returning premium status');
  return true;
}

export async function purchasePackage(packageToPurchase: Offering['availablePackages'][number]): Promise<boolean> {
  // TEMPORARY: Always return success since RevenueCat is disabled
  console.log('[RevenueCat Web] purchasePackage bypassed - RevenueCat disabled');
  return true;
}

export async function restorePurchases(): Promise<boolean> {
  // TEMPORARY: Always return success since RevenueCat is disabled
  console.log('[RevenueCat Web] restorePurchases bypassed - RevenueCat disabled');
  return true;
}

// Paywall utility function
export async function presentPaywall(): Promise<boolean> {
  // TEMPORARY: Always return success since RevenueCat is disabled
  console.log('[RevenueCat Web] presentPaywall bypassed - RevenueCat disabled');
  return true;
}