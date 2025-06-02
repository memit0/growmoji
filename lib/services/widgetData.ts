import { ExtensionStorage } from '@bacons/apple-targets';
import { Habit } from './habits';
import { Todo } from './todos';

// Use the correct App Group ID
const APP_GROUP_ID = 'group.com.mebattll.habittracker.widget';
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
  appTheme?: 'light' | 'dark';
  isPremium?: 0 | 1; // 0 for false, 1 for true
  // We can also store aggregated counts as numbers
  totalTasks?: number;
  completedTasksToday?: number;
  activeHabits?: number;
}

export function updateWidgetData(todos: Todo[], habits: Habit[], currentTheme: 'light' | 'dark', isPremium: boolean = false) {
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
      totalTasks: widgetTasks.length,
      activeHabits: widgetHabits.length,
    } as any; 

    storage.set('widgetData', dataToStore);

    ExtensionStorage.reloadWidget(); 

  } catch (error) {
    // Consider more robust error handling/reporting here for production
  }
}

// Optional: Function to clear widget data (e.g., on sign out)
export function clearWidgetData() {
  try {
    const emptyData = {
      tasks: [],
      habits: [],
      appTheme: undefined,
      isPremium: 0,
      totalTasks: 0,
      activeHabits: 0,
    } as any;
    storage.set('widgetData', emptyData); 

    ExtensionStorage.reloadWidget();

  } catch (error) {
    // Consider more robust error handling/reporting here for production
  }
} 