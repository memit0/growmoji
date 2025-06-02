// OAuth-specific debugging utilities
import * as Linking from 'expo-linking';

export class OAuthDebugger {
    static logEnvironment() {
        // console.log('[OAuthDebugger] ===== ENVIRONMENT CHECK =====');
        // console.log('[OAuthDebugger] Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
        // console.log('[OAuthDebugger] Has Anon Key:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
        // console.log('[OAuthDebugger] Platform:', require('expo-constants').default.platform);
        // console.log('[OAuthDebugger] App Version:', require('expo-constants').default.manifest?.version);
        // console.log('[OAuthDebugger] Expo SDK:', require('expo-constants').default.expoVersion);

        // Check deep linking configuration
        const scheme = Linking.createURL('/');
        // console.log('[OAuthDebugger] Deep Link Scheme:', scheme);
        // console.log('[OAuthDebugger] Expected Redirect:', 'com.mebattll.habittracker://auth/callback');
        // console.log('[OAuthDebugger] =====================================');
    }

    static logOAuthAttempt(provider: string, options: any) {
        // console.log(`[OAuthDebugger] ===== ${provider.toUpperCase()} OAUTH ATTEMPT =====`);
        // console.log(`[OAuthDebugger] Provider: ${provider}`);
        // console.log(`[OAuthDebugger] Options:`, JSON.stringify(options, null, 2));
        // console.log(`[OAuthDebugger] Timestamp: ${new Date().toISOString()}`);
        // console.log('[OAuthDebugger] ==========================================');
    }

    static logOAuthResponse(provider: string, data: any, error: any) {
        // console.log(`[OAuthDebugger] ===== ${provider.toUpperCase()} OAUTH RESPONSE =====`);
        // console.log(`[OAuthDebugger] Success:`, !error);
        // console.log(`[OAuthDebugger] Has Data:`, !!data);
        // console.log(`[OAuthDebugger] Has Error:`, !!error);

        if (data) {
            // console.log(`[OAuthDebugger] Data Structure:`, {
            //     hasUrl: !!data.url,
            //     hasProvider: !!data.provider,
            //     provider: data.provider,
            //     urlLength: data.url?.length
            // });

            if (data.url) {
                try {
                    const url = new URL(data.url);
                    // console.log(`[OAuthDebugger] URL Analysis:`, {
                    //     protocol: url.protocol,
                    //     hostname: url.hostname,
                    //     pathname: url.pathname,
                    //     hasParams: url.searchParams.toString().length > 0
                    // });
                } catch (e) {
                    // console.log(`[OAuthDebugger] URL Parse Error:`, e);
                }
            }
        }

        if (error) {
            // console.log(`[OAuthDebugger] Error Details:`, {
            //     message: error.message,
            //     name: error.name,
            //     code: error.code,
            //     status: error.status
            // });
        }
        // console.log('[OAuthDebugger] =============================================');
    }

    static logDeepLinkReceived(url: string) {
        // console.log('[OAuthDebugger] ===== DEEP LINK RECEIVED =====');
        // console.log('[OAuthDebugger] URL:', url);
        // console.log('[OAuthDebugger] Timestamp:', new Date().toISOString());

        try {
            const urlObj = new URL(url);
            // console.log('[OAuthDebugger] URL Components:', {
            //     protocol: urlObj.protocol,
            //     host: urlObj.host,
            //     pathname: urlObj.pathname,
            //     search: urlObj.search,
            //     hash: urlObj.hash
            // });

            // Check for common OAuth parameters
            const params = new URLSearchParams(urlObj.search);
            const hashParams = new URLSearchParams(urlObj.hash.replace('#', ''));

            // console.log('[OAuthDebugger] Query Parameters:', Object.fromEntries(params.entries()));
            // console.log('[OAuthDebugger] Hash Parameters:', Object.fromEntries(hashParams.entries()));

            // Apple-specific checks
            if (url.includes('apple') || url.includes('appleid')) {
                // console.log('[OAuthDebugger] 🍎 Apple Sign-In URL detected');
            }

            // Error checks
            if (url.includes('error')) {
                // console.log('[OAuthDebugger] ❌ Error detected in URL');
                const errorCode = params.get('error') || hashParams.get('error');
                const errorDesc = params.get('error_description') || hashParams.get('error_description');
                // console.log('[OAuthDebugger] Error Code:', errorCode);
                // console.log('[OAuthDebugger] Error Description:', errorDesc);
            }

            // Success indicators
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken || refreshToken) {
                // console.log('[OAuthDebugger] ✅ Tokens found in URL');
                // console.log('[OAuthDebugger] Has Access Token:', !!accessToken);
                // console.log('[OAuthDebugger] Has Refresh Token:', !!refreshToken);
            }

        } catch (e) {
            // console.log('[OAuthDebugger] URL Parse Error:', e);
        }

        // console.log('[OAuthDebugger] ===============================');
    }

    static logSupabaseConfig() {
        // console.log('[OAuthDebugger] ===== SUPABASE CONFIG CHECK =====');

        // This will help identify configuration issues
        const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        // console.log('[OAuthDebugger] URL Format Valid:', url?.startsWith('https://') && url?.includes('.supabase.co'));
        // console.log('[OAuthDebugger] Key Format Valid:', key?.length === 120); // Typical anon key length

        if (url) {
            try {
                const supabaseUrl = new URL(url);
                // console.log('[OAuthDebugger] Supabase Project:', supabaseUrl.hostname.split('.')[0]);
                // console.log('[OAuthDebugger] Supabase Region:', supabaseUrl.hostname.split('.')[1] || 'us-east-1');
            } catch (e) {
                // console.log('[OAuthDebugger] Invalid Supabase URL format');
            }
        }

        // console.log('[OAuthDebugger] ===================================');
    }
}
