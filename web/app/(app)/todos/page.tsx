'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import type { Todo } from "@/lib/supabase";
import {
  CheckCircle,
  CheckSquare,
  Clock,
  Plus,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

export default function TodosPage() {
  const { isSignedIn } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTodoContent, setNewTodoContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    if (isSignedIn) {
      fetchTodos();
    }
  }, [isSignedIn]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodoContent.trim()) return;

    // Check if user has reached the 3-todo limit
    if (todos.length >= 3) {
      return; // Don't create if at limit
    }

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newTodoContent.trim(),
          is_completed: false
        })
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos(prev => [newTodo, ...prev]);
        setNewTodoContent('');
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTodos(prev => prev.filter(t => t.id !== todoId));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_completed: !todo.is_completed
        })
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prev => prev.map(t => t.id === todoId ? updatedTodo : t));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.is_completed;
    if (filter === 'completed') return todo.is_completed;
    return true;
  });

  const completedCount = todos.filter(t => t.is_completed).length;
  const pendingCount = todos.length - completedCount;
  const isAtLimit = todos.length >= 3;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8" />
            My Tasks
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Organize and track your tasks. {completedCount} completed, {pendingCount} pending. {todos.length}/3 tasks
            {isAtLimit && <span className="text-red-500 font-medium"> • Limit reached</span>}
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto" disabled={isAtLimit}>
              <Plus className="h-4 w-4" />
              {isAtLimit ? 'Limit Reached' : 'Add Task'}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Task Description</Label>
                <Input
                  id="content"
                  placeholder="What do you need to do?"
                  value={newTodoContent}
                  onChange={(e) => setNewTodoContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTodo()}
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCreateTodo} className="flex-1" disabled={isAtLimit}>
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          All ({todos.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Completed ({completedCount})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todos.length}/3</div>
            <p className="text-xs text-muted-foreground">
              Tasks (limit: 3)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Tasks to complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      {filteredTodos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'all' ? 'No tasks yet' :
                filter === 'pending' ? 'No pending tasks' :
                  'No completed tasks'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' ? 'Create your first task to get started! (Limit: 3 tasks)' :
                filter === 'pending' ? 'All tasks are completed! Great job!' :
                  'Complete some tasks to see them here.'}
            </p>
            {filter === 'all' && !isAtLimit && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <Card key={todo.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <Checkbox
                    checked={todo.is_completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                    className="shrink-0 mt-1 sm:mt-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${todo.is_completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                      {todo.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant={todo.is_completed ? 'default' : 'secondary'} className="text-xs">
                        {todo.is_completed ? 'Completed' : 'Pending'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(todo.created_at).toLocaleDateString()}
                      </span>
                      {todo.completed_at && (
                        <span className="text-xs text-muted-foreground">
                          • Completed {new Date(todo.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-destructive hover:text-destructive shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 