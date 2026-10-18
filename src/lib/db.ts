import type { Device, DeviceReview, NewsArticle } from '../data/devices';
import clientPromise, { getMongoClientSafe, isMongoHealthy } from './mongodb';
import { getCache, setCache, invalidateDeviceCache } from './redis';
import fs from 'fs';
import path from 'path';

export const normalizeBrandName = (brand: string): string =>
  brand.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Sanitize helper ─────────────────────────────────────────────────────────
/** Convert any value to a safe primitive (string/number/boolean/null) */
function toSafe(v: unknown): string | number | boolean | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
  if (typeof v === 'object') {
    if (v instanceof Date) return v.toISOString();
    const obj = v as Record<string, unknown>;
    const pick = obj.title ?? obj.name ?? obj.body ?? obj.value ?? obj.text;
    if (pick !== undefined) return String(pick);
    return JSON.stringify(v);
  }
  return String(v);
}

export function normalizeCategory(category?: string, name?: string): 'mobiles' | 'tablets' | 'watches' | 'earbuds' | 'laptops' {
  const cat = (category || '').toLowerCase().trim();
  if (cat === 'tablets' || cat === 'tablet' || cat === 'pad') return 'tablets';
  if (cat === 'watches' || cat === 'watch' || cat === 'smartwatch' || cat === 'wearable' || cat === 'wearables') return 'watches';
  if (cat === 'earbuds' || cat === 'audio' || cat === 'headphones' || cat === 'earphones') return 'earbuds';
  if (cat === 'laptops' || cat === 'laptop' || cat === 'notebook' || cat === 'notebooks') return 'laptops';
  if (cat === 'mobiles' || cat === 'mobile' || cat === 'phone' || cat === 'phones' || cat === 'smartphone' || cat === 'smartphones') return 'mobiles';

  // Fallback heuristic based on device name
  if (name) {
    const n = name.toLowerCase();
    if (/\b(ipad|tablet|galaxy tab|mediapad|pad \d|pad pro|pad air)\b/i.test(n)) return 'tablets';
    if (/\b(watch|band \d|galaxy watch|apple watch|fitbit)\b/i.test(n)) return 'watches';
    if (/\b(buds|airpods|earbuds|headphones|earphones)\b/i.test(n)) return 'earbuds';
    if (/\b(macbook|chromebook|thinkpad|zenbook|laptop|notebook)\b/i.test(n)) return 'laptops';
  }

  return 'mobiles';
}

export function formatCategoryLabel(cat?: string): string {
  if (!cat) return 'Phone';
  const c = cat.toLowerCase().trim();
  if (c === 'mobiles' || c === 'mobile' || c === 'phone' || c === 'phones') return 'Phone';
  if (c === 'tablets' || c === 'tablet') return 'Tablet';
  if (c === 'watches' || c === 'watch') return 'Smartwatch';
  if (c === 'earbuds' || c === 'audio') return 'Earbuds';
  if (c === 'laptops' || c === 'laptop') return 'Laptop';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function sanitizeDevice(d: any): Device {
  const specs: any = {};
  if (d.specs && typeof d.specs === 'object') {
    for (const [k, v] of Object.entries(d.specs)) {
      specs[k] = toSafe(v);
    }
  }
  const perf: any = {};
  if (d.performance && typeof d.performance === 'object') {
    for (const [k, v] of Object.entries(d.performance)) {
      perf[k] = typeof v === 'object' && v !== null ? toSafe(v) : v;
    }
  }
  return {
    id:          String(d.id   ?? ''),
    name:        String(d.name  ?? ''),
    brand:       String((d.brand || 'Unknown')).trim(),
    category:    normalizeCategory(d.category, d.name),
    image:       String(d.image  ?? ''),
    price:       String(d.price  ?? ''),
    rating:      Number(d.rating ?? 0),
    description: d.description ? String(d.description) : undefined,
    specs,
    performance: perf,
    buyUrl:      d.buyUrl || d.buyLink || d.buy_url || d.buy_link ? String(d.buyUrl || d.buyLink || d.buy_url || d.buy_link) : undefined,
    buyLinks:    d.buyLinks ? d.buyLinks : undefined,
  } as Device;
}

// ─── Release Date Parser ────────────────────────────────────────────────────
export function parseReleaseDate(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const yearMatch = dateStr.match(/\b(19\d\d|20\d\d)\b/);
  if (!yearMatch) return 0;
  const year = parseInt(yearMatch[1], 10);

  const months: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    q1: 2, q2: 5, q3: 8, q4: 11
  };

  const lower = dateStr.toLowerCase();
  let month = 1;
  for (const [mName, mNum] of Object.entries(months)) {
    if (lower.includes(mName)) {
      month = mNum;
      break;
    }
  }

  return year * 100 + month;
}

