import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/auth/sign-in');
  }
  
  return userId;
}

export async function getCurrentUser() {
  return await currentUser();
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