/**
 * Part 1.1 — Redis Cache-Aside Layer
 * 
 * Drop this file into your Next.js project under `lib/deviceCache.ts` (or .js).
 * Reduces MongoDB load and provides sub-millisecond cached responses.
 */

import Redis from 'ioredis';

// Reuse Redis connection across hot-reloads
const globalForRedis = global as unknown as { redisClient?: Redis };
const redis = globalForRedis.redisClient ?? new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
if (process.env.NODE_ENV !== 'production') globalForRedis.redisClient = redis;

export interface DeviceQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

/**
 * Fetch devices with Redis cache-aside strategy (30s TTL).
 * @param DeviceModel Mongoose model or DB query function
 */
export async function getDevicesWithCache<T>(
  DeviceModel: any,
  options: DeviceQueryOptions = {}
): Promise<{ devices: T[]; source: 'redis-cache' | 'mongodb'; latencyMs: number }> {
  const start = performance.now();
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(200, Math.max(1, options.limit || 50));
  const searchKey = options.search ? `:q:${encodeURIComponent(options.search)}` : '';
  const catKey = options.category ? `:cat:${encodeURIComponent(options.category)}` : '';

  const cacheKey = `devices:page:${page}:limit:${limit}${searchKey}${catKey}`;

  // 1. Try Redis cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return {
        devices: JSON.parse(cached),
        source: 'redis-cache',
        latencyMs: Number((performance.now() - start).toFixed(2)),
      };
    }
  } catch (err) {
    console.warn('[Cache] Redis get failed, falling back to DB:', err);
  }

  // 2. Query MongoDB (using .lean() for fast plain JS objects)
  const query: Record<string, any> = {};
  if (options.category && options.category !== 'all') {
    query.category = options.category;
  }
  if (options.search) {
    query.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { brand: { $regex: options.search, $options: 'i' } },
      { deviceId: { $regex: options.search, $options: 'i' } },
    ];
  }

  const devices = await DeviceModel.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // 3. Populate Redis with 30s TTL
  try {
    await redis.set(cacheKey, JSON.stringify(devices), 'EX', 30);
  } catch (err) {
    console.warn('[Cache] Redis set failed:', err);
  }

  return {
    devices,
    source: 'mongodb',
    latencyMs: Number((performance.now() - start).toFixed(2)),
  };
}

/**
 * Invalidate all device page caches when a device is added, updated, or removed.
 */
export async function invalidateDeviceCache(): Promise<number> {
  try {
    const keys = await redis.keys('devices:page:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      return keys.length;
    }
  } catch (err) {
    console.warn('[Cache] Cache invalidation failed:', err);
  }
  return 0;
}

export { redis };
