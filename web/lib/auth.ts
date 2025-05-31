import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/sign-in');
  }

  return user.id;
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function checkPremiumStatus() {
  // This function is now primarily for server-side use
  // Client-side premium checking should use the useSubscription hook
  // which integrates with RevenueCat's web SDK

  const user = await getCurrentUser();
  if (!user) return false;

  // For server-side rendering, we'll assume the user needs to be checked
  // The actual premium status will be determined on the client side
  // using the RevenueCat integration

  // TODO: In the future, you might want to store premium status in your database
  // and check it here for server-side rendering optimization

  return true; // Allow access, premium check happens on client
}

export function getAuthHeaders() {
  // This will be used for API calls that need authentication
  return {
    'Content-Type': 'application/json',
  };
} 