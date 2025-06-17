import { supabase } from '../supabase';

export interface Habit {
  id: string;
  user_id: string;
  emoji: string;
  start_date: string;
  current_streak: number;
  last_check_date?: string | null;
  created_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  created_at?: string;
}

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  // This will be called from components that have access to useUser hook
  // For now, we'll throw an error if no user is found
  throw new Error('getCurrentUserId must be called from a component with user context');
};

export const habitsService = {
  async getHabits(userId: string): Promise<Habit[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

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
    userId: string
  ): Promise<Habit> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('habits')
      .insert([{
        ...habit,
        user_id: userId,
        current_streak: 0,
        last_check_date: null,
      }])
      .select()
      .single();

    if (error) {
      console.error('[habitsService.createHabit] Supabase insert FAILED. Error:', error, 'Input was:', habit);
      throw error;
    }
    return data;
  },

  async updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>, userId: string): Promise<Habit> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own habits
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      throw error;
    }

    return data;
  },

  async deleteHabit(id: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own habits

    if (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  async logHabitCompletion(habitId: string, log_date: string, userId: string): Promise<HabitLog> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // First verify the habit belongs to the user
    const { data: habit } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (!habit) {
      throw new Error('Habit not found or access denied');
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .insert([{ habit_id: habitId, log_date: log_date }])
      .select()
      .single();

    if (error) {
      console.error('Error logging habit completion:', error);
      throw error;
    }
    
    return data;
  },

  async getHabitLogs(habitId: string, userId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // First verify the habit belongs to the user
    const { data: habit } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (!habit) {
      throw new Error('Habit not found or access denied');
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId);

    if (error) {
      console.error('Error fetching habit logs:', error);
      throw error;
    }

    return data || [];
  },

  async deleteHabitLog(habitId: string, logDate: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // First verify the habit belongs to the user
    const { data: habit } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (!habit) {
      throw new Error('Habit not found or access denied');
    }

    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('log_date', logDate);

    if (error) {
      console.error('Error deleting habit log:', error, { habitId, logDate });
      throw error;
    }
  },

  async updateHabitStreakDetails(id: string, updates: { current_streak: number; last_check_date: string | null }, userId: string): Promise<Habit> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own habits
      .select('id, user_id, emoji, start_date, current_streak, last_check_date, created_at')
      .single();

    if (error) {
      console.error('Error updating habit streak details:', error, { id, updates });
      throw error;
    }
    return data;
  },

  // Optimized habit logging that handles both log/unlog and streak calculation in one call
  async toggleHabitLog(habitId: string, userId: string): Promise<Habit> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const today = new Date().toISOString().split('T')[0];

    // Try the stored procedure first, but catch errors and fallback
    try {
      const { data, error } = await supabase.rpc('toggle_habit_log', {
        habit_id: habitId,
        user_id_param: userId,
        log_date: today
      });

      if (error) {
        console.warn('RPC function not available, using fallback:', error);
        return await this.toggleHabitLogFallback(habitId, userId);
      }

      return data;
    } catch (error) {
      console.warn('RPC function failed, using fallback:', error);
      return await this.toggleHabitLogFallback(habitId, userId);
    }
  },

  // Fallback function for when RPC is not available - still optimized
  async toggleHabitLogFallback(habitId: string, userId: string): Promise<Habit> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const today = new Date().toISOString().split('T')[0];

    // Get habit and check if logged today in a single query
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (habitError || !habit) {
      throw new Error('Habit not found or access denied');
    }

    // Check if already logged today
    const { data: todayLog, error: logError } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('log_date', today)
      .maybeSingle();

    if (logError) {
      console.error('Error checking today\'s log:', logError);
      throw logError;
    }

    const isLoggedToday = !!todayLog;

    if (isLoggedToday) {
      // Unlog: Delete today's log
      await this.deleteHabitLog(habitId, today, userId);
      
      // Get the most recent log after deletion to update streak
      const { data: recentLog } = await supabase
        .from('habit_logs')
        .select('log_date')
        .eq('habit_id', habitId)
        .order('log_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newLastCheckDate = recentLog?.log_date || null;
      let newStreak = 0;
      
      if (newLastCheckDate) {
        // Simple streak calculation for fallback
        const lastDate = new Date(newLastCheckDate);
        const currentDate = new Date();
        const diffTime = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        
        if (diffDays <= 1) {
          // Recent log, calculate streak more accurately
          newStreak = await this.calculateStreakFromDate(habitId, newLastCheckDate, userId);
        } else {
          newStreak = 1; // Old log, reset to 1
        }
      }
      
      return await this.updateHabitStreakDetails(habitId, {
        current_streak: newStreak,
        last_check_date: newLastCheckDate
      }, userId);
    } else {
      // Log: Add new log entry
      await this.logHabitCompletion(habitId, today, userId);
      
      // Calculate new streak
      const newStreak = this.calculateNewStreak(habit.current_streak, habit.last_check_date, today);
      
      return await this.updateHabitStreakDetails(habitId, {
        current_streak: newStreak,
        last_check_date: today
      }, userId);
    }
  },

  // Helper function to calculate streak more efficiently
  calculateNewStreak(currentStreak: number, lastCheckDate: string | null, newLogDate: string): number {
    if (!lastCheckDate) {
      return 1; // First log
    }

    const lastDate = new Date(lastCheckDate);
    const newDate = new Date(newLogDate);
    const diffTime = newDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      return currentStreak + 1; // Consecutive day
    } else if (diffDays === 0) {
      return currentStreak; // Same day (shouldn't happen but handle gracefully)
    } else {
      return 1; // Gap in streak, restart
    }
  },

  // Helper function to calculate streak from a specific date
  async calculateStreakFromDate(habitId: string, fromDate: string, userId: string): Promise<number> {
    // This is a simplified version - in a real implementation, you'd want to
    // fetch logs in descending order and count consecutive days
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('log_date')
      .eq('habit_id', habitId)
      .order('log_date', { ascending: false })
      .limit(100); // Reasonable limit for streak calculation

    if (!logs || logs.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(fromDate);

    for (let i = 1; i < logs.length; i++) {
      const prevDate = new Date(logs[i].log_date);
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  },
}; 