import { createSupabaseServerClient } from '@/lib/auth';
import { timerService } from '@/lib/services/timer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await timerService.getTimerSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching timer settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const settings = await timerService.createOrUpdateTimerSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error creating/updating timer settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 