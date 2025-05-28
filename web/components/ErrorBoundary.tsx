'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Check if this is a Clerk-related error
    const isClerkError = error.message?.includes('clerk') || 
                        error.message?.includes('Clerk') ||
                        error.message?.includes('createUnhandledError') ||
                        error.stack?.includes('clerk.browser.js');
    
    if (isClerkError) {
      console.warn('Clerk authentication error detected. This is often caused by browser extensions.');
    }
    
    this.setState({ errorInfo });
  }

  private isClerkError(): boolean {
    const error = this.state.error;
    if (!error) return false;
    
    return error.message?.includes('clerk') || 
           error.message?.includes('Clerk') ||
           error.message?.includes('createUnhandledError') ||
           error.stack?.includes('clerk.browser.js') ||
           false;
  }

  private clearCacheAndReload = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Force reload
      window.location.reload();
    } catch (err) {
      console.error('Error clearing cache:', err);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isClerk = this.isClerkError();
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              {isClerk ? 'Authentication Error' : 'Application Error'}
            </h2>
            
            {isClerk ? (
              <>
                <p className="text-gray-600 mb-4">
                  There was an issue with the authentication system. This is commonly caused by browser extensions.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">Quick Solutions:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    <li>Try in incognito/private mode</li>
                    <li>Temporarily disable browser extensions</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Refresh the page</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-600 mb-4">
                Something went wrong. Please try refreshing the page.
              </p>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.clearCacheAndReload}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Clear Cache & Reload
              </button>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details (Dev Mode)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                    </div>
                    {this.state.error?.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 