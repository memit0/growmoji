'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { Offering } from '@revenuecat/purchases-js';
import { Crown, Loader2, Sparkles, Star, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  title?: string;
  subtitle?: string;
}

const features = [
  {
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    title: 'Unlimited Habits',
    description: 'Track as many habits as you want without any limits'
  },
  {
    icon: <Star className="h-5 w-5 text-purple-500" />,
    title: 'Advanced Analytics',
    description: 'Get detailed insights into your progress and streaks'
  },
  {
    icon: <Sparkles className="h-5 w-5 text-blue-500" />,
    title: 'Premium Features',
    description: 'Unlock exclusive themes and customization options'
  },
  {
    icon: <Crown className="h-5 w-5 text-amber-500" />,
    title: 'Priority Support',
    description: 'Get help when you need it with premium support'
  }
];

// Helper function to convert period codes to readable text
const formatPeriod = (period: string | undefined, packageIdentifier?: string): string => {
  // First, try to determine from package identifier (more reliable)
  if (packageIdentifier) {
    const identifier = packageIdentifier.toLowerCase();
    if (identifier.includes('annual') || identifier.includes('yearly') || identifier.includes('year')) {
      return 'yearly';
    }
    if (identifier.includes('monthly') || identifier.includes('month')) {
      return 'monthly';
    }
  }

  // Fallback to period code if package identifier doesn't help
  if (!period) return 'period';

  switch (period.toUpperCase()) {
    case 'P1M':
      return 'monthly';
    case 'P1Y':
    case 'P12M':
      return 'yearly';
    case 'P1W':
      return 'weekly';
    case 'P1D':
      return 'daily';
    default:
      // Final fallback for any other period format
      if (period.toLowerCase().includes('month') || period.toLowerCase().includes('m')) {
        return 'monthly';
      }
      if (period.toLowerCase().includes('year') || period.toLowerCase().includes('annual')) {
        return 'yearly';
      }
      if (period.toLowerCase().includes('week')) {
        return 'weekly';
      }
      return period.toLowerCase();
  }
};

export function PaywallModal({
  isOpen,
  onClose,
  showCloseButton = false, // Hard unskipable by default
  title = "Unlock Premium Features",
  subtitle = "Get unlimited habits and exclusive features"
}: PaywallModalProps) {
  const { offerings, purchase, isLoading, error } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Offering['availablePackages'][number] | null>(null);

  // Auto-select the first package when offerings are loaded
  useEffect(() => {
    if (offerings && offerings.length > 0 && offerings[0].availablePackages.length > 0) {
      setSelectedPackage(offerings[0].availablePackages[0]);
    }
  }, [offerings]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);
      const success = await purchase(selectedPackage);

      if (success) {
        // Close modal on successful purchase
        onClose();
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      // Error is handled by the hook
    } finally {
      setPurchasing(false);
    }
  };

  const handleClose = () => {
    if (showCloseButton && !purchasing) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={showCloseButton ? handleClose : undefined}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </DialogTitle>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={purchasing}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50">
                {feature.icon}
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription Plans */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading subscription options...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          ) : offerings && offerings.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Choose Your Plan</h3>
              <div className="grid gap-3">
                {offerings[0].availablePackages.map((pkg, index) => {
                  const isPopular = pkg.identifier.toLowerCase().includes('annual') ||
                    pkg.identifier.toLowerCase().includes('yearly');
                  const isSelected = selectedPackage?.identifier === pkg.identifier;

                  return (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all duration-200 ${isSelected
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                        }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {pkg.webBillingProduct?.title || pkg.identifier}
                          </CardTitle>
                          {isPopular && (
                            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold">
                            {pkg.webBillingProduct?.currentPrice?.formattedPrice || 'Price unavailable'}
                          </span>
                          <span className="text-muted-foreground">
                            /{formatPeriod(pkg.webBillingProduct?.normalPeriodDuration || undefined, pkg.identifier)}
                          </span>
                        </div>
                        {pkg.webBillingProduct?.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {pkg.webBillingProduct.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subscription plans available.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try again later or contact support.
              </p>
            </div>
          )}

          {/* Purchase Button */}
          <div className="space-y-4 pt-4 border-t">
            <Button
              onClick={handlePurchase}
              disabled={!selectedPackage || purchasing || isLoading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {purchasing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 