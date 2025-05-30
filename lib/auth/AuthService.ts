import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { OAuthDebugger } from '../utils/oauthDebug';

export class AuthService {
    /**
     * Handle OAuth redirects and deep links
     */
    static async handleAuthRedirect(url: string) {
        // Log the deep link received
        OAuthDebugger.logDeepLinkReceived(url);

        console.log('[AuthService] handleAuthRedirect: ===== STARTING REDIRECT HANDLING =====');
        console.log('[AuthService] handleAuthRedirect: Received URL:', url);
        console.log('[AuthService] handleAuthRedirect: Timestamp:', new Date().toISOString());

        try {
            // Parse URL components for debugging
            try {
                const urlObj = new URL(url);
                console.log('[AuthService] handleAuthRedirect: URL components:', {
                    protocol: urlObj.protocol,
                    host: urlObj.host,
                    pathname: urlObj.pathname,
                    search: urlObj.search,
                    hash: urlObj.hash,
                    searchParams: Object.fromEntries(urlObj.searchParams.entries())
                });
            } catch (parseError) {
                console.error('[AuthService] handleAuthRedirect: Error parsing URL:', parseError);
            }

            // Check for Apple-specific URL patterns
            if (url.includes('apple') || url.includes('appleid')) {
                console.log('[AuthService] handleAuthRedirect: Apple Sign-In URL detected');
            }

            // Check for error states in URL
            if (url.includes('error')) {
                console.log('[AuthService] handleAuthRedirect: Error detected in URL');
                const errorCode = url.split('error=')[1]?.split('&')[0];
                const errorDescription = url.split('error_description=')[1]?.split('&')[0];
                console.log('[AuthService] handleAuthRedirect: Error details:', {
                    errorCode: errorCode ? decodeURIComponent(errorCode) : null,
                    errorDescription: errorDescription ? decodeURIComponent(errorDescription) : null
                });
            }

            const { data, error } = await supabase.auth.getSession();
            console.log('[AuthService] handleAuthRedirect: Initial getSession attempt', {
                hasSession: !!data?.session,
                hasUser: !!data?.session?.user,
                userId: data?.session?.user?.id,
                error
            });

            // Look for tokens in URL hash
            const accessToken = url.split('#access_token=')[1]?.split('&')[0];
            const refreshToken = url.split('#refresh_token=')[1]?.split('&')[0];
            const tokenType = url.split('#token_type=')[1]?.split('&')[0];
            const expiresIn = url.split('#expires_in=')[1]?.split('&')[0];

            console.log('[AuthService] handleAuthRedirect: Token analysis:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                tokenType,
                expiresIn,
                accessTokenLength: accessToken?.length,
                refreshTokenLength: refreshToken?.length
            });

            if (accessToken && refreshToken) {
                console.log('[AuthService] handleAuthRedirect: Setting session with extracted tokens');
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                console.log('[AuthService] handleAuthRedirect: setSession result', {
                    hasSession: !!sessionData?.session,
                    hasUser: !!sessionData?.session?.user,
                    userId: sessionData?.session?.user?.id,
                    sessionError
                });

                if (sessionError) {
                    console.error('[AuthService] handleAuthRedirect: Error setting session:', sessionError);
                    return { success: false, error: sessionError };
                }
                if (sessionData.session) {
                    console.log('[AuthService] handleAuthRedirect: ✅ OAuth authentication successful after setSession');
                    return { success: true, session: sessionData.session };
                }
            } else if (url.includes('error_description=')) {
                const errorDescription = decodeURIComponent(url.split('error_description=')[1]?.split('&')[0]);
                console.error('[AuthService] handleAuthRedirect: ❌ Error in URL:', errorDescription);
                return { success: false, error: new Error(errorDescription) };
            } else {
                console.log('[AuthService] handleAuthRedirect: No tokens found in URL hash, checking for other formats');

                // Check for tokens in query parameters (some providers might use this)
                const urlObj = new URL(url);
                const queryAccessToken = urlObj.searchParams.get('access_token');
                const queryRefreshToken = urlObj.searchParams.get('refresh_token');

                console.log('[AuthService] handleAuthRedirect: Query parameter tokens:', {
                    hasQueryAccessToken: !!queryAccessToken,
                    hasQueryRefreshToken: !!queryRefreshToken
                });
            }

            // Fallback to getSession if tokens aren't in URL hash or if setSession failed silently
            console.log('[AuthService] handleAuthRedirect: Attempting final getSession');
            const { data: finalData, error: finalError } = await supabase.auth.getSession();
            console.log('[AuthService] handleAuthRedirect: Final getSession attempt', {
                hasSession: !!finalData?.session,
                hasUser: !!finalData?.session?.user,
                userId: finalData?.session?.user?.id,
                finalError
            });

            if (finalError) {
                console.error('[AuthService] handleAuthRedirect: ❌ Error handling auth redirect (final getSession):', finalError);
                return { success: false, error: finalError };
            }

            if (finalData.session) {
                console.log('[AuthService] handleAuthRedirect: ✅ OAuth authentication successful (final getSession)');
                return { success: true, session: finalData.session };
            }

            console.warn('[AuthService] handleAuthRedirect: ⚠️ No session found after all attempts.');
            console.warn('[AuthService] handleAuthRedirect: This might indicate:');
            console.warn('- OAuth provider configuration issues');
            console.warn('- Redirect URL mismatch');
            console.warn('- Supabase project settings problems');
            console.warn('- Network connectivity issues');

            return { success: false, error: 'No session found' };
        } catch (error) {
            console.error('[AuthService] handleAuthRedirect: ❌ Exception in handleAuthRedirect:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return { success: false, error };
        } finally {
            console.log('[AuthService] handleAuthRedirect: ===== REDIRECT HANDLING COMPLETE =====');
        }
    }

