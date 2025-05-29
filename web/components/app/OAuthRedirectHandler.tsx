'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OAuthRedirectHandlerProps {
  children: React.ReactNode;
}

export function OAuthRedirectHandler({ children }: OAuthRedirectHandlerProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(false);

  useEffect(() => {
    // Check if we're handling an OAuth callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('code') || 
                            urlParams.has('state') || 
                            urlParams.has('oauth_callback') ||
                            window.location.hash.includes('access_token');
      
      if (hasOAuthParams && !isLoaded) {
        console.log('[OAuthRedirectHandler] OAuth callback detected, waiting for Clerk to load');
        setIsHandlingRedirect(true);
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    // Once Clerk is loaded and we have a user, clear the redirect handling state
    if (isLoaded && userId && isHandlingRedirect) {
      console.log('[OAuthRedirectHandler] OAuth callback completed, user authenticated');
      setIsHandlingRedirect(false);
      
      // Small delay to ensure subscription hook has time to initialize
      setTimeout(() => {
        console.log('[OAuthRedirectHandler] Proceeding to main app');
      }, 100);
    }
  }, [isLoaded, userId, isHandlingRedirect]);

  // Show loading state while handling OAuth redirect
  if (isHandlingRedirect && !isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Completing sign-in...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
