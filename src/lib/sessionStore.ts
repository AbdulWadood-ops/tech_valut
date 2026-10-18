import { getMongoClientSafe, isMongoHealthy } from './mongodb';
import { getRefreshTokenExpiryDate } from './authTokens';

export interface UserSession {
  refreshToken: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  avatarBg?: string;
  expiresAt: string; // ISO date
  createdAt: string; // ISO date
  revoked: boolean;
  userAgent?: string;
  ip?: string;
}

// In-memory fallback for high-speed local caching or when MongoDB is offline
const inMemorySessions: Map<string, UserSession> = new Map();

/**
 * Persist a session (refresh token) in MongoDB collection 'sessions' and in-memory map
 */
export async function saveSession(
  refreshToken: string,
  user: { id: string; email: string; name: string; role: string; avatarBg?: string },
  userAgent = 'web',
  ip = '127.0.0.1'
): Promise<UserSession> {
  const session: UserSession = {
    refreshToken,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarBg: user.avatarBg,
    expiresAt: getRefreshTokenExpiryDate().toISOString(),
    createdAt: new Date().toISOString(),
    revoked: false,
    userAgent,
    ip,
  };

  // 1. Save in memory for instant O(1) lookup
  inMemorySessions.set(refreshToken, session);

  // 2. Persist in MongoDB if healthy
  if (isMongoHealthy()) {
    try {
      const client = await getMongoClientSafe();
      if (client) {
        const db = client.db('appdb');
        const col = db.collection<UserSession>('sessions');
        await col.updateOne(
          { refreshToken },
          { $set: session },
          { upsert: true }
        );
      }
    } catch (err: any) {
      console.warn('[SessionStore saveSession MongoDB fallback]:', err.message);
    }
  }

  return session;
}

/**
 * Find and validate a refresh token session
 */
export async function getSession(refreshToken: string): Promise<UserSession | null> {
  if (!refreshToken) return null;

  // 1. Check in-memory first
  let session = inMemorySessions.get(refreshToken);

  // 2. If not found in memory, query MongoDB
  if (!session && isMongoHealthy()) {
    try {
      const client = await getMongoClientSafe();
      if (client) {
        const db = client.db('appdb');
        const col = db.collection<UserSession>('sessions');
        const doc = await col.findOne({ refreshToken });
        if (doc) {
          session = {
            refreshToken: doc.refreshToken,
            userId: doc.userId,
            email: doc.email,
            name: doc.name,
            role: doc.role,
            avatarBg: doc.avatarBg,
            expiresAt: doc.expiresAt,
            createdAt: doc.createdAt,
            revoked: doc.revoked,
            userAgent: doc.userAgent,
            ip: doc.ip,
          };
          // Cache back into memory
          inMemorySessions.set(refreshToken, session);
        }
      }
    } catch (err: any) {
      console.warn('[SessionStore getSession MongoDB fallback]:', err.message);
    }
  }

  if (!session) return null;

  // Validate revoked status
  if (session.revoked) {
    return null;
  }

  // Validate expiration
  const expTime = new Date(session.expiresAt).getTime();
  if (Date.now() > expTime) {
    return null;
  }

  return session;
}

/**
 * Revoke a refresh token on logout
 */
export async function revokeSession(refreshToken: string): Promise<boolean> {
  if (!refreshToken) return false;

  // 1. Remove/mark in memory
  const memSession = inMemorySessions.get(refreshToken);
  if (memSession) {
    memSession.revoked = true;
  }

  // 2. Mark revoked in MongoDB
  if (isMongoHealthy()) {
    try {
      const client = await getMongoClientSafe();
      if (client) {
        const db = client.db('appdb');
        const col = db.collection('sessions');
        await col.updateOne({ refreshToken }, { $set: { revoked: true } });
        return true;
      }
    } catch (err: any) {
      console.warn('[SessionStore revokeSession MongoDB fallback]:', err.message);
    }
  }

  return true;
}
