import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      console.log('[AuthContext] Getting initial session...');
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error.message);
        }
        
        console.log('[AuthContext] Initial session check complete:', {
          hasSession: !!session,
          userId: session?.user?.id
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setInitialCheckComplete(true);
      } catch (error) {
        console.error('[AuthContext] Error in initial session check:', error);
        setSession(null);
        setUser(null);
        setInitialCheckComplete(true);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state change:', _event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Only set loading to false if initial check is complete
      if (initialCheckComplete) {
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialCheckComplete]);

  const signOut = async () => {
    console.log('[AuthContext] Signing out...');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
      }
    } catch (error) {
      console.error('[AuthContext] Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 