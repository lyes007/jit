import { NextResponse } from 'next/server';
import { getBalancedQuantities } from '@/lib/queries';

export async function GET() {
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

    const data = await getBalancedQuantities();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching balanced quantities:', error);
    
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
      { error: 'Failed to fetch balanced quantities', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

