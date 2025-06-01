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

  useEffect(() => {
    // Show paywall if user is not premium and not loading
    if (!isLoading && !isPremium) {
      setShowPaywall(true);
    } else {
      setShowPaywall(false);
    }
  }, [isPremium, isLoading]);

  // Show loading spinner while checking subscription status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and user is not premium
  if (error && !isPremium) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="text-destructive text-sm">
            Failed to check subscription status: {error}
          </div>
          <p className="text-sm text-muted-foreground">
            Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  // Show paywall if user is not premium
  if (showPaywall) {
    return (
      <PaywallModal
        isOpen={true}
        onClose={() => { }} // Cannot close - hard paywall
        showCloseButton={false}
        title="Unlock Premium Features"
        subtitle="Get unlimited habits and exclusive features"
      />
    );
  }

  // User is premium, show the app
  return <>{children}</>;
} 