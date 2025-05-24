import { timerService } from '@/lib/services/timer';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
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
    const { userId } = await auth();
    
    if (!userId) {
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