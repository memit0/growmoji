/**
 * Authentication configuration utilities
 * Handles environment-specific redirect URLs and OAuth configurations
 */

import { isProd } from './env';

/**
 * Get the appropriate redirect URL for OAuth flows
 * In production, always use the production domain to avoid localhost redirects
 */
export function getOAuthRedirectUrl(): string {
  if (isProd) {
    // In production, always use the production domain
    return `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
  }
  
  // In development, use the current origin if available, fallback to relative
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  
  return '/auth/callback';
}

/**
 * Get the appropriate site URL for OAuth provider configuration
 */
export function getSiteUrl(): string {
  if (isProd) {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://www.growmoji.app';
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:3000';
}

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  if (isProd) {
    requiredVars.push('NEXT_PUBLIC_APP_URL');
  }

  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required OAuth environment variables: ${missing.join(', ')}`);
  }

  // Validate production URL format
  if (isProd) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl?.startsWith('https://')) {
      throw new Error('Production app URL must use HTTPS');
    }
  }

  return true;
}

/**
 * Debug OAuth configuration
 */
export function debugOAuthConfig() {
  console.log('[OAuth Config] Environment:', isProd ? 'production' : 'development');
  console.log('[OAuth Config] Redirect URL:', getOAuthRedirectUrl());
  console.log('[OAuth Config] Site URL:', getSiteUrl());
  
  if (isProd) {
    console.log('[OAuth Config] Production App URL:', process.env.NEXT_PUBLIC_APP_URL);
  }
  
  try {
    validateOAuthConfig();
    console.log('[OAuth Config] ✅ Configuration valid');
  } catch (error) {
    console.error('[OAuth Config] ❌ Configuration invalid:', error);
  }
}
