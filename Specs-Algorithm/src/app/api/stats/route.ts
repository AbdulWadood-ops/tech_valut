import { NextResponse } from 'next/server';
import { redis, isRedisMemoryFallback } from '@/lib/redis';
import { getDevicesDB } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const devices = getDevicesDB();
  const rankedCount = await redis.zcard('devices:ranked');
  const cacheKeys = await redis.keys('devices:page:*');

  const binDir = path.join(process.cwd(), 'bin');
  const hasRankingBin = fs.existsSync(path.join(binDir, 'ranking_engine.exe'));
  const hasVerificationBin = fs.existsSync(path.join(binDir, 'verification_engine.exe'));

  return NextResponse.json({
    totalDevices: devices.length,
    rankedDevicesCount: rankedCount,
    activeCacheKeysCount: cacheKeys.length,
    redisMode: isRedisMemoryFallback() ? 'In-Memory High-Speed Store' : 'Redis Server Connected',
    cppEngines: {
      rankingEngineBinary: hasRankingBin ? 'Ready (bin/ranking_engine.exe)' : 'Fallback JIT Active',
      verificationEngineBinary: hasVerificationBin ? 'Ready (bin/verification_engine.exe)' : 'Fallback JIT Active',
      arch: process.arch,
      platform: process.platform,
    },
    uptimeSeconds: process.uptime(),
    memoryUsageMB: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
  });
}
