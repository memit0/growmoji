import { habitsService } from '@/lib/services/habits';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { params } = context;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { log_date } = await request.json();
    const log = await habitsService.logHabitCompletion(params.id, log_date);
    return NextResponse.json(log);
  } catch (error) {
    console.error('Error logging habit completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { params } = context;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await habitsService.getHabitLogs(params.id);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching habit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { params } = context;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const logDate = searchParams.get('log_date');
    
    if (!logDate) {
      return NextResponse.json({ error: 'log_date is required' }, { status: 400 });
    }

    await habitsService.deleteHabitLog(params.id, logDate);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 