// ─── In-process cache (survives HMR reloads in dev) ──────────────────────────
const globalForDb = globalThis as unknown as {
  cachedDevices:          Device[] | null;
  cachedBrands:           string[] | null;
  cachedDevicesMap:       Map<string, Device>;
  cachedDevicesByBrandMap: Map<string, Device[]>;
  cachedDevicesByCategoryMap: Map<string, Device[]>;
  fetchPromise:           Promise<Device[]> | null;
  cachedReviewsMap:       Map<string, DeviceReview>;
  cacheTimestamp:         number;
};

if (!globalForDb.cacheTimestamp) {
  globalForDb.cachedDevices          = null;
  globalForDb.cachedBrands           = null;
  globalForDb.cachedDevicesMap       = new Map();
  globalForDb.cachedDevicesByBrandMap = new Map();
  globalForDb.cachedDevicesByCategoryMap = new Map();
  globalForDb.fetchPromise           = null;
  globalForDb.cachedReviewsMap       = new Map();
  globalForDb.cacheTimestamp         = 0;
}

// Cache TTL: 6 hours in ms
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const isCacheValid = () =>
  globalForDb.cachedDevices !== null &&
  globalForDb.cachedDevices.length > 0 &&
  Date.now() - globalForDb.cacheTimestamp < CACHE_TTL_MS;

function indexDevices(devices: Device[]) {
  const devMap = new Map<string, Device>();
  const brandMap = new Map<string, Device[]>();
  const catMap = new Map<string, Device[]>();
  for (const d of devices) {
    devMap.set(d.id, d);
    const bSlug = normalizeBrandName(d.brand);
    const list = brandMap.get(bSlug);
    if (list) {
      list.push(d);
    } else {
      brandMap.set(bSlug, [d]);
    }

    const cat = d.category || 'mobiles';
    const cList = catMap.get(cat);
    if (cList) {
      cList.push(d);
    } else {
      catMap.set(cat, [d]);
    }
  }
  globalForDb.cachedDevicesMap = devMap;
  globalForDb.cachedDevicesByBrandMap = brandMap;
  globalForDb.cachedDevicesByCategoryMap = catMap;
}

// ─── getDevices ───────────────────────────────────────────────────────────────
// ─── Local Dataset Fallback ──────────────────────────────────────────────────
function loadDevicesFromLocalFiles(): Device[] {
  try {
    let brandsDir = path.join(process.cwd(), 'src', 'data', 'brands');
    if (!fs.existsSync(brandsDir)) {
      brandsDir = path.join(process.cwd(), 'Specs-Algorithm', 'brands');
    }
    if (fs.existsSync(brandsDir)) {
      const files = fs.readdirSync(brandsDir).filter(f => f.endsWith('.json'));
      const all: Device[] = [];
      for (const f of files) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(brandsDir, f), 'utf-8'));
          if (Array.isArray(content)) {
            for (const item of content) {
              all.push(sanitizeDevice(item));
            }
          }
        } catch {}
      }
      if (all.length > 0) {
        return all;
      }
    }
  } catch (e: any) {
    console.error('[Data Layer] Error loading dataset:', e.message);
  }
  return [];
}

