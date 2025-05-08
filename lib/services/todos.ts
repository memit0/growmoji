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

  async createTodo(todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Todo> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const todoToInsert = {
      content: todo.content,
      is_completed: todo.is_completed || false,
    };

    // Supabase Query: Insert a new todo item into the 'todos' table.
    // Data Sent: todoToInsert object (content, is_completed) along with the authenticated user_id.
    // Expected: Returns the newly created todo item from the database.
    const { data, error } = await supabase
      .from('todos') // Specifies the table 'todos'.
      .insert([{ ...todoToInsert, user_id: user.id }]) // Inserts the new todo data, automatically handling created_at/updated_at by Supabase.
      .select() // Selects all columns of the newly inserted row.
      .single(); // Expects a single row to be returned.

    if (error) {
      console.error('Error creating todo:', error);
      throw error;
    }

    return data;
  },

  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Todo> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const updatesForDb: Partial<Todo> = { ...updates };
    if (typeof updates.is_completed === 'boolean' && updates.completed_at === undefined) {
      updatesForDb.completed_at = updates.is_completed ? new Date().toISOString() : null;
    }

    // Supabase Query: Update an existing todo item in the 'todos' table.
    // Data Sent: updatesForDb object, which contains the fields to be updated for the todo.
    // Filters: Matches a todo with the given 'id' and the authenticated 'user_id'.
    // Expected: Returns the updated todo item.
    const { data, error } = await supabase
      .from('todos') // Specifies the table 'todos'.
      .update(updatesForDb) // Applies the updates to the matched todo.
      .eq('id', id) // Filters for the specific todo by its ID.
      .eq('user_id', user.id) // Ensures the todo belongs to the authenticated user.
      .select() // Selects all columns of the updated row.
      .single(); // Expects a single row to be affected and returned.

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

    // Supabase Query: Delete a todo item from the 'todos' table.
    // Filters: Matches a todo with the given 'id' and the authenticated 'user_id'.
    // Expected: No data is returned on successful deletion, only checks for an error.
    const { error } = await supabase
      .from('todos') // Specifies the table 'todos'.
      .delete() // Deletes the matched todo.
      .eq('id', id) // Filters for the specific todo by its ID.
      .eq('user_id', user.id); // Ensures the todo belongs to the authenticated user.

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
    // This function internally calls updateTodo, which contains the Supabase update query.
    // Refer to updateTodo for Supabase interaction details.
    return this.updateTodo(id, updates as Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>);
  }
}; 