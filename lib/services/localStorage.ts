import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog } from './habits';
import { Todo } from './todos';

// Storage keys generator functions
const STORAGE_KEYS = {
  habits: (userId: string) => `local_habits_${userId}`,
  todos: (userId: string) => `local_todos_${userId}`,
  habitLogs: (userId: string) => `local_habit_logs_${userId}`,
  timerSessions: (userId: string) => `local_timer_sessions_${userId}`,
  userPreferences: (userId: string) => `local_preferences_${userId}`,
  anonymousUserId: 'anonymous_user_id',
};

// Generic local storage operations
export async function saveToLocalStorage<T>(
  key: string, 
  data: T[]
): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    console.log(`[LocalStorage] Saved ${data.length} items to ${key}`);
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
    if (data === null) {
      console.log(`[LocalStorage] No data found for ${key}, returning default`);
      return defaultValue;
    }
    const parsedData = JSON.parse(data);
    console.log(`[LocalStorage] Retrieved ${parsedData.length} items from ${key}`);
    return parsedData;
  } catch (error) {
    console.error('[LocalStorage] Get failed:', error);
    return defaultValue;
  }
}

// Save single item to local storage
export async function saveItemToLocalStorage<T>(
  key: string,
  data: T
): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    console.log(`[LocalStorage] Saved single item to ${key}`);
  } catch (error) {
    console.error('[LocalStorage] Save item failed:', error);
    throw error;
  }
}

// Get single item from local storage
export async function getItemFromLocalStorage<T>(
  key: string,
  defaultValue: T | null = null
): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data === null) {
      return defaultValue;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('[LocalStorage] Get item failed:', error);
    return defaultValue;
  }
}

// Specific data type operations
export async function getAnonymousData(
  dataType: 'habits' | 'todos' | 'timer_sessions' | 'habit_logs', 
  userId: string
): Promise<any[]> {
  const keyFunction = STORAGE_KEYS[dataType === 'timer_sessions' ? 'timerSessions' : dataType === 'habit_logs' ? 'habitLogs' : dataType];
  const key = keyFunction(userId);
  return getFromLocalStorage(key);
}

export async function saveAnonymousData<T>(
  dataType: 'habits' | 'todos' | 'timer_sessions' | 'habit_logs',
  userId: string,
  data: T[]
): Promise<void> {
  const keyFunction = STORAGE_KEYS[dataType === 'timer_sessions' ? 'timerSessions' : dataType === 'habit_logs' ? 'habitLogs' : dataType];
  const key = keyFunction(userId);
  return saveToLocalStorage(key, data);
}

export async function clearAnonymousData(userId: string): Promise<void> {
  try {
    const keys = [
      STORAGE_KEYS.habits(userId),
      STORAGE_KEYS.todos(userId),
      STORAGE_KEYS.habitLogs(userId),
      STORAGE_KEYS.timerSessions(userId),
      STORAGE_KEYS.userPreferences(userId),
    ];
    
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
    console.log(`[LocalStorage] Cleared all anonymous data for user ${userId}`);
  } catch (error) {
    console.error('[LocalStorage] Clear failed:', error);
    throw error;
  }
}

// Data export for account creation
export async function exportAnonymousData(userId: string): Promise<{
  habits: Habit[];
  todos: Todo[];
  habitLogs: HabitLog[];
  timerSessions: any[];
}> {
  try {
    const [habits, todos, habitLogs, timerSessions] = await Promise.all([
      getAnonymousData('habits', userId),
      getAnonymousData('todos', userId),
      getAnonymousData('habit_logs', userId),
      getAnonymousData('timer_sessions', userId)
    ]);

    console.log(`[LocalStorage] Exported data for ${userId}:`, {
      habits: habits.length,
      todos: todos.length,
      habitLogs: habitLogs.length,
      timerSessions: timerSessions.length
    });

    return { habits, todos, habitLogs, timerSessions };
  } catch (error) {
    console.error('[LocalStorage] Export failed:', error);
    throw error;
  }
}

// Anonymous user ID management
export async function getAnonymousUserId(): Promise<string | null> {
  return getItemFromLocalStorage<string>(STORAGE_KEYS.anonymousUserId);
}

export async function setAnonymousUserId(userId: string): Promise<void> {
  return saveItemToLocalStorage(STORAGE_KEYS.anonymousUserId, userId);
}

export async function clearAnonymousUserId(): Promise<void> {
  return AsyncStorage.removeItem(STORAGE_KEYS.anonymousUserId);
}

// Generate unique anonymous user ID
export function generateAnonymousUserId(): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  return `anon_${timestamp}_${randomString}`;
}

// Storage space management
export async function checkStorageSpace(): Promise<boolean> {
  try {
    // Test write to check available space
    const testKey = 'storage_test';
    const testData = 'x'.repeat(1024); // 1KB test
    
    await AsyncStorage.setItem(testKey, testData);
    await AsyncStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('[LocalStorage] Storage space check failed:', error);
    return false;
  }
}

// Data validation helpers
export function validateHabit(habit: any): habit is Habit {
  return (
    typeof habit.id === 'string' &&
    typeof habit.emoji === 'string' &&
    typeof habit.current_streak === 'number' &&
    habit.current_streak >= 0
  );
}

export function validateTodo(todo: any): todo is Todo {
  return (
    typeof todo.id === 'string' &&
    typeof todo.content === 'string' &&
    typeof todo.is_completed === 'boolean'
  );
}

// Repair corrupted data
export async function repairCorruptedData(userId: string): Promise<void> {
  try {
    console.log(`[LocalStorage] Starting data repair for user ${userId}`);
    
    // Validate and repair habits
    const habits = await getFromLocalStorage<Habit>(STORAGE_KEYS.habits(userId));
    const validHabits = habits.filter(validateHabit);
    
    if (validHabits.length !== habits.length) {
      console.warn(`[LocalStorage] Repaired ${habits.length - validHabits.length} corrupted habits`);
      await saveToLocalStorage(STORAGE_KEYS.habits(userId), validHabits);
    }

    // Validate and repair todos
    const todos = await getFromLocalStorage<Todo>(STORAGE_KEYS.todos(userId));
    const validTodos = todos.filter(validateTodo);
    
    if (validTodos.length !== todos.length) {
      console.warn(`[LocalStorage] Repaired ${todos.length - validTodos.length} corrupted todos`);
      await saveToLocalStorage(STORAGE_KEYS.todos(userId), validTodos);
    }
    
    console.log(`[LocalStorage] Data repair completed for user ${userId}`);
  } catch (error) {
    console.error('[LocalStorage] Repair failed:', error);
    throw error;
  }
} 