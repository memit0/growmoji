import { supabase } from '../supabase';

export interface Todo {
  id: string;
  user_id: string;
  content: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

export const todosService = {
  async getTodos(userId: string): Promise<Todo[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }

    return data || [];
  },

  async createTodo(todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>, userId: string): Promise<Todo> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{ 
        ...todo, 
        user_id: userId 
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      throw error;
    }

    return data;
  },

  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>, userId: string): Promise<Todo> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const updatesForDb: Partial<Todo> = { ...updates };
    if (typeof updates.is_completed === 'boolean' && updates.completed_at === undefined) {
      updatesForDb.completed_at = updates.is_completed ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updatesForDb)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
      throw error;
    }

    return data;
  },

  async deleteTodo(id: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  async toggleTodoComplete(id: string, is_completed: boolean, userId: string): Promise<Todo> {
    const updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {
      is_completed,
      completed_at: is_completed ? new Date().toISOString() : null,
    };
    return this.updateTodo(id, updates as Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>, userId);
  }
}; 