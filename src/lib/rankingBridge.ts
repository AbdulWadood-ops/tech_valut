/**
 * Algorithmic Device Ranking Bridge
 * 
 * Computes multi-attribute normalized device rankings based on search count,
 * request frequency, recency, and decay rates. Results are stored in high-speed
 * in-memory cache for instant retrieval without external services.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { setCache } from './redis';

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

// CPPSPEC Engine status: Detached per configuration (pure TypeScript ranking active)
export const CPPSPEC_ENGINE_DETACHED = true;

const isWindows = process.platform === 'win32';
const DEFAULT_BINARY_PATH = path.join(
  process.cwd(),
  'bin',
  isWindows ? 'ranking_engine.exe' : 'ranking_engine'
);

/**
 * Global storage reference for instant zero-overhead access to rankings
 */
const globalRankStore = globalThis as unknown as {
  tvRankedStore?: Array<{ rank: number; deviceId: string; score: number }>;
};

/**
 * Execute Ranking Algorithm and cache scores in memory.
 */
export async function rankAndSyncToRedis(
  devices: DeviceMetricInput[],
  weights: RankingWeights = { w_search: 0.4, w_request: 0.4, w_recency: 0.2, decay_lambda: 0.05 },
  binaryPath = DEFAULT_BINARY_PATH
): Promise<{ processed: number; cppExecutionMs: number; redisWriteMs: number; results: RankedDeviceResult[] }> {
  const rankingStart = performance.now();

  let ranked: RankedDeviceResult[] = [];

  if (!CPPSPEC_ENGINE_DETACHED && fs.existsSync(binaryPath)) {
    ranked = await new Promise<RankedDeviceResult[]>((resolve) => {
      const child = spawn(binaryPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '';
      child.stdout.on('data', (d) => (out += d.toString()));
      child.on('close', (code) => {
        if (code === 0 && out.trim().length > 0) {
          try {
            const parsed = JSON.parse(out);
            resolve(parsed.results || []);
            return;
          } catch {}
        }
        resolve(pureJsRanking(devices, weights));
      });
      child.on('error', () => resolve(pureJsRanking(devices, weights)));
      child.stdin.write(JSON.stringify(devices));
      child.stdin.end();
    });
  } else {
    // Pure TypeScript ranking computation (< 1ms)
    ranked = pureJsRanking(devices, weights);
  }

  const executionMs = Number((performance.now() - rankingStart).toFixed(2));

  // Store ranked summary in global store and in-memory cache
  const summary = ranked.map(r => ({
    rank: r.rank,
    deviceId: r.deviceId,
    score: r.score,
  }));
  globalRankStore.tvRankedStore = summary;
  await setCache('devices:ranked', summary, 86400);

  return {
    processed: ranked.length,
    cppExecutionMs: executionMs,
    redisWriteMs: 0,
    results: ranked,
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
      score: Number(score.toFixed(4)),
      searchScore: Number(searchScore.toFixed(4)),
      requestScore: Number(requestScore.toFixed(4)),
      recencyScore: Number(recencyScore.toFixed(4)),
    };
  });

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => (r.rank = i + 1));
  return results;
}
