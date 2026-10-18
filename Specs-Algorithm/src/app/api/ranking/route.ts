import { NextRequest, NextResponse } from 'next/server';
import { getDevicesDB } from '@/lib/db';
import { runCppRankingEngine } from '@/lib/cppBridge';
import { redis } from '@/lib/redis';

// Trigger the C++ Ranking engine on background or demand and populate Redis Sorted Set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const count = Math.min(20000, body.count || 15000);
    const weights = {
      search: body.w_search !== undefined ? Number(body.w_search) : 0.40,
      request: body.w_request !== undefined ? Number(body.w_request) : 0.40,
      recency: body.w_recency !== undefined ? Number(body.w_recency) : 0.20,
      decayLambda: body.decay_lambda !== undefined ? Number(body.decay_lambda) : 0.05,
    };

    // 1. Fetch raw device metrics from DB (MongoDB equivalent)
    const devices = getDevicesDB().slice(0, count);

    // 2. Pass to C++ Ranking Engine binary
    const startCpp = performance.now();
    const rankedOutput = await runCppRankingEngine(devices, weights);
    const cppDuration = performance.now() - startCpp;

    // 3. Store in Redis Sorted Set: ZADD devices:ranked score deviceId
    const startRedis = performance.now();
    for (const item of rankedOutput.results) {
      await redis.zadd('devices:ranked', item.score, item.deviceId);
    }
    const redisDuration = performance.now() - startRedis;

    return NextResponse.json({
      success: true,
      engine: rankedOutput.engine,
      totalRanked: rankedOutput.results.length,
      cppExecutionMs: rankedOutput.executionTimeMs || Number(cppDuration.toFixed(3)),
      redisWriteMs: Number(redisDuration.toFixed(3)),
      top5: rankedOutput.results.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to compute and store rankings', details: error.message },
      { status: 500 }
    );
  }
}

// Fetch current ranking status
export async function GET() {
  try {
    const zcard = await redis.zcard('devices:ranked');
    return NextResponse.json({
      rankedCount: zcard,
      key: 'devices:ranked',
      status: zcard > 0 ? 'populated' : 'empty',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
