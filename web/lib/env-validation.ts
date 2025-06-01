/**
 * Environment Variable Validation for Production
 * Ensures all required Supabase and other service keys are properly configured
 */

import { APP_URL, getRevenueCatApiKey, isProd, validateEnvVars } from './env';

export function validateProductionEnvironment() {
  // Use the new validation function
  validateEnvVars();

  const requiredEnvVars: Record<string, string | undefined> = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  // Add production-specific required variables
  if (isProd) {
    requiredEnvVars['NEXT_PUBLIC_APP_URL'] = process.env.NEXT_PUBLIC_APP_URL;
    requiredEnvVars['NEXT_PUBLIC_REVENUECAT_WEB_API_KEY'] = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
  }

  const missingVars: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Test RevenueCat API key configuration
  try {
    const apiKey = getRevenueCatApiKey();
    console.log(`✅ RevenueCat API key configured (${isProd ? 'production' : 'sandbox'})`);
  } catch (error) {
    throw new Error(`RevenueCat configuration error: ${error}`);
  }

  // Production-specific validations
  if (isProd) {
    console.log('🚀 Production environment detected');
    console.log(`🌐 App URL: ${APP_URL}`);

    // Validate production URL format
    if (!APP_URL.startsWith('https://')) {
      throw new Error('Production app URL must use HTTPS');
    }
  } else {
    console.log('🛠️ Development environment detected');
  }

  console.log('✅ Environment validation passed');
  console.log(`🏠 Environment: ${process.env.NODE_ENV || 'development'}`);

  return {
    isValid: true,
    environment: process.env.NODE_ENV || 'development',
    appUrl: APP_URL,
  };
}

// Environment validation for production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Server-side validation
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  console.log('✅ All required environment variables are present and valid');
}

// Client-side browser extension detection for auth compatibility
if (typeof window !== 'undefined') {
  // Detect problematic browser extensions that might interfere with authentication
  const detectProblematicExtensions = () => {
    const indicators = [
      // Ad blockers
      () => window.navigator.plugins && Array.from(window.navigator.plugins).some(p =>
        p.name.toLowerCase().includes('adblock') ||
        p.name.toLowerCase().includes('ublock')
      ),
      // Privacy extensions
      () => document.querySelector('script[src*="ghostery"]') !== null,
      () => '_gaq' in window && typeof (window as Record<string, unknown>)._gaq === 'undefined', // AdBlock detection
      // Developer extensions that might interfere
      () => '__REACT_DEVTOOLS_GLOBAL_HOOK__' in window,
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  };

  // Monitor for auth-specific errors and provide user guidance
  const setupAuthErrorMonitoring = () => {
    let authErrorCount = 0;
    const maxErrors = 3;

    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');

      if (message.includes('supabase') || message.includes('auth') || message.includes('CORS')) {
        authErrorCount++;

        if (authErrorCount >= maxErrors && process.env.NODE_ENV === 'production') {
          // Show user-friendly notification
          const hasExtensions = detectProblematicExtensions();

          if (hasExtensions) {
            // Create a non-intrusive notification
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #fee2e2;
              border: 1px solid #fecaca;
              color: #991b1b;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 14px;
              z-index: 10000;
              max-width: 300px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            `;
            notification.innerHTML = `
              <div style="font-weight: 600; margin-bottom: 4px;">Browser Extension Detected</div>
              <div>Some browser extensions may interfere with authentication. Try incognito mode if you experience issues.</div>
              <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: #991b1b;
                cursor: pointer;
                margin-top: 8px;
                text-decoration: underline;
                font-size: 12px;
              ">Dismiss</button>
            `;

            document.body.appendChild(notification);

            // Auto-remove after 10 seconds
            setTimeout(() => {
              if (notification.parentElement) {
                notification.remove();
              }
            }, 10000);
          }
        }

        // Don't call the original console.error for auth errors in production
        if (process.env.NODE_ENV !== 'production') {
          originalConsoleError(...args);
        }
        return;
      }

      // Call original for non-auth errors
      originalConsoleError(...args);
    };
  };

  // Initialize monitoring after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAuthErrorMonitoring);
  } else {
    setupAuthErrorMonitoring();
  }
}

