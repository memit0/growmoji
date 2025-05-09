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

export const habitsService = {
  async getHabits(): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }

    return data || [];
  },

  async createHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'current_streak' | 'last_check_date'>): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert([{
        ...habit,
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

  async updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      throw error;
    }

    return data;
  },

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  async logHabitCompletion(habitId: string, log_date: string): Promise<HabitLog> {
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

  async getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
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

  async deleteHabitLog(habitId: string, logDate: string): Promise<void> {
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

  async updateHabitStreakDetails(id: string, updates: { current_streak: number; last_check_date: string | null }): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
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