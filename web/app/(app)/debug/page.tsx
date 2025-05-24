'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits, useTimerSettings, useTodos } from "@/hooks";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, CheckCircle, Loader2, Wifi } from "lucide-react";
import { useState } from "react";

export default function DebugPage() {
  const { isSignedIn, userId } = useAuth();
  const { habits, loading: habitsLoading, error: habitsError, createHabit } = useHabits();
  const { todos, loading: todosLoading, error: todosError, createTodo } = useTodos();
  const { settings, loading: settingsLoading, error: settingsError, updateSettings } = useTimerSettings();
  
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setConnectionTest(data);
    } catch (error) {
      setConnectionTest({
        success: false,
        error: 'Failed to test connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const testCreateHabit = async () => {
    try {
      await createHabit({
        emoji: '🧪',
        start_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Test create habit failed:', error);
    }
  };

  const testCreateTodo = async () => {
    try {
      await createTodo({
        content: 'Test todo from debug page'
      });
    } catch (error) {
      console.error('Test create todo failed:', error);
    }
  };

  const testUpdateTimerSettings = async () => {
    try {
      await updateSettings({
        work_duration: 25,
        break_duration: 5
      });
    } catch (error) {
      console.error('Test update timer settings failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backend Connection Debug</h1>
        <p className="text-muted-foreground mt-1">
          Test the connection between frontend and Supabase backend
        </p>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={testingConnection}>
            {testingConnection ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          
          {connectionTest && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(connectionTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSignedIn ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Signed In: {isSignedIn ? 'Yes' : 'No'}</p>
          {userId && <p>User ID: {userId}</p>}
        </CardContent>
      </Card>

      {/* Habits Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {habitsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : habitsError ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Habits Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Loading: {habitsLoading ? 'Yes' : 'No'}</p>
            <p>Error: {habitsError || 'None'}</p>
            <p>Habits Count: {habits.length}</p>
          </div>
          <Button onClick={testCreateHabit} disabled={habitsLoading}>
            Test Create Habit
          </Button>
          {habits.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Recent Habits:</p>
              <ul className="text-sm text-muted-foreground">
                {habits.slice(0, 3).map(habit => (
                  <li key={habit.id}>{habit.emoji} - Streak: {habit.current_streak}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todos Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {todosLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : todosError ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Todos Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Loading: {todosLoading ? 'Yes' : 'No'}</p>
            <p>Error: {todosError || 'None'}</p>
            <p>Todos Count: {todos.length}</p>
          </div>
          <Button onClick={testCreateTodo} disabled={todosLoading}>
            Test Create Todo
          </Button>
          {todos.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Recent Todos:</p>
              <ul className="text-sm text-muted-foreground">
                {todos.slice(0, 3).map(todo => (
                  <li key={todo.id}>{todo.content} - {todo.is_completed ? 'Done' : 'Pending'}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timer Settings Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {settingsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : settingsError ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Timer Settings Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Loading: {settingsLoading ? 'Yes' : 'No'}</p>
            <p>Error: {settingsError || 'None'}</p>
            <p>Settings: {settings ? 'Found' : 'None'}</p>
            {settings && (
              <div className="text-sm text-muted-foreground">
                <p>Work Duration: {settings.work_duration} minutes</p>
                <p>Break Duration: {settings.break_duration} minutes</p>
              </div>
            )}
          </div>
          <Button onClick={testUpdateTimerSettings} disabled={settingsLoading}>
            Test Update Timer Settings
          </Button>
        </CardContent>
      </Card>

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Clerk Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 