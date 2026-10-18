/**
 * Next.js Server Component SEO Ranked Reader
 * 
 * Reads pre-ranked device scores from in-memory cache in < 0.1ms
 * without requiring external network calls or Redis servers.
 */

import { getCache } from './redis';

export interface RankedItemSummary {
  rank: number;
  deviceId: string;
  score: number;
}

const globalRankStore = globalThis as unknown as {
  tvRankedStore?: RankedItemSummary[];
};

/**
 * Fetch top N ranked devices from in-memory ranked cache.
 * @param limit Number of devices to return (default: 20)
 */
export async function getTopRankedDevices(limit = 20): Promise<RankedItemSummary[]> {
  try {
    // 1. Check instant global memory store
    if (globalRankStore.tvRankedStore && globalRankStore.tvRankedStore.length > 0) {
      return globalRankStore.tvRankedStore.slice(0, limit);
    }

    // 2. Check in-memory cache entry
    const cached = await getCache<RankedItemSummary[]>('devices:ranked');
    if (cached && Array.isArray(cached) && cached.length > 0) {
      globalRankStore.tvRankedStore = cached;
      return cached.slice(0, limit);
    }

    return [];
  } catch {
    return [];
  }
}
