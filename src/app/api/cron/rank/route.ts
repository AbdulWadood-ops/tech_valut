import { NextResponse } from 'next/server';
import { getDevices } from '@/lib/db';
import { rankAndSyncToRedis } from '@/lib/rankingBridge';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const devices = await getDevices();
    if (!devices || devices.length === 0) {
      return NextResponse.json({ success: false, message: 'No devices found in database.' }, { status: 404 });
    }

    const metricInputs = devices.map((d: any) => ({
      deviceId: d.id,
      name: d.name,
      brand: d.brand,
      category: d.category,
      searchCount: d.searchCount || Math.floor(Math.random() * 5000) + 10,
      requestCount: d.requestCount || Math.floor(Math.random() * 2000) + 5,
      lastAccessedHoursAgo: d.lastAccessedHoursAgo || Math.floor(Math.random() * 48),
    }));

    const stats = await rankAndSyncToRedis(metricInputs);

    return NextResponse.json({
      success: true,
      cppspecDetached: true,
      timestamp: new Date().toISOString(),
      processedCount: stats.processed,
      executionMs: stats.cppExecutionMs,
      cacheWriteMs: stats.redisWriteMs,
      topRankedSample: stats.results.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
