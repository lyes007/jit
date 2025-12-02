import { NextRequest, NextResponse } from 'next/server';
import { getTRSData } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    // Check for missing DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: 'Database configuration missing',
          message: 'DATABASE_URL is not defined. Please create a .env.local file with your database connection string.',
          help: 'Run "node scripts/setup-env.js" to create .env.local automatically.',
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const machineIds = searchParams.get('machineIds')?.split(',').map(Number).filter(Boolean);

    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      machineIds: machineIds && machineIds.length > 0 ? machineIds : undefined,
    };

    const data = await getTRSData(filters);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching TRS data:', error);
    
    // Check if error is about missing DATABASE_URL
    if (error?.message?.includes('DATABASE_URL is not defined')) {
      return NextResponse.json(
        {
          error: 'Database configuration missing',
          message: error.message,
          help: 'Run "node scripts/setup-env.js" to create .env.local automatically.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch TRS data', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

