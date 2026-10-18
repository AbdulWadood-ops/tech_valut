/**
 * High-Speed Cache-Aside Layer for Devices
 * 
 * In-memory caching for device queries to minimize database operations.
 */

import { getCache, setCache, invalidateDeviceCache } from './redis';

export { invalidateDeviceCache };

export interface DeviceQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

/**
 * Fetch devices with in-memory cache-aside strategy (60s TTL).
 * @param DeviceModel Mongoose model or DB query function
 */
export async function getDevicesWithCache<T>(
  DeviceModel: any,
  options: DeviceQueryOptions = {}
): Promise<{ devices: T[]; source: 'memory-cache' | 'mongodb'; latencyMs: number }> {
  const start = performance.now();
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(200, Math.max(1, options.limit || 50));
  const searchKey = options.search ? `:q:${encodeURIComponent(options.search)}` : '';
  const catKey = options.category ? `:cat:${encodeURIComponent(options.category)}` : '';

  const cacheKey = `devices:page:${page}:limit:${limit}${searchKey}${catKey}`;

  // 1. Try In-Memory cache
  const cached = await getCache<T[]>(cacheKey);
  if (cached) {
    return {
      devices: cached,
      source: 'memory-cache',
      latencyMs: Number((performance.now() - start).toFixed(2)),
    };
  }

  // 2. Query MongoDB
  const query: Record<string, any> = {};
  if (options.category && options.category !== 'all') {
    query.category = options.category;
  }
  if (options.search) {
    query.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { brand: { $regex: options.search, $options: 'i' } },
      { id: { $regex: options.search, $options: 'i' } },
    ];
  }

  let devices: T[] = [];
  if (typeof DeviceModel?.find === 'function') {
    devices = await DeviceModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  // 3. Populate Cache with 60s TTL
  if (devices.length > 0) {
    await setCache(cacheKey, devices, 60);
  }

  return {
    devices,
    source: 'mongodb',
    latencyMs: Number((performance.now() - start).toFixed(2)),
  };
}
