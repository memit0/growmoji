import { supabase } from '../supabase';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export const todosService = {
  async getTodos(): Promise<Todo[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }

    return data || [];
  },

  async createTodo(todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...todo, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      throw error;
    }

    return data;
  },

  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'user_id'>>): Promise<Todo> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
      throw error;
    }

    return data;
  },

  async deleteTodo(id: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  async toggleTodoComplete(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed });
  }
}; 