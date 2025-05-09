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
  async getTodos(): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }

    return data || [];
  },

  async createTodo(todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...todo }])
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      throw error;
    }

    return data;
  },

  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Todo> {
    const updatesForDb: Partial<Todo> = { ...updates };
    if (typeof updates.is_completed === 'boolean' && updates.completed_at === undefined) {
      updatesForDb.completed_at = updates.is_completed ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updatesForDb)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
      throw error;
    }

    return data;
  },

  async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  async toggleTodoComplete(id: string, is_completed: boolean): Promise<Todo> {
    const updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {
      is_completed,
      completed_at: is_completed ? new Date().toISOString() : null,
    };
    return this.updateTodo(id, updates as Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>);
  }
}; 