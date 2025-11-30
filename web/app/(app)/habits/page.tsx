'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import type { Habit } from "@/lib/supabase";
import {
  CheckCircle,
  Flame,
  Plus,
  Target,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

type LogEntry = {
  log_date: string;
  // Add other properties if logs have them, e.g., id: string;
};

export default function HabitsPage() {
  const { isSignedIn } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHabitEmoji, setNewHabitEmoji] = useState('');

  useEffect(() => {
    if (isSignedIn) {
      fetchHabits();
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      setNewHabitEmoji('');
    }
  }, [isCreateModalOpen]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/habits');
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
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
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setHabits(prev => prev.filter(h => h.id !== habitId));
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
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
            } else if (diffDays === 2) {
              // allow one-day gap without breaking streak chain
              continue;
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
      fetchHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.last_check_date?.startsWith(todayStr)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 sm:h-8 sm:w-8" />
            My Habits
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your daily habits with simple emojis. {completedToday}/{habits.length} completed today.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Choose an Emoji for Your Habit</Label>
                <div className="grid grid-cols-6 gap-2 mt-2 p-4 border rounded-lg">
                  {['💧', '🏃', '📚', '🧘', '🍎', '💤', '🚴', '🎯', '🎸', '🧠', '🥗', '☕', '🌅', '🧹', '📝', '💪', '🚶', '🎨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewHabitEmoji(emoji)}
                      className={`text-2xl p-2 rounded-lg border hover:bg-accent transition-colors ${newHabitEmoji === emoji ? 'bg-primary text-primary-foreground' : 'bg-background'
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
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building better habits with simple emoji representations!
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {habits.map((habit) => {
            const isCompletedToday = habit.last_check_date?.startsWith(todayStr);

            return (
              <Card key={habit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-2xl sm:text-3xl mb-1">
                          {habit.emoji}
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Started {new Date(habit.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-destructive hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Flame className="h-3 w-3" />
                      {habit.current_streak} day streak
                    </Badge>
                    {isCompletedToday && (
                      <Badge variant="default" className="gap-1 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Done today
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => handleHabitToggle(habit.id)}
                    variant={isCompletedToday ? "default" : "outline"}
                    className="w-full gap-2 h-10 sm:h-11"
                  >
                    {isCompletedToday ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm sm:text-base">Completed Today</span>
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        <span className="text-sm sm:text-base">Mark as Done</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 