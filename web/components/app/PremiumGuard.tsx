'use client';

import React from 'react';

// Commented out unused imports since RevenueCat integration is disabled
// import { PaywallModal } from '@/components/ui/PaywallModal';
// import { useSubscription } from '@/hooks/useSubscription';
// import { Loader2 } from 'lucide-react';
// import { useEffect, useState } from 'react';

interface PremiumGuardProps {
  children: React.ReactNode;
}

export function PremiumGuard({ children }: PremiumGuardProps) {
  // TEMPORARY: Bypass all premium checks - allow all users access to web version
  // RevenueCat integration disabled for web version

  // Comment out all RevenueCat integration
  // const { isPremium, isLoading, error } = useSubscription();
  // const [showPaywall, setShowPaywall] = useState(false);

  // Always render children without any premium checks
  return <>{children}</>;
} 