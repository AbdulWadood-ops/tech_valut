import { NextResponse, NextRequest } from 'next/server';
import { getMongoClientSafe, isMongoHealthy } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/authTokens';

export const dynamic = 'force-dynamic';

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  author: {
    id: string;
    name: string;
    email?: string;
    avatarBg: string;
    role: string;
  };
  snippet: string;
  replies: number;
  views: number;
  upvotes: number;
  lastActivity: string;
  createdAt: string;
  isPinned?: boolean;
  isSolved?: boolean;
  tags: string[];
}

const DEFAULT_TOPICS: ForumTopic[] = [
  {
    id: 'topic-1',
    title: 'Galaxy S26 Ultra vs iPhone 16 Pro Max — Thermal Throttling & Battery Drain in 120Hz Gaming',
    category: 'comparisons',
    author: { id: 'usr-1', name: 'David Tech', email: 'david@techvault.io', avatarBg: 'bg-[#7f22fe]', role: 'Verified Reviewer' },
    snippet: 'Ran 45 minutes of Genshin Impact on max settings. The Snapdragon 8 Elite stays cooler during sustained load, while Apple A18 Pro maintains higher peak FPS for the first 15 mins.',
    replies: 4,
    views: 1820,
    upvotes: 142,
    lastActivity: '12m ago',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isPinned: true,
    tags: ['Galaxy S26', 'iPhone 16', 'Gaming', 'Benchmarks'],
  },
  {
    id: 'topic-2',
    title: 'TechVault Community Guidelines & Verified Benchmark Score Submission Rules',
    category: 'announcements',
    author: { id: 'usr-admin', name: 'TechVault Team', email: 'admin@techvault.io', avatarBg: 'bg-[#00bc7d]', role: 'Admin' },
    snippet: 'Please read our updated submission criteria for AnTuTu v10, Geekbench 6, and battery endurance cycles before posting new device benchmark requests.',
    replies: 2,
    views: 3410,
    upvotes: 280,
    lastActivity: '1h ago',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isPinned: true,
    tags: ['Guidelines', 'Official', 'Rules'],
  },
  {
    id: 'topic-3',
    title: 'Pixel 9 Pro XL Camera update (Build AP2A.2408) fixes dynamic range noise in low-light night sight',
    category: 'smartphones',
    author: { id: 'usr-2', name: 'Elena Rostova', email: 'elena@techvault.io', avatarBg: 'bg-rose-500', role: 'Verified Reviewer' },
    snippet: 'Here is a side-by-side RAW comparison of the new HDR tone mapper. Shadows show 40% less chromatic noise, and highlights maintain true color balance.',
    replies: 18,
    views: 1240,
    upvotes: 95,
    lastActivity: '3h ago',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isSolved: true,
    tags: ['Pixel 9 Pro', 'Google Camera', 'Photography'],
  },
  {
    id: 'topic-4',
    title: 'Best Compact Tablet in 2026: iPad Mini 7 vs Legion Y700 Gen 3 comparison',
    category: 'tablets',
    author: { id: 'usr-3', name: 'Marcus Vance', email: 'marcus@techvault.io', avatarBg: 'bg-cyan-500', role: 'Hardware Guru' },
    snippet: 'Looking for a one-handed media and gaming tablet. The 165Hz panel on the Legion is tempting, but Apple Pencil Pro support on iPad Mini is hard to overlook.',
    replies: 9,
    views: 890,
    upvotes: 43,
    lastActivity: '5h ago',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    tags: ['iPad Mini', 'Gaming Tablet', 'Display'],
  },
  {
    id: 'topic-5',
    title: 'M4 MacBook Air vs Lunar Lake Dell XPS 13: Real World Battery Life & Thermals',
    category: 'laptops',
    author: { id: 'usr-4', name: 'Sarah Jenkins', email: 'sarah@techvault.io', avatarBg: 'bg-emerald-500', role: 'Verified Reviewer' },
    snippet: 'Tested both machines with heavy TypeScript compile loops and Docker containers. Battery life results and fan noise analysis inside.',
    replies: 14,
    views: 1530,
    upvotes: 88,
    lastActivity: '1d ago',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['MacBook Air', 'Dell XPS', 'Intel Core Ultra', 'Apple Silicon'],
  },
];

let inMemoryTopics = [...DEFAULT_TOPICS];

// GET /api/forum/topics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let topics = inMemoryTopics;

    // Check MongoDB if healthy
    if (isMongoHealthy()) {
      try {
        const client = await getMongoClientSafe();
        if (client) {
          const db = client.db('appdb');
          const col = db.collection<ForumTopic>('forum_topics');
          const count = await col.countDocuments();
          if (count === 0) {
            // Seed initial topics into MongoDB
            await col.insertMany(DEFAULT_TOPICS);
          } else {
            const query: any = {};
            if (category && category !== 'all') {
              query.category = category;
            }
            if (search) {
              query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { snippet: { $regex: search, $options: 'i' } },
              ];
            }
            const docs = await col.find(query).sort({ isPinned: -1, createdAt: -1 }).toArray();
            topics = docs.map(({ _id, ...rest }: any) => rest as ForumTopic);
            return NextResponse.json({ success: true, count: topics.length, topics });
          }
        }
      } catch (err: any) {
        console.warn('[Forum MongoDB Error fallback]:', err.message);
      }
    }

    // Filter in-memory
    let filtered = [...topics];
    if (category && category !== 'all') {
      filtered = filtered.filter((t) => t.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.snippet.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      topics: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/forum/topics (Requires Access Token Authentication & Authorization)
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user via JWT Access Token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to create a discussion topic.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const verification = verifyAccessToken(token);

    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        { success: false, error: 'Session expired or invalid token. Please log in again.' },
        { status: 401 }
      );
    }

    const verifiedUser = verification.payload;
    const body = await request.json();
    const { title, category, snippet, tags } = body;

    if (!title || !title.trim() || !snippet || !snippet.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title and content snippet are required' },
        { status: 400 }
      );
    }

    const newTopic: ForumTopic = {
      id: `topic-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      category: category || 'smartphones',
      author: {
        id: verifiedUser.userId,
        name: verifiedUser.name,
        email: verifiedUser.email,
        avatarBg: verifiedUser.avatarBg || 'bg-[#7f22fe]',
        role: verifiedUser.role || 'Verified Member',
      },
      snippet: snippet.trim(),
      replies: 0,
      views: 1,
      upvotes: 1,
      lastActivity: 'Just now',
      createdAt: new Date().toISOString(),
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Discussion'],
    };

    // Save in memory
    inMemoryTopics = [newTopic, ...inMemoryTopics];

    // Save in MongoDB
    if (isMongoHealthy()) {
      try {
        const client = await getMongoClientSafe();
        if (client) {
          const db = client.db('appdb');
          await db.collection('forum_topics').insertOne(newTopic);
        }
      } catch (err: any) {
        console.warn('[Forum Topic Insert MongoDB Error]:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Topic created successfully',
      topic: newTopic,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
