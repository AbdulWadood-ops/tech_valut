import { NextResponse } from 'next/server';
import { getNews } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const deviceId = searchParams.get('deviceId') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    let type: 'news' | 'review' | undefined = undefined;
    if (typeParam === 'news' || typeParam === 'review') {
      type = typeParam;
    }

    const articles = await getNews({ type, deviceId, search, limit });

    return NextResponse.json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}
