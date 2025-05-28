import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { debugLog } from './utils/debug';

// Remember to add your Supabase URL and Anon Key to your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables
debugLog('Supabase Config', 'Environment Check', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl?.substring(0, 20),
  anonKeyPrefix: supabaseAnonKey?.substring(0, 10)
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client without Clerk integration for now
// This prevents the session access error during initialization
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to create authenticated Supabase client with Clerk token
export const createAuthenticatedSupabaseClient = async (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};

// Function to sync Clerk authentication with Supabase
export const syncClerkWithSupabase = async (clerkToken: string, clerkUser: any) => {
  try {
    // Create a custom session for Supabase using Clerk token
    const { data, error } = await supabase.auth.setSession({
      access_token: clerkToken,
      refresh_token: clerkToken, // In this case, we'll use the same token
    });

    if (error) {
      console.error('Error syncing Clerk with Supabase:', error);
      return { success: false, error };
    }

    debugLog('Supabase Sync', 'Clerk session synced', {
      hasSession: !!data.session,
      userId: data.session?.user?.id
    });

    return { success: true, session: data.session };
  } catch (error) {
    console.error('Error in syncClerkWithSupabase:', error);
    return { success: false, error };
  }
};

// Add query debug listener
supabase.channel('custom-all-channel')
  .on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
    debugLog('Supabase Query', 'Database Change', payload);
  })
  .subscribe();

console.log('DEBUG: Supabase client initialized:', supabase ? 'Yes' : 'No'); 