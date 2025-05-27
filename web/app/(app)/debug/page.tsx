'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@clerk/nextjs';
import { AlertCircle, CheckCircle, Crown, Loader2, Wifi } from 'lucide-react';
import { useState } from 'react';

export default function DebugPage() {
  const { isSignedIn, userId } = useAuth();
  const { 
    isPremium, 
    isLoading: subscriptionLoading, 
    customerInfo, 
    offerings, 
    error: subscriptionError,
    refreshCustomerInfo,
    refreshOfferings,
    isInitialized
  } = useSubscription();
  
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setConnectionTest(data);
    } catch (error) {
      setConnectionTest({ 
        success: false, 
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Console</h1>
        <p className="text-muted-foreground mt-1">
          Test connections and debug subscription status
        </p>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={testingConnection}>
            {testingConnection ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          
          {connectionTest && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(connectionTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSignedIn ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Signed In: {isSignedIn ? 'Yes' : 'No'}</p>
          {userId && <p>User ID: {userId}</p>}
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {subscriptionLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : subscriptionError ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : isPremium ? (
              <Crown className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-gray-500" />
            )}
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Loading: {subscriptionLoading ? 'Yes' : 'No'}</p>
            <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
            <p>Premium: {isPremium ? 'Yes' : 'No'}</p>
            <p>Error: {subscriptionError || 'None'}</p>
            <p>Customer Info: {customerInfo ? 'Available' : 'None'}</p>
            <p>Offerings: {offerings ? `${offerings.length} available` : 'None'}</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={refreshCustomerInfo} disabled={subscriptionLoading}>
              Refresh Customer Info
            </Button>
            <Button onClick={refreshOfferings} disabled={subscriptionLoading}>
              Refresh Offerings
            </Button>
          </div>

          {customerInfo && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Customer Info:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify({
                  activeEntitlements: Object.keys(customerInfo.entitlements.active),
                  allEntitlements: Object.keys(customerInfo.entitlements.all),
                  originalAppUserId: customerInfo.originalAppUserId
                }, null, 2)}
              </pre>
            </div>
          )}

          {offerings && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Offerings:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(offerings.map(offering => ({
                  identifier: offering.identifier,
                  description: offering.serverDescription,
                  packagesCount: offering.availablePackages.length,
                  packages: offering.availablePackages.map(pkg => ({
                    identifier: pkg.identifier,
                    productTitle: pkg.webBillingProduct?.title
                  }))
                })), null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Clerk Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>RevenueCat Web API Key: {process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 