    /**
     * Initialize auth redirect handling
     */
    static initializeAuthHandling() {
        console.log('[AuthService] initializeAuthHandling: Setting up URL listeners.');
        // Handle initial URL if app was opened via deep link
        Linking.getInitialURL().then((url) => {
            if (url) {
                console.log('[AuthService] initializeAuthHandling: Handling initial URL:', url);
                this.handleAuthRedirect(url);
            }
        });

        // Handle subsequent URLs while app is running
        const subscription = Linking.addEventListener('url', (event) => {
            console.log('[AuthService] initializeAuthHandling: Handling event URL:', event.url);
            this.handleAuthRedirect(event.url);
        });

        return () => {
            console.log('[AuthService] initializeAuthHandling: Cleaning up URL listeners.');
            subscription?.remove();
        }
    }

    /**
     * Sign in with email and password
     */
    static async signInWithPassword(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error signing in:', error);
            return { success: false, error };
        }
    }

    /**
     * Sign up with email and password
     */
    static async signUpWithPassword(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error signing up:', error);
            return { success: false, error };
        }
    }

    /**
     * Sign in with OAuth provider (with native Apple Sign-In support)
     */
    static async signInWithOAuth(provider: 'google' | 'apple') {
        // For Apple, use native Sign-In on iOS
        if (provider === 'apple' && Platform.OS === 'ios') {
            return this.signInWithAppleNative();
        }

        // For Google or Apple on non-iOS platforms, use web OAuth
        return this.signInWithOAuthWeb(provider);
    }

    /**
     * Native Apple Sign-In (iOS only)
     */
    static async signInWithAppleNative() {
        console.log('[AuthService] signInWithAppleNative: Starting native Apple Sign-In');

        try {
            // Check if Apple Authentication is available
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
                console.error('[AuthService] signInWithAppleNative: Apple Authentication not available');
                return { success: false, error: new Error('Apple Authentication not available on this device') };
            }

            console.log('[AuthService] signInWithAppleNative: Apple Authentication available, requesting credential');

            // Request Apple ID credential
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            console.log('[AuthService] signInWithAppleNative: Apple credential received:', {
                hasUser: !!credential.user,
                hasEmail: !!credential.email,
                hasFullName: !!credential.fullName,
                hasIdentityToken: !!credential.identityToken,
                hasAuthorizationCode: !!credential.authorizationCode,
            });

            // Sign in to Supabase with Apple ID token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken!,
            });

            if (error) {
                console.error('[AuthService] signInWithAppleNative: Supabase sign-in error:', error);
                throw error;
            }

            console.log('[AuthService] signInWithAppleNative: ✅ Native Apple Sign-In successful');
            return { success: true, data };

        } catch (error: any) {
            console.error('[AuthService] signInWithAppleNative: Error:', error);

            if (error.code === 'ERR_REQUEST_CANCELED') {
                // User canceled the sign-in
                return { success: false, error: new Error('Sign-in was canceled') };
            }

            return { success: false, error };
        }
    }

    /**
     * Web-based OAuth (fallback for Google and Apple on non-iOS)
     */
    static async signInWithOAuthWeb(provider: 'google' | 'apple') {
        // Log environment and configuration
        OAuthDebugger.logEnvironment();
        OAuthDebugger.logSupabaseConfig();

        console.log(`[AuthService] signInWithOAuthWeb: Starting OAuth flow for ${provider}`);
        console.log(`[AuthService] signInWithOAuthWeb: Timestamp:`, new Date().toISOString());

        try {
            // Pre-flight checks
            console.log(`[AuthService] signInWithOAuthWeb: Pre-flight checks for ${provider}`);
            console.log(`[AuthService] signInWithOAuthWeb: Supabase client available:`, !!supabase);
            console.log(`[AuthService] signInWithOAuthWeb: Environment:`, {
                supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
                hasAnonKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
            });

            const options = {
                redirectTo: 'com.mebattll.habittracker://auth/callback',
                // Apple Sign In specific debugging
                ...(provider === 'apple' && {
                    scopes: 'email name'
                })
            };

            // Log the OAuth attempt
            OAuthDebugger.logOAuthAttempt(provider, options);

            const startTime = Date.now();
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options,
            });
            const endTime = Date.now();

            console.log(`[AuthService] signInWithOAuthWeb: Request completed for ${provider} in ${endTime - startTime}ms`);

            // Log the OAuth response
            OAuthDebugger.logOAuthResponse(provider, data, error);

            if (error) {
                console.error(`[AuthService] signInWithOAuthWeb: Error details for ${provider}:`, {
                    message: error.message,
                    stack: error.stack,
                    fullError: error
                });
                throw error;
            }

            // Detailed data analysis
            if (data) {
                console.log(`[AuthService] signInWithOAuthWeb: Data structure for ${provider}:`, {
                    hasUrl: !!data.url,
                    hasProvider: !!data.provider,
                    provider: data.provider,
                    urlLength: data.url?.length,
                    urlDomain: data.url ? new URL(data.url).hostname : null,
                    urlParams: data.url ? new URL(data.url).searchParams.toString() : null
                });

                if (data.url) {
                    console.log(`[AuthService] signInWithOAuthWeb: Full redirect URL for ${provider}:`, data.url);

                    // Parse URL for debugging
                    try {
                        const urlObj = new URL(data.url);
                        console.log(`[AuthService] signInWithOAuthWeb: URL breakdown for ${provider}:`, {
                            protocol: urlObj.protocol,
                            hostname: urlObj.hostname,
                            pathname: urlObj.pathname,
                            search: urlObj.search,
                            hash: urlObj.hash
                        });
                    } catch (urlError) {
                        console.error(`[AuthService] signInWithOAuthWeb: Error parsing URL for ${provider}:`, urlError);
                    }
                } else {
                    console.warn(`[AuthService] signInWithOAuthWeb: No redirect URL provided by Supabase for ${provider}`);
                    console.warn(`[AuthService] signInWithOAuthWeb: This might indicate a configuration issue`);
                }
            } else {
                console.warn(`[AuthService] signInWithOAuthWeb: No data returned from Supabase for ${provider}`);
            }

            return { success: true, data };
        } catch (error: any) {
            console.error(`[AuthService] signInWithOAuthWeb: Exception caught for ${provider}:`, {
                name: error.name,
                message: error.message,
                stack: error.stack,
                fullError: error
            });

            // Additional error context
            if (error.code) {
                console.error(`[AuthService] signInWithOAuthWeb: Error code for ${provider}:`, error.code);
            }

            if (error.details) {
                console.error(`[AuthService] signInWithOAuthWeb: Error details for ${provider}:`, error.details);
            }

            return { success: false, error };
        }
    }

    /**
     * Check if Apple Sign-In is available (iOS only)
     */
    static async isAppleSignInAvailable(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            return false;
        }

        try {
            return await AppleAuthentication.isAvailableAsync();
        } catch (error) {
            console.error('[AuthService] isAppleSignInAvailable: Error checking availability:', error);
            return false;
        }
    }

    /**
     * Sign out
     */
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error };
        }
    }

    /**
     * Resend confirmation email
     */
    static async resendConfirmation(email: string) {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
            });

            if (error) {
                throw error;
            }

            return { success: true };
        } catch (error) {
            console.error('Error resending confirmation:', error);
            return { success: false, error };
        }
    }
}

// Call initializeAuthHandling when the module is loaded.
// This ensures the listeners are set up as early as possible.
// The returned cleanup function will be managed if needed by specific app lifecycle events,
// but for basic setup, just calling it is the priority.
AuthService.initializeAuthHandling();
console.log('[AuthService Module] Called initializeAuthHandling() at module level.');
