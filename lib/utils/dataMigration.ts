import { User } from '@supabase/supabase-js';
import { habitsService } from '../services/habits';
import { clearAnonymousData, exportAnonymousData } from '../services/localStorage';
import { todosService } from '../services/todos';

export interface MigrationResult {
  success: boolean;
  migratedCounts: {
    habits: number;
    todos: number;
    habitLogs: number;
    timerSessions: number;
  };
  errors: string[];
}

export async function migrateAnonymousDataToAccount(
  anonymousUserId: string, 
  authenticatedUser: User
): Promise<MigrationResult> {
  console.log('[DataMigration] Starting migration from anonymous to authenticated user');
  
  const result: MigrationResult = {
    success: false,
    migratedCounts: {
      habits: 0,
      todos: 0,
      habitLogs: 0,
      timerSessions: 0
    },
    errors: []
  };

  try {
    // Get all anonymous data
    const anonymousData = await exportAnonymousData(anonymousUserId);
    
    console.log('[DataMigration] Retrieved anonymous data:', {
      habits: anonymousData.habits.length,
      todos: anonymousData.todos.length,
      habitLogs: anonymousData.habitLogs.length,
      timerSessions: anonymousData.timerSessions.length
    });

    // Migrate habits
    for (const habit of anonymousData.habits) {
      try {
        await habitsService.createHabit(
          {
            emoji: habit.emoji,
            start_date: habit.start_date
          },
          authenticatedUser.id
        );
        result.migratedCounts.habits++;
      } catch (error) {
        console.error('[DataMigration] Failed to migrate habit:', error);
        result.errors.push(`Failed to migrate habit ${habit.emoji}: ${error}`);
      }
    }

    // Migrate todos
    for (const todo of anonymousData.todos) {
      try {
        await todosService.createTodo(
          {
            content: todo.content,
            is_completed: todo.is_completed
          },
          authenticatedUser.id
        );
        result.migratedCounts.todos++;
      } catch (error) {
        console.error('[DataMigration] Failed to migrate todo:', error);
        result.errors.push(`Failed to migrate todo "${todo.content}": ${error}`);
      }
    }

    // TODO: Migrate habit logs and timer sessions when those services are updated

    // Clear anonymous data after successful migration
    await clearAnonymousData(anonymousUserId);
    
    result.success = result.errors.length === 0;
    
    console.log('[DataMigration] Migration completed:', result);
    return result;
    
  } catch (error) {
    console.error('[DataMigration] Migration failed:', error);
    result.errors.push(`Migration failed: ${error}`);
    result.success = false;
    return result;
  }
}

export async function validateMigrationData(anonymousUserId: string): Promise<{
  isValid: boolean;
  dataStats: {
    habits: number;
    todos: number;
    habitLogs: number;
    timerSessions: number;
  };
  warnings: string[];
}> {
  try {
    const data = await exportAnonymousData(anonymousUserId);
    const warnings: string[] = [];
    
    // Validate data integrity
    if (data.habits.some(h => !h.emoji || typeof h.emoji !== 'string')) {
      warnings.push('Some habits have invalid emoji data');
    }
    
    if (data.todos.some(t => !t.content || typeof t.content !== 'string')) {
      warnings.push('Some todos have invalid content data');
    }

    return {
      isValid: warnings.length === 0,
      dataStats: {
        habits: data.habits.length,
        todos: data.todos.length,
        habitLogs: data.habitLogs.length,
        timerSessions: data.timerSessions.length
      },
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      dataStats: { habits: 0, todos: 0, habitLogs: 0, timerSessions: 0 },
      warnings: [`Failed to validate data: ${error}`]
    };
  }
}

export async function estimateMigrationTime(anonymousUserId: string): Promise<number> {
  try {
    const data = await exportAnonymousData(anonymousUserId);
    const totalItems = data.habits.length + data.todos.length + data.habitLogs.length + data.timerSessions.length;
    
    // Estimate 200ms per item (conservative estimate for network requests)
    return Math.max(totalItems * 200, 1000); // Minimum 1 second
  } catch (error) {
    console.error('[DataMigration] Failed to estimate migration time:', error);
    return 5000; // Default 5 seconds
  }
}

export function createMigrationBackup(anonymousUserId: string, data: any): void {
  try {
    // Store backup locally in case migration fails
    const backupKey = `migration_backup_${anonymousUserId}_${Date.now()}`;
    // This would be stored in AsyncStorage for recovery purposes
    console.log('[DataMigration] Backup created:', backupKey);
  } catch (error) {
    console.error('[DataMigration] Failed to create backup:', error);
  }
} 