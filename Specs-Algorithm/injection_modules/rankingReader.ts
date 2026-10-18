/**
 * Part 2.3 — Next.js Server Component SEO Ranked Reader
 * 
 * Drop this helper into any Next.js Server Component or Page.
 * It reads the pre-ranked scores from Redis in < 2ms without ever touching C++ or MongoDB.
 */

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface RankedItemSummary {
  rank: number;
  deviceId: string;
  score: number;
}

/**
 * Fetch top N ranked devices from Redis Sorted Set (`devices:ranked`).
 * @param limit Number of devices to return (default: 20)
 */
export async function getTopRankedDevices(limit = 20): Promise<RankedItemSummary[]> {
  try {
    const raw = await redis.zrevrange('devices:ranked', 0, limit - 1, 'WITHSCORES');
    const devices: RankedItemSummary[] = [];

    for (let i = 0; i < raw.length; i += 2) {
      devices.push({
        rank: Math.floor(i / 2) + 1,
        deviceId: raw[i],
        score: parseFloat(raw[i + 1]),
      });
    }

    return devices;
  } catch (err) {
    console.warn('[Ranking Reader] Redis read failed:', err);
    return [];
  }
}
