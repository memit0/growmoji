import { supabase } from '../supabase';

export interface TimerSession {
  id: string;
  timer_type: 'work' | 'break' | 'long_break';
  duration_minutes: number;
  started_at: string;
  completed_at?: string;
  todo_id?: string;
  created_at?: string;
}

export const timerService = {
  async getTimerSessions(limit: number = 10): Promise<TimerSession[]> {
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching timer sessions:', error);
      throw error;
    }

    return data || [];
  },

  async startTimerSession(session: Omit<TimerSession, 'id' | 'created_at' | 'completed_at'>): Promise<TimerSession> {
    const { data, error } = await supabase
      .from('timer_sessions')
      .insert([session])
      .select()
      .single();

    if (error) {
      console.error('Error starting timer session:', error);
      throw error;
    }

    return data;
  },

  async completeTimerSession(id: string): Promise<TimerSession> {
    const { data, error } = await supabase
      .from('timer_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error completing timer session:', error);
      throw error;
    }

    return data;
  },

  async getTimerSessionsByDateRange(startDate: string, endDate: string): Promise<TimerSession[]> {
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching timer sessions by date range:', error);
      throw error;
    }

    return data || [];
  },

  async getTimerSessionsByTodo(todoId: string): Promise<TimerSession[]> {
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('todo_id', todoId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching timer sessions by todo:', error);
      throw error;
    }

    return data || [];
  },

  async deleteTimerSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('timer_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting timer session:', error);
      throw error;
    }
  },
}; 