'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, hasSession: !!session, userId: session?.user?.id });
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, redirecting to dashboard');
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Welcome back to Growmoji</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to continue building your habits with emojis
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg border-0 p-6">
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0f172a',
                  brandAccent: '#1e293b',
                }
              }
            }
          }}
          providers={['google', 'apple']}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
          showLinks={true}
        />
      </div>
    </>
  );
} 