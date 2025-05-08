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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .select('id, user_id, emoji, start_date, current_streak, last_check_date, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }

    return data || [];
  },

  async createHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'current_streak' | 'last_check_date'>): Promise<Habit> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const habitToInsert = {
      ...habit,
      user_id: user.id,
    };

    // Supabase Query: Insert a new habit into the 'habits' table.
    // Data Sent: habitToInsert object (emoji, start_date, etc.) along with the authenticated user_id.
    // Expected: Returns the newly created habit item from the database.
    console.log(`[habitsService.createHabit] Attempting to insert:`, habitToInsert);
    const { data, error } = await supabase
      .from('habits') // Specifies the table 'habits'.
      .insert([habitToInsert]) // Inserts the new habit data.
      .select('id, user_id, emoji, start_date, current_streak, last_check_date, created_at') // Selects specified columns of the new row.
      .single(); // Expects a single row to be returned.

    if (error) {
      console.error('[habitsService.createHabit] Supabase insert FAILED. Error:', error, 'Input was:', habitToInsert);
      throw error;
    }
    console.log('[habitsService.createHabit] Supabase insert SUCCEEDED. Response:', data);
    return data;
  },

  async updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at' | 'current_streak' | 'last_check_date'>>): Promise<Habit> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Supabase Query: Update an existing habit in the 'habits' table.
    // Data Sent: updates object, which contains the fields to be updated for the habit.
    // Filters: Matches a habit with the given 'id' and the authenticated 'user_id'.
    // Expected: Returns the updated habit item.
    const { data, error } = await supabase
      .from('habits') // Specifies the table 'habits'.
      .update(updates) // Applies the updates to the matched habit.
      .eq('id', id) // Filters for the specific habit by its ID.
      .eq('user_id', user.id) // Ensures the habit belongs to the authenticated user.
      .select('id, user_id, emoji, start_date, current_streak, last_check_date, created_at') // Selects specified columns.
      .single(); // Expects a single row to be affected and returned.

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

    // Supabase Query: Delete a habit from the 'habits' table.
    // Filters: Matches a habit with the given 'id' and the authenticated 'user_id'.
    // Expected: No data is returned on successful deletion, only checks for an error.
    const { error } = await supabase
      .from('habits') // Specifies the table 'habits'.
      .delete() // Deletes the matched habit.
      .eq('id', id) // Filters for the specific habit by its ID.
      .eq('user_id', user.id); // Ensures the habit belongs to the authenticated user.

    if (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  async logHabitCompletion(habitId: string, log_date: string): Promise<HabitLog> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Supabase Query: Insert a new log entry into the 'habit_logs' table.
    // Data Sent: Object containing habit_id and log_date.
    // Expected: Returns the newly created habit log entry.
    const { data: log, error: logError } = await supabase
      .from('habit_logs') // Specifies the table 'habit_logs'.
      .insert([{
        habit_id: habitId, // The ID of the habit being logged.
        log_date: log_date, // The date for which the habit is being logged.
      }])
      .select('id, habit_id, log_date, created_at') // Selects specified columns of the new log entry.
      .single(); // Expects a single row to be returned.

    if (logError) {
      console.error('Error logging habit completion:', logError);
      throw logError;
    }
    
    return log;
  },

  async getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('habit_logs')
      .select('id, habit_id, log_date, created_at')
      .eq('habit_id', habitId);

    if (startDate) {
      query = query.gte('log_date', startDate);
    }
    if (endDate) {
      query = query.lte('log_date', endDate);
    }
    
    query = query.order('log_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching habit logs:', error);
      throw error;
    }

    return data || [];
  },

  async deleteHabitLog(habitId: string, logDate: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Ensure last_check_date is either a valid date string or null
    const validUpdates = {
      ...updates,
      last_check_date: updates.last_check_date ? updates.last_check_date : null,
    };

    const { data, error } = await supabase
      .from('habits')
      .update(validUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, user_id, emoji, start_date, current_streak, last_check_date, created_at')
      .single();

    if (error) {
      console.error('Error updating habit streak details:', error, { id, updates: validUpdates });
      throw error;
    }
    console.log('[habitsService.updateHabitStreakDetails] Supabase update SUCCEEDED.', data);
    return data;
  },
}; 