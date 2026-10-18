import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/authTokens';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing or malformed token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const result = verifyAccessToken(token);

    if (!result.valid || !result.payload) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { userId, email, name, role, avatarBg } = result.payload;

    // Authorization capabilities based on role
    const isSuperAdmin = role.toLowerCase().includes('admin');
    const isModerator = isSuperAdmin || role.toLowerCase().includes('mod') || role.toLowerCase().includes('guru');
    const isVerifiedReviewer = isModerator || role.toLowerCase().includes('reviewer') || role.toLowerCase().includes('verified');

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        role,
        avatarBg,
      },
      permissions: {
        canPostTopic: true,
        canComment: true,
        canModerate: isModerator,
        canPinTopic: isModerator,
        canDeleteComments: isModerator,
        canVerifyBenchmark: isVerifiedReviewer,
        isAdmin: isSuperAdmin,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication check failed' },
      { status: 500 }
    );
  }
}
