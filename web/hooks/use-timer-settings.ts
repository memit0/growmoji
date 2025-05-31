'use client';

import type { TimerSettings } from '@/lib/supabase';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export function useTimerSettings() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<TimerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/timer-settings');

      if (!response.ok) {
        throw new Error(`Failed to fetch timer settings: ${response.statusText}`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching timer settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch timer settings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateSettings = useCallback(async (settingsData: { work_duration: number; break_duration: number }) => {
    try {
      const response = await fetch('/api/timer-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update timer settings: ${response.statusText}`);
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      console.error('Error updating timer settings:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings
  };
} 