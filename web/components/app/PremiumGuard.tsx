'use client';

import { PaywallModal } from '@/components/ui/PaywallModal';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PremiumGuardProps {
  children: React.ReactNode;
  /**
   * Whether to show content immediately based on cached data
   * Set to false for critical premium-only features that should never show for free users
   */
  allowCachedContent?: boolean;
  /**
   * Fallback content to show while loading (instead of blocking the entire UI)
   */
  loadingFallback?: React.ReactNode;
}

export function PremiumGuard({ 
  children, 
  allowCachedContent = true,
  loadingFallback 
}: PremiumGuardProps) {
  const { isPremium, isLoading, error, isInitialized } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    // Show paywall if user is not premium and subscription check is complete
    if (isInitialized && !isPremium) {
      setShowPaywall(true);
    } else {
      setShowPaywall(false);
    }
  }, [isPremium, isInitialized]);

  // For critical premium features, still block if not initialized and no cached content allowed
  if (!allowCachedContent && isLoading && !isInitialized) {
    return loadingFallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and user is definitely not premium
  if (error && isInitialized && !isPremium) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
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

  // Show paywall if user is confirmed not premium
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

  // Show content - either user is premium or we're allowing cached content
  return <>{children}</>;
} 