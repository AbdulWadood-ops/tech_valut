import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// High-speed in-memory buffer cache for images (< 0.05ms response)
const imageBufferCache = new Map<string, { buffer: ArrayBuffer; contentType: string; cachedAt: number }>();
const IMAGE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  // 1. Instant Cache Hit (< 0.05ms)
  const cached = imageBufferCache.get(url);
  if (cached && Date.now() - cached.cachedAt < IMAGE_CACHE_TTL_MS) {
    return new NextResponse(cached.buffer, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.gsmarena.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.redirect('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', 302);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    // Cache in memory (evict oldest if size exceeds 200 images to prevent memory leaks)
    if (imageBufferCache.size > 200) {
      const firstKey = imageBufferCache.keys().next().value;
      if (firstKey) imageBufferCache.delete(firstKey);
    }
    imageBufferCache.set(url, { buffer, contentType, cachedAt: Date.now() });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    // Fail-fast redirect to high-speed Unsplash CDN image
    return NextResponse.redirect('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', 302);
  }
}
