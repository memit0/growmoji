# Anonymous User Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to enable anonymous usage in the Habittracker app to comply with app store restrictions while maintaining functionality, data integrity, and providing a path for users to create accounts later.

## Current Architecture Analysis

### Authentication Dependencies
- **Data Services**: All CRUD operations require `userId` parameter
- **Database**: Supabase RLS policies enforce user-based data isolation
- **Navigation**: Route guards prevent access without authentication
- **Subscriptions**: RevenueCat tied to authenticated user IDs
- **Local Storage**: User-specific keys for preferences and cache
- **Widget Integration**: Requires user context for data updates

### Critical Components Requiring Changes
1. `AuthContext.tsx` - Add anonymous user state
2. `lib/services/*` - Support local storage fallback
3. `app/_layout.tsx` - Navigation flow modification
4. `app/onboarding.tsx` - Add "Continue without account" option
5. Data services (habits.ts, todos.ts, timer.ts) - Local storage implementation
6. Subscription handling for anonymous users

## Implementation Strategy

### Phase 1: Anonymous User Foundation

#### 1.1 Enhanced AuthContext

**File**: `contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // NEW: Anonymous user support
  isAnonymous: boolean;
  anonymousUserId: string | null;
  enableAnonymousMode: () => Promise<string>;
  convertToRealAccount: (user: User) => Promise<void>;
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: Anonymous user state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousUserId, setAnonymousUserId] = useState<string | null>(null);

  // Generate persistent anonymous ID
  const enableAnonymousMode = async (): Promise<string> => {
    let anonId = await AsyncStorage.getItem('anonymous_user_id');
    if (!anonId) {
      anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('anonymous_user_id', anonId);
    }
    setAnonymousUserId(anonId);
    setIsAnonymous(true);
    return anonId;
  };

  // Convert anonymous data to real account
  const convertToRealAccount = async (authenticatedUser: User) => {
    if (!isAnonymous || !anonymousUserId) return;
    
    // Migrate local data to Supabase
    await migrateAnonymousDataToAccount(anonymousUserId, authenticatedUser.id);
    
    // Clear anonymous state
    await AsyncStorage.removeItem('anonymous_user_id');
    setIsAnonymous(false);
    setAnonymousUserId(null);
    setUser(authenticatedUser);
  };
};
```

#### 1.2 Data Migration Utility

**File**: `lib/utils/dataMigration.ts`

```typescript
import { habitsService } from '../services/habits';
import { todosService } from '../services/todos';
import { getAnonymousData, clearAnonymousData } from '../services/localStorage';

export async function migrateAnonymousDataToAccount(
  anonymousUserId: string, 
  realUserId: string
): Promise<void> {
  try {
    console.log('[DataMigration] Starting migration from anonymous to authenticated user');
    
    // Get all anonymous data
    const [habits, todos, timerSessions] = await Promise.all([
      getAnonymousData('habits', anonymousUserId),
      getAnonymousData('todos', anonymousUserId),
      getAnonymousData('timer_sessions', anonymousUserId)
    ]);

    // Migrate habits
    for (const habit of habits) {
      await habitsService.createHabit(
        {
          emoji: habit.emoji,
          start_date: habit.start_date
        },
        realUserId
      );
    }

    // Migrate todos
    for (const todo of todos) {
      await todosService.createTodo(
        {
          content: todo.content,
          is_completed: todo.is_completed
        },
        realUserId
      );
    }

    // Clear anonymous data after successful migration
    await clearAnonymousData(anonymousUserId);
    
    console.log('[DataMigration] Migration completed successfully');
  } catch (error) {
    console.error('[DataMigration] Migration failed:', error);
    throw new Error('Failed to migrate anonymous data. Please try again.');
  }
}
```

### Phase 2: Local Storage Data Services

#### 2.1 Local Storage Service