function getEagerDevices(): Device[] {
  if (globalForDb.cachedDevices && globalForDb.cachedDevices.length > 0) {
    return globalForDb.cachedDevices;
  }
  const local = loadDevicesFromLocalFiles();
  if (local.length > 0) {
    globalForDb.cachedDevices = local;
    globalForDb.cacheTimestamp = Date.now();
    globalForDb.cachedBrands = Array.from(new Set(local.map(d => d.brand))).sort((a, b) => a.localeCompare(b));
    indexDevices(local);
    return local;
  }
  return [];
}

// ─── getDevices ───────────────────────────────────────────────────────────────
/**
 * Fetch all devices directly from MongoDB Atlas collection `devices-specs` with in-memory caching.
 * Gracefully falls back to the dataset if Atlas is unreachable or timing out.
 */
export const getDevices = async (): Promise<Device[]> => {
  if (isCacheValid()) return globalForDb.cachedDevices!;

  const eager = getEagerDevices();
  if (eager.length > 0) {
    // If we have eager devices loaded from disk, return them immediately without waiting!
    // Trigger non-blocking background sync only if MongoDB circuit is healthy
    if (isMongoHealthy() && !globalForDb.fetchPromise) {
      globalForDb.fetchPromise = (async () => {
        try {
          const client = await getMongoClientSafe();
          if (!client) return eager;
          const db = client.db('appdb');

          const mongoDevices = await db
            .collection<Device>('devices-specs')
            .find({})
            .project({ _id: 0, rawSpecs: 0 })
            .toArray();

          if (mongoDevices?.length) {
            const cleaned = mongoDevices.map((d: any) => sanitizeDevice(d));
            console.log(`[MongoDB Atlas] Loaded ${cleaned.length} devices from 'devices-specs'.`);
            globalForDb.cachedDevices = cleaned;
            globalForDb.cacheTimestamp = Date.now();
            globalForDb.cachedBrands = Array.from(new Set(cleaned.map(d => d.brand))).sort((a, b) => a.localeCompare(b));
            return cleaned;
          }
        } catch (err: any) {
          console.warn('[MongoDB Atlas] Background sync notice:', err.message);
        }
        return eager;
      })().finally(() => {
        globalForDb.fetchPromise = null;
      });
    }
    return eager;
  }

  // If no local files found, try MongoDB safely
  if (isMongoHealthy()) {
    try {
      const client = await getMongoClientSafe();
      if (client) {
        const db = client.db('appdb');
        const mongoDevices = await db
          .collection<Device>('devices-specs')
          .find({})
          .project({ _id: 0, rawSpecs: 0 })
          .toArray();
        if (mongoDevices?.length) {
          const cleaned = mongoDevices.map((d: any) => sanitizeDevice(d));
          globalForDb.cachedDevices = cleaned;
          globalForDb.cacheTimestamp = Date.now();
          return cleaned;
        }
      }
    } catch {}
  }

  return [];
};

// ─── Paginated Device Fetching ────────────────────────────────────────────────
export interface PaginationOptions {
  brand?: string;
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface PaginatedResult {
  devices: Device[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  brandName?: string;
}

/**
 * Paginated device query with Redis caching layer
 * Cache key pattern: devices:{brand}:page:{page} (or devices:all:page:{page})
 * Default limit: 45 per page
 */
export const getPaginatedDevices = async (options: PaginationOptions = {}): Promise<PaginatedResult> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 45);
  const brandParam = options.brand?.trim();
  const isAll = !brandParam || brandParam.toLowerCase() === 'all';
  const brandSlug = isAll ? 'all' : normalizeBrandName(brandParam!);
  const category = options.category?.trim();
  const search = options.search?.trim().toLowerCase();

