import { NextResponse } from 'next/server';
import { getSession, saveSession, revokeSession } from '@/lib/sessionStore';
import { signAccessToken, generateRefreshToken } from '@/lib/authTokens';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken || request.headers.get('x-refresh-token');

    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // 1. Verify session in MongoDB / in-memory store
    const session = await getSession(refreshToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid, expired, or revoked refresh token' },
        { status: 401 }
      );
    }

    // 2. Issue fresh Access Token
    const safeUser = {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      avatarBg: session.avatarBg || 'bg-purple-600',
    };

    const newAccessToken = signAccessToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
      avatarBg: safeUser.avatarBg,
    });

    // 3. Optional token rotation for maximum security
    const newRefreshToken = generateRefreshToken();
    const userAgent = request.headers.get('user-agent') || session.userAgent || 'web';
    const forwardedFor = request.headers.get('x-forwarded-for') || session.ip || '127.0.0.1';

    // Revoke old token and save new session
    await revokeSession(refreshToken);
    await saveSession(newRefreshToken, safeUser, userAgent, forwardedFor.split(',')[0]);

    return NextResponse.json({
      success: true,
      message: 'Tokens renewed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Token refresh failed' },
      { status: 500 }
    );
  }
}
