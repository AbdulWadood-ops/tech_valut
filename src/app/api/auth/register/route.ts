import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getMongoClientSafe, isMongoHealthy } from '@/lib/mongodb';
import { signAccessToken, generateRefreshToken } from '@/lib/authTokens';
import { saveSession } from '@/lib/sessionStore';

export const dynamic = 'force-dynamic';

// In-memory fallback user database
const inMemoryUsers: Map<string, any> = new Map();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'techvault_salt_2026').digest('hex');
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const colors = ['bg-emerald-500', 'bg-purple-600', 'bg-cyan-500', 'bg-blue-600', 'bg-amber-500', 'bg-rose-500'];
    const avatarBg = colors[Math.floor(Math.random() * colors.length)];
    const assignedRole = role || 'Verified Reviewer';

    const userId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      avatarBg,
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };

    // Save to MongoDB if healthy
    if (isMongoHealthy()) {
      try {
        const client = await getMongoClientSafe();
        if (client) {
          const db = client.db('appdb');
          const usersCol = db.collection('users');
          
          const existing = await usersCol.findOne({ email: cleanEmail });
          if (existing) {
            return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
          }

          await usersCol.insertOne(newUser);
        }
      } catch (err: any) {
        console.warn('[Auth Register MongoDB fallback]:', err.message);
      }
    }

    // Save to memory cache as fallback
    if (inMemoryUsers.has(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }
    inMemoryUsers.set(cleanEmail, newUser);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarBg: newUser.avatarBg,
      role: newUser.role,
      joinedAt: new Date().toLocaleDateString(),
    };

    // Generate Access & Refresh tokens
    const accessToken = signAccessToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
      avatarBg: safeUser.avatarBg,
    });

    const refreshToken = generateRefreshToken();

    // Persist session to MongoDB & memory
    const userAgent = request.headers.get('user-agent') || 'web-browser';
    const forwardedFor = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await saveSession(refreshToken, safeUser, userAgent, forwardedFor.split(',')[0]);

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      user: safeUser,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Registration failed' }, { status: 500 });
  }
}