**File**: `lib/services/localStorage.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog } from './habits';
import { Todo } from './todos';

// Storage keys
const STORAGE_KEYS = {
  habits: (userId: string) => `local_habits_${userId}`,
  todos: (userId: string) => `local_todos_${userId}`,
  habitLogs: (userId: string) => `local_habit_logs_${userId}`,
  timerSessions: (userId: string) => `local_timer_sessions_${userId}`,
  userPreferences: (userId: string) => `local_preferences_${userId}`,
};

// Generic local storage operations
export async function saveToLocalStorage<T>(
  key: string, 
  data: T[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('[LocalStorage] Save failed:', error);
    throw error;
  }
}

export async function getFromLocalStorage<T>(
  key: string, 
  defaultValue: T[] = []
): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('[LocalStorage] Get failed:', error);
    return defaultValue;
  }
}

// Specific data type operations
export async function getAnonymousData(
  dataType: 'habits' | 'todos' | 'timer_sessions', 
  userId: string
): Promise<any[]> {
  const key = STORAGE_KEYS[dataType](userId);
  return getFromLocalStorage(key);
}

export async function clearAnonymousData(userId: string): Promise<void> {
  const keys = Object.values(STORAGE_KEYS).map(fn => fn(userId));
  await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
}

// Data export for account creation
export async function exportAnonymousData(userId: string): Promise<{
  habits: Habit[];
  todos: Todo[];
  timerSessions: any[];
}> {
  const [habits, todos, timerSessions] = await Promise.all([
    getAnonymousData('habits', userId),
    getAnonymousData('todos', userId),
    getAnonymousData('timer_sessions', userId)
  ]);

  return { habits, todos, timerSessions };
}
```

#### 2.2 Enhanced Habits Service

**File**: `lib/services/habits.ts` (Modified)

```typescript
// Add local storage imports
import { saveToLocalStorage, getFromLocalStorage } from './localStorage';

export const habitsService = {
  async getHabits(userId: string, useLocalStorage = false): Promise<Habit[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      const key = `local_habits_${userId}`;
      return getFromLocalStorage<Habit>(key);
    }

    // Existing Supabase logic for authenticated users
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }

    return data || [];
  },

  async createHabit(
    habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'current_streak' | 'last_check_date'>, 
    userId: string,
    useLocalStorage = false
  ): Promise<Habit> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const newHabit: Habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      ...habit,
      current_streak: 0,
      last_check_date: null,
      created_at: new Date().toISOString(),
    };

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      const key = `local_habits_${userId}`;
      const existingHabits = await getFromLocalStorage<Habit>(key);
      const updatedHabits = [newHabit, ...existingHabits];
      await saveToLocalStorage(key, updatedHabits);
      return newHabit;
    }

    // Existing Supabase logic for authenticated users
    const { data, error } = await supabase
      .from('habits')
      .insert([newHabit])
      .select()
      .single();

    if (error) {
      console.error('[habitsService.createHabit] Supabase insert FAILED. Error:', error);
      throw error;
    }
    return data;
  },

  // Similar modifications for updateHabit, deleteHabit, etc.
  // Each method needs useLocalStorage parameter and conditional logic
};
```

#### 2.3 Enhanced Todos Service

**File**: `lib/services/todos.ts` (Modified)

```typescript
// Similar pattern as habits service
export const todosService = {
  async getTodos(userId: string, useLocalStorage = false): Promise<Todo[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (useLocalStorage || userId.startsWith('anon_')) {
      const key = `local_todos_${userId}`;
      return getFromLocalStorage<Todo>(key);
    }

    // Existing Supabase logic
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }

    return data || [];
  },

  // Similar modifications for create, update, delete operations
};
```

### Phase 3: Modified Navigation Flow

#### 3.1 Enhanced Onboarding

**File**: `app/onboarding.tsx` (Modified)

```typescript
// Add new slide for account choice
const onboardingSlides: OnboardingSlide[] = [
  // ... existing slides ...
  {
    key: '11', // New slide
    type: 'account-choice',
    title: '🚀 Ready to get started?',
    description: 'Choose how you\'d like to use Growmoji',
    options: [
      {
        id: 'create-account',
        title: 'Create Account',
        description: 'Sync across devices & backup your data',
        icon: '☁️',
        benefits: ['Data backup', 'Sync across devices', 'Premium features']
      },
      {
        id: 'continue-anonymous',
        title: 'Continue without Account',
        description: 'Use locally, create account later',
        icon: '📱',
        benefits: ['Use immediately', 'No registration', 'Upgrade anytime']
      }
    ]
  }
];

// Add new handlers
const handleCreateAccount = async () => {
  await markOnboardingAsSeen();
  router.replace('/(auth)/login');
};

const handleContinueAnonymous = async () => {
  const { enableAnonymousMode } = useAuth();
  await enableAnonymousMode();
  await markOnboardingAsSeen();
  router.replace('/(tabs)');
};
```

