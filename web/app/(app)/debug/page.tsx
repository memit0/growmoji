'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { debugEntitlements } from '@/lib/subscription';
import { useAuth } from '@clerk/nextjs';
import { AlertCircle, CheckCircle, Crown, Loader2, RefreshCw, Wifi } from 'lucide-react';
import { useState } from 'react';

type ConnectionTestResult = {
  success: boolean;
  data?: unknown; 
  error?: string;
  details?: string;
};

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
    isInitialized,
    restore
  } = useSubscription();
  
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [restoring, setRestoring] = useState(false);

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

  const handleDebugEntitlements = () => {
    debugEntitlements(customerInfo);
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restore();
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setRestoring(false);
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={refreshCustomerInfo} disabled={subscriptionLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Customer Info
            </Button>
            <Button onClick={refreshOfferings} disabled={subscriptionLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Offerings  
            </Button>
            <Button 
              onClick={handleRestore} 
              disabled={restoring || !isInitialized}
              variant="outline"
            >
              {restoring ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              Restore Purchases
            </Button>
            <Button 
              onClick={handleDebugEntitlements} 
              disabled={!customerInfo}
              variant="outline"
            >
              Debug Entitlements
            </Button>
          </div>
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Loading:</strong> {subscriptionLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Premium:</strong> <span className={isPremium ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{isPremium ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <strong>Error:</strong> {subscriptionError || 'None'}
            </div>
            <div>
              <strong>Customer Info:</strong> {customerInfo ? 'Available' : 'None'}
            </div>
            <div>
              <strong>Offerings:</strong> {offerings ? `${offerings.length} available` : 'None'}
            </div>
          </div>

          {customerInfo && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Customer Info Summary:</h4>
              <div className="text-sm space-y-1">
                <p><strong>User ID:</strong> {customerInfo.originalAppUserId}</p>
                <p><strong>Active Entitlements:</strong> {Object.keys(customerInfo.entitlements.active).length > 0 ? Object.keys(customerInfo.entitlements.active).join(', ') : 'None'}</p>
                <p><strong>All Entitlements:</strong> {Object.keys(customerInfo.entitlements.all).length > 0 ? Object.keys(customerInfo.entitlements.all).join(', ') : 'None'}</p>
              </div>
              
              {Object.keys(customerInfo.entitlements.active).length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Active Entitlement Details:</h5>
                  <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(customerInfo.entitlements.active, null, 2)}
                  </pre>
                </div>
              )}
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
            {process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY && (
              <p className="text-xs text-muted-foreground">
                API Key Preview: {process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY.substring(0, 10)}...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Troubleshooting Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">If subscription info is not displaying:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Check if RevenueCat Web API Key is set correctly</li>
                <li>Verify the API key is the correct one (Public API Key for web)</li>
                <li>Check browser console for any RevenueCat errors</li>
                <li>Try clicking "Refresh Customer Info" button</li>
                <li>Verify your RevenueCat dashboard has web billing configured</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">If premium user is seeing paywall:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Check if the entitlement names match what's in RevenueCat dashboard</li>
                <li>Verify the user ID matches between web and mobile apps</li>
                <li>Try clicking "Restore Purchases" button</li>
                <li>Check if the subscription is actually active in RevenueCat dashboard</li>
                <li>Verify entitlement configuration in RevenueCat</li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <p className="font-medium text-yellow-800">Pro Tip:</p>
              <p className="text-yellow-700">Open your browser's developer console (F12) to see detailed RevenueCat logs and errors.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 