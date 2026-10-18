import { NextResponse, NextRequest } from 'next/server';
import { getMongoClientSafe, isMongoHealthy } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/authTokens';

export const dynamic = 'force-dynamic';

export interface ForumTopicComment {
  id: string;
  topicId: string;
  author: {
    id: string;
    name: string;
    email?: string;
    avatarBg: string;
    role: string;
  };
  content: string;
  createdAt: string;
  upvotes: number;
}

const inMemoryForumComments: Map<string, ForumTopicComment[]> = new Map();

// Initial seed comments for topic-1
inMemoryForumComments.set('topic-1', [
  {
    id: 'tc-seed-1',
    topicId: 'topic-1',
    author: {
      id: 'usr-seed-1',
      name: 'Alex Vance',
      avatarBg: 'bg-emerald-500',
      role: 'Hardware Guru',
    },
    content: 'Can confirm! Tested both in an ambient room temperature of 24°C. The vapor chamber on S26 Ultra dissipates heat much more evenly along the back glass.',
    createdAt: '45m ago',
    upvotes: 18,
  },
  {
    id: 'tc-seed-2',
    topicId: 'topic-1',
    author: {
      id: 'usr-seed-2',
      name: 'Michael Scott',
      avatarBg: 'bg-cyan-500',
      role: 'Member',
    },
    content: 'What about battery consumption per hour? Does the A18 Pro draw fewer total watts during normal everyday web browsing and video playback?',
    createdAt: '20m ago',
    upvotes: 7,
  },
]);

// GET /api/forum/topics/[id]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

    let comments = inMemoryForumComments.get(topicId);

    if (isMongoHealthy()) {
      try {
        const client = await getMongoClientSafe();
        if (client) {
          const db = client.db('appdb');
          const cursor = await db
            .collection<ForumTopicComment>('forum_comments')
            .find({ topicId })
            .sort({ createdAt: 1 })
            .toArray();

          if (cursor && cursor.length > 0) {
            comments = cursor.map(({ _id, ...rest }: any) => rest as ForumTopicComment);
            inMemoryForumComments.set(topicId, comments);
          }
        }
      } catch (err: any) {
        console.warn(`[Forum Comments Mongo Error]:`, err.message);
      }
    }

    if (!comments) {
      comments = [];
      inMemoryForumComments.set(topicId, comments);
    }

    return NextResponse.json({
      success: true,
      topicId,
      count: comments.length,
      comments,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/forum/topics/[id]/comments (Requires Access Token Authentication)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

    // Verify Access Token from Authorization Header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to post a reply.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const verification = verifyAccessToken(token);

    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        { success: false, error: 'Your session has expired or token is invalid. Please sign in again.' },
        { status: 401 }
      );
    }

    const verifiedUser = verification.payload;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    const newComment: ForumTopicComment = {
      id: `tc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      topicId,
      author: {
        id: verifiedUser.userId,
        name: verifiedUser.name,
        email: verifiedUser.email,
        avatarBg: verifiedUser.avatarBg || 'bg-[#7f22fe]',
        role: verifiedUser.role || 'Verified Member',
      },
      content: content.trim(),
      createdAt: 'Just now',
      upvotes: 0,
    };

    // Save in memory
    const existing = inMemoryForumComments.get(topicId) || [];
    inMemoryForumComments.set(topicId, [...existing, newComment]);

    // Save in MongoDB and update replies count on topic
    if (isMongoHealthy()) {
      try {
        const client = await getMongoClientSafe();
        if (client) {
          const db = client.db('appdb');
          await db.collection('forum_comments').insertOne(newComment);
          await db.collection('forum_topics').updateOne(
            { id: topicId },
            { $inc: { replies: 1 }, $set: { lastActivity: 'Just now' } }
          );
        }
      } catch (err: any) {
        console.warn(`[Forum Comment Insert Mongo Error]:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Comment posted successfully',
      comment: newComment,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
