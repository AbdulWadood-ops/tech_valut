'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  TrendingUp,
  Sparkles,
  Flame,
  HelpCircle,
  Cpu,
  Smartphone,
  Tag,
  Search,
  ThumbsUp,
  MessageCircle,
  Eye,
  Plus,
  Pin,
  CheckCircle2,
  Filter,
  UserCheck,
  Clock,
  Lock,
  LogIn,
  LogOut,
  Send,
  X,
  Share2,
  ShieldCheck,
  ArrowRight,
  Layers,
  BarChart2
} from 'lucide-react';
import Footer from './Footer';
import ForumRightSidebar from './ForumRightSidebar';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface ForumComment {
  id: string;
  topicId: string;
  author: {
    id?: string;
    name: string;
    avatarBg: string;
    role?: string;
  };
  content: string;
  createdAt: string;
  upvotes: number;
}

interface ForumTopic {
  id: string;
  title: string;
  category: string;
  author: {
    id?: string;
    name: string;
    avatarBg: string;
    role?: string;
  };
  snippet: string;
  replies: number;
  views: number;
  upvotes: number;
  lastActivity: string;
  isPinned?: boolean;
  isSolved?: boolean;
  tags: string[];
}

const FORUM_CATEGORIES = [
  { id: 'all', label: 'All Discussions', icon: MessageSquare, count: 285 },
  { id: 'smartphones', label: 'Smartphones & Flagships', icon: Smartphone, count: 142 },
  { id: 'comparisons', label: 'Comparison Debates', icon: TrendingUp, count: 58 },
  { id: 'rumors', label: 'Rumor Mill & Leaks', icon: Flame, count: 39 },
  { id: 'troubleshooting', label: 'Troubleshooting & ROMs', icon: HelpCircle, count: 26 },
  { id: 'audio', label: 'Audio & Wearables', icon: Cpu, count: 20 },
];

