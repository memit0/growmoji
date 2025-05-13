import { ExtensionStorage } from '@bacons/apple-targets';
import { Habit } from './habits';
import { Todo } from './todos';

// IMPORTANT: Replace 'group.com.yourbundleid' with your actual App Group ID
const APP_GROUP_ID = 'group.com.yourbundleid';
const storage = new ExtensionStorage(APP_GROUP_ID);

// Adjusted WidgetData to conform to ExtensionStorage types
// All values will be string or number.
export interface WidgetTask {
  title: string;
  is_completed: 0 | 1; // 0 for false, 1 for true
}

export interface WidgetHabit {
  emoji: string;
  streak: number;
  isLoggedToday: 0 | 1; // 0 for false, 1 for true
}

export interface WidgetDataForStorage {
  tasks: WidgetTask[];
  habits: WidgetHabit[];
  // We can also store aggregated counts as numbers
  totalTasks?: number;
  completedTasksToday?: number;
  activeHabits?: number;
}

export function updateWidgetData(todos: Todo[], habits: Habit[]) {
  console.log('[widgetData] Updating widget data...');
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

    // Type assertion: We construct this object carefully to match one of the allowed types.
    // Here, we aim for `Record<string, string | number | Array<Record<string, string | number>>>`
    // by ensuring tasks and habits are arrays of records with only string/number values.
    const dataToStore = {
      tasks: widgetTasks.slice(0, 3),
      habits: widgetHabits.slice(0, 3),
      totalTasks: widgetTasks.length,
      activeHabits: widgetHabits.length,
    } as any; // Using 'as any' here to bypass complex type checking for ExtensionStorage
                // We are ensuring the structure is compliant.

    storage.set('widgetData', dataToStore);
    ExtensionStorage.reloadWidget(); // Reload all widgets
    console.log('[widgetData] Widget data updated and reload requested:', dataToStore);
  } catch (error) {
    console.error('[widgetData] Error updating widget data:', error);
  }
}

// Optional: Function to clear widget data (e.g., on sign out)
export function clearWidgetData() {
  try {
    const emptyData = {
      tasks: [],
      habits: [],
      totalTasks: 0,
      activeHabits: 0,
    } as any;
    storage.set('widgetData', emptyData); // Set to an empty state
    ExtensionStorage.reloadWidget();
    console.log('[widgetData] Widget data cleared.');
  } catch (error) {
    console.error('[widgetData] Error clearing widget data:', error);
  }
} 