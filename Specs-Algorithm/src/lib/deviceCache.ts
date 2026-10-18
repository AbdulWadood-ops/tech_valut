import { redis } from './redis';
import { getDevicesDB } from './db';
import { Device, CursorPaginatedResponse } from './types';

const CACHE_TTL_SECONDS = 30;

export async function getDevicesWithCache(
  page = 1,
  limit = 50,
  search?: string,
  category?: string
): Promise<CursorPaginatedResponse<Device>> {
  const startTime = performance.now();
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(200, Math.max(1, limit));

  // If search/category filter is present, we include it in the cache key
  const cacheKey = `devices:page:${safePage}:limit:${safeLimit}:${search || 'all'}:${category || 'all'}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const latencyMs = Number((performance.now() - startTime).toFixed(2));
      return {
        ...parsed,
        source: 'redis-cache',
        latencyMs,
      };
    }
  } catch (err) {
    console.warn('[Cache] Read error:', err);
  }

  // Database Read (Simulating MongoDB .skip().limit().lean())
  const allDevices = getDevicesDB();
  let filtered = allDevices;

  if (category && category !== 'all') {
    filtered = filtered.filter((d) => d.category.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.brand.toLowerCase().includes(q) ||
        d.deviceId.toLowerCase().includes(q)
    );
  }

  const offset = (safePage - 1) * safeLimit;
  const paginatedDevices = filtered.slice(offset, offset + safeLimit);
  const nextCursor = paginatedDevices.length === safeLimit && (offset + safeLimit) < filtered.length
    ? paginatedDevices[paginatedDevices.length - 1].id
    : null;

  const resultPayload: CursorPaginatedResponse<Device> = {
    devices: paginatedDevices,
    nextCursor,
    totalCount: filtered.length,
    page: safePage,
    limit: safeLimit,
    source: 'database',
    latencyMs: Number((performance.now() - startTime).toFixed(2)),
  };

  // Cache in Redis with 30s TTL
  try {
    await redis.set(cacheKey, JSON.stringify(resultPayload), 'EX', CACHE_TTL_SECONDS);
  } catch (err) {
    console.warn('[Cache] Write error:', err);
  }

  return resultPayload;
}

export async function invalidateDeviceCache(): Promise<number> {
  try {
    const keys = await redis.keys('devices:page:*');
    if (keys && keys.length > 0) {
      await redis.del(...keys);
      return keys.length;
    }
  } catch (err) {
    console.warn('[Cache] Invalidation error:', err);
  }
  return 0;
}