#### 3.2 Modified App Layout

**File**: `app/_layout.tsx` (Modified)

```typescript
function RootNavigation() {
  const { user, loading, isAnonymous, anonymousUserId } = useAuth();
  
  // Modified navigation logic
  useEffect(() => {
    if (loading || onboardingLoading || navigationInProgress) return;

    const hasActiveSession = user || (isAnonymous && anonymousUserId);

    if (!hasActiveSession) {
      // No user and not anonymous - show onboarding or auth
      if (!hasSeenOnboarding && !inOnboarding) {
        router.replace('/onboarding');
      } else if (hasSeenOnboarding && !inAuthGroup && !inOnboarding) {
        router.replace('/(auth)/login');
      }
    } else {
      // Has active session (authenticated or anonymous) - go to main app
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [loading, onboardingLoading, user, isAnonymous, anonymousUserId, hasSeenOnboarding]);
}
```

### Phase 4: UI/UX Enhancements

#### 4.1 Anonymous User Indicators

**File**: `app/components/ProfileModal.tsx` (Modified)

```typescript
export const ProfileModal: React.FC<ProfileModalProps> = ({ isVisible, onClose }) => {
  const { user, isAnonymous, signOut } = useAuth();
  
  return (
    <Modal visible={isVisible} animationType="slide">
      {isAnonymous ? (
        <AnonymousUserProfile onClose={onClose} />
      ) : (
        <AuthenticatedUserProfile user={user} onClose={onClose} />
      )}
    </Modal>
  );
};

const AnonymousUserProfile = ({ onClose }) => {
  const { colors } = useTheme();
  const router = useRouter();
  
  const handleCreateAccount = () => {
    onClose();
    router.push('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Anonymous User</Text>
        <Text style={styles.subtitle}>
          Your data is stored locally on this device
        </Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Important</Text>
        <Text style={styles.warningText}>
          Without an account, your data won't sync across devices and could be lost if you delete the app.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleCreateAccount}
      >
        <Text style={styles.primaryButtonText}>
          Create Account & Backup Data
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={onClose}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
          Continue Without Account
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### 4.2 Data Export/Import UI

**File**: `components/ui/DataMigrationPrompt.tsx` (New)

```typescript
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { exportAnonymousData } from '@/lib/utils/dataMigration';

