'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HabitYearGraph } from "@/components/ui/HabitYearGraph";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { Habit, Todo } from "@/lib/supabase";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
    Calendar,
    CheckCircle,
    Flame,
    Plus,
    Target,
    TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LogEntry = {
  log_date: string;
  // Add other properties if logs have them, e.g., id: string;
};

export default function DashboardPage() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);
  const [newHabitEmoji, setNewHabitEmoji] = useState('');

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push('/auth/sign-in');
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push('/auth/sign-in');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (!isCreateHabitModalOpen) {
      setNewHabitEmoji('');
    }
  }, [isCreateHabitModalOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [habitsResponse, todosResponse] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/todos')
      ]);

      if (habitsResponse.ok && todosResponse.ok) {
        const [habitsData, todosData] = await Promise.all([
          habitsResponse.json(),
          todosResponse.json()
        ]);
        setHabits(habitsData);
        setTodos(todosData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHabitToggle = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const isLoggedToday = habit.last_check_date?.startsWith(todayStr);

      if (isLoggedToday) {
        // Unlog the habit
        await fetch(`/api/habits/${habitId}/logs?log_date=${todayStr}`, {
          method: 'DELETE'
        });

        // Get remaining logs to recalculate streak
        const logsResponse = await fetch(`/api/habits/${habitId}/logs`);
        const logs = await logsResponse.json();

        let newStreak = 0;
        let newLastCheckDate: string | null = null;

        if (logs.length > 0) {
          logs.sort((a: LogEntry, b: LogEntry) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
          newLastCheckDate = logs[logs.length - 1].log_date;
          newStreak = 1;

          for (let i = logs.length - 2; i >= 0; i--) {
            const currentDate = new Date(logs[i + 1].log_date);
            const previousDate = new Date(logs[i].log_date);
            const diffTime = currentDate.getTime() - previousDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            if (diffDays === 1) {
              newStreak++;
            } else {
              break;
            }
          }
        }

        // Update habit streak details
        await fetch(`/api/habits/${habitId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_streak: newStreak,
            last_check_date: newLastCheckDate
          })
        });
      } else {
        // Log the habit
        await fetch(`/api/habits/${habitId}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ log_date: todayStr })
        });
      }

      // Refresh habits
      const habitsResponse = await fetch('/api/habits');
      if (habitsResponse.ok) {
        const updatedHabits = await habitsResponse.json();
        setHabits(updatedHabits);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleCreateHabit = async () => {
    if (!newHabitEmoji.trim()) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji: newHabitEmoji.trim(),
          start_date: today
        })
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits(prev => [newHabit, ...prev]);
        setNewHabitEmoji('');
        setIsCreateHabitModalOpen(false);
        // Refresh data to ensure consistency
        fetchData();
      }
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedToday = habits.filter(h => {
    const today = new Date().toISOString().split('T')[0];
    return h.last_check_date?.startsWith(today);
  }).length;

  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const completedTodos = todos.filter(t => t.is_completed).length;
  const pendingTodos = todos.length - completedTodos;

  // Calculate current streak (highest streak among habits)
  const currentStreak = habits.reduce((max, habit) => Math.max(max, habit.current_streak), 0);

  // Calculate week completion rate
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekCompletion = 85; // This would need more complex calculation based on logs

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Good morning! 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Let&apos;s make today count. You have {totalHabits - completedToday} habits and {pendingTodos} tasks left to complete.
          </p>
        </div>
        <Dialog open={isCreateHabitModalOpen} onOpenChange={setIsCreateHabitModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Choose an Emoji for Your Habit</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2 p-4 border rounded-lg">
                  {['💧', '🏃', '📚', '🧘', '🍎', '💤', '🚴', '🎯', '🎸', '🧠', '🥗', '☕', '🌅', '🧹', '📝', '💪', '🚶', '🎨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewHabitEmoji(emoji)}
                      className={`text-xl sm:text-2xl p-2 rounded-lg border hover:bg-accent transition-colors touch-manipulation ${newHabitEmoji === emoji ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {newHabitEmoji && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-muted-foreground">Selected: </span>
                    <span className="text-2xl">{newHabitEmoji}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCreateHabit} className="flex-1" disabled={!newHabitEmoji.trim()}>
                  Create Habit
                </Button>
                <Button variant="outline" onClick={() => setIsCreateHabitModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}/{totalHabits}</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completionRate}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHabits}</div>
            <p className="text-xs text-muted-foreground">
              active habits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Habit Year Graphs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Habit Progress Overview</h2>
          <p className="text-sm text-muted-foreground">
            {habits.length} active habit{habits.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {habits.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">No habits to display</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first habit to see your progress visualization
                </p>
                <Button onClick={() => setIsCreateHabitModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Habit
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {habits.map((habit) => (
              <HabitYearGraph key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      {/* Today's Habits - Quick Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quick Toggle - Today&apos;s Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {habits.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No habits yet. Create your first habit to get started!
              </div>
            ) : (
              habits.map((habit) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isCompletedToday = habit.last_check_date?.startsWith(todayStr);

                return (
                  <div key={habit.id} className="flex flex-col items-center gap-2">
                    <Button
                      variant={isCompletedToday ? "default" : "outline"}
                      size="icon"
                      className="h-12 w-12 rounded-xl"
                      onClick={() => handleHabitToggle(habit.id)}
                    >
                      <span className="text-lg">{habit.emoji}</span>
                    </Button>
                    <div className="text-center">
                      <div className="text-xs font-medium">
                        🔥 {habit.current_streak}
                      </div>
                      {isCompletedToday && (
                        <div className="text-xs text-green-600">✅ Done</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setIsCreateHabitModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Habit
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/stats')}
            >
              <TrendingUp className="h-4 w-4" />
              View Statistics
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/todos')}
            >
              <Plus className="h-4 w-4" />
              Add New Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Total Tasks</span>
                <span className="font-medium">{todos.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Completed</span>
                <span className="font-medium text-green-600">{completedTodos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <span className="font-medium text-orange-600">{pendingTodos}</span>
              </div>
              {todos.length > 0 && (
                <div className="pt-2">
                  <Progress value={(completedTodos / todos.length) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((completedTodos / todos.length) * 100)}% tasks completed
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 