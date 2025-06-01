'use client';

import { useAuth } from '@/hooks/useAuth';
import type { Habit, HabitLog } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export function useHabits() {
  const { isSignedIn } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/habits');

      if (!response.ok) {
        throw new Error(`Failed to fetch habits: ${response.statusText}`);
      }

      const data = await response.json();
      setHabits(data);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const createHabit = useCallback(async (habitData: { emoji: string; start_date: string }) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create habit: ${response.statusText}`);
      }

      const newHabit = await response.json();
      setHabits(prev => [newHabit, ...prev]);
      return newHabit;
    } catch (err) {
      console.error('Error creating habit:', err);
      throw err;
    }
  }, []);

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete habit: ${response.statusText}`);
      }

      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  }, []);

  const toggleHabit = useCallback(async (habitId: string) => {
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
          logs.sort((a: HabitLog, b: HabitLog) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
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
      await fetchHabits();
    } catch (err) {
      console.error('Error toggling habit:', err);
      throw err;
    }
  }, [habits, fetchHabits]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    refetch: fetchHabits,
    createHabit,
    deleteHabit,
    toggleHabit
  };
} 