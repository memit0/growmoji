'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PurchaseSuccessOverlayProps {
  show: boolean;
  onComplete: () => void;
}

export function PurchaseSuccessOverlay({ show, onComplete }: PurchaseSuccessOverlayProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Crown className="h-16 w-16 text-amber-500" />
            <CheckCircle className="h-8 w-8 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Premium!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your subscription is now active. You have access to all premium features.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Continue to Dashboard
          </Button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
