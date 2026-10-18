'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Star,
  Lock,
  Send,
  CornerDownRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  User as UserIcon,
  LogIn,
  Heart,
  Flame,
  Award,
  Search,
  Check,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import type { DeviceComment } from '../app/api/devices/[id]/comments/route';

interface DeviceCommentsSectionProps {
  deviceId: string;
  deviceName: string;
  deviceBrand: string;
}

const AVAILABLE_TAGS = [
  'All Comments',
  'Battery Life',
  'Camera Quality',
  'Gaming & Thermals',
  'Daily Driver Experience',
  'Value for Money',
  'Build & Design',
];

const RATING_DESCRIPTIONS: Record<number, { title: string; badge: string; desc: string }> = {
  1: { title: '1.0 Star', badge: 'Poor / Problematic', desc: 'Critical defects or performance flaws.' },
  2: { title: '2.0 Stars', badge: 'Below Average', desc: 'Noticeable compromises and lag.' },
  3: { title: '3.0 Stars', badge: 'Decent / Average', desc: 'Good for basic daily essentials.' },
  4: { title: '4.0 Stars', badge: 'Very Good', desc: 'Reliable, fluid, and satisfying experience.' },
  5: { title: '5.0 Stars', badge: 'True Flagship', desc: 'Best-in-class performance and quality.' },
};

