'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AuthFlowBoundaryState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

interface AuthFlowBoundaryProps {
  children: React.ReactNode;
}

export class AuthFlowBoundary extends React.Component<
  AuthFlowBoundaryProps,
  AuthFlowBoundaryState
> {
  private maxRetries = 2;

  constructor(props: AuthFlowBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthFlowBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthFlowBoundary caught an error:', error, errorInfo);
    
    // Check if this is a subscription/paywall related error
    const isSubscriptionError = error.message?.includes('RevenueCat') || 
                               error.message?.includes('subscription') ||
                               error.message?.includes('paywall') ||
                               error.stack?.includes('useSubscription');
    
    if (isSubscriptionError) {
      console.warn('Subscription system error detected during auth flow');
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({ 
        hasError: false, 
        error: undefined,
        retryCount: prevState.retryCount + 1 
      }));
    } else {
      // Max retries reached, force a page reload
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private clearCacheAndReload = () => {
    try {
      // Clear any cached data that might be causing issues
      localStorage.removeItem('rc_anonymous_user_id');
      localStorage.removeItem('clerk-db-jwt');
      sessionStorage.clear();
      
      // Force reload
      window.location.reload();
    } catch (err) {
      console.error('Error clearing cache:', err);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Authentication Flow Error
              </h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              There was an issue during the sign-in process. This can happen due to network issues or browser extensions.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <h3 className="font-medium text-blue-800 mb-2">Quick Solutions:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li>Try refreshing the page</li>
                <li>Check your internet connection</li>
                <li>Disable browser extensions temporarily</li>
                <li>Try in incognito/private mode</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              {canRetry ? (
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              ) : (
                <Button
                  onClick={this.handleReload}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              )}
              
              <Button
                onClick={this.clearCacheAndReload}
                className="w-full"
                variant="outline"
              >
                Clear Cache & Reload
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details (Dev Mode)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                  </div>
                  <div className="mb-2">
                    <strong>Retry Count:</strong> {this.state.retryCount}
                  </div>
                  {this.state.error?.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
