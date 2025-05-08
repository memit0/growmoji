import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Remember to add your Supabase URL and Anon Key to your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('DEBUG: EXPO_PUBLIC_SUPABASE_URL is not set or undefined.');
} else {
  console.log('DEBUG: EXPO_PUBLIC_SUPABASE_URL is set:', supabaseUrl.substring(0, 20) + "...");
}
if (!supabaseAnonKey) {
  console.error('DEBUG: EXPO_PUBLIC_SUPABASE_ANON_KEY is not set or undefined.');
} else {
  console.log('DEBUG: EXPO_PUBLIC_SUPABASE_ANON_KEY is set:', supabaseAnonKey.substring(0, 10) + "...");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
console.log('DEBUG: Supabase client initialized:', supabase ? 'Yes' : 'No'); 