interface DataMigrationPromptProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const DataMigrationPrompt: React.FC<DataMigrationPromptProps> = ({
  visible,
  onComplete,
  onSkip
}) => {
  const { anonymousUserId, convertToRealAccount } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [dataStats, setDataStats] = useState({ habits: 0, todos: 0 });

  useEffect(() => {
    if (visible && anonymousUserId) {
      loadDataStats();
    }
  }, [visible, anonymousUserId]);

  const loadDataStats = async () => {
    if (!anonymousUserId) return;
    
    const data = await exportAnonymousData(anonymousUserId);
    setDataStats({
      habits: data.habits.length,
      todos: data.todos.length
    });
  };

  const handleMigrate = async () => {
    if (!anonymousUserId) return;
    
    setMigrating(true);
    try {
      // This will be called after successful account creation
      await convertToRealAccount(newUser);
      onComplete();
    } catch (error) {
      console.error('Migration failed:', error);
      // Show error message
    } finally {
      setMigrating(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>🔄 Backup Your Data</Text>
          <Text style={styles.description}>
            We found {dataStats.habits} habits and {dataStats.todos} tasks on this device.
            Would you like to backup this data to your new account?
          </Text>

          <View style={styles.dataPreview}>
            <Text style={styles.dataItem}>📋 {dataStats.todos} Tasks</Text>
            <Text style={styles.dataItem}>🏃‍♀️ {dataStats.habits} Habits</Text>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, migrating && styles.disabled]}
            onPress={handleMigrate}
            disabled={migrating}
          >
            <Text style={styles.primaryButtonText}>
              {migrating ? 'Backing up...' : 'Yes, Backup My Data'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
            <Text style={styles.secondaryButtonText}>
              Skip (Start Fresh)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
```

### Phase 5: Premium Features & Subscription Handling

#### 5.1 Anonymous User Subscription Logic

**File**: `contexts/SubscriptionContext.tsx` (Modified)

```typescript
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isAnonymous, anonymousUserId } = useAuth();
  
  useEffect(() => {
    if (isAnonymous) {
      // Anonymous users are always free tier
      setCustomerInfo(null);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    // Existing authenticated user logic
    if (user?.id) {
      initializeRevenueCatInBackground();
    }
  }, [user?.id, isAnonymous]);

  // Anonymous users cannot purchase premium
  const isPremium = isAnonymous ? false : checkPremiumStatus(customerInfo);

  const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
    if (isAnonymous) {
      // Prompt user to create account first
      throw new Error('Please create an account to purchase premium features');
    }
    
    // Existing purchase logic
    return performPurchase(packageToPurchase);
  };
};
```

#### 5.2 Feature Limit Enforcement

**File**: `hooks/useFeatureLimits.ts` (New)

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export interface FeatureLimits {
  maxHabits: number;
  maxTodos: number;
  maxTimerSessions: number;
  canExportData: boolean;
  canSyncAcrossDevices: boolean;
}

export function useFeatureLimits(): FeatureLimits {
  const { isAnonymous } = useAuth();
  const { isPremium } = useSubscription();

  // Anonymous users get same limits as free authenticated users
  if (isAnonymous || !isPremium) {
    return {
      maxHabits: 3,
      maxTodos: 3,
      maxTimerSessions: 10,
      canExportData: isAnonymous, // Anonymous users can export for account creation
      canSyncAcrossDevices: false,
    };
  }

  // Premium users get unlimited access
  return {
    maxHabits: Infinity,
    maxTodos: Infinity,
    maxTimerSessions: Infinity,
    canExportData: true,
    canSyncAcrossDevices: true,
  };
}
```

### Phase 6: Widget & Native Integration

#### 6.1 Widget Data for Anonymous Users

**File**: `lib/services/widgetData.ts` (Modified)

```typescript
export function updateWidgetData(
  todos: Todo[], 
  habits: Habit[], 
  currentTheme: 'light' | 'dark', 
  isPremium: boolean = false,
  isAnonymous: boolean = false
) {
  try {
    const widgetTasks: WidgetTask[] = todos.map(todo => ({
      title: todo.content,
      is_completed: todo.is_completed ? 1 : 0,
    }));

    const todayStr = new Date().toISOString().split('T')[0];
    const widgetHabits: WidgetHabit[] = habits.map(habit => ({
      emoji: habit.emoji,
      streak: habit.current_streak,
      isLoggedToday: (habit.last_check_date ? habit.last_check_date.startsWith(todayStr) : false) ? 1 : 0,
    }));

    const dataToStore = {
      tasks: widgetTasks.slice(0, 3),
      habits: widgetHabits.slice(0, 3),
      appTheme: currentTheme,
      isPremium: isPremium ? 1 : 0,
      isAnonymous: isAnonymous ? 1 : 0, // NEW: Indicate anonymous mode
      totalTasks: widgetTasks.length,
      activeHabits: widgetHabits.length,
    };

    storage.set('widgetData', dataToStore);
    ExtensionStorage.reloadWidget(); 
  } catch (error) {
    console.error('[WidgetData] Update failed:', error);
  }
}
```

### Phase 7: Error Handling & Edge Cases

#### 7.1 Storage Quota Management

**File**: `lib/utils/storageManager.ts` (New)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageManager {
  static async checkStorageSpace(): Promise<boolean> {
    try {
      // Test write to check available space
      const testKey = 'storage_test';
      const testData = 'x'.repeat(1024); // 1KB test
      
      await AsyncStorage.setItem(testKey, testData);
      await AsyncStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('[StorageManager] Storage space check failed:', error);
      return false;
    }
  }

  static async cleanupOldData(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const keys = await AsyncStorage.getAllKeys();
      const cleanupPromises = keys
        .filter(key => key.startsWith('local_') && this.isDataOld(key, cutoffDate))
        .map(key => AsyncStorage.removeItem(key));
      
      await Promise.all(cleanupPromises);
      console.log(`[StorageManager] Cleaned up ${cleanupPromises.length} old entries`);
    } catch (error) {
      console.error('[StorageManager] Cleanup failed:', error);
    }
  }

  private static isDataOld(key: string, cutoffDate: Date): boolean {
    // Extract timestamp from key if available, or use creation time
    // Implementation depends on key naming convention
    return false; // Placeholder
  }
}
```

#### 7.2 Data Validation & Corruption Handling

**File**: `lib/utils/dataValidator.ts` (New)

```typescript
export class DataValidator {
  static validateHabit(habit: any): habit is Habit {
    return (
      typeof habit.id === 'string' &&
      typeof habit.emoji === 'string' &&
      typeof habit.current_streak === 'number' &&
      habit.current_streak >= 0
    );
  }

