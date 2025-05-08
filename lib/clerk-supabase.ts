import { useAuth } from '@clerk/clerk-expo';
import { supabase } from './supabase';

export function useSupabaseAuth() {
  const { getToken } = useAuth();

  // Sets up the Supabase auth header using the Clerk JWT
  async function setupSupabaseAuth() {
    try {
      console.log('DEBUG: Starting Supabase auth setup with Clerk...');
      const token = await getToken({ template: 'supabase' });
      
      console.log('DEBUG: Clerk token status:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPrefix: token?.substring(0, 10) + '...'
      });
      
      if (token) {
        console.log('DEBUG: Setting Supabase session with Clerk token');
        const { data, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });

        if (error) {
          console.error('DEBUG: Error setting Supabase session:', {
            error: error.message,
            status: error.status,
            name: error.name
          });
          return null;
        }

        console.log('DEBUG: Supabase session set successfully:', {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
          expiresAt: data.session?.expires_at
        });
        
        return token;
      } else {
        console.error('DEBUG: Failed to get token from Clerk - token is null or undefined');
        return null;
      }
    } catch (error) {
      console.error('DEBUG: Error in setupSupabaseAuth:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }

  return {
    setupSupabaseAuth,
    supabase,
  };
} 