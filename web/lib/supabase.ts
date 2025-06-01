import { createBrowserClient, createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
export const supabaseClient = createSupabaseBrowserClient();

// Create Supabase client for client-side operations
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Create Supabase client for server-side operations
export async function createSupabaseServerClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated');
  }

  return { client: supabase, userId: user.id };
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