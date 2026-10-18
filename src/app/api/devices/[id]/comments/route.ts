import { NextResponse, NextRequest } from 'next/server';
import { getMongoDbSafe } from '@/lib/mongodb';
import { getDeviceById } from '@/lib/db';
import { verifyAccessToken } from '@/lib/authTokens';

export const dynamic = 'force-dynamic';

export interface DeviceComment {
  id: string;
  deviceId: string;
  deviceName?: string;
  deviceBrand?: string;
  author: {
    id: string;
    name: string;
    email?: string;
    avatarBg: string;
    role: string;
  };
  content: string;
  rating?: number;
  tag?: string;
  createdAt: string;
  createdAtIso?: string;
  upvotes: number;
  reactions?: Record<string, number>;
  replies?: Array<{
    id: string;
    author: {
      name: string;
      avatarBg: string;
      role: string;
    };
    content: string;
    createdAt: string;
  }>;
}

// In-memory comments cache keyed by deviceId for rapid reads
const inMemoryCommentsMap: Map<string, DeviceComment[]> = new Map();

function generateDefaultComments(device: any): DeviceComment[] {
  const dName = device?.name || 'this device';
  const dBrand = device?.brand || 'Tech';
  const now = new Date();

  return [
    {
      id: `comm-default-1-${device?.id || 'd1'}`,
      deviceId: device?.id || '',
      deviceName: dName,
      deviceBrand: dBrand,
      author: {
        id: 'usr-seed-1',
        name: 'Jordan Miller',
        avatarBg: 'bg-emerald-500',
        role: 'Verified Owner',
      },
      content: `I've had the ${dName} for 3 weeks now. Battery standby time is surprisingly good, getting easily 7.5 hours of Screen-on-Time on mixed 5G and Wi-Fi. Fast charging stays cool and software performance is buttery smooth.`,
      rating: 5,
      tag: 'Battery Life',
      createdAt: '2 days ago',
      createdAtIso: new Date(now.getTime() - 2 * 86400000).toISOString(),
      upvotes: 14,
      reactions: { '🔥': 8, '💡': 5 },
      replies: [
        {
          id: 'rep-1',
          author: { name: 'TechEnthusiast', avatarBg: 'bg-purple-600', role: 'Verified Reviewer' },
          content: 'Did you notice any thermal throttling while running intensive 3D games outdoors?',
          createdAt: '1 day ago',
        },
      ],
    },
    {
      id: `comm-default-2-${device?.id || 'd2'}`,
      deviceId: device?.id || '',
      deviceName: dName,
      deviceBrand: dBrand,
      author: {
        id: 'usr-seed-2',
        name: 'Liam Chen',
        avatarBg: 'bg-cyan-500',
        role: 'Tech Reviewer',
      },
      content: `The display calibration is top tier. Peak brightness easily cuts through direct sunlight. Solid haptics and the software skin feels snappy with zero frame drops. Excellent value overall.`,
      rating: 4,
      tag: 'Daily Driver Experience',
      createdAt: '4 days ago',
      createdAtIso: new Date(now.getTime() - 4 * 86400000).toISOString(),
      upvotes: 9,
      reactions: { '💡': 6, '❤️': 3 },
      replies: [],
    },
  ];
}

