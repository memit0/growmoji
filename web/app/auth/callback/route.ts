import type { CookieOptions } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');
    const user = searchParams.get('user'); // Apple sends user data

    console.log('Auth callback received:', {
        hasCode: !!code,
        error,
        errorDescription: errorDescription ? decodeURIComponent(errorDescription) : null,
        state,
        hasUser: !!user,
        next,
        fullUrl: request.url,
        allParams: Object.fromEntries(searchParams.entries())
    });

    if (error) {
        console.error('Auth callback error:', {
            error,
            errorDescription: errorDescription ? decodeURIComponent(errorDescription) : null,
            state
        });

        const errorMessage = errorDescription ?
            decodeURIComponent(errorDescription) :
            error === 'access_denied' ? 'Sign-in was cancelled' :
                error === 'invalid_request' ? 'Invalid authentication request' :
                    error === 'server_error' ? 'Authentication server error' :
                        `Authentication error: ${error}`;

        return NextResponse.redirect(`${origin}/auth/sign-in?error=${encodeURIComponent(errorMessage)}`);
    }

    if (code) {
        const cookieJar: { name: string; value: string; options: CookieOptions }[] = [];

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookieJar.push(...cookiesToSet);
                    },
                },
            }
        );

        try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            console.log('Code exchange result:', {
                hasSession: !!data?.session,
                hasUser: !!data?.user,
                error: exchangeError?.message,
                errorCode: exchangeError?.status,
                errorDetails: exchangeError ? JSON.stringify(exchangeError, null, 2) : null
            });

            if (!exchangeError && data?.session) {
                const forwardedHost = request.headers.get('x-forwarded-host');
                const isLocalEnv = process.env.NODE_ENV === 'development';

                const redirectUrl = isLocalEnv
                    ? `${origin}${next}`
                    : forwardedHost
                        ? `https://${forwardedHost}${next}`
                        : `${origin}${next}`;

                console.log('Redirecting to:', redirectUrl);

                // Create new response with redirect and proper cookies
                const response = NextResponse.redirect(redirectUrl);

                // Apply any cookies that Supabase wants to set
                cookieJar.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });

                return response;
            } else {
                console.error('Failed to exchange code for session:', {
                    error: exchangeError,
                    code: code.substring(0, 20) + '...' // Log partial code for debugging
                });

                // Provide more specific error messages
                let errorMessage = 'Failed to authenticate';
                if (exchangeError?.message?.includes('signup')) {
                    errorMessage = 'Sign up not complete. Please check your Apple ID configuration or try again.';
                } else if (exchangeError?.message?.includes('invalid')) {
                    errorMessage = 'Invalid authentication code. Please try signing in again.';
                } else if (exchangeError?.message?.includes('expired')) {
                    errorMessage = 'Authentication session expired. Please try signing in again.';
                } else if (exchangeError?.message) {
                    errorMessage = exchangeError.message;
                }

                return NextResponse.redirect(`${origin}/auth/sign-in?error=${encodeURIComponent(errorMessage)}`);
            }
        } catch (err) {
            console.error('Exception during code exchange:', err);
            return NextResponse.redirect(`${origin}/auth/sign-in?error=Authentication failed`);
        }
    }

    // If there's no code, redirect to sign-in page
    console.log('No authorization code found, redirecting to sign-in');
    return NextResponse.redirect(`${origin}/auth/sign-in?error=No authorization code found`);
}