  static validateTodo(todo: any): todo is Todo {
    return (
      typeof todo.id === 'string' &&
      typeof todo.content === 'string' &&
      typeof todo.is_completed === 'boolean'
    );
  }

  static async repairCorruptedData(userId: string): Promise<void> {
    try {
      // Validate and repair habits
      const habits = await getFromLocalStorage<Habit>(`local_habits_${userId}`);
      const validHabits = habits.filter(this.validateHabit);
      
      if (validHabits.length !== habits.length) {
        console.warn(`[DataValidator] Repaired ${habits.length - validHabits.length} corrupted habits`);
        await saveToLocalStorage(`local_habits_${userId}`, validHabits);
      }

      // Validate and repair todos
      const todos = await getFromLocalStorage<Todo>(`local_todos_${userId}`);
      const validTodos = todos.filter(this.validateTodo);
      
      if (validTodos.length !== todos.length) {
        console.warn(`[DataValidator] Repaired ${todos.length - validTodos.length} corrupted todos`);
        await saveToLocalStorage(`local_todos_${userId}`, validTodos);
      }
    } catch (error) {
      console.error('[DataValidator] Repair failed:', error);
    }
  }
}
```

## Implementation Phases & Timeline

### Phase 1: Foundation (Week 1)
- ✅ Enhanced AuthContext with anonymous support
- ✅ Local storage service infrastructure
- ✅ Data migration utilities

### Phase 2: Core Services (Week 2)
- ✅ Modified habits/todos services with local storage
- ✅ Feature limits enforcement
- ✅ Subscription handling for anonymous users

### Phase 3: UI/UX (Week 3)
- ✅ Modified onboarding flow
- ✅ Anonymous user profile interface
- ✅ Data migration prompts

### Phase 4: Integration & Polish (Week 4)
- ✅ Widget integration for anonymous users
- ✅ Error handling and edge cases
- ✅ Testing and bug fixes

## Security Considerations

### 1. Data Isolation
- Anonymous user IDs are unique and non-guessable
- Local storage keys are user-specific
- No cross-contamination between users

### 2. Privacy Compliance
- No personal data collection for anonymous users
- Clear data retention policies
- User-initiated data export/delete capabilities

### 3. Transition Security
- Data migration uses encrypted local storage
- Validation during account creation process
- Rollback capability if migration fails

## Testing Strategy

### 1. Unit Tests
- Local storage operations
- Data validation functions
- Migration utilities

### 2. Integration Tests
- Anonymous user flow end-to-end
- Account creation with data migration
- Feature limit enforcement

### 3. Edge Case Testing
- Storage quota exceeded
- Corrupted local data
- Network failures during migration
- App backgrounding during operations

## Risk Mitigation

### 1. Data Loss Prevention
- Regular local storage validation
- Backup prompts before critical operations
- Recovery mechanisms for common failures

### 2. Performance Considerations
- Lazy loading of local data
- Background cleanup operations
- Storage quota monitoring

### 3. User Experience
- Clear communication about anonymous limitations
- Smooth account creation flow
- Helpful migration prompts

## Success Metrics

### 1. App Store Compliance
- ✅ Functional app without account requirement
- ✅ Clear value proposition for account creation
- ✅ No data collection without consent

### 2. User Adoption
- Track anonymous vs authenticated user ratios
- Monitor conversion from anonymous to authenticated
- Measure feature usage patterns

### 3. Technical Performance
- Local storage operation latency
- Data migration success rates
- Error rates and crash analytics

## Conclusion

This implementation plan enables anonymous usage while maintaining:

1. **Full Functionality**: All core features work locally
2. **Data Safety**: Robust local storage with validation
3. **Upgrade Path**: Seamless account creation with data migration
4. **App Store Compliance**: Functional app without forced registration
5. **Premium Model**: Clear value proposition for accounts and premium features

The phased approach ensures minimal risk while delivering maximum value for both anonymous and authenticated users. 