// GET /api/devices/[id]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const device = await getDeviceById(id);

    let comments: DeviceComment[] | null = null;
    const db = await getMongoDbSafe('appdb');

    // 1. Fetch from MongoDB collection `device_comments`
    if (db) {
      try {
        const cursor = await db
          .collection<DeviceComment>('device_comments')
          .find({ deviceId: id })
          .sort({ createdAtIso: -1, createdAt: -1 })
          .toArray();

        if (cursor && cursor.length > 0) {
          comments = cursor.map(({ _id, ...rest }: any) => rest as DeviceComment);
          inMemoryCommentsMap.set(id, comments);
        }
      } catch (err: any) {
        console.warn(`[Comments Mongo Error for ${id}]:`, err.message);
      }
    }

    // 2. Fallback to in-memory cache
    if (!comments || comments.length === 0) {
      comments = inMemoryCommentsMap.get(id) || null;
    }

    // 3. Fallback to default seed reviews & persist them to MongoDB
    if (!comments || comments.length === 0) {
      comments = generateDefaultComments(device);
      inMemoryCommentsMap.set(id, comments);

      if (db) {
        try {
          await db.collection('device_comments').insertMany(comments as any).catch(() => {});
        } catch {}
      }
    }

    // Calculate rating stats & distribution breakdown
    const rated = comments.filter((c) => c.rating && c.rating > 0);
    const sum = rated.reduce((acc, c) => acc + (c.rating || 0), 0);
    const avgScore = rated.length > 0 ? (sum / rated.length).toFixed(1) : '4.8';

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const c of rated) {
      const r = Math.round(c.rating || 5);
      if (distribution[r] !== undefined) {
        distribution[r] += 1;
      }
    }

    return NextResponse.json({
      success: true,
      deviceId: id,
      count: comments.length,
      avgRating: avgScore,
      totalRatings: rated.length,
      distribution,
      comments,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/devices/[id]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      author,
      content,
      rating,
      tag,
      replyToCommentId,
      action,
      commentId,
      reaction,
    } = body;

    const db = await getMongoDbSafe('appdb');

    // ── ACTION: UPVOTE ──────────────────────────────────────────────
    if (action === 'upvote' && commentId) {
      if (db) {
        try {
          await db.collection('device_comments').updateOne(
            { id: commentId },
            { $inc: { upvotes: 1 } }
          );
        } catch {}
      }

      // Update in-memory
      const current = inMemoryCommentsMap.get(id) || [];
      const updated = current.map((c) => (c.id === commentId ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c));
      inMemoryCommentsMap.set(id, updated);

      return NextResponse.json({ success: true, action: 'upvote', commentId });
    }

    // ── ACTION: REACTION ────────────────────────────────────────────
    if (action === 'react' && commentId && reaction) {
      if (db) {
        try {
          await db.collection('device_comments').updateOne(
            { id: commentId },
            { $inc: { [`reactions.${reaction}`]: 1 } }
          );
        } catch {}
      }

      return NextResponse.json({ success: true, action: 'react', commentId, reaction });
    }

    // Check optional Authorization header for verified JWT
    let verifiedAuthor = author;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const verification = verifyAccessToken(token);
      if (verification.valid && verification.payload) {
        verifiedAuthor = {
          id: verification.payload.userId,
          name: verification.payload.name,
          email: verification.payload.email,
          avatarBg: verification.payload.avatarBg || author?.avatarBg || 'bg-[#7f22fe]',
          role: verification.payload.role || 'Verified Reviewer',
        };
      }
    }

    if (!verifiedAuthor || !verifiedAuthor.name || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Author name and review content are required' },
        { status: 400 }
      );
    }

    // ── SUBMIT REPLY ────────────────────────────────────────────────
    if (replyToCommentId) {
      const replyObj = {
        id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        author: {
          name: verifiedAuthor.name,
          avatarBg: verifiedAuthor.avatarBg || 'bg-purple-600',
          role: verifiedAuthor.role || 'Member',
        },
        content: content.trim(),
        createdAt: 'Just now',
      };

      if (db) {
        try {
          await db.collection('device_comments').updateOne(
            { id: replyToCommentId },
            { $push: { replies: replyObj } as any }
          );
        } catch (err: any) {
          console.warn('[Mongo Reply Error]:', err.message);
        }
      }

      // Update in-memory
      const current = inMemoryCommentsMap.get(id) || [];
      const updated = current.map((c) => {
        if (c.id === replyToCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), replyObj],
          };
        }
        return c;
      });
      inMemoryCommentsMap.set(id, updated);

      return NextResponse.json({ success: true, reply: replyObj });
    }

    // ── SUBMIT NEW REVIEW & COMMENT ─────────────────────────────────
    const device = await getDeviceById(id);
    const parsedRating = rating ? Math.min(5, Math.max(1, Math.round(Number(rating)))) : 5;
    const now = new Date();

    const newComment: DeviceComment = {
      id: `comm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      deviceId: id,
      deviceName: device?.name || 'Device',
      deviceBrand: device?.brand || 'Tech',
      author: {
        id: verifiedAuthor.id || `usr-${Date.now()}`,
        name: verifiedAuthor.name,
        email: verifiedAuthor.email || '',
        avatarBg: verifiedAuthor.avatarBg || 'bg-emerald-500',
        role: verifiedAuthor.role || 'Verified Reviewer',
      },
      content: content.trim(),
      rating: parsedRating,
      tag: tag || 'Daily Driver Experience',
      createdAt: 'Just now',
      createdAtIso: now.toISOString(),
      upvotes: 0,
      reactions: {},
      replies: [],
    };

    // 1. Save in-memory
    const existing = inMemoryCommentsMap.get(id) || [];
    inMemoryCommentsMap.set(id, [newComment, ...existing]);

    // 2. Persist to MongoDB collections: `device_comments` and `user_reviews`
    if (db) {
      try {
        // Insert into device comments feed
        await db.collection('device_comments').insertOne({ ...newComment });

        // Upsert review record in `user_reviews` collection for this specific user
        await db.collection('user_reviews').updateOne(
          {
            userId: newComment.author.id,
            deviceId: id,
          },
          {
            $set: {
              userId: newComment.author.id,
              userName: newComment.author.name,
              userEmail: newComment.author.email || '',
              userAvatarBg: newComment.author.avatarBg,
              userRole: newComment.author.role,
              deviceId: id,
              deviceName: device?.name || 'Device',
              deviceBrand: device?.brand || 'Tech',
              rating: parsedRating,
              tag: newComment.tag,
              content: newComment.content,
              updatedAt: now.toISOString(),
            },
            $setOnInsert: {
              createdAt: now.toISOString(),
            },
          },
          { upsert: true }
        );

        console.log(`[MongoDB] Successfully saved review for user ${newComment.author.name} on ${device?.name || id}`);
      } catch (err: any) {
        console.warn(`[Comments Insert Mongo Error]:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
