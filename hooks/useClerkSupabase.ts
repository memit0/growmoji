import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { supabase, syncClerkWithSupabase } from '../lib/supabase';

export const useClerkSupabase = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncAuthentication = async () => {
      if (!isLoaded) {
        return;
      }

      try {
        if (isSignedIn && user) {
          // Get Clerk token safely
          const token = await getToken();
          
          if (token) {
            // Sync Clerk authentication with Supabase
            const result = await syncClerkWithSupabase(token, user);
            
            if (result.success) {
              setIsSupabaseReady(true);
              setError(null);
            } else {
              setError('Failed to sync authentication');
              setIsSupabaseReady(false);
            }
          } else {
            setError('No authentication token available');
            setIsSupabaseReady(false);
          }
        } else {
          // User is not signed in, clear Supabase session
          await supabase.auth.signOut();
          setIsSupabaseReady(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error syncing Clerk with Supabase:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsSupabaseReady(false);
      }
    };

    syncAuthentication();
  }, [isLoaded, isSignedIn, user, getToken]);

  return {
    isSupabaseReady,
    error,
    supabase,
    user,
    isSignedIn,
    isLoaded,
  };
}; 