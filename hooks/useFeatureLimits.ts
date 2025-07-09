import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export interface FeatureLimits {
  maxHabits: number;
  maxTodos: number;
  maxTimerSessions: number;
  canExportData: boolean;
  canSyncAcrossDevices: boolean;
  canAccessPremiumFeatures: boolean;
  userType: 'anonymous' | 'free' | 'premium';
}

export function useFeatureLimits(): FeatureLimits {
  const { isAnonymous, user } = useAuth();
  const { isPremium } = useSubscription();

  // Anonymous users get same limits as free authenticated users
  if (isAnonymous) {
    return {
      maxHabits: 3,
      maxTodos: 3,
      maxTimerSessions: 10,
      canExportData: true, // Anonymous users can export for account creation
      canSyncAcrossDevices: false,
      canAccessPremiumFeatures: false,
      userType: 'anonymous',
    };
  }

  // Free authenticated users
  if (user && !isPremium) {
    return {
      maxHabits: 3,
      maxTodos: 3,
      maxTimerSessions: 10,
      canExportData: true,
      canSyncAcrossDevices: true, // Authenticated users can sync
      canAccessPremiumFeatures: false,
      userType: 'free',
    };
  }

  // Premium users get unlimited access
  if (user && isPremium) {
    return {
      maxHabits: Infinity,
      maxTodos: Infinity,
      maxTimerSessions: Infinity,
      canExportData: true,
      canSyncAcrossDevices: true,
      canAccessPremiumFeatures: true,
      userType: 'premium',
    };
  }

  // Fallback to most restrictive settings
  return {
    maxHabits: 1,
    maxTodos: 1,
    maxTimerSessions: 5,
    canExportData: false,
    canSyncAcrossDevices: false,
    canAccessPremiumFeatures: false,
    userType: 'anonymous',
  };
}

// Convenience hooks for specific checks
export function useCanCreateHabits(): boolean {
  // This would need to be implemented to check current habit count vs limits
  // For now, returning true as a placeholder
  return true;
}

export function useCanCreateTodos(): boolean {
  // This would need to be implemented to check current todo count vs limits
  // For now, returning true as a placeholder
  return true;
}

export function useIsFeatureBlocked(feature: string): boolean {
  const limits = useFeatureLimits();
  
  switch (feature) {
    case 'sync':
      return !limits.canSyncAcrossDevices;
    case 'premium':
      return !limits.canAccessPremiumFeatures;
    case 'export':
      return !limits.canExportData;
    default:
      return false;
  }
} 