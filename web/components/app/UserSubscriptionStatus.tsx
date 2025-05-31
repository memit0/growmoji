'use client';

import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, User } from 'lucide-react';

export function UserSubscriptionStatus() {
  const { isPremium, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-1 w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge
          variant={isPremium ? "default" : "secondary"}
          className={`text-xs px-2 py-0.5 ${isPremium
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-gray-100 text-gray-600'
            }`}
        >
          {isPremium ? 'Premium' : 'Free'}
        </Badge>
        {isPremium ? (
          <Crown className="h-3 w-3 text-amber-500" />
        ) : (
          <User className="h-3 w-3 text-gray-400" />
        )}
        <span className="text-xs text-muted-foreground">Web Access</span>
      </div>
    </div>
  );
} 