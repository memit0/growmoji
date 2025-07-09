import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getAnonymousData } from '../lib/services/localStorage';

export interface FeatureLimits {
  maxHabits: number;
  maxTodos: number;
  maxTimerSessions: number;
  canExportData: boolean;
  canSyncAcrossDevices: boolean;
  canAccessPremiumFeatures: boolean;
  userType: 'anonymous' | 'free' | 'premium';
}

// Hook to get current data counts for any user type
export function useDataCounts() {
  const { isAnonymous, user, anonymousUserId } = useAuth();
  const [counts, setCounts] = useState<{ habits: number; todos: number; timerSessions: number }>({
    habits: 0,
    todos: 0,
    timerSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const userId = isAnonymous ? anonymousUserId : user?.id;
        if (!userId) {
          setCounts({ habits: 0, todos: 0, timerSessions: 0 });
          setLoading(false);
          return;
        }

        if (isAnonymous) {
          // For anonymous users, get from local storage
          const [habits, todos, timerSessions] = await Promise.all([
            getAnonymousData('habits', userId),
            getAnonymousData('todos', userId),
            getAnonymousData('timer_sessions', userId),
          ]);
          
          setCounts({
            habits: habits.length,
            todos: todos.length,
            timerSessions: timerSessions.length,
          });
        } else {
          // For authenticated users, we'd need to fetch from Supabase
          // For now, we'll rely on the parent component to pass counts
          // This will be handled in the main components that use these hooks
          setCounts({ habits: 0, todos: 0, timerSessions: 0 });
        }
      } catch (error) {
        console.error('[useDataCounts] Error fetching counts:', error);
        setCounts({ habits: 0, todos: 0, timerSessions: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [isAnonymous, user?.id, anonymousUserId]);

  return { counts, loading };
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

// Convenience hooks for specific checks that work with current data
export function useCanCreateHabits(currentHabitsCount: number): boolean {
  const limits = useFeatureLimits();
  return currentHabitsCount < limits.maxHabits;
}

export function useCanCreateTodos(currentTodosCount: number): boolean {
  const limits = useFeatureLimits();
  return currentTodosCount < limits.maxTodos;
}

export function useCanCreateTimerSessions(currentSessionsCount: number): boolean {
  const limits = useFeatureLimits();
  return currentSessionsCount < limits.maxTimerSessions;
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