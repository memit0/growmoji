import { createSupabaseBrowserClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface AuthState {
    user: User | null;
    userId: string | null;
    isLoaded: boolean;
    isSignedIn: boolean;
}

export function useAuth(): AuthState {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        userId: null,
        isLoaded: false,
        isSignedIn: false,
    });

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setAuthState({
                user: session?.user || null,
                userId: session?.user?.id || null,
                isLoaded: true,
                isSignedIn: !!session?.user,
            });
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setAuthState({
                    user: session?.user || null,
                    userId: session?.user?.id || null,
                    isLoaded: true,
                    isSignedIn: !!session?.user,
                });
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return authState;
}
