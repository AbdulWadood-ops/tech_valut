import { NextRequest, NextResponse } from 'next/server';
import { getDevicesWithCache, invalidateDeviceCache } from '@/lib/deviceCache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    const data = await getDevicesWithCache(page, limit, search, category);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch devices', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === 'invalidate-cache') {
      const deletedCount = await invalidateDeviceCache();
      return NextResponse.json({
        success: true,
        message: `Invalidated ${deletedCount} cache keys.`,
      });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
