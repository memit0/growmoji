/**
 * Production environment utilities for Clerk deployment
 */

export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://growmoji.app';

export const CLERK_CONFIG = {
  // Use production keys in production, development keys in development
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,
  
  // Production-specific configurations
  authorizedParties: isProd ? [APP_URL] : undefined,
  
  // Webhook configurations (update with your actual webhook URLs)
  webhookUrl: isProd 
    ? `${APP_URL}/api/webhooks/clerk`
    : 'http://localhost:3000/api/webhooks/clerk',
};

// Validate required environment variables
export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all Clerk keys are set.'
    );
  }
  
  // Validate key formats
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  const secretKey = process.env.CLERK_SECRET_KEY!;
  
  if (isProd) {
    if (!pubKey.startsWith('pk_live_')) {
      throw new Error('Production environment requires a live publishable key (pk_live_...)');
    }
    if (!secretKey.startsWith('sk_live_')) {
      throw new Error('Production environment requires a live secret key (sk_live_...)');
    }
  } else {
    if (!pubKey.startsWith('pk_test_')) {
      console.warn('Development environment should use test publishable key (pk_test_...)');
    }
    if (!secretKey.startsWith('sk_test_')) {
      console.warn('Development environment should use test secret key (sk_test_...)');
    }
  }
}

// DNS and domain configuration helpers
export const DOMAIN_CONFIG = {
  // Your custom domain for Clerk (set in Clerk Dashboard -> Domains)
  clerkDomain: isProd ? 'clerk.growmoji.app' : undefined,
  
  // Primary domain
  primaryDomain: isProd ? 'growmoji.app' : 'localhost:3000',
  
  // Allowed origins for CORS
  allowedOrigins: isProd 
    ? [APP_URL, 'https://clerk.growmoji.app']
    : ['http://localhost:3000'],
}; 