  // Construct cache key
  let cacheKey = `devices:${brandSlug}:page:${page}`;
  if (limit !== 45) cacheKey += `:lim:${limit}`;
  if (category) cacheKey += `:cat:${category}`;
  if (search) cacheKey += `:q:${search}`;

  // Check Redis / In-Memory Cache first (< 0.1ms)
  const cached = await getCache<PaginatedResult>(cacheKey);
  if (cached) {
    return cached;
  }

  let matchedDevices: Device[] = [];
  let brandName = brandParam;

  // Optimized fetch: if specific brand requested, try fast in-memory indexed cache first (< 0.005ms)
  if (!isAll && brandSlug) {
    getEagerDevices();
    if (globalForDb.cachedDevicesByBrandMap && globalForDb.cachedDevicesByBrandMap.has(brandSlug)) {
      matchedDevices = globalForDb.cachedDevicesByBrandMap.get(brandSlug)!;
      brandName = matchedDevices[0]?.brand || brandParam;
    } else {
      // 1. Fast local brand file load (< 0.5ms)
      try {
        let filePath = path.join(process.cwd(), 'src', 'data', 'brands', `${brandSlug}.json`);
        if (!fs.existsSync(filePath)) {
          filePath = path.join(process.cwd(), 'Specs-Algorithm', 'brands', `${brandSlug}.json`);
        }
        if (fs.existsSync(filePath)) {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (Array.isArray(content) && content.length > 0) {
            matchedDevices = content.map(d => sanitizeDevice(d));
            brandName = matchedDevices[0]?.brand || brandParam;
            // Index brand devices into device map
            for (const d of matchedDevices) {
              globalForDb.cachedDevicesMap.set(d.id, d);
            }
            globalForDb.cachedDevicesByBrandMap.set(brandSlug, matchedDevices);
          }
        }
      } catch {}
    }

    // 2. Only if local file not found, try MongoDB safely
    if (matchedDevices.length === 0 && isMongoHealthy()) {
      try {
        const client = await getMongoClientSafe();
        if (client) {
          const db = client.db('appdb');
          const regex = new RegExp(`^${brandParam}$`, 'i');
          const mongoBrand = await db
            .collection<Device>('devices-specs')
            .find({ brand: regex })
            .project({ _id: 0, rawSpecs: 0 })
            .toArray();

          if (mongoBrand.length > 0) {
            matchedDevices = mongoBrand.map(d => sanitizeDevice(d));
            brandName = matchedDevices[0]?.brand || brandParam;
          }
        }
      } catch {}
    }
  }

  // Fallback to searching entire catalog if not resolved yet
  if (isAll || matchedDevices.length === 0) {
    if (isAll && category && globalForDb.cachedDevicesByCategoryMap?.has(category)) {
      matchedDevices = globalForDb.cachedDevicesByCategoryMap.get(category)!;
    } else {
      const all = await getDevices();
      matchedDevices = all;

      if (!isAll && brandSlug) {
        matchedDevices = matchedDevices.filter(d =>
          normalizeBrandName(d.brand) === brandSlug ||
          d.brand.toLowerCase() === brandParam!.toLowerCase()
        );
        if (matchedDevices.length > 0) {
          brandName = matchedDevices[0]?.brand || brandParam;
        }
      }

      // Filter category
      if (category) {
        matchedDevices = matchedDevices.filter(d => d.category === category);
      }
    }
  } else if (category) {
    matchedDevices = matchedDevices.filter(d => d.category === category);
  }

