import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getDeviceById, getDevicesDB } from '@/lib/db';
import { runCppRankingEngine } from '@/lib/cppBridge';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  // If redis has no ranking yet, auto-populate it on first request
  let totalInRedis = await redis.zcard('devices:ranked');
  if (totalInRedis === 0) {
    const devices = getDevicesDB().slice(0, 15000);
    const rankedOutput = await runCppRankingEngine(devices);
    for (const item of rankedOutput.results) {
      await redis.zadd('devices:ranked', item.score, item.deviceId);
    }
    totalInRedis = rankedOutput.results.length;
  }

  // Fast Redis read: ZREVRANGE devices:ranked 0 (limit - 1) WITHSCORES
  const raw = await redis.zrevrange('devices:ranked', 0, limit - 1, 'WITHSCORES');

  const rankedItems = [];
  for (let i = 0; i < raw.length; i += 2) {
    const deviceId = raw[i];
    const score = parseFloat(raw[i + 1]);
    const deviceDetails = getDeviceById(deviceId);

    rankedItems.push({
      rank: Math.floor(i / 2) + 1,
      deviceId,
      score: Number(score.toFixed(4)),
      device: deviceDetails || {
        name: `Device ${deviceId}`,
        brand: 'Generic',
        category: 'Smartphone',
        searchCount: 0,
        requestCount: 0,
      },
    });
  }

  const durationMs = Number((performance.now() - startTime).toFixed(2));

  return NextResponse.json({
    totalInIndex: totalInRedis,
    limit,
    readDurationMs: durationMs,
    source: 'redis-zrevrange',
    devices: rankedItems,
  });
}
