import type { TimerSettings } from '../supabase';
import { createSupabaseServerClient } from '../supabase';

export const timerService = {
  async getTimerSettings(): Promise<TimerSettings | null> {
    const { client: supabase, userId } = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('timer_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return null
        return null;
      }
      console.error('Error fetching timer settings:', error);
      throw error;
    }

    return data;
  },

  async createOrUpdateTimerSettings(settings: Omit<TimerSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TimerSettings> {
    const { client: supabase, userId } = await createSupabaseServerClient();
    
    // Try to update existing settings first
    const { data: existingData } = await supabase
      .from('timer_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingData) {
      // Update existing settings
      const { data, error } = await supabase
        .from('timer_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating timer settings:', error);
        throw error;
      }

      return data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('timer_settings')
        .insert([{
          ...settings,
          user_id: userId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating timer settings:', error);
        throw error;
      }

      return data;
    }
  },
}; 