  // Filter search
  if (search) {
    matchedDevices = matchedDevices.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.brand.toLowerCase().includes(search)
    );
  }

  // Sort: prioritize newer devices
  matchedDevices.sort((a, b) => {
    const dateA = parseReleaseDate(a.specs?.releaseDate);
    const dateB = parseReleaseDate(b.specs?.releaseDate);
    if (dateA !== dateB) return dateB - dateA;
    return (b.rating || 0) - (a.rating || 0);
  });

  const total = matchedDevices.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const pagedDevices = matchedDevices.slice(start, start + limit);

  const result: PaginatedResult = {
    devices: pagedDevices,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    brandName,
  };

  // Cache paginated result in Redis (TTL: 1 hour = 3600 seconds)
  await setCache(cacheKey, result, 3600);

  return result;
};

// ─── Homepage: Newest Devices Across All Brands ─────────────────────────────
/**
 * Fetches the newest devices across all brands, sorted chronologically descending.
 * Cached in Redis under 'devices:latest' with shorter TTL (5 minutes = 300s).
 */
export const getLatestDevices = async (limit = 45): Promise<Device[]> => {
  const cacheKey = `devices:latest:limit:${limit}`;
  const cached = await getCache<Device[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  // High-Speed Targeted Load: Load top flagship brands instead of scanning all 133 files (< 15ms cold start)
  const topFlagshipBrands = ['samsung', 'apple', 'google', 'xiaomi', 'oneplus', 'vivo', 'oppo', 'honor', 'motorola', 'realme'];
  let pool: Device[] = [];

  for (const b of topFlagshipBrands) {
    if (globalForDb.cachedDevicesByBrandMap && globalForDb.cachedDevicesByBrandMap.has(b)) {
      pool.push(...globalForDb.cachedDevicesByBrandMap.get(b)!);
    } else {
      try {
        let filePath = path.join(process.cwd(), 'src', 'data', 'brands', `${b}.json`);
        if (!fs.existsSync(filePath)) {
          filePath = path.join(process.cwd(), 'Specs-Algorithm', 'brands', `${b}.json`);
        }
        if (fs.existsSync(filePath)) {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (Array.isArray(content)) {
            const sanitizedList = content.map(d => sanitizeDevice(d));
            for (const d of sanitizedList) {
              globalForDb.cachedDevicesMap.set(d.id, d);
            }
            globalForDb.cachedDevicesByBrandMap.set(b, sanitizedList);
            pool.push(...sanitizedList);
          }
        }
      } catch {}
    }
  }

  // Sort chronologically descending (newest devices first)
  pool.sort((a, b) => {
    const dateA = parseReleaseDate(a.specs?.releaseDate);
    const dateB = parseReleaseDate(b.specs?.releaseDate);
    if (dateA !== dateB) return dateB - dateA;
    return (b.rating || 0) - (a.rating || 0);
  });

  const latest = pool.slice(0, limit);
  await setCache(cacheKey, latest, 3600); // 1-hour cache
  return latest;
};

export const getDeviceById = async (id: string): Promise<Device | undefined> => {
  if (!id) return undefined;

  // 1. Instant O(1) in-memory indexed hash map lookup (< 0.005ms)
  if (globalForDb.cachedDevicesMap && globalForDb.cachedDevicesMap.has(id)) {
    return globalForDb.cachedDevicesMap.get(id);
  }

  // 2. Direct single-brand JSON lookup based on id prefix (< 1.5ms)
  // E.g. "samsung-galaxy-s24-ultra" -> load only "samsung.json" (avoids 133 files!)
  const brandPrefix = id.split('-')[0]?.toLowerCase();
  if (brandPrefix) {
    try {
      let filePath = path.join(process.cwd(), 'src', 'data', 'brands', `${brandPrefix}.json`);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), 'Specs-Algorithm', 'brands', `${brandPrefix}.json`);
      }
      if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(content)) {
          let foundDevice: Device | undefined = undefined;
          for (const item of content) {
            const sanitized = sanitizeDevice(item);
            globalForDb.cachedDevicesMap.set(sanitized.id, sanitized);
            if (sanitized.id === id) foundDevice = sanitized;
          }
          if (foundDevice) return foundDevice;
        }
      }
    } catch {}
  }

  // 3. Fallback: Search in eager devices only if brand prefix didn't match
  const eager = getEagerDevices();
  if (eager.length > 0) {
    const found = eager.find(d => d.id === id);
    if (found) return found;
  }

  // 4. Fallback: MongoDB Atlas safe query (< 350ms fail-fast)
  if (isMongoHealthy()) {
    try {
      const client = await getMongoClientSafe();
      if (client) {
        const db = client.db('appdb');
        const doc = await db.collection('devices-specs').findOne({ id }, { projection: { _id: 0, rawSpecs: 0 } });
        if (doc) {
          const sanitized = sanitizeDevice(doc);
          globalForDb.cachedDevicesMap.set(sanitized.id, sanitized);
          return sanitized;
        }
      }
    } catch (e) {
      console.error(`[MongoDB Atlas] Error querying device ${id}:`, e);
    }
  }

  return undefined;
};

