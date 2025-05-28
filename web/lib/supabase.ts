import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid Supabase URL format');
}

// Create Supabase client for client-side operations
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'habittracker-web'
    }
  }
});

// Create Supabase client for server-side operations with Clerk auth
export async function createSupabaseServerClient() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Use service role key if available to bypass RLS, otherwise use anon key
  const apiKey = supabaseServiceRoleKey || supabaseAnonKey;
  
  const client = createClient(supabaseUrl, apiKey, {
    global: {
      headers: {
        'X-Client-Info': 'habittracker-web-server',
        'X-User-ID': userId
      }
    }
  });

  return { client, userId };
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { error } = await supabaseClient
      .from('habits')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Default export for backward compatibility
export const supabase = supabaseClient;

// Database types (matching mobile app schema)
export interface Habit {
  id: string;
  user_id: string;
  emoji: string;
  start_date: string;
  current_streak: number;
  last_check_date: string | null;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  content: string;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface TimerSettings {
  id: string;
  user_id: string;
  work_duration: number;
  break_duration: number;
  created_at: string;
  updated_at: string;
} 