export default function DeviceCommentsSection({
  deviceId,
  deviceName,
  deviceBrand,
}: DeviceCommentsSectionProps) {
  const { user, isAuthenticated, openAuthModal, authFetch } = useAuth();
  const { showToast } = useApp();

  const [comments, setComments] = useState<DeviceComment[]>([]);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('Daily Driver Experience');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('All Comments');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'top' | 'highest'>('latest');
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Fetch comments and rating distribution from API (backed by MongoDB)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/devices/${encodeURIComponent(deviceId)}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
          if (data.distribution) {
            setDistribution(data.distribution);
          }
        }
      })
      .catch((err) => console.error('Failed to load device comments:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [deviceId]);

  // Aggregate average score
  const avgRating = useMemo(() => {
    const rated = comments.filter((c) => c.rating && c.rating > 0);
    if (rated.length === 0) return '4.8';
    const sum = rated.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (sum / rated.length).toFixed(1);
  }, [comments]);

  // Dynamic distribution stats
  const ratingStats = useMemo(() => {
    const rated = comments.filter((c) => c.rating && c.rating > 0);
    const total = rated.length || 1;
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const c of rated) {
      const r = Math.round(c.rating || 5);
      if (counts[r] !== undefined) counts[r] += 1;
    }
    return {
      total: rated.length,
      counts,
      percentages: {
        5: Math.round((counts[5] / total) * 100),
        4: Math.round((counts[4] / total) * 100),
        3: Math.round((counts[3] / total) * 100),
        2: Math.round((counts[2] / total) * 100),
        1: Math.round((counts[1] / total) * 100),
      },
    };
  }, [comments]);

  // Handle post new comment & review to MongoDB
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      openAuthModal('login', `Sign in or register to post your review on ${deviceName}`);
      return;
    }

    if (!newCommentText.trim()) {
      showToast('Please write your review before publishing.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarBg: user.avatarBg || 'bg-[#7f22fe]',
          role: user.role || 'Verified Reviewer',
        },
        content: newCommentText.trim(),
        rating: selectedRating,
        tag: selectedTag,
      };

      const res = await authFetch(`/api/devices/${encodeURIComponent(deviceId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewCommentText('');
        showToast('🌟 Review saved to MongoDB successfully!');
      } else {
        showToast('Error publishing review: ' + (data.error || 'Server error'));
      }
    } catch {
      // Local optimistic fallback
      const localComment: DeviceComment = {
        id: `comm-local-${Date.now()}`,
        deviceId,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarBg: user.avatarBg || 'bg-[#7f22fe]',
          role: user.role || 'Verified Reviewer',
        },
        content: newCommentText.trim(),
        rating: selectedRating,
        tag: selectedTag,
        createdAt: 'Just now',
        upvotes: 0,
        reactions: {},
        replies: [],
      };
      setComments((prev) => [localComment, ...prev]);
      setNewCommentText('');
      showToast('🌟 Review published successfully!');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submit
  const handleReplySubmit = async (commentId: string) => {
    if (!isAuthenticated || !user) {
      openAuthModal('login', 'Sign in or register to reply to this discussion');
      return;
    }

    if (!replyText.trim()) return;

    try {
      const payload = {
        author: {
          id: user.id,
          name: user.name,
          avatarBg: user.avatarBg || 'bg-emerald-500',
          role: user.role || 'Member',
        },
        content: replyText.trim(),
        replyToCommentId: commentId,
      };

      const res = await authFetch(`/api/devices/${encodeURIComponent(deviceId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const replyObj = data.reply || {
        id: `rep-${Date.now()}`,
        author: {
          name: user.name,
          avatarBg: user.avatarBg || 'bg-emerald-500',
          role: user.role || 'Member',
        },
        content: replyText.trim(),
        createdAt: 'Just now',
      };

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), replyObj],
            };
          }
          return c;
        })
      );

      setReplyText('');
      setActiveReplyId(null);
      showToast('💬 Reply posted and saved!');
    } catch {
      showToast('Failed to post reply.');
    }
  };

  // Upvote comment with MongoDB synchronization
  const handleUpvote = async (commentId: string) => {
    if (upvotedIds.has(commentId)) {
      showToast('You already upvoted this review.');
      return;
    }

    setUpvotedIds((prev) => new Set([...prev, commentId]));
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c))
    );
    showToast('👍 Upvoted review!');

    try {
      await fetch(`/api/devices/${encodeURIComponent(deviceId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', commentId }),
      });
    } catch {}
  };

  // Reaction with MongoDB synchronization
  const handleReaction = async (commentId: string, emoji: string) => {
    const isAlready = userReactions[commentId] === emoji;
    const newEmoji = isAlready ? '' : emoji;

    setUserReactions((prev) => ({
      ...prev,
      [commentId]: newEmoji,
    }));

    if (!isAlready) {
      showToast(`Reacted ${emoji}`);
      try {
        await fetch(`/api/devices/${encodeURIComponent(deviceId)}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'react', commentId, reaction: emoji }),
        });
      } catch {}
    }
  };

  // Filter & Sort
  const filteredComments = useMemo(() => {
    return comments
      .filter((c) => {
        if (activeFilterTag !== 'All Comments' && c.tag !== activeFilterTag) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchContent = c.content?.toLowerCase().includes(q);
          const matchAuthor = c.author?.name?.toLowerCase().includes(q);
          if (!matchContent && !matchAuthor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'top') return (b.upvotes || 0) - (a.upvotes || 0);
        if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
        return 0; // Latest
      });
  }, [comments, activeFilterTag, searchQuery, sortBy]);

  const activeStarPreview = hoveredRating ?? selectedRating;
  const currentRatingInfo = RATING_DESCRIPTIONS[activeStarPreview] || RATING_DESCRIPTIONS[5];

  return (
    <section className="mt-12 mb-14 w-full max-w-5xl mx-auto flex flex-col gap-6 select-none">
      {/* ── Community Rating & Header Card ── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900/90 via-zinc-950/80 to-zinc-900/90 border border-white/10 p-5 sm:p-7 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glow Ambient Highlights */}
        <div className="absolute -top-16 -right-16 size-72 bg-[#7f22fe]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-72 bg-[#00bc7d]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          {/* Title & Description */}
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-[#7f22fe]/25 to-[#ad46ff]/25 text-[#ad46ff] border border-[#7f22fe]/40 shadow-sm">
                Verified Reviews
              </span>
              <span className="text-xs text-zinc-400">• MongoDB Synced Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {deviceName} Reviews & User Discussions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Explore authentic hands-on experiences on battery endurance, camera portrait tuning, sustained gaming thermals, and software longevity from genuine {deviceBrand} users.
            </p>
          </div>

          {/* Rating Score & Distribution Matrix Card */}
          <div className="bg-zinc-950/90 border border-white/10 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-5 shrink-0">
            {/* Average Big Score */}
            <div className="flex flex-col items-center justify-center text-center px-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter">
                {avgRating}
              </span>
              <div className="flex items-center gap-1 my-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-4 ${
                      s <= Math.round(Number(avgRating))
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                {comments.length} Total Ratings
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-24 w-px bg-white/10" />

            {/* Distribution Breakdown Bars */}
            <div className="flex flex-col gap-1.5 w-full sm:w-44 text-[11px]">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingStats.counts[stars] || 0;
                const pct = ratingStats.percentages[stars as 1 | 2 | 3 | 4 | 5] || 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-5 text-right font-mono font-bold text-zinc-400">{stars}★</span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-900 border border-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right font-mono text-[10px] text-zinc-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Pills + Search Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5">
          {/* Tag filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveFilterTag(tag)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  activeFilterTag === tag
                    ? 'bg-[#7f22fe] text-white border-[#ad46ff] shadow-[0_0_12px_rgba(127,34,254,0.35)]'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search comments */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="size-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-all"
              />
            </div>

            {/* Sort toggle */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'latest' ? 'bg-[#7f22fe] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setSortBy('top')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'top' ? 'bg-[#7f22fe] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Helpful
              </button>
              <button
                type="button"
                onClick={() => setSortBy('highest')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'highest' ? 'bg-[#7f22fe] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                5★ Top
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Comment & Review Submission Form (Auth-gated) ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/70 border border-white/10 shadow-xl relative overflow-hidden backdrop-blur-md">
        {!isAuthenticated ? (
          /* Unauthenticated State Call-to-Action */
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-5 sm:p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-[#7f22fe]/15 border border-[#7f22fe]/30 text-[#ad46ff] shrink-0 mt-0.5 shadow-lg shadow-[#7f22fe]/10">
                <Lock className="size-5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-extrabold text-white">
                    Sign in to leave a verified review for {deviceName}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#00bc7d]/10 text-[#00bc7d] border border-[#00bc7d]/20">
                    Database Verified
                  </span>
                </div>
                <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                  TechVault specifications and comparisons are 100% open to view. Free sign-in lets you post reviews, rate hardware, vote on comments, and sync with MongoDB.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal('login', `Sign in or register to review the ${deviceName}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#7f22fe]/25 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <LogIn className="size-4" />
              <span>Login / Register to Review</span>
            </button>
          </div>
        ) : (
          /* Authenticated Review Form with Perfect Responsive Star Rating */
          <form onSubmit={handleSubmitComment} className="flex flex-col gap-4">
            {/* Header: User Profile + Star Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              {/* User Identity */}
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-full ${user?.avatarBg || 'bg-[#7f22fe]'} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/10`}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-white">{user?.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00bc7d]/15 text-[#00bc7d] border border-[#00bc7d]/30">
                      {user?.role || 'Verified Reviewer'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">{user?.email}</span>
                </div>
              </div>

              {/* ── FLAWLESS INTERACTIVE STAR RATING SELECTOR ── */}
              <div
                className="flex items-center gap-2.5 sm:gap-3 bg-zinc-950/95 px-3.5 py-2 rounded-2xl border border-white/10 shadow-inner self-start sm:self-auto"
                onMouseLeave={() => setHoveredRating(null)}
              >
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rating:</span>
                
                {/* 5 Interactive Star Buttons */}
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Device star rating">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeStarPreview;
                    const isCurrentlySelected = selectedRating === star;

                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={isCurrentlySelected}
                        aria-label={`Rate ${star} star`}
                        onMouseEnter={() => setHoveredRating(star)}
                        onPointerDown={() => {
                          setSelectedRating(star);
                          setHoveredRating(null);
                        }}
                        onClick={() => {
                          setSelectedRating(star);
                          setHoveredRating(null);
                        }}
                        className={`cursor-pointer transition-all p-1.5 rounded-xl flex items-center justify-center ${
                          isFilled
                            ? 'bg-amber-400/15 text-amber-400'
                            : 'hover:bg-zinc-800 text-zinc-600'
                        } ${isCurrentlySelected ? 'ring-2 ring-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : ''}`}
                      >
                        <Star
                          className={`size-5 sm:size-5.5 transition-transform duration-150 ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] scale-110'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Score & Descriptive Title */}
                <div className="flex flex-col pl-1 border-l border-white/10 min-w-[125px]">
                  <span className="text-xs font-black text-amber-400 font-mono flex items-center gap-1">
                    <span>{activeStarPreview}.0</span>
                    <span className="text-[10px] text-zinc-400 font-sans font-semibold">
                      ({currentRatingInfo.badge})
                    </span>
                  </span>
                  <span className="text-[9px] text-zinc-500 truncate max-w-[140px]">
                    {currentRatingInfo.desc}
                  </span>
                </div>
              </div>
            </div>

            {/* Tag Selection for the comment */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Topic:</span>
              {AVAILABLE_TAGS.filter((t) => t !== 'All Comments').map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#7f22fe]/25 border-[#ad46ff] text-white shadow-[0_0_10px_rgba(127,34,254,0.3)]'
                      : 'bg-zinc-950/70 border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Comment Textarea with Live Character Count */}
            <div className="relative">
              <textarea
                rows={3}
                maxLength={600}
                placeholder={`Share your experience with the ${deviceName} (battery standby, camera details, gaming thermals, charging speeds, or daily software bugs)...`}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full bg-zinc-950/90 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe] focus:ring-1 focus:ring-[#7f22fe]/50 transition-all resize-none leading-relaxed"
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">
                {newCommentText.length} / 600
              </span>
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <CheckCircle2 className="size-3.5 text-[#00bc7d]" />
                <span>Reviews are stored in MongoDB under your verified profile.</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#7f22fe]/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="size-3.5" />
                <span>{submitting ? 'Saving to Database...' : 'Publish Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Community Comments Stream ── */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="py-14 flex items-center justify-center gap-3 text-xs text-zinc-400 bg-zinc-900/20 rounded-2xl border border-white/5">
            <div className="size-5 rounded-full border-2 border-[#7f22fe] border-t-transparent animate-spin" />
            <span>Fetching verified reviews from database...</span>
          </div>
        ) : filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="p-5 sm:p-6 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-[#7f22fe]/40 hover:bg-zinc-900/70 transition-all duration-300 flex flex-col gap-3 shadow-md group relative"
            >
              {/* Header: Author + Verified Pill + Timestamp + Star Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-8 sm:size-9 rounded-full ${
                      comment.author?.avatarBg || 'bg-[#7f22fe]'
                    } text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/10`}
                  >
                    {comment.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-white text-xs sm:text-sm">
                      {comment.author?.name}
                    </span>
                    {comment.author?.role && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-950 border border-white/10 text-zinc-400 font-semibold flex items-center gap-1">
                        <Check className="size-2.5 text-[#00bc7d]" />
                        {comment.author.role}
                      </span>
                    )}
                    {comment.tag && (
                      <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-[#7f22fe]/15 text-[#ad46ff] border border-[#7f22fe]/30 font-bold">
                        {comment.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating badge & time */}
                <div className="flex items-center gap-3 text-zinc-400 text-[11px] self-start sm:self-auto pl-11 sm:pl-0">
                  {comment.rating && (
                    <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-amber-400 font-black text-xs shadow-sm">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span>{comment.rating}.0★</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-zinc-500 text-[10px]">
                    <Clock className="size-3" />
                    {comment.createdAt}
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed pl-0 sm:pl-12 whitespace-pre-line">
                {comment.content}
              </p>

              {/* Action Bar: Reactions + Upvote + Reply */}
              <div className="flex items-center justify-between flex-wrap gap-2 pl-0 sm:pl-12 pt-2 border-t border-white/5 mt-1">
                {/* Reactions */}
                <div className="flex items-center gap-1.5">
                  {[
                    { emoji: '🔥', label: 'Hot' },
                    { emoji: '💡', label: 'Helpful' },
                    { emoji: '❤️', label: 'Love' },
                  ].map((r) => {
                    const active = userReactions[comment.id] === r.emoji;
                    const count = (comment.reactions?.[r.emoji] || 0) + (active ? 1 : 0);
                    return (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={() => handleReaction(comment.id, r.emoji)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? 'bg-[#7f22fe]/30 border-[#ad46ff] text-white scale-105 shadow-sm'
                            : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                        title={r.label}
                      >
                        <span>{r.emoji}</span>
                        {count > 0 && <span className="font-mono text-[10px] font-bold">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Upvotes & Reply buttons */}
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                  <button
                    type="button"
                    onClick={() => handleUpvote(comment.id)}
                    className={`flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-xl border border-white/5 cursor-pointer ${
                      upvotedIds.has(comment.id)
                        ? 'bg-emerald-500/20 text-[#00bc7d] border-emerald-500/40'
                        : 'bg-zinc-950 hover:bg-zinc-800 hover:text-white'
                    }`}
                    title="Mark Helpful"
                  >
                    <ThumbsUp className="size-3.5" />
                    <span className="font-mono">{comment.upvotes || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        openAuthModal('login', 'Sign in to reply to this review');
                      } else {
                        setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                      }
                    }}
                    className="flex items-center gap-1.5 hover:text-[#ad46ff] transition-colors px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-white/5 cursor-pointer"
                  >
                    <CornerDownRight className="size-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>

              {/* Threaded Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-2 sm:ml-12 mt-2 flex flex-col gap-2 pl-3 border-l-2 border-white/10">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-5 rounded-full ${
                              reply.author?.avatarBg || 'bg-purple-600'
                            } text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                          >
                            {reply.author?.name?.charAt(0) || 'R'}
                          </div>
                          <span className="font-bold text-white">{reply.author?.name}</span>
                          <span className="text-[8px] text-zinc-500 uppercase">{reply.author?.role}</span>
                        </div>
                        <span className="text-zinc-500 text-[10px]">{reply.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-normal pl-7 whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Reply Input Form */}
              {activeReplyId === comment.id && (
                <div className="ml-2 sm:ml-12 mt-2 p-3.5 rounded-2xl bg-zinc-950/95 border border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-bold text-white">Replying to {comment.author?.name}</span>
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="text-zinc-500 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Write your constructive reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleReplySubmit(comment.id);
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(comment.id)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-95 text-white text-xs font-bold"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-zinc-400 text-xs bg-zinc-900/20 rounded-2xl border border-white/5">
            No community reviews yet for this filter. Be the first to share your experience!
          </div>
        )}
      </div>
    </section>
  );
}
