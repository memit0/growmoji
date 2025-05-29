'use client';

import { PaywallModal } from '@/components/ui/PaywallModal';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PremiumGuardProps {
  children: React.ReactNode;
}

export function PremiumGuard({ children }: PremiumGuardProps) {
  const { isPremium, isLoading, error, isInitialized } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasCheckedPremium, setHasCheckedPremium] = useState(false);

  // Show paywall for non-premium users after loading, with proper timing
  useEffect(() => {
    if (isInitialized && !isLoading) {
      setHasCheckedPremium(true);
      
      // Add a small delay to prevent visual glitching
      const timer = setTimeout(() => {
        if (!isPremium) {
          setShowPaywall(true);
        } else {
          setShowPaywall(false);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isPremium, isInitialized]);

  // Show loading state while initializing or checking premium status
  if (isLoading || !hasCheckedPremium) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">
            {!isInitialized ? 'Initializing...' : 'Checking subscription status...'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This will only take a moment
          </p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and user is not premium
  if (error && !isPremium) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">
            Unable to verify your subscription status. Please check your connection and try again.
          </p>
          <p className="text-sm text-muted-foreground">
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  // Show children if user is premium
  if (isPremium && hasCheckedPremium) {
    return <>{children}</>;
  }

  // If not loading, not premium, and has checked status, show paywall content
  // Don't render the background content until we're ready to show the modal
  return (
    <>
      {!showPaywall && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-muted-foreground">
              Preparing paywall...
            </p>
          </div>
        </div>
      )}

      {showPaywall && (
        <>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="text-6xl mb-6">🚀</div>
              <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Premium Required
              </h1>
              <p className="text-muted-foreground mb-6">
                The web version of Growmoji is exclusively available to premium subscribers. 
                Upgrade now to access all features on web and mobile.
              </p>
            </div>
          </div>

          <PaywallModal
            isOpen={true}
            onClose={() => {
              // Refresh the subscription status after potential purchase
              window.location.reload();
            }}
            showCloseButton={false} // Unskippable
            title="Upgrade to Premium"
            subtitle="Access the web version and unlock unlimited features"
          />
        </>
      )}
    </>
  );
} 