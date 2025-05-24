'use client';

import type { Todo } from '@/lib/supabase';
import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

export function useTodos() {
  const { isSignedIn } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/todos');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const createTodo = useCallback(async (todoData: { content: string; is_completed?: boolean }) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...todoData, is_completed: false })
      });

      if (!response.ok) {
        throw new Error(`Failed to create todo: ${response.statusText}`);
      }

      const newTodo = await response.json();
      setTodos(prev => [newTodo, ...prev]);
      return newTodo;
    } catch (err) {
      console.error('Error creating todo:', err);
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (todoId: string, updates: Partial<Pick<Todo, 'content' | 'is_completed'>>) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.statusText}`);
      }

      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => todo.id === todoId ? updatedTodo : todo));
      return updatedTodo;
    } catch (err) {
      console.error('Error updating todo:', err);
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.statusText}`);
      }

      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (err) {
      console.error('Error deleting todo:', err);
      throw err;
    }
  }, []);

  const toggleTodo = useCallback(async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    return updateTodo(todoId, { is_completed: !todo.is_completed });
  }, [todos, updateTodo]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    refetch: fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  };
} 