import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const error = searchParams.get('error');

    console.log('Auth callback received:', {
        hasCode: !!code,
        error,
        next,
        fullUrl: request.url
    });

    if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/auth/sign-in?error=${encodeURIComponent(error)}`);
    }

    if (code) {
        const cookieJar: { name: string; value: string; options?: any }[] = [];

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
                error: exchangeError?.message
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
                console.error('Failed to exchange code for session:', exchangeError);
                return NextResponse.redirect(`${origin}/auth/sign-in?error=Failed to authenticate`);
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
