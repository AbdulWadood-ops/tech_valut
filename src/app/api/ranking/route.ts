import { NextResponse } from 'next/server';
import { getTopRankedDevices } from '@/lib/rankingReader';
import { getDevices } from '@/lib/db';
import { rankAndSyncToRedis } from '@/lib/rankingBridge';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const refresh = searchParams.get('refresh') === 'true';

    let top = await getTopRankedDevices(limit);

    if (top.length === 0 || refresh) {
      const devices = await getDevices();
      const metricInputs = devices.map((d: any) => ({
        deviceId: d.id,
        name: d.name,
        brand: d.brand,
        category: d.category,
        searchCount: d.searchCount || Math.floor(Math.random() * 5000) + 10,
        requestCount: d.requestCount || Math.floor(Math.random() * 2000) + 5,
        lastAccessedHoursAgo: d.lastAccessedHoursAgo || Math.floor(Math.random() * 48),
      }));

      await rankAndSyncToRedis(metricInputs);
      top = await getTopRankedDevices(limit);
    }

    return NextResponse.json({
      success: true,
      cppspecDetached: true,
      count: top.length,
      devices: top,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
