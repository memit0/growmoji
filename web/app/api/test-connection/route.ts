import { testSupabaseConnection } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication failed',
        details: 'User not authenticated'
      }, { status: 401 });
    }

    // Test Supabase connection
    const connectionTest = await testSupabaseConnection();
    
    return NextResponse.json({
      success: true,
      auth: {
        userId,
        authenticated: true
      },
      supabase: connectionTest,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        clerkKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing'
      }
    });
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 