export default function ForumPageContent() {
  const { showToast } = useApp();
  const { user, isAuthenticated, openAuthModal, logout, authFetch } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'top' | 'replies'>('latest');
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [commentsMap, setCommentsMap] = useState<Record<string, ForumComment[]>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  // Mobile navigation tab switcher: 'discussions' | 'channels' | 'trends'
  const [mobileTab, setMobileTab] = useState<'discussions' | 'channels' | 'trends'>('discussions');

  // Modal / Detail states
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newSnippet, setNewSnippet] = useState('');
  const [newCategory, setNewCategory] = useState('smartphones');
  const [newTagInput, setNewTagInput] = useState('');
  const [topicCommentText, setTopicCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingTopic, setSubmittingTopic] = useState(false);

  // Fetch topics from API
  useEffect(() => {
    let isMounted = true;
    setLoadingTopics(true);

    fetch('/api/forum/topics')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.topics)) {
          setTopics(data.topics);
        }
      })
      .catch((err) => console.error('Failed to load forum topics:', err))
      .finally(() => {
        if (isMounted) setLoadingTopics(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch comments when a topic is selected
  useEffect(() => {
    if (!selectedTopic) return;

    let isMounted = true;
    setLoadingComments(true);

    fetch(`/api/forum/topics/${encodeURIComponent(selectedTopic.id)}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.comments)) {
          setCommentsMap((prev) => ({ ...prev, [selectedTopic.id]: data.comments }));
        }
      })
      .catch((err) => console.error('Failed to fetch topic comments:', err))
      .finally(() => {
        if (isMounted) setLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTopic]);

  // Filter and sort topics
  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
        const matchesSearch =
          searchQuery === '' ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === 'top') return b.upvotes - a.upvotes;
        if (sortBy === 'replies') return b.replies - a.replies;
        return 0; // default order
      });
  }, [topics, activeCategory, searchQuery, sortBy]);

  // Handle upvoting
  const handleUpvote = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
    showToast('Upvoted discussion');
  };

  // Trigger New Topic modal (with Auth check)
  const handleOpenNewTopic = () => {
    if (!isAuthenticated || !user) {
      openAuthModal('login', 'Please sign in or register with verified credentials to create a new discussion topic');
      return;
    }
    setIsNewTopicModalOpen(true);
  };

  // Submit new topic with JWT authorization
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      openAuthModal('login', 'Please sign in to publish a discussion topic');
      return;
    }

    if (!newTitle.trim() || !newSnippet.trim()) {
      showToast('Please provide a title and detailed question');
      return;
    }

    setSubmittingTopic(true);

    try {
      const parsedTags = newTagInput
        ? newTagInput.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Discussion'];

      const res = await authFetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          snippet: newSnippet.trim(),
          tags: parsedTags,
        }),
      });

      const data = await res.json();

      if (data.success && data.topic) {
        setTopics((prev) => [data.topic, ...prev]);
        setIsNewTopicModalOpen(false);
        setNewTitle('');
        setNewSnippet('');
        setNewTagInput('');
        showToast('Discussion published to TechVault Forum!');
      } else {
        showToast(data.error || 'Failed to create discussion');
      }
    } catch {
      // Optimistic fallback
      const fallbackTopic: ForumTopic = {
        id: `topic-${Date.now()}`,
        title: newTitle.trim(),
        category: newCategory,
        author: {
          id: user.id,
          name: user.name,
          avatarBg: user.avatarBg || 'bg-[#7f22fe]',
          role: user.role || 'Verified Member',
        },
        snippet: newSnippet.trim(),
        replies: 0,
        views: 1,
        upvotes: 1,
        lastActivity: 'Just now',
        tags: newTagInput ? newTagInput.split(',').map((t) => t.trim()).filter(Boolean) : ['Discussion'],
      };
      setTopics((prev) => [fallbackTopic, ...prev]);
      setIsNewTopicModalOpen(false);
      setNewTitle('');
      setNewSnippet('');
      showToast('Discussion published to TechVault Forum!');
    } finally {
      setSubmittingTopic(false);
    }
  };

  // Add comment to open topic with JWT authorization
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;

    if (!isAuthenticated || !user) {
      openAuthModal('login', 'Sign in or register to reply to this forum topic');
      return;
    }

    if (!topicCommentText.trim()) {
      showToast('Please write a reply before posting');
      return;
    }

    setSubmittingComment(true);

    try {
      const res = await authFetch(`/api/forum/topics/${encodeURIComponent(selectedTopic.id)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: topicCommentText.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && data.comment) {
        setCommentsMap((prev) => ({
          ...prev,
          [selectedTopic.id]: [...(prev[selectedTopic.id] || []), data.comment],
        }));

        setTopics((prev) =>
          prev.map((t) =>
            t.id === selectedTopic.id ? { ...t, replies: t.replies + 1, lastActivity: 'Just now' } : t
          )
        );

        setSelectedTopic((prev) => (prev ? { ...prev, replies: prev.replies + 1 } : null));
        setTopicCommentText('');
        showToast('Comment posted in forum discussion!');
      } else {
        showToast(data.error || 'Failed to post reply');
      }
    } catch {
      // Optimistic fallback
      const fallbackComment: ForumComment = {
        id: `tc-${Date.now()}`,
        topicId: selectedTopic.id,
        author: {
          id: user.id,
          name: user.name,
          avatarBg: user.avatarBg || 'bg-[#7f22fe]',
          role: user.role || 'Verified Member',
        },
        content: topicCommentText.trim(),
        createdAt: 'Just now',
        upvotes: 0,
      };

      setCommentsMap((prev) => ({
        ...prev,
        [selectedTopic.id]: [...(prev[selectedTopic.id] || []), fallbackComment],
      }));

      setTopics((prev) =>
        prev.map((t) =>
          t.id === selectedTopic.id ? { ...t, replies: t.replies + 1, lastActivity: 'Just now' } : t
        )
      );

      setSelectedTopic((prev) => (prev ? { ...prev, replies: prev.replies + 1 } : null));
      setTopicCommentText('');
      showToast('Comment posted in forum discussion!');
    } finally {
      setSubmittingComment(false);
    }
  };

  const currentTopicComments = selectedTopic ? commentsMap[selectedTopic.id] || [] : [];

  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)]">
      {/* ── Desktop Left Sidebar (Categories & Auth Status) ── */}
      <aside className="w-64 xl:w-72 border-r border-white/5 bg-zinc-950/40 backdrop-blur-md p-4 flex-col gap-4 shrink-0 hidden md:flex h-full self-stretch">
        {/* User Auth Status Card */}
        {isAuthenticated && user ? (
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`size-8 rounded-full ${
                  user.avatarBg || 'bg-[#7f22fe]'
                } text-white font-extrabold text-xs flex items-center justify-center shrink-0`}
              >
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{user.name}</span>
                <span className="text-[10px] text-[#00bc7d] font-semibold flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  {user.role || 'Verified Reviewer'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                showToast('Signed out of TechVault');
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#7f22fe]/10 to-zinc-900 border border-[#7f22fe]/20 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#7f22fe]" />
              <span className="text-xs font-bold text-zinc-200">Verified Member Access</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Sign in or register to publish new topics, submit benchmark records, and post replies.
            </p>
            <button
              onClick={() => openAuthModal('login', 'Sign in or register to participate in forum discussions')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <LogIn className="size-3.5" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}

        {/* New Post Button */}
        <button
          onClick={handleOpenNewTopic}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#7f22fe]/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>New Discussion</span>
        </button>

        {/* Categories Section */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider px-2 mb-1">
            Forum Channels
          </span>
          {FORUM_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7f22fe]/20 to-[#ad46ff]/20 text-white border border-[#7f22fe]/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`size-3.5 ${isActive ? 'text-[#ad46ff]' : 'text-zinc-500'}`} />
                  <span>{cat.label}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 font-bold">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Community Trust Badge */}
        <div className="mt-auto p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex items-center gap-2.5 text-zinc-400">
          <Sparkles className="size-4 text-[#00bc7d] shrink-0" />
          <span className="text-[10px] leading-tight font-medium">
            TechVault Forum verifies benchmark scores and hardware telemetry.
          </span>
        </div>
      </aside>

      {/* ── Main Forum Center Content ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-y-auto">
        {/* Responsive Mobile Tab Switcher (< lg screens) */}
        <div className="lg:hidden sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 w-full bg-zinc-900/90 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setMobileTab('discussions')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'discussions'
                  ? 'bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>Discussions</span>
            </button>

            <button
              onClick={() => setMobileTab('channels')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'channels'
                  ? 'bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Channels</span>
            </button>

            <button
              onClick={() => setMobileTab('trends')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'trends'
                  ? 'bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart2 className="size-3.5" />
              <span>Polls & Trends</span>
            </button>
          </div>
        </div>

        {/* Mobile View: Channels Tab */}
        {mobileTab === 'channels' && (
          <div className="lg:hidden p-4 flex flex-col gap-4">
            {/* New Post Button */}
            <button
              onClick={handleOpenNewTopic}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#7f22fe]/20 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Start New Discussion</span>
            </button>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase font-black text-zinc-400 tracking-wider">
                Select a Channel
              </span>
              {FORUM_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setMobileTab('discussions');
                      showToast(`Viewing ${cat.label}`);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7f22fe]/20 to-[#ad46ff]/20 text-white border border-[#7f22fe]/40'
                        : 'bg-zinc-900/60 text-zinc-300 border border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-900 text-[#ad46ff]">
                        <Icon className="size-4" />
                      </div>
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-400">
                      {cat.count} topics
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile View: Trends Tab */}
        {mobileTab === 'trends' && (
          <div className="lg:hidden p-4">
            <ForumRightSidebar />
          </div>
        )}

        {/* Discussions View (Always on desktop, conditional on mobile) */}
        <div className={`p-4 sm:p-6 lg:p-7 flex flex-col gap-6 ${mobileTab !== 'discussions' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header Banner */}
          <div className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#7f22fe]/15 via-zinc-900/80 to-zinc-950 border border-white/10 shadow-xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#7f22fe]/20 via-[#00bc7d]/10 to-transparent blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-2 relative z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7f22fe]/20 text-[#ad46ff] border border-[#7f22fe]/30 font-extrabold text-[10px] uppercase tracking-wider">
                  TechVault Community
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold">• 2.4k Online</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                Hardware Debates, Benchmarks & User Experiences
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Connect with smartphone testers, SoC engineers, and power users. Ask questions, compare battery endurance cycles, and discover authentic device findings.
              </p>
            </div>

            <button
              onClick={handleOpenNewTopic}
              className="relative z-10 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00bc7d] to-[#009664] hover:opacity-95 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00bc7d]/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="size-4" />
              <span>New Discussion</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-2 sm:p-2.5 rounded-2xl border border-white/5 backdrop-blur-sm">
            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="size-4 text-zinc-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search topics, chips, thermal tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe]/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-zinc-500 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-white/5 shrink-0">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  sortBy === 'latest' ? 'bg-[#7f22fe] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  sortBy === 'top' ? 'bg-[#7f22fe] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Top Voted
              </button>
              <button
                onClick={() => setSortBy('replies')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  sortBy === 'replies' ? 'bg-[#7f22fe] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Most Active
              </button>
            </div>
          </div>

          {/* Topics List */}
          <div className="flex flex-col gap-3.5">
            {loadingTopics ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="size-8 rounded-full border-2 border-[#7f22fe] border-t-transparent animate-spin" />
                <span className="text-xs text-zinc-400">Loading verified discussions...</span>
              </div>
            ) : filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-[#7f22fe]/50 hover:bg-zinc-900/80 transition-all duration-200 flex flex-col gap-3 shadow-md advance-card-hover group cursor-pointer"
                >
                  {/* Row 1: Badges, Author & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {topic.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Pin className="size-2.5" /> Pinned
                        </span>
                      )}
                      {topic.isSolved && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00bc7d]/15 text-[#00bc7d] border border-[#00bc7d]/30">
                          <CheckCircle2 className="size-2.5" /> Solved
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-950 border border-white/10 text-zinc-400">
                        {topic.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-500 text-[11px]">
                      <Clock className="size-3" />
                      <span>{topic.lastActivity}</span>
                    </div>
                  </div>

                  {/* Row 2: Title & Snippet */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-[#00bc7d] transition-colors leading-snug">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {topic.snippet}
                    </p>
                  </div>

                  {/* Row 3: Tags + Author + Metrics */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5 mt-1">
                    {/* Author badge */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-6 rounded-full ${
                          topic.author.avatarBg || 'bg-[#7f22fe]'
                        } text-white font-black text-[10px] flex items-center justify-center shrink-0`}
                      >
                        {topic.author.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-zinc-300">{topic.author.name}</span>
                      {topic.author.role && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 border border-white/10 text-[#00bc7d] font-semibold">
                          {topic.author.role}
                        </span>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-zinc-400">
                      <button
                        onClick={(e) => handleUpvote(topic.id, e)}
                        className="flex items-center gap-1 hover:text-[#00bc7d] transition-colors p-1 rounded hover:bg-zinc-800/50 cursor-pointer"
                        title="Upvote discussion"
                      >
                        <ThumbsUp className="size-3.5" />
                        <span>{topic.upvotes}</span>
                      </button>
                      <div className="flex items-center gap-1 hover:text-white transition-colors">
                        <MessageCircle className="size-3.5 text-[#ad46ff]" />
                        <span>{topic.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="size-3.5 text-zinc-500" />
                        <span>{topic.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-900/20 rounded-2xl border border-white/5">
                No discussion topics found in this category. Be the first to start a conversation!
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>

      {/* ── Desktop Famous Forum Right Sidebar ── */}
      <div className="hidden lg:block shrink-0">
        <ForumRightSidebar />
      </div>

      {/* ── Topic Details & Comments Thread Modal ── */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl max-w-3xl w-full p-4 sm:p-6 md:p-8 flex flex-col gap-5 shadow-2xl advance-enter-scale max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-400">
                    {selectedTopic.category}
                  </span>
                  {selectedTopic.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Pin className="size-2.5" /> Pinned
                    </span>
                  )}
                  <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                    <Clock className="size-3" />
                    {selectedTopic.lastActivity}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                  {selectedTopic.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Topic Author & Body */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`size-8 rounded-full ${
                      selectedTopic.author.avatarBg || 'bg-[#7f22fe]'
                    } text-white font-black text-xs flex items-center justify-center`}
                  >
                    {selectedTopic.author.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{selectedTopic.author.name}</span>
                    <span className="text-[10px] text-[#00bc7d]">{selectedTopic.author.role || 'Member'}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleUpvote(selectedTopic.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-[#00bc7d] transition-all cursor-pointer"
                >
                  <ThumbsUp className="size-3.5" />
                  <span>{selectedTopic.upvotes} Upvotes</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                {selectedTopic.snippet}
              </p>

              {/* Tags */}
              {selectedTopic.tags && selectedTopic.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {selectedTopic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 border border-white/5 text-zinc-400 font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Discussion Comments Thread */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <MessageCircle className="size-4 text-[#ad46ff]" />
                  <span>Replies ({currentTopicComments.length})</span>
                </h3>
              </div>

              {/* Comments List */}
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                {loadingComments ? (
                  <div className="py-6 text-center text-xs text-zinc-500">Loading replies...</div>
                ) : currentTopicComments.length > 0 ? (
                  currentTopicComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-6 rounded-full ${
                              comment.author.avatarBg || 'bg-[#7f22fe]'
                            } text-white font-bold text-[10px] flex items-center justify-center`}
                          >
                            {comment.author.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-white">{comment.author.name}</span>
                          {comment.author.role && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 border border-white/10 text-zinc-400 font-semibold">
                              {comment.author.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed pl-8">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-500 bg-zinc-900/20 rounded-xl">
                    No replies yet. Start the conversation below!
                  </div>
                )}
              </div>

              {/* Reply Box with Advance Authentication Protection */}
              {isAuthenticated && user ? (
                <form onSubmit={handleAddComment} className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-zinc-400 font-semibold">
                      Replying as <strong className="text-white">{user.name}</strong> ({user.role || 'Verified Member'})
                    </span>
                    <span className="text-[10px] text-[#00bc7d] flex items-center gap-1 font-semibold">
                      <ShieldCheck className="size-3" />
                      Session Active
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={3}
                      value={topicCommentText}
                      onChange={(e) => setTopicCommentText(e.target.value)}
                      placeholder="Share your technical findings or ask a follow-up question..."
                      className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe]/50 resize-none transition-all"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !topicCommentText.trim()}
                      className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Send className="size-3" />
                      <span>{submittingComment ? 'Posting...' : 'Post Reply'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">Join the Discussion</span>
                    <span className="text-[11px] text-zinc-400">
                      Sign in or register with verified credentials to comment on this topic.
                    </span>
                  </div>
                  <button
                    onClick={() => openAuthModal('login', 'Sign in to post replies on this topic')}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    <LogIn className="size-3.5" />
                    <span>Sign In to Reply</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── New Topic Modal ── */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl max-w-xl w-full p-5 sm:p-7 flex flex-col gap-5 shadow-2xl advance-enter-scale max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#7f22fe]/20 text-[#ad46ff]">
                  <MessageSquare className="size-4" />
                </div>
                <h2 className="text-base font-extrabold text-white">Create New Discussion Topic</h2>
              </div>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="flex flex-col gap-4 text-xs">
              {/* Channel Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Forum Channel</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#7f22fe]/50"
                >
                  <option value="smartphones">Smartphones & Flagships</option>
                  <option value="comparisons">Comparison Debates</option>
                  <option value="rumors">Rumor Mill & Leaks</option>
                  <option value="troubleshooting">Troubleshooting & ROMs</option>
                  <option value="audio">Audio & Wearables</option>
                </select>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Discussion Title</label>
                <input
                  type="text"
                  placeholder="e.g., Dimensity 9400 vs Snapdragon 8 Elite: 60-min thermal stress test"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#7f22fe]/50"
                />
              </div>

              {/* Snippet / Content */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Description / Details</label>
                <textarea
                  rows={4}
                  placeholder="Provide test conditions, benchmark scores, firmware versions or exact questions..."
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#7f22fe]/50 resize-none"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Snapdragon, Gaming, Battery, Thermals"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#7f22fe]/50"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTopic || !newTitle.trim() || !newSnippet.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white font-bold disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {submittingTopic ? 'Publishing...' : 'Publish Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
