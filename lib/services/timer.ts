import { supabase } from '../supabase';
import {
    getAnonymousData,
    saveAnonymousData
} from './localStorage';

export interface TimerSession {
  id: string;
  user_id: string;
  timer_type: 'work' | 'break' | 'long_break';
  duration_minutes: number;
  started_at: string;
  completed_at?: string;
  todo_id?: string;
  created_at?: string;
}

export const timerService = {
  async getTimerSessions(userId: string, limit: number = 10, useLocalStorage = false): Promise<TimerSession[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[timerService.getTimerSessions] Using local storage for user:', userId);
      const sessions = await getAnonymousData('timer_sessions', userId) as TimerSession[];
      // Sort by created_at descending and limit
      return sessions
        .sort((a, b) => new Date(b.created_at || b.started_at).getTime() - new Date(a.created_at || a.started_at).getTime())
        .slice(0, limit);
    }

    // Existing Supabase logic for authenticated users
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching timer sessions:', error);
      throw error;
    }

    return data || [];
  },

  async startTimerSession(
    session: Omit<TimerSession, 'id' | 'user_id' | 'created_at' | 'completed_at'>, 
    userId: string,
    useLocalStorage = false
  ): Promise<TimerSession> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const newSession: TimerSession = {
      id: `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      ...session,
      created_at: new Date().toISOString(),
    };

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[timerService.startTimerSession] Using local storage for user:', userId);
      const existingSessions = await getAnonymousData('timer_sessions', userId) as TimerSession[];
      const updatedSessions = [newSession, ...existingSessions];
      await saveAnonymousData('timer_sessions', userId, updatedSessions);
      return newSession;
    }

    // Existing Supabase logic for authenticated users
    const { data, error } = await supabase
      .from('timer_sessions')
      .insert([{
        ...session,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error starting timer session:', error);
      throw error;
    }

    return data;
  },

  async completeTimerSession(id: string, userId: string, useLocalStorage = false): Promise<TimerSession> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const completedAt = new Date().toISOString();

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[timerService.completeTimerSession] Using local storage for user:', userId);
      const sessions = await getAnonymousData('timer_sessions', userId) as TimerSession[];
      const sessionIndex = sessions.findIndex(s => s.id === id);
      
      if (sessionIndex === -1) {
        throw new Error('Timer session not found');
      }

      const updatedSession = { ...sessions[sessionIndex], completed_at: completedAt };
      sessions[sessionIndex] = updatedSession;
      await saveAnonymousData('timer_sessions', userId, sessions);
      return updatedSession;
    }

    // Existing Supabase logic for authenticated users
    const { data, error } = await supabase
      .from('timer_sessions')
      .update({ completed_at: completedAt })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error completing timer session:', error);
      throw error;
    }

    return data;
  },

  async getTimerSessionsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string,
    useLocalStorage = false
  ): Promise<TimerSession[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[timerService.getTimerSessionsByDateRange] Using local storage for user:', userId);
      const sessions = await getAnonymousData('timer_sessions', userId) as TimerSession[];
      return sessions.filter(session => {
        const sessionDate = session.started_at;
        return sessionDate >= startDate && sessionDate <= endDate;
      }).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }

    // Existing Supabase logic for authenticated users
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching timer sessions by date range:', error);
      throw error;
    }

    return data || [];
  },

  async getTimerSessionsByTodo(todoId: string, userId: string, useLocalStorage = false): Promise<TimerSession[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[timerService.getTimerSessionsByTodo] Using local storage for user:', userId);
      const sessions = await getAnonymousData('timer_sessions', userId) as TimerSession[];
      return sessions
        .filter(session => session.todo_id === todoId)
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }

    // Existing Supabase logic for authenticated users
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('todo_id', todoId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching timer sessions by todo:', error);
      throw error;
    }

    return data || [];
  },

  async deleteTimerSession(id: string, userId: string, useLocalStorage = false): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[timerService.deleteTimerSession] Using local storage for user:', userId);
      const sessions = await getAnonymousData('timer_sessions', userId) as TimerSession[];
      const filteredSessions = sessions.filter(s => s.id !== id);
      await saveAnonymousData('timer_sessions', userId, filteredSessions);
      return;
    }

    // Existing Supabase logic for authenticated users
    const { error } = await supabase
      .from('timer_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting timer session:', error);
      throw error;
    }
  },
}; 