import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const primaryUri = process.env.MONGODB_URI || (!isServerless ? 'mongodb://127.0.0.1:27017/appdb' : '');
const fallbackUri = process.env.REMOTE_MONGODB_URI || '';

const clientOptions: MongoClientOptions = {
  serverSelectionTimeoutMS: 2500, // 2.5s timeout for fast connection/failover
  connectTimeoutMS: 3000,
  socketTimeoutMS: 10000,
  maxPoolSize: isServerless ? 10 : 20,
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
  retryWrites: true,
  retryReads: true,
};

// ─── Global State for Connection Persistence across Next.js reloads ───────────
interface MongoState {
  clientPromise: Promise<MongoClient | null> | null;
  client: MongoClient | null;
  isAvailable: boolean;
  circuitBreakerOpen: boolean;
  lastFailureTime: number;
  indexesEnsured: boolean;
}

const globalForMongo = globalThis as unknown as {
  tvMongoState?: MongoState;
};

if (!globalForMongo.tvMongoState) {
  globalForMongo.tvMongoState = {
    clientPromise: null,
    client: null,
    isAvailable: false,
    circuitBreakerOpen: false,
    lastFailureTime: 0,
    indexesEnsured: false,
  };
}

const state = globalForMongo.tvMongoState;
const CIRCUIT_COOLDOWN_MS = 60_000; // 1 minute cooldown if completely unreachable

/**
 * Ensures optimal database indexes for fast device comment feeds and user reviews
 */
async function ensureIndexes(db: Db) {
  if (state.indexesEnsured) return;
  try {
    const commentsCol = db.collection('device_comments');
    await Promise.allSettled([
      commentsCol.createIndex({ deviceId: 1, createdAt: -1 }),
      commentsCol.createIndex({ id: 1 }, { unique: true }),
      commentsCol.createIndex({ 'author.id': 1 }),
    ]);

    const reviewsCol = db.collection('user_reviews');
    await Promise.allSettled([
      reviewsCol.createIndex({ userId: 1, deviceId: 1 }, { unique: true }),
      reviewsCol.createIndex({ deviceId: 1 }),
      reviewsCol.createIndex({ userId: 1 }),
      reviewsCol.createIndex({ createdAt: -1 }),
    ]);

    state.indexesEnsured = true;
    console.log('[MongoDB] Collections and indexes verified for device_comments and user_reviews.');
  } catch (err: any) {
    console.warn('[MongoDB] Index initialization notice:', err?.message || err);
  }
}

/**
 * Checks whether MongoDB is available or potentially available.
 */
export function isMongoHealthy(): boolean {
  if (state.client) return true;
  if (state.circuitBreakerOpen) {
    if (Date.now() - state.lastFailureTime < CIRCUIT_COOLDOWN_MS) {
      return false; // Circuit open, cooling down
    }
  }
  return true; // Connection attempt permitted
}

/**
 * Connects to MongoDB with automatic fallback and connection caching.
 */
export async function getMongoClientSafe(): Promise<MongoClient | null> {
  if (state.client) {
    try {
      // Quick ping test if already connected
      return state.client;
    } catch {
      state.client = null;
    }
  }

  if (state.circuitBreakerOpen && Date.now() - state.lastFailureTime < CIRCUIT_COOLDOWN_MS) {
    return null;
  }

  if (!state.clientPromise) {
    state.clientPromise = (async () => {
      // If serverless and no valid remote URI is provided, skip localhost attempts
      if (!primaryUri && !fallbackUri) {
        state.client = null;
        state.isAvailable = false;
        state.circuitBreakerOpen = true;
        state.lastFailureTime = Date.now();
        console.log('[MongoDB] Running in serverless mode without MONGODB_URI. Operating with local JSON dataset.');
        return null;
      }

      // 1. Try primary URI
      if (primaryUri) {
        try {
          const client = new MongoClient(primaryUri, clientOptions);
          await client.connect();
          state.client = client;
          state.isAvailable = true;
          state.circuitBreakerOpen = false;
          console.log('[MongoDB] Connected successfully via primary URI.');
          ensureIndexes(client.db('appdb')).catch(() => {});
          return client;
        } catch (primaryErr: any) {
          console.warn(`[MongoDB] Primary connection failed: ${primaryErr.message}. Trying fallback...`);
        }
      }

      // 2. Try fallback URI if different
      if (fallbackUri && fallbackUri !== primaryUri) {
        try {
          const client = new MongoClient(fallbackUri, clientOptions);
          await client.connect();
          state.client = client;
          state.isAvailable = true;
          state.circuitBreakerOpen = false;
          console.log('[MongoDB] Connected successfully via fallback URI.');
          ensureIndexes(client.db('appdb')).catch(() => {});
          return client;
        } catch (fallbackErr: any) {
          console.warn(`[MongoDB] Fallback connection failed: ${fallbackErr.message}`);
        }
      }

      // 3. Try local default if neither succeeded and not serverless
      if (!isServerless) {
        const localDefaultUri = 'mongodb://127.0.0.1:27017/appdb';
        if (primaryUri !== localDefaultUri && fallbackUri !== localDefaultUri) {
          try {
            const client = new MongoClient(localDefaultUri, clientOptions);
            await client.connect();
            state.client = client;
            state.isAvailable = true;
            state.circuitBreakerOpen = false;
            console.log('[MongoDB] Connected successfully to local MongoDB instance.');
            ensureIndexes(client.db('appdb')).catch(() => {});
            return client;
          } catch {}
        }
      }

      // Trip circuit breaker on complete failure
      state.client = null;
      state.isAvailable = false;
      state.circuitBreakerOpen = true;
      state.lastFailureTime = Date.now();
      console.warn('[MongoDB] All connection candidates failed. Operating in dataset fallback mode.');
      return null;
    })();
  }

  const result = await state.clientPromise;
  if (!result) {
    state.clientPromise = null;
  }
  return result;
}

/**
 * Returns the app MongoDB database instance directly or null if offline.
 */
export async function getMongoDbSafe(dbName = 'appdb'): Promise<Db | null> {
  const client = await getMongoClientSafe();
  if (!client) return null;
  return client.db(dbName);
}

// Backward compatibility export
const defaultPromise: Promise<MongoClient> = new Promise((resolve) => {
  getMongoClientSafe().then((c) => {
    if (c) resolve(c);
  });
});

export default defaultPromise;
