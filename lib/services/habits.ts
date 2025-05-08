import { supabase } from '../supabase';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  emoji?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  frequency_config?: {
    days?: number[];
    interval?: number;
    repeat_every?: number;
  };
  start_date: string;
  current_streak: number;
  longest_streak: number;
  created_at?: string;
  updated_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  date: string;
  notes?: string;
}

export const habitsService = {
  async getHabits(): Promise<Habit[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }

    return data || [];
  },

  async createHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_streak' | 'longest_streak'>): Promise<Habit> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .insert([{ 
        ...habit, 
        user_id: user.id,
        current_streak: 0, 
        longest_streak: 0 
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      throw error;
    }

    return data;
  },

  async updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'user_id'>>): Promise<Habit> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      throw error;
    }

    return data;
  },

  async deleteHabit(id: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  async logHabitCompletion(habitId: string, date: string, notes?: string): Promise<HabitLog> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // First get the current habit data
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single();

    if (habitError) {
      console.error('Error fetching habit:', habitError);
      throw habitError;
    }

    // Create the log entry
    const { data: log, error: logError } = await supabase
      .from('habit_logs')
      .insert([{
        habit_id: habitId,
        user_id: user.id,
        date,
        notes,
      }])
      .select()
      .single();

    if (logError) {
      console.error('Error logging habit completion:', logError);
      throw logError;
    }

    // Update streak
    const { data: habitLogs, error: logsError } = await supabase
      .from('habit_logs')
      .select('date')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (logsError) {
      console.error('Error fetching habit logs:', logsError);
      throw logsError;
    }

    // Calculate current streak
    let currentStreak = 1;
    const today = new Date(date);
    for (let i = 1; i < habitLogs.length; i++) {
      const prevDate = new Date(habitLogs[i].date);
      const diffDays = Math.floor((today.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Update habit with new streak
    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({
        current_streak: currentStreak,
        longest_streak: Math.max(currentStreak, habit.longest_streak),
      })
      .eq('id', habitId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating habit streak:', updateError);
      throw updateError;
    }

    return log;
  },

  async getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching habit logs:', error);
      throw error;
    }

    return data || [];
  },
}; 