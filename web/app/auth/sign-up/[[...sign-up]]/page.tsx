'use client';

import { getOAuthRedirectUrl } from '@/lib/auth-config';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Debug OAuth configuration
    console.log('[Auth] OAuth Configuration:', {
      environment: process.env.NODE_ENV,
      redirectUrl: getOAuthRedirectUrl(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'SSR'
    });

    // Check for error from callback
    const error = searchParams.get('error');
    if (error) {
      setAuthError(decodeURIComponent(error));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, hasSession: !!session, userId: session?.user?.id });
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, redirecting to dashboard');
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, searchParams]);

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Join Growmoji</h1>
        <p className="text-muted-foreground mt-2">
          Start building better habits with emojis today
        </p>
      </div>

      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div>
              <h3 className="text-red-800 font-semibold">Authentication Error</h3>
              <p className="text-red-700 mt-1">{authError}</p>
              {authError.includes('sign up not complete') && (
                <div className="mt-2 text-sm text-red-600">
                  <p>This usually means:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Apple Sign-In configuration issue in Supabase</li>
                    <li>Missing or incorrect Apple Services ID</li>
                    <li>Domain verification not completed</li>
                  </ul>
                  <p className="mt-2">
                    <a
                      href="/debug-apple-auth"
                      className="text-red-800 underline hover:text-red-900"
                    >
                      Use our debug tool to troubleshoot →
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="mt-3 text-red-600 text-sm underline hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg border-0 p-6">
        <Auth
          supabaseClient={supabase}
          view="sign_up"
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
          redirectTo={getOAuthRedirectUrl()}
          showLinks={true}
        />
      </div>
    </>
  );
}