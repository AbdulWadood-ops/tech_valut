import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { getMongoClientSafe } from '../../../lib/mongodb';
import { getDevices } from '../../../lib/db';
import type { NewsArticle, Device } from '../../../data/devices';

export const dynamic = 'force-dynamic';

// Initialize RSS Parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

// Target RSS Feed Sources
const FEED_SOURCES = [
  {
    name: 'GSMArena',
    url: 'https://www.gsmarena.com/rss-news-reviews.php3'
  },
  {
    name: 'Android Authority',
    url: 'https://www.androidauthority.com/feed/'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml'
  }
];

// Keywords to filter relevant phone launch & review articles
const RELEVANT_KEYWORDS = [
  'launch', 'launched', 'review', 'unveil', 'unveiled', 'announce',
  'announced', 'release', 'released', 'smartphone', 'phone', 'mobile',
  'pixel', 'galaxy', 'iphone', 'xiaomi', 'oneplus', 'oppo', 'vivo',
  'realme', 'motorola', 'nokia', 'foldable', 'flip', 'snapdragon',
  'ios', 'android'
];

/**
 * Generate clean URL-safe slug from title
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Clean HTML tags and truncate text to max length
 */
function cleanExcerpt(htmlText?: string, maxLen = 300): string {
  if (!htmlText) return '';
  const text = htmlText.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}

/**
 * Extract external image URL directly from RSS item fields (media, enclosure, or body img tag)
 */
function extractImageUrl(item: any): string {
  // 1. Check media:content array
  if (item.mediaContent && Array.isArray(item.mediaContent) && item.mediaContent.length > 0) {
    const media = item.mediaContent[0]?.$ || item.mediaContent[0];
    if (media?.url) return media.url;
  }

  // 2. Check media:thumbnail
  if (item.mediaThumbnail && Array.isArray(item.mediaThumbnail) && item.mediaThumbnail.length > 0) {
    const thumb = item.mediaThumbnail[0]?.$ || item.mediaThumbnail[0];
    if (thumb?.url) return thumb.url;
  }

  // 3. Check enclosure
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }

  // 4. Regex extract <img> src from content/contentEncoded/summary
  const bodyText = item['contentEncoded'] || item.content || item.summary || item.snippet || '';
  const imgMatch = bodyText.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  // Fallback high quality tech article image
  return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';
}

/**
 * Attempt to match article against MongoDB devices list (fuzzy/substring match)
 */
function findMatchingDeviceId(articleTitle: string, articleSummary: string, devices: Device[]): string | null {
  const titleLower = articleTitle.toLowerCase();
  const summaryLower = articleSummary.toLowerCase();

  for (const device of devices) {
    const devNameLower = device.name.toLowerCase();
    const brandLower = device.brand.toLowerCase();

    // Check direct device name in title
    if (titleLower.includes(devNameLower) && devNameLower.length > 3) {
      return device.id;
    }

    // Check brand + full model name match
    const fullBrandName = `${brandLower} ${devNameLower}`;
    if (titleLower.includes(fullBrandName) || summaryLower.includes(fullBrandName)) {
      return device.id;
    }
  }

  return null;
}

export async function GET() {
  return handleFetchNews();
}

export async function POST() {
  return handleFetchNews();
}

async function handleFetchNews() {
  const startTime = Date.now();
  console.log('[RSS Fetch Job] Starting RSS news ingestion...');

  try {
    const client = await getMongoClientSafe();
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'MongoDB is currently unavailable. Cannot ingest news without a database connection.' },
        { status: 503 }
      );
    }
    const db = client.db('appdb');
    const newsCol = db.collection('news');

    // Create unique index on `link` field if not exists
    await newsCol.createIndex({ link: 1 }, { unique: true }).catch(() => {});

    // Fetch existing devices from MongoDB for matching
    const devices = await getDevices();
    console.log(`[RSS Fetch Job] Loaded ${devices.length} devices from MongoDB for article matching.`);

    let totalFetched = 0;
    let totalUpserted = 0;
    const logs: string[] = [];

    // Process each RSS feed with individual error handling
    for (const source of FEED_SOURCES) {
      try {
        console.log(`[RSS Fetch Job] Parsing feed from ${source.name} (${source.url})...`);
        const feed = await parser.parseURL(source.url);

        if (!feed.items || feed.items.length === 0) {
          logs.push(`${source.name}: 0 items found`);
          continue;
        }

        let sourceUpserted = 0;

        for (const item of feed.items) {
          if (!item.title || !item.link) continue;

          const title = item.title.trim();
          const link = item.link.trim();
          const rawContent = item['contentEncoded'] || item.content || item.summary || '';
          const summary = cleanExcerpt(rawContent || title);
          const textForKeywords = `${title} ${summary}`.toLowerCase();

          // 1. Keyword Relevance Filtering
          const isRelevant = RELEVANT_KEYWORDS.some(kw => textForKeywords.includes(kw));
          if (!isRelevant) continue;

          // 2. Classify Article Type ("news" or "review")
          const isReview = title.toLowerCase().includes('review') || summary.toLowerCase().includes('review');
          const type: 'news' | 'review' = isReview ? 'review' : 'news';

          // 3. Extract Image URL
          const image = extractImageUrl(item);

          // 4. Match Device ID from MongoDB devices
          const deviceId = findMatchingDeviceId(title, summary, devices);

          // 5. Parse Publication Date
          const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
          const slug = slugify(title);

          const newsDoc: NewsArticle = {
            title,
            slug,
            type,
            link,
            summary,
            image,
            source: source.name,
            publishedAt,
            deviceId,
            createdAt: new Date()
          };

          // 6. Upsert into MongoDB `news` collection by `link`
          await newsCol.updateOne(
            { link },
            { 
              $set: {
                title: newsDoc.title,
                slug: newsDoc.slug,
                type: newsDoc.type,
                summary: newsDoc.summary,
                image: newsDoc.image,
                source: newsDoc.source,
                publishedAt: newsDoc.publishedAt,
                deviceId: newsDoc.deviceId,
              },
              $setOnInsert: {
                link: newsDoc.link,
                createdAt: newsDoc.createdAt
              }
            },
            { upsert: true }
          );

          sourceUpserted++;
          totalUpserted++;
          totalFetched++;
        }

        logs.push(`${source.name}: ${sourceUpserted} articles upserted`);
      } catch (err: any) {
        console.error(`[RSS Fetch Job] Error fetching RSS from ${source.name}:`, err.message);
        logs.push(`${source.name} error: ${err.message}`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[RSS Fetch Job] Completed in ${duration}s. Upserted ${totalUpserted} total articles.`);

    return NextResponse.json({
      success: true,
      message: `Successfully processed RSS feeds and upserted ${totalUpserted} articles into MongoDB.`,
      duration: `${duration}s`,
      details: logs
    });
  } catch (error: any) {
    console.error('[RSS Fetch Job] Critical error during job execution:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute RSS news fetch job' },
      { status: 500 }
    );
  }
}
