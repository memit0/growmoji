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

  // Check if user has premium subscription (either Yearly or Monthly)
  const isPremium = 
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
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '' });
      } else if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '' });
      }

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

      setCustomerInfo(customerInfo);
      
      // Handle offerings
      const offeringsArray = offerings.all ? Object.values(offerings.all) : [];
      setOfferings(offeringsArray);
      
      if (offeringsArray.length === 0) {
        console.warn('[RevenueCat] No offerings found. Possible reasons:');
        console.warn('1. Offering not created in RevenueCat dashboard');
        console.warn('2. Products not configured in App Store Connect/Google Play Console');
        console.warn('3. Offering configuration still propagating (can take up to 24 hours)');
        console.warn('4. App identifier mismatch between RevenueCat and app stores');
        setError('No subscription plans available. This could be due to configuration still propagating from RevenueCat dashboard. Please try refreshing in a few minutes.');
      } else {
        console.log('[RevenueCat] Found offerings:', offeringsArray.length);
        offeringsArray.forEach((offering, index) => {
          console.log(`[RevenueCat] Offering ${index + 1}:`, {
            identifier: offering.identifier,
            serverDescription: offering.serverDescription,
            availablePackages: offering.availablePackages.length
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
      if (error.message?.includes('no products registered')) {
        setError('RevenueCat configuration incomplete. Please create an Offering in your dashboard.');
      } else if (error.message?.includes('API key')) {
        setError('Invalid RevenueCat API key. Please check your environment variables.');
      } else {
        setError('Failed to initialize subscription system. Please try again.');
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
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 