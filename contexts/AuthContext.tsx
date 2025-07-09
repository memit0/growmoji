import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    clearAnonymousUserId,
    generateAnonymousUserId,
    getAnonymousUserId,
    setAnonymousUserId
} from '../lib/services/localStorage';
import { supabase } from '../lib/supabase';
import { migrateAnonymousDataToAccount } from '../lib/utils/dataMigration';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // Anonymous user support
  isAnonymous: boolean;
  anonymousUserId: string | null;
  enableAnonymousMode: () => Promise<string>;
  convertToRealAccount: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  
  // Anonymous user state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousUserId, setAnonymousUserIdState] = useState<string | null>(null);

  // Initialize anonymous user if exists
  useEffect(() => {
    const initializeAnonymousUser = async () => {
      try {
        const existingAnonymousId = await getAnonymousUserId();
        if (existingAnonymousId) {
          setAnonymousUserIdState(existingAnonymousId);
          setIsAnonymous(true);
          console.log('[AuthContext] Found existing anonymous user:', existingAnonymousId);
        }
      } catch (error) {
        console.error('[AuthContext] Failed to check for anonymous user:', error);
      }
    };

    initializeAnonymousUser();
  }, []);

  // Generate persistent anonymous ID
  const enableAnonymousMode = async (): Promise<string> => {
    try {
      let anonId = await getAnonymousUserId();
      if (!anonId) {
        anonId = generateAnonymousUserId();
        await setAnonymousUserId(anonId);
      }
      setAnonymousUserIdState(anonId);
      setIsAnonymous(true);
      console.log('[AuthContext] Anonymous mode enabled:', anonId);
      return anonId;
    } catch (error) {
      console.error('[AuthContext] Failed to enable anonymous mode:', error);
      throw error;
    }
  };

  // Convert anonymous data to real account
  const convertToRealAccount = async (authenticatedUser: User): Promise<void> => {
    if (!isAnonymous || !anonymousUserId) {
      console.log('[AuthContext] No anonymous data to convert');
      return;
    }
    
    try {
      console.log('[AuthContext] Converting anonymous data to real account');
      
      // Migrate local data to Supabase
      const migrationResult = await migrateAnonymousDataToAccount(anonymousUserId, authenticatedUser);
      
      if (!migrationResult.success) {
        throw new Error(`Migration failed: ${migrationResult.errors.join(', ')}`);
      }
      
      // Clear anonymous state
      await clearAnonymousUserId();
      setIsAnonymous(false);
      setAnonymousUserIdState(null);
      setUser(authenticatedUser);
      
      console.log('[AuthContext] Anonymous data conversion completed:', migrationResult.migratedCounts);
    } catch (error) {
      console.error('[AuthContext] Failed to convert anonymous data:', error);
      throw error;
    }
  };

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
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signOut,
      isAnonymous,
      anonymousUserId,
      enableAnonymousMode,
      convertToRealAccount
    }}>
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