import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'techvault_super_secure_jwt_secret_key_2026_xyz!@#';
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  avatarBg?: string;
  iat?: number;
  exp?: number;
}

/**
 * Base64URL encode/decode helpers
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Sign a payload with HMAC-SHA256 to create a tamper-proof Access Token
 */
export function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const fullPayload: TokenPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ACCESS_TOKEN_EXPIRY_MS) / 1000),
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${dataToSign}.${signature}`;
}

/**
 * Verify and decode an Access Token
 */
export function verifyAccessToken(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token missing' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [headerB64, payloadB64, signature] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(dataToSign)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadB64));
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < nowSec) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification failed' };
  }
}

/**
 * Generate a cryptographically secure random Refresh Token
 */
export function generateRefreshToken(): string {
  return `rt_${crypto.randomBytes(40).toString('hex')}`;
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
}
