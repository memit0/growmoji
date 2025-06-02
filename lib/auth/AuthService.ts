import { GoogleSignin } from '@react-native-google-signin/google-signin';
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

        try {
            const params = new URLSearchParams(url.split('#')[1]);
            const hashParams = new URLSearchParams(url.split('#')[1]);

            // console.log('[AuthService] handleAuthRedirect: URL components:', {
            //   url,
            //   pathname: new URL(url).pathname,
            //   hash: new URL(url).hash,
            //   params: Object.fromEntries(params.entries()),
            //   hashParams: Object.fromEntries(hashParams.entries()),
            // });

            const accessToken = params.get('access_token') || hashParams.get('access_token');
            const refreshToken = params.get('refresh_token') || hashParams.get('refresh_token');
            const error = params.get('error') || hashParams.get('error');
            const errorCode = params.get('error_code') || hashParams.get('error_code');
            const errorDescription = params.get('error_description') || hashParams.get('error_description');

            if (error || errorCode) {
                const isAppleSignIn = url.includes('apple') && errorCode === '401';
                if (isAppleSignIn) {
                    // console.log('[AuthService] handleAuthRedirect: Apple Sign-In URL detected');
                    // This specific error for Apple often means the user cancelled or had an issue on Apple's side.
                    // It might not be a true "error" in the sense of a system failure, but a user action.
                    // You might want to handle this silently or with a specific user message.
                    return { error: new Error('Apple Sign-In cancelled or failed.'), session: null, isAppleSignInCancellation: true };
                }
                // console.log('[AuthService] handleAuthRedirect: Error detected in URL');
                // console.log('[AuthService] handleAuthRedirect: Error details:', {
                //   error,
                //   errorCode,
                //   errorDescription,
                //   url,
                // });
                return { error: new Error(errorDescription || errorCode || 'OAuth error'), session: null };
            }

            // console.log('[AuthService] handleAuthRedirect: Initial getSession attempt', {
            //   hasAccessToken: !!accessToken,
            //   hasRefreshToken: !!refreshToken,
            // });

            // Attempt to get session if tokens are not in URL, maybe it's already set by native flow
            if (!accessToken || !refreshToken) {
                const { data: initialSessionData, error: initialSessionError } = await supabase.auth.getSession();
                // console.log('[AuthService] handleAuthRedirect: Token analysis:', {
                //   accessTokenInUrl: !!accessToken,
                //   refreshTokenInUrl: !!refreshToken,
                //   initialSession: !!initialSessionData.session,
                //   initialSessionError: initialSessionError?.message,
                //   currentSupabaseUser: supabase.auth.currentUser?.id
                // });

                if (initialSessionData.session) {
                    // console.log('[AuthService] handleAuthRedirect: ✅ Session already active, no need to set manually from URL.');
                    return { session: initialSessionData.session, error: null };
                }
                // console.log('[AuthService] handleAuthRedirect: Setting session with extracted tokens');
                // If getSession didn't find a session, but we have tokens from the URL, try setSession
                if (accessToken && refreshToken) {
                    const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    // console.log('[AuthService] handleAuthRedirect: setSession result', {
                    //   setSessionData: setSessionData?.session?.user?.id,
                    //   setSessionError: setSessionError?.message
                    // });

                    if (setSessionError) {
                        // console.error('[AuthService] Error setting session with URL tokens:', setSessionError);
                        return { error: setSessionError, session: null };
                    }
                    if (setSessionData.session) {
                        // console.log('[AuthService] handleAuthRedirect: ✅ OAuth authentication successful after setSession');
                        return { session: setSessionData.session, error: null };
                    }
                }
                // console.log('[AuthService] handleAuthRedirect: No tokens found in URL hash, checking for other formats');
                // If still no session, and no tokens were in the hash, check query parameters (less common for PKCE)
                const queryAccessToken = params.get('access_token');
                const queryRefreshToken = params.get('refresh_token');

                // console.log('[AuthService] handleAuthRedirect: Query parameter tokens:', {
                //   queryAccessToken: !!queryAccessToken,
                //   queryRefreshToken: !!queryRefreshToken
                // });

                if (queryAccessToken && queryRefreshToken) {
                    const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
                        access_token: queryAccessToken,
                        refresh_token: queryRefreshToken,
                    });
                    // console.log('[AuthService] handleAuthRedirect: Attempting final getSession');
                    if (setSessionError) {
                        // console.error('[AuthService] Error setting session with query param tokens:', setSessionError);
                        return { error: setSessionError, session: null };
                    }
                    // Final check if session is established
                    const { data: finalSessionData, error: finalSessionError } = await supabase.auth.getSession();
                    if (finalSessionError) {
                        // console.error('[AuthService] Error in final getSession after query param attempt:', finalSessionError);
                        return { error: finalSessionError, session: null };
                    }
                    if (finalSessionData.session) {
                        // console.log('[AuthService] handleAuthRedirect: ✅ Session established after query param token handling.');
                        return { session: finalSessionData.session, error: null };
                    }
                }

                // console.warn('[AuthService] handleAuthRedirect: Failed to establish session from URL tokens or existing session.');
                return { error: new Error('Failed to establish session.'), session: null };
            }

            // This part handles when tokens ARE present in the URL and we directly use them.
            // console.log('[AuthService] handleAuthRedirect: Proceeding with tokens found directly in URL (hash or query)');
            const { data, error: خارجیError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (خارجیError) {
                // console.error('[AuthService] Error setting session with URL tokens:', خارجیError);
                return { error: خارجیError, session: null };
            }

            if (data.session) {
                // console.log('[AuthService] handleAuthRedirect: ✅ OAuth authentication successful after setSession');
                return { session: data.session, error: null };
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
     * Sign in with OAuth provider (with native Apple and Google Sign-In support)
     */
    static async signInWithOAuth(provider: 'google' | 'apple') {
        // For Apple, use native Sign-In on iOS
        if (provider === 'apple' && Platform.OS === 'ios') {
            return this.signInWithAppleNative();
        }

        // For Google, use native Sign-In on iOS
        if (provider === 'google' && Platform.OS === 'ios') {
            return this.signInWithGoogleNative();
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
     * Native Google Sign-In (iOS/Android)
     */
    static async signInWithGoogleNative() {
        console.log('[AuthService] signInWithGoogleNative: Starting native Google Sign-In');

        try {
            // Configure Google Sign-In if not already configured
            await this.configureGoogleSignIn();

            console.log('[AuthService] signInWithGoogleNative: Google Sign-In configured, checking play services');

            // Check if Google Play Services are available
            await GoogleSignin.hasPlayServices();

            console.log('[AuthService] signInWithGoogleNative: Initiating Google Sign-In');

            // Trigger Google Sign-In
            const response = await GoogleSignin.signIn();

            console.log('[AuthService] signInWithGoogleNative: Google Sign-In successful:', {
                hasData: !!response.data,
                hasIdToken: !!response.data?.idToken,
                userId: response.data?.user?.id,
                email: response.data?.user?.email
            });

            if (!response.data?.idToken) {
                throw new Error('No ID token received from Google Sign-In');
            }

            // Sign in to Supabase with Google ID token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.data.idToken,
            });

            if (error) {
                console.error('[AuthService] signInWithGoogleNative: Supabase sign-in error:', error);
                throw error;
            }

            console.log('[AuthService] signInWithGoogleNative: ✅ Native Google Sign-In successful');
            return { success: true, data };

        } catch (error: any) {
            console.error('[AuthService] signInWithGoogleNative: Error:', error);

            if (error.code === 'SIGN_IN_CANCELLED') {
                // User canceled the sign-in
                return { success: false, error: new Error('Sign-in was canceled') };
            }

            if (error.code === 'IN_PROGRESS') {
                // Sign-in is already in progress
                return { success: false, error: new Error('Sign-in already in progress') };
            }

            return { success: false, error };
        }
    }

    /**
     * Configure Google Sign-In
     */
    static async configureGoogleSignIn() {
        try {
            console.log('[AuthService] configureGoogleSignIn: Configuring Google Sign-In');

            // You'll need to get your iOS client ID from Google Cloud Console
            // For now, we'll use a placeholder - you'll need to replace this with your actual client ID
            const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_WEB_CLIENT_ID';
            const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'YOUR_GOOGLE_IOS_CLIENT_ID';

            GoogleSignin.configure({
                webClientId: webClientId, // From Google Cloud Console
                iosClientId: iosClientId, // From Google Cloud Console (optional)
                offlineAccess: true,
                hostedDomain: '', // Optional
                forceCodeForRefreshToken: true,
            });

            console.log('[AuthService] configureGoogleSignIn: ✅ Google Sign-In configured successfully');
        } catch (error) {
            console.error('[AuthService] configureGoogleSignIn: Error configuring Google Sign-In:', error);
            throw error;
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
     * Check if Google Sign-In is available
     */
    static async isGoogleSignInAvailable(): Promise<boolean> {
        try {
            // Configure Google Sign-In first
            await this.configureGoogleSignIn();

            // Check if Play Services are available (this works on both iOS and Android)
            await GoogleSignin.hasPlayServices();
            return true;
        } catch (error) {
            console.error('[AuthService] isGoogleSignInAvailable: Error checking availability:', error);
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

    /**
     * Test Google Sign-In configuration (for debugging)
     */
    static async testGoogleSignInConfig() {
        console.log('[AuthService] testGoogleSignInConfig: Testing Google Sign-In configuration');

        try {
            const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
            const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

            console.log('[AuthService] testGoogleSignInConfig: Environment variables:', {
                hasWebClientId: !!webClientId && webClientId !== 'YOUR_GOOGLE_WEB_CLIENT_ID',
                hasIosClientId: !!iosClientId && iosClientId !== 'YOUR_GOOGLE_IOS_CLIENT_ID',
                webClientIdLength: webClientId?.length || 0,
                iosClientIdLength: iosClientId?.length || 0
            });

            if (!webClientId || webClientId === 'YOUR_GOOGLE_WEB_CLIENT_ID') {
                throw new Error('Google Web Client ID not configured. Please update your .env file.');
            }

            await this.configureGoogleSignIn();
            await GoogleSignin.hasPlayServices();

            console.log('[AuthService] testGoogleSignInConfig: ✅ Google Sign-In configuration test passed');
            return { success: true };

        } catch (error: any) {
            console.error('[AuthService] testGoogleSignInConfig: ❌ Configuration test failed:', error);
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
