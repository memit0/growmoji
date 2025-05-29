'use client';

import { PaywallModal } from '@/components/ui/PaywallModal';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PremiumGuardProps {
  children: React.ReactNode;
}

export function PremiumGuard({ children }: PremiumGuardProps) {
  const { isPremium, isLoading, error } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  // Show paywall for non-premium users after loading
  useEffect(() => {
    if (!isLoading && !isPremium) {
      setShowPaywall(true);
    } else if (!isLoading && isPremium) {
      setShowPaywall(false);
    }
  }, [isLoading, isPremium]);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Checking subscription status...</p>
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
  if (isPremium) {
    return <>{children}</>;
  }

  // If not loading, not premium, and no error, then prepare to show paywall content.
  // The PaywallModal will be conditionally rendered based on showPaywall state.
  return (
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

      {/* Conditionally render PaywallModal only when showPaywall is true */}
      {showPaywall && (
        <PaywallModal
          isOpen={true} // isOpen is now controlled by the existence of the modal itself
          onClose={() => {}} // No close action - hard paywall
          showCloseButton={false} // Unskippable
          title="Upgrade to Premium"
          subtitle="Access the web version and unlock unlimited features"
        />
      )}
    </>
  );
} 