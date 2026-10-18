import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

// This API route fetches AnTuTu scores live by scraping DuckDuckGo search results
// for the query: "[Device Name] antutu score".
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const device = searchParams.get('device');

  if (!device) {
    return NextResponse.json({ error: 'Device name is required' }, { status: 400 });
  }

  try {
    const query = encodeURIComponent(`${device} antutu score`);
    // DuckDuckGo HTML version is much easier to scrape and less prone to blocking
    const url = `https://html.duckduckgo.com/html/?q=${query}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      // Adding cache control
      next: { revalidate: 3600 * 24 } // cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from search engine: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let score = null;
    let foundScore = false;

    // Search the text snippets for something resembling an AnTuTu score
    // AnTuTu scores are typically in the hundreds of thousands or over a million (e.g. "1,200,500" or "1.2 million")
    $('.result__snippet').each((i, el) => {
      if (foundScore) return;
      
      const text = $(el).text().toLowerCase();
      // Regex to find a number formatted like 1,000,000 or 850,000
      const scoreMatch = text.match(/(?:antutu|score)[\s\S]{0,30}?((?:[1-9]\d{0,2})(?:,\d{3}){1,2}|[1-9]\d{5,6})/i);
      
      if (scoreMatch && scoreMatch[1]) {
        let rawNumber = parseInt(scoreMatch[1].replace(/,/g, ''), 10);
        // Sanity check for AnTuTu scores (typically between 100k and 3M)
        if (rawNumber > 50000 && rawNumber < 4000000) {
          // Format as "1.2M" or "850K"
          if (rawNumber >= 1000000) {
            score = (rawNumber / 1000000).toFixed(2) + 'M';
          } else {
            score = Math.round(rawNumber / 1000) + 'K';
          }
          foundScore = true;
        }
      }
      
      // Secondary check for "X.XX million" format
      if (!foundScore) {
        const millionMatch = text.match(/(?:antutu|score)[\s\S]{0,30}?(\d+\.\d+|\d+)\s*million/i);
        if (millionMatch && millionMatch[1]) {
          const num = parseFloat(millionMatch[1]);
          if (num > 0.5 && num < 4) {
             score = num.toFixed(2) + 'M';
             foundScore = true;
          }
        }
      }
    });

    if (score) {
      return NextResponse.json({ device, score });
    } else {
      // Return a 404 if no score could be parsed, allowing the frontend to use a fallback
      return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Live fetch error for ${device}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
