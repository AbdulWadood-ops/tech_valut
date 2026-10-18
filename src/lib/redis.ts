/**
 * High-Speed In-Memory Cache Layer
 * 
 * Zero external dependencies (No Redis / No network latency).
 * Provides sub-millisecond caching with TTL expiration and automatic cleanup.
 */

interface CacheEntry {
  data: string;
  expiresAt: number;
}

const globalForCache = globalThis as unknown as {
  tvMemoryStore?: Map<string, CacheEntry>;
  tvRankedStore?: Array<{ rank: number; deviceId: string; score: number }>;
};

if (!globalForCache.tvMemoryStore) {
  globalForCache.tvMemoryStore = new Map<string, CacheEntry>();
}
const memoryStore = globalForCache.tvMemoryStore;

/**
 * Get value from in-memory cache (< 0.05ms)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }

  try {
    return JSON.parse(entry.data) as T;
  } catch {
    memoryStore.delete(key);
    return null;
  }
}

/**
 * Set value in in-memory cache with TTL in seconds
 */
export async function setCache(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    memoryStore.set(key, {
      data: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // Limit memory store to 3000 entries to prevent memory overflow
    if (memoryStore.size > 3000) {
      const firstKey = memoryStore.keys().next().value;
      if (firstKey) memoryStore.delete(firstKey);
    }
  } catch {
    // Serialization error safeguard
  }
}

/**
 * Invalidate cache keys matching pattern
 * e.g., 'devices:samsung:*', 'devices:all:*', or 'devices:latest'
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of Array.from(memoryStore.keys())) {
    if (regex.test(key)) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Invalidate all page caches for a given brand, global all-devices pages, and latest homepage devices
 */
export async function invalidateDeviceCache(brand?: string): Promise<void> {
  const patterns: string[] = ['devices:latest:*', 'devices:all:page:*'];
  if (brand) {
    const normalized = brand.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    patterns.push(`devices:${normalized}:page:*`);
    patterns.push(`devices:${brand.toLowerCase()}:page:*`);
  } else {
    patterns.push('devices:*:page:*');
  }

  await Promise.all(patterns.map(p => invalidateCachePattern(p)));
}

/**
 * Clear the entire in-memory cache
 */
export async function clearCache(): Promise<void> {
  memoryStore.clear();
}

/**
 * Diagnostic health check for cache system
 */
export async function checkRedisHealth(): Promise<{
  available: boolean;
  provider: 'memory';
  cachedItemsCount: number;
  message: string;
}> {
  return {
    available: true,
    provider: 'memory',
    cachedItemsCount: memoryStore.size,
    message: 'High-speed in-memory cache active (0ms network latency).',
  };
}
