import { supabase } from '../supabase';
import {
    getAnonymousData,
    saveAnonymousData
} from './localStorage';

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
  async getTodos(userId: string, useLocalStorage = false): Promise<Todo[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[todosService.getTodos] Using local storage for user:', userId);
      return getAnonymousData('todos', userId);
    }

    // Existing Supabase logic for authenticated users
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

  async createTodo(
    todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>, 
    userId: string,
    useLocalStorage = false
  ): Promise<Todo> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const newTodo: Todo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      ...todo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: todo.is_completed ? new Date().toISOString() : null,
    };

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[todosService.createTodo] Using local storage for user:', userId);
      const existingTodos = await getAnonymousData('todos', userId) as Todo[];
      const updatedTodos = [newTodo, ...existingTodos];
      await saveAnonymousData('todos', userId, updatedTodos);
      return newTodo;
    }

    // Existing Supabase logic for authenticated users
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

  async updateTodo(
    id: string, 
    updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>, 
    userId: string,
    useLocalStorage = false
  ): Promise<Todo> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[todosService.updateTodo] Using local storage for user:', userId);
      const todos = await getAnonymousData('todos', userId) as Todo[];
      const todoIndex = todos.findIndex(t => t.id === id);
      
      if (todoIndex === -1) {
        throw new Error('Todo not found');
      }

      const updatesForTodo: Partial<Todo> = { 
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      if (typeof updates.is_completed === 'boolean' && updates.completed_at === undefined) {
        updatesForTodo.completed_at = updates.is_completed ? new Date().toISOString() : null;
      }

      const updatedTodo = { ...todos[todoIndex], ...updatesForTodo };
      todos[todoIndex] = updatedTodo;
      await saveAnonymousData('todos', userId, todos);
      return updatedTodo;
    }

    // Existing Supabase logic for authenticated users
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

  async deleteTodo(id: string, userId: string, useLocalStorage = false): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use local storage for anonymous users
    if (useLocalStorage || userId.startsWith('anon_')) {
      console.log('[todosService.deleteTodo] Using local storage for user:', userId);
      const todos = await getAnonymousData('todos', userId) as Todo[];
      const filteredTodos = todos.filter(t => t.id !== id);
      await saveAnonymousData('todos', userId, filteredTodos);
      return;
    }

    // Existing Supabase logic for authenticated users
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

  async toggleTodoComplete(
    id: string, 
    is_completed: boolean, 
    userId: string,
    useLocalStorage = false
  ): Promise<Todo> {
    const updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {
      is_completed,
      completed_at: is_completed ? new Date().toISOString() : null,
    };
    return this.updateTodo(id, updates as Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>, userId, useLocalStorage);
  }
}; 