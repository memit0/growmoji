import { createSupabaseServerClient } from '@/lib/auth';
import { testSupabaseConnection } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test authentication
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authError?.message || 'User not authenticated'
      }, { status: 401 });
    }

    // Test Supabase connection
    const connectionTest = await testSupabaseConnection();

    return NextResponse.json({
      success: true,
      auth: {
        userId: user.id,
        authenticated: true
      },
      supabase: connectionTest,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
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