export interface BrandStat {
  brand: string;
  total: number;
  categories: string[];
}

export const getBrandStats = async (): Promise<BrandStat[]> => {
  const all = await getDevices();
  const stats: Record<string, { total: number; categories: Set<string> }> = {};
  for (const d of all) {
    if (!d.brand) continue;
    const b = d.brand.trim();
    if (!stats[b]) {
      stats[b] = { total: 0, categories: new Set() };
    }
    stats[b].total += 1;
    if (d.category) stats[b].categories.add(d.category);
  }
  return Object.entries(stats)
    .map(([brand, data]) => ({
      brand,
      total: data.total,
      categories: Array.from(data.categories),
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
};

export const getBrands = async (): Promise<string[]> => {
  if (globalForDb.cachedBrands?.length) return globalForDb.cachedBrands;
  const all    = await getDevices();
  const sorted = Array.from(new Set(all.map(d => d.brand))).sort((a, b) => a.localeCompare(b));
  globalForDb.cachedBrands = sorted;
  return sorted;
};

// ─── Write helpers with Redis Cache Invalidation ─────────────────────────────
// ─── Write helpers with Redis Cache Invalidation ─────────────────────────────
export const addDevice = async (device: Device): Promise<boolean> => {
  if (!device.brand || !device.id) return false;
  try {
    const client = await getMongoClientSafe();
    if (client) {
      const db = client.db('appdb');
      await db.collection('devices-specs').insertOne(device);
      const slug = device.brand.toLowerCase().trim().replace(/\s+/g, '_');
      await db.collection(`${slug}_devices`).insertOne(device);
    }

    // Invalidate local in-process cache
    globalForDb.cachedDevices = null;
    globalForDb.cachedBrands  = null;
    globalForDb.cacheTimestamp = 0;

    // Invalidate Redis cache for this brand and global pages
    await invalidateDeviceCache(device.brand);

    return true;
  } catch (e) {
    console.error('[MongoDB] Error adding device:', e);
    return false;
  }
};

export const updateDevice = async (id: string, updatedDevice: Device): Promise<boolean> => {
  try {
    const client = await getMongoClientSafe();
    if (client) {
      const db = client.db('appdb');
      await db.collection('devices-specs').updateOne({ id }, { $set: updatedDevice });
    }

    globalForDb.cachedDevices  = null;
    globalForDb.cachedBrands   = null;
    globalForDb.cacheTimestamp = 0;

    // Invalidate Redis cache
    await invalidateDeviceCache(updatedDevice.brand);

    return true;
  } catch (e) {
    console.error('[MongoDB] Error updating device:', e);
    return false;
  }
};

export const deleteDevice = async (id: string, brand?: string): Promise<boolean> => {
  try {
    const client = await getMongoClientSafe();
    if (client) {
      const db = client.db('appdb');
      await db.collection('devices-specs').deleteOne({ id });
    }

    globalForDb.cachedDevices  = null;
    globalForDb.cachedBrands   = null;
    globalForDb.cacheTimestamp = 0;

    // Invalidate Redis cache
    await invalidateDeviceCache(brand);

    return true;
  } catch (e) {
    console.error('[MongoDB] Error deleting device:', e);
    return false;
  }
};

// ─── News ─────────────────────────────────────────────────────────────────────
export const getNews = async (options?: {
  type?:     'news' | 'review';
  deviceId?: string;
  search?:   string;
  limit?:    number;
}): Promise<NewsArticle[]> => {
  if (!isMongoHealthy()) return [];
  try {
    const client = await getMongoClientSafe();
    if (!client) return [];
    const db      = client.db('appdb');
    const newsCol = db.collection<NewsArticle>('news');

    const filter: any = {};
    if (options?.type)     filter.type     = options.type;
    if (options?.deviceId) filter.deviceId = options.deviceId;
    if (options?.search)   filter.title    = { $regex: options.search, $options: 'i' };

    const query = newsCol.find(filter).sort({ publishedAt: -1 });
    if (options?.limit) query.limit(options.limit);

    const articles = await query.toArray();
    return articles.map(({ _id, ...rest }: any) => rest) as NewsArticle[];
  } catch {
    return [];
  }
};

export const getNewsByDeviceId = async (deviceId: string, limit = 6): Promise<NewsArticle[]> =>
  getNews({ deviceId, limit });

// ─── Device Reviews ───────────────────────────────────────────────────────────
export const getDeviceReviews = async (deviceId: string, brand?: string): Promise<DeviceReview | null> => {
  if (!deviceId) return null;

  // 1. In-process cache check (< 0.05ms)
  if (globalForDb.cachedReviewsMap.has(deviceId)) {
    return globalForDb.cachedReviewsMap.get(deviceId)!;
  }

  // 2. High-speed local fallback from src/data/reviews/*.json (< 0.5ms)
  try {
    let reviewsDir = path.join(process.cwd(), 'src', 'data', 'reviews');
    if (!fs.existsSync(reviewsDir)) {
      reviewsDir = path.join(process.cwd(), 'Specs-Algorithm', 'src', 'data', 'reviews');
    }

    if (fs.existsSync(reviewsDir)) {
      const targetBrands: string[] = [];
      if (brand) {
        targetBrands.push(normalizeBrandName(brand));
      }
      const firstSlug = deviceId.split('-')[0]?.toLowerCase();
      if (firstSlug && !targetBrands.includes(firstSlug)) {
        targetBrands.push(firstSlug);
      }

      for (const bSlug of targetBrands) {
        const filePath = path.join(reviewsDir, `${bSlug}-reviews.json`);
        if (fs.existsSync(filePath)) {
          const list: DeviceReview[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (Array.isArray(list)) {
            const cleanTarget = deviceId.toLowerCase().replace(/[^a-z0-9]+/g, '');
            const found = list.find((r) => {
              if (r.id === deviceId) return true;
              const cleanId = (r.id || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
              if (cleanId === cleanTarget) return true;
              if (r.name && cleanTarget.includes(r.name.toLowerCase().replace(/[^a-z0-9]+/g, ''))) return true;
              return false;
            });

            if (found) {
              globalForDb.cachedReviewsMap.set(deviceId, found);
              return found;
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error(`[Data Layer] Error loading reviews for ${deviceId}:`, err.message);
  }

  // 3. Only if not found locally, query MongoDB Atlas safely
  if (isMongoHealthy()) {
    try {
      const client = await getMongoClientSafe();
      if (client) {
        const db = client.db('appdb');
        const doc = await db
          .collection<DeviceReview>('devices-reviews')
          .findOne({ id: deviceId }, { projection: { _id: 0 } });
        if (doc) {
          const reviewObj = doc as unknown as DeviceReview;
          globalForDb.cachedReviewsMap.set(deviceId, reviewObj);
          return reviewObj;
        }
      }
    } catch {}
  }

  return null;
};
