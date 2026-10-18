import Redis from 'ioredis';

// In-Memory Redis Compatible Mock for zero-dependency local development and resilience
class MemoryRedisStore {
  private kv = new Map<string, { value: string; expiry?: number }>();
  private zsets = new Map<string, Map<string, number>>();

  async get(key: string): Promise<string | null> {
    const item = this.kv.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.kv.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiry: number | undefined;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    } else if (mode === 'PX' && duration) {
      expiry = Date.now() + duration;
    }
    this.kv.set(key, { value, expiry });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.kv.delete(key)) count++;
      if (this.zsets.delete(key)) count++;
    }
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = [...this.kv.keys(), ...this.zsets.keys()];
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return allKeys.filter((k) => regex.test(k));
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.zsets.has(key)) {
      this.zsets.set(key, new Map());
    }
    const zset = this.zsets.get(key)!;
    zset.set(member, score);
    return 1;
  }

  async zrevrange(key: string, start: number, stop: number, withScores?: string): Promise<string[]> {
    const zset = this.zsets.get(key);
    if (!zset) return [];

    const sorted = [...zset.entries()].sort((a, b) => b[1] - a[1]);
    const end = stop === -1 ? sorted.length : stop + 1;
    const slice = sorted.slice(start, end);

    if (withScores === 'WITHSCORES') {
      const result: string[] = [];
      for (const [member, score] of slice) {
        result.push(member, score.toString());
      }
      return result;
    }
    return slice.map(([member]) => member);
  }

  async zcard(key: string): Promise<number> {
    const zset = this.zsets.get(key);
    return zset ? zset.size : 0;
  }

  async zscore(key: string, member: string): Promise<string | null> {
    const zset = this.zsets.get(key);
    if (!zset || !zset.has(member)) return null;
    return zset.get(member)!.toString();
  }

  async flushdb(): Promise<'OK'> {
    this.kv.clear();
    this.zsets.clear();
    return 'OK';
  }

  async ping(): Promise<'PONG'> {
    return 'PONG';
  }
}

// Global singleton to prevent multiple connections during hot-reloads
const globalForRedis = global as unknown as {
  redisClientInstance?: any;
  isMemoryFallback?: boolean;
};

export function getRedisClient(): any {
  if (globalForRedis.redisClientInstance) {
    return globalForRedis.redisClientInstance;
  }

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
      });

      client.on('error', (err) => {
        console.warn('[Redis] Connection error, activating in-memory store:', err.message);
        globalForRedis.isMemoryFallback = true;
      });

      globalForRedis.redisClientInstance = client;
      globalForRedis.isMemoryFallback = false;
      return client;
    } catch (e) {
      console.warn('[Redis] Fallback to in-memory store');
    }
  }

  // Standalone in-memory fallback
  const memoryStore = new MemoryRedisStore();
  globalForRedis.redisClientInstance = memoryStore;
  globalForRedis.isMemoryFallback = true;
  return memoryStore;
}

export const redis = getRedisClient();

export function isRedisMemoryFallback(): boolean {
  return !!globalForRedis.isMemoryFallback;
}
