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
  // For now, we'll assume all authenticated users have premium access
  // In a real implementation, you would check the user's subscription status
  // from the mobile app's RevenueCat data stored in your database
  const user = await getCurrentUser();
  return !!user;
}

export function getAuthHeaders() {
  // This will be used for API calls that need authentication
  return {
    'Content-Type': 'application/json',
  };
} 