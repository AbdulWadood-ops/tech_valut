'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Newspaper, ExternalLink, Search, Calendar, Smartphone, Tag, Check, Filter } from 'lucide-react';
import type { NewsArticle, Device } from '../data/devices';
import LeftAdSidebar from './LeftAdSidebar';
import AdSidebar from './AdSidebar';
import Footer from './Footer';

interface NewsPageContentProps {
  initialArticles: NewsArticle[];
  initialDevices: Device[];
}

export default function NewsPageContent({ initialArticles, initialDevices }: NewsPageContentProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map deviceId -> Device object for fast lookup
  const deviceMap = useMemo(() => {
    const map = new Map<string, Device>();
    initialDevices.forEach(d => map.set(d.id, d));
    return map;
  }, [initialDevices]);

  // Filter articles based on activeTab & searchQuery
  const filteredArticles = useMemo(() => {
    return initialArticles.filter(article => {
      if (activeTab !== 'all' && article.type !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSummary = article.summary.toLowerCase().includes(q);
        const matchesSource = article.source.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesSource) return false;
      }
      return true;
    });
  }, [initialArticles, activeTab, searchQuery]);

  const formatDate = (dateVal: Date | string) => {
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source.toLowerCase()) {
      case 'gsmarena':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'android authority':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'the verge':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar containing Brand Explorer */}
      <LeftAdSidebar devices={initialDevices} />

      {/* Main News Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 pb-20">
          
          {/* Hero Header */}
          <section className="relative py-12 px-6 md:px-10 flex flex-col items-center text-center overflow-hidden border-b border-white/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7f22fe]/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative max-w-3xl flex flex-col items-center gap-3 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-extrabold text-[#00bc7d]">
                <Newspaper className="size-3.5 text-[#00bc7d]" />
                <span>Live Tech Feed</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Tech Launch <span className="bg-gradient-to-r from-[#00bc7d] via-[#7f22fe] to-[#ad46ff] bg-clip-text text-transparent">News & Reviews</span>
              </h1>

              <p className="text-[#9f9fa9] text-xs md:text-sm max-w-xl">
                Stay informed with real-time RSS updates from GSMArena, Android Authority, and The Verge. Filter phone launches, hands-on reviews, and specs announcements.
              </p>

              {/* Controls: Search Bar & Tabs */}
              <div className="w-full max-w-xl mt-5 flex flex-col gap-3">
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="size-4 text-[#7f22fe] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search articles, phones, or keywords (e.g. Pixel 9, Galaxy S24, iPhone 16)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe] focus:ring-1 focus:ring-[#7f22fe] transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-center gap-2 bg-zinc-900/60 backdrop-blur-md p-1.5 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-[#7f22fe] text-white shadow-[0_0_12px_rgba(127,34,254,0.4)]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    All ({initialArticles.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      activeTab === 'news'
                        ? 'bg-[#00bc7d] text-white shadow-[0_0_12px_rgba(0,188,125,0.4)]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    News ({initialArticles.filter(a => a.type === 'news').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('review')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      activeTab === 'review'
                        ? 'bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    Reviews ({initialArticles.filter(a => a.type === 'review').length})
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Articles Showcase Grid */}
          <section className="py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
                <Newspaper className="size-12 text-zinc-600 mb-1" />
                <h3 className="text-lg font-black text-zinc-200">No Articles Found</h3>
                <p className="text-xs text-zinc-500 max-w-md">
                  No news or review articles matched your current search or tab filter. Try running the RSS fetcher or clearing filters.
                </p>
                <button
                  onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                  className="mt-2 text-xs font-black text-[#00bc7d] hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredArticles.map((article) => {
                  const linkedDevice = article.deviceId ? deviceMap.get(article.deviceId) : null;
                  const sourceBadge = getSourceBadgeClass(article.source);

                  return (
                    <article
                      key={article.link}
                      className="group rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#7f22fe]/60 hover:bg-zinc-900/80 transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(127,34,254,0.25)] hover:-translate-y-1"
                    >
                      <div>
                        {/* Article Image Banner */}
                        <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-950 relative border-b border-white/5">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';
                            }}
                          />
                          
                          {/* Type Overlay Badge */}
                          <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border backdrop-blur-md shadow-md ${
                            article.type === 'review'
                              ? 'bg-amber-500/90 text-white border-amber-400'
                              : 'bg-[#7f22fe]/90 text-white border-[#7f22fe]'
                          }`}>
                            {article.type}
                          </span>

                          {/* Source Badge */}
                          <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md shadow-md ${sourceBadge}`}>
                            {article.source}
                          </span>
                        </div>

                        {/* Article Details */}
                        <div className="p-5 flex flex-col gap-2.5">
                          {/* Date */}
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                            <Calendar className="size-3 text-zinc-500" />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>

                          {/* Article Title */}
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-extrabold text-neutral-100 text-base group-hover:text-white leading-snug line-clamp-2 hover:underline cursor-pointer"
                          >
                            {article.title}
                          </a>

                          {/* Article Excerpt / Summary */}
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                            {article.summary}
                          </p>

                          {/* Linked Device Badge (If matched) */}
                          {linkedDevice && (
                            <Link
                              href={`/device/${linkedDevice.id}`}
                              className="mt-1 self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00bc7d]/10 border border-[#00bc7d]/30 text-[#00bc7d] text-[10px] font-black hover:bg-[#00bc7d]/20 transition-colors"
                            >
                              <Smartphone className="size-3" />
                              <span>Specs: {linkedDevice.name}</span>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Bottom External Link Action */}
                      <div className="p-5 pt-0">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-white/10 hover:border-[#00bc7d]/60 hover:bg-[#00bc7d]/10 text-neutral-200 hover:text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer group/link shadow-inner"
                        >
                          <span>Read Full Article</span>
                          <ExternalLink className="size-3.5 text-[#00bc7d] group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Right Ad Sidebar */}
      <AdSidebar />
    </div>
  );
}
