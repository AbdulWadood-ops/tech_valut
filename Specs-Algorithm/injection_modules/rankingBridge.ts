/**
 * Part 2.1 & 2.2 — C++ Ranking Bridge + Redis Sorted Set Writer
 * 
 * Invokes the high-performance C++ ranking binary (or JIT fallback)
 * and writes the pre-computed scores directly into Redis `devices:ranked` sorted set.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface RankingWeights {
  w_search?: number;
  w_request?: number;
  w_recency?: number;
  decay_lambda?: number;
}

export interface DeviceMetricInput {
  deviceId: string;
  name?: string;
  brand?: string;
  category?: string;
  searchCount: number;
  requestCount: number;
  lastAccessedHoursAgo: number;
  status?: string;
}

export interface RankedDeviceResult {
  rank: number;
  deviceId: string;
  score: number;
  searchScore: number;
  requestScore: number;
  recencyScore: number;
}

/**
 * Execute C++ Ranking Engine and write scores to Redis Sorted Set (`devices:ranked`).
 */
export async function rankAndSyncToRedis(
  devices: DeviceMetricInput[],
  weights: RankingWeights = { w_search: 0.4, w_request: 0.4, w_recency: 0.2, decay_lambda: 0.05 },
  binaryPath = path.join(process.cwd(), 'bin', 'ranking_engine.exe')
): Promise<{ processed: number; cppExecutionMs: number; redisWriteMs: number }> {
  const cppStart = performance.now();

  let ranked: RankedDeviceResult[] = [];

  if (fs.existsSync(binaryPath)) {
    // Run native C++ binary
    ranked = await new Promise<RankedDeviceResult[]>((resolve) => {
      const child = spawn(binaryPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '';
      child.stdout.on('data', (d) => (out += d));
      child.on('close', () => {
        try {
          const parsed = JSON.parse(out);
          resolve(parsed.results || []);
        } catch {
          resolve(pureJsRanking(devices, weights));
        }
      });
      child.on('error', () => resolve(pureJsRanking(devices, weights)));
      child.stdin.write(JSON.stringify(devices));
      child.stdin.end();
    });
  } else {
    ranked = pureJsRanking(devices, weights);
  }

  const cppExecutionMs = Number((performance.now() - cppStart).toFixed(2));

  // Write into Redis Sorted Set (ZADD)
  const redisStart = performance.now();
  const pipeline = redis.pipeline();
  for (const item of ranked) {
    pipeline.zadd('devices:ranked', item.score, item.deviceId);
  }
  await pipeline.exec();
  const redisWriteMs = Number((performance.now() - redisStart).toFixed(2));

  return {
    processed: ranked.length,
    cppExecutionMs,
    redisWriteMs,
  };
}

function pureJsRanking(devices: DeviceMetricInput[], weights: RankingWeights): RankedDeviceResult[] {
  let maxSearch = 0;
  let maxRequest = 0;
  for (const d of devices) {
    if (d.searchCount > maxSearch) maxSearch = d.searchCount;
    if (d.requestCount > maxRequest) maxRequest = d.requestCount;
  }

  const wSearch = weights.w_search ?? 0.4;
  const wRequest = weights.w_request ?? 0.4;
  const wRecency = weights.w_recency ?? 0.2;
  const lambda = weights.decay_lambda ?? 0.05;

  const results: RankedDeviceResult[] = devices.map((d) => {
    const searchScore = maxSearch > 0 ? d.searchCount / maxSearch : 0;
    const requestScore = maxRequest > 0 ? d.requestCount / maxRequest : 0;
    const recencyScore = Math.exp(-lambda * Math.max(0, d.lastAccessedHoursAgo));
    const score = wSearch * searchScore + wRequest * requestScore + wRecency * recencyScore;

    return {
      rank: 0,
      deviceId: d.deviceId,
      score,
      searchScore,
      requestScore,
      recencyScore,
    };
  });

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => (r.rank = i + 1));
  return results;
}
