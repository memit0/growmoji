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

// Create Supabase client for direct authentication
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    debug: true, // Enable auth debugging
  },
});

// Enhanced auth state debugging
supabase.auth.onAuthStateChange((event, session) => {
  debugLog('Supabase Auth', `State Change - ${event}`, {
    event,
    hasSession: !!session,
    userId: session?.user?.id,
    provider: session?.user?.app_metadata?.provider,
    email: session?.user?.email,
    timestamp: new Date().toISOString()
  });
});

// Add query debug listener
supabase.channel('custom-all-channel')
  .on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
    debugLog('Supabase Query', 'Database Change', payload);
  })
  .subscribe();

console.log('DEBUG: Supabase client initialized:', supabase ? 'Yes' : 'No');
debugLog('Supabase Client', 'Initialization Complete', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false
}); 