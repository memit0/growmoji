import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

interface SubscriptionContextType {
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering[] | null;
  isPremium: boolean;
  purchasePackage: (packageToPurchase: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshOfferings: () => Promise<void>;
  error: string | null;
  // Debug features
  debugPremiumOverride: boolean;
  setDebugPremiumOverride: (override: boolean) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugPremiumOverride, setDebugPremiumOverride] = useState(false);

  // Check if user has premium subscription (either Yearly or Monthly) or debug override
  const isPremium = 
    debugPremiumOverride ||
    customerInfo?.entitlements.active['Yearly'] !== undefined ||
    customerInfo?.entitlements.active['Monthly'] !== undefined;

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Configure RevenueCat
      const apiKey = Platform.OS === 'ios' 
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY 
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

      if (!apiKey) {
        throw new Error(`Missing RevenueCat API key for ${Platform.OS}`);
      }

      console.log(`[RevenueCat] Configuring for ${Platform.OS} with key: ${apiKey.substring(0, 10)}...`);
      await Purchases.configure({ apiKey });

      console.log('[RevenueCat] Configuration successful');

      // Get customer info and offerings
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings()
      ]);

      console.log('[RevenueCat] Customer info retrieved:', customerInfo.entitlements.active);
      console.log('[RevenueCat] Raw offerings response:', offerings);
      console.log('[RevenueCat] Available offerings count:', Object.keys(offerings.all || {}).length);
      console.log('[RevenueCat] Current offering:', offerings.current);

      // Log app identifier for debugging
      console.log('[RevenueCat] App bundle identifier:', Platform.OS === 'ios' ? 'com.mebattll.habittracker' : 'com.mebattll.habittracker');

      setCustomerInfo(customerInfo);
      
      // Handle offerings
      const offeringsArray = offerings.all ? Object.values(offerings.all) : [];
      setOfferings(offeringsArray);
      
      if (offeringsArray.length === 0) {
        console.warn('[RevenueCat] No offerings found. Possible reasons:');
        console.warn('1. Offering not created in RevenueCat dashboard');
        console.warn('2. Products not configured in App Store Connect/Google Play Console');
        console.warn('3. Bundle identifier mismatch between app and RevenueCat dashboard');
        console.warn('4. Offering configuration still propagating (can take up to 24 hours)');
        console.warn('5. API key might be for wrong project');
        setError('No subscription plans available. Please check RevenueCat dashboard configuration and ensure bundle identifiers match.');
      } else {
        console.log('[RevenueCat] Found offerings:', offeringsArray.length);
        offeringsArray.forEach((offering, index) => {
          console.log(`[RevenueCat] Offering ${index + 1}:`, {
            identifier: offering.identifier,
            serverDescription: offering.serverDescription,
            availablePackages: offering.availablePackages.length
          });
          offering.availablePackages.forEach((pkg, pkgIndex) => {
            console.log(`[RevenueCat] Package ${pkgIndex + 1}:`, {
              identifier: pkg.identifier,
              productId: pkg.product.identifier,
              price: pkg.product.priceString
            });
          });
        });
      }

      // Set up listener for customer info updates
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        console.log('[RevenueCat] Customer info updated:', customerInfo.entitlements.active);
        setCustomerInfo(customerInfo);
      });

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
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
    try {
      setError(null);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setCustomerInfo(customerInfo);
      return (
        customerInfo.entitlements.active['Yearly'] !== undefined ||
        customerInfo.entitlements.active['Monthly'] !== undefined
      );
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
      return (
        customerInfo.entitlements.active['Yearly'] !== undefined ||
        customerInfo.entitlements.active['Monthly'] !== undefined
      );
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

  const value: SubscriptionContextType = {
    isLoading,
    customerInfo,
    offerings,
    isPremium,
    purchasePackage,
    restorePurchases,
    refreshOfferings,
    error,
    // Debug features
    debugPremiumOverride,
    setDebugPremiumOverride,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 