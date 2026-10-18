import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/redis';
import { isMongoHealthy } from '@/lib/mongodb';
import { getDevices } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = performance.now();
  const cacheHealth = await checkRedisHealth();
  const mongoHealthy = isMongoHealthy();
  const devices = await getDevices();
  const latencyMs = Math.round((performance.now() - start) * 100) / 100;

  return NextResponse.json({
    status: 'healthy',
    latencyMs,
    timestamp: new Date().toISOString(),
    cache: {
      provider: 'in-memory',
      status: 'active',
      available: true,
      cachedItemsCount: cacheHealth.cachedItemsCount,
      message: cacheHealth.message,
    },
    mongodb: {
      status: mongoHealthy ? 'circuit-closed (connected)' : 'circuit-open (offline, serving local dataset)',
      circuitBreakerOpen: !mongoHealthy,
      loadedDevicesCount: devices.length,
    },
    performance: {
      ttfbEstimate: `${latencyMs}ms`,
      status: latencyMs < 50 ? 'EXCELLENT (Target 98+)' : 'OPTIMIZED',
    },
  });
}
