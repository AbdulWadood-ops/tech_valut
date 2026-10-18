import { NextResponse } from 'next/server';
import { revokeSession } from '@/lib/sessionStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken || request.headers.get('x-refresh-token');

    if (refreshToken) {
      await revokeSession(refreshToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out and session revoked successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
