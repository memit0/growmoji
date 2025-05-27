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
    console.log('[habitsService.deleteHabitLog] Supabase delete SUCCEEDED.', { habitId, logDate });
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
    console.log('[habitsService.updateHabitStreakDetails] Supabase update SUCCEEDED.', data);
    return data;
  },
}; 