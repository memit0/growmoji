import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId, sessionId, orgId } = await auth();
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        sessionId,
        orgId,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        hasClerkKeys: {
          publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
          secretKey: !!process.env.CLERK_SECRET_KEY,
        },
        hasRevenueCatKey: !!process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY,
        hasSupabaseKeys: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }
      }
    });
  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
