'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Compass, Smartphone, Watch, Headphones, Tablet, Laptop, ArrowRight, Search, Layers, Sparkles } from 'lucide-react';
import type { Device } from '../data/devices';
import LeftAdSidebar from './LeftAdSidebar';
import AdSidebar from './AdSidebar';
import Footer from './Footer';

import brandManifest from '../../public/brands/manifest.json';

export interface BrandStatItem {
  brand: string;
  total: number;
  categories: string[];
}

interface AllBrandsPageContentProps {
  initialBrandStats?: BrandStatItem[];
  initialDevices?: Device[];
}

const BRAND_PALETTES = [
  { gradient: 'from-violet-600 to-indigo-600', glow: 'rgba(124, 58, 237, 0.35)', border: 'hover:border-violet-500/60', text: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  { gradient: 'from-emerald-500 to-teal-500', glow: 'rgba(16, 185, 129, 0.35)', border: 'hover:border-emerald-500/60', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { gradient: 'from-cyan-500 to-blue-600', glow: 'rgba(6, 182, 212, 0.35)', border: 'hover:border-cyan-500/60', text: 'text-cyan-400', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { gradient: 'from-amber-500 to-orange-600', glow: 'rgba(245, 158, 11, 0.35)', border: 'hover:border-amber-500/60', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { gradient: 'from-rose-500 to-pink-600', glow: 'rgba(244, 63, 94, 0.35)', border: 'hover:border-rose-500/60', text: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { gradient: 'from-fuchsia-500 to-purple-600', glow: 'rgba(217, 70, 239, 0.35)', border: 'hover:border-fuchsia-500/60', text: 'text-fuchsia-400', badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
];

function BrandAvatar({ brand, gradient }: { brand: string; gradient: string }) {
  const [imageError, setImageError] = useState(false);
  const initial = brand.charAt(0).toUpperCase();
  const slug = useMemo(() => {
    return brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }, [brand]);

  const imageSrc = (brandManifest as Record<string, string>)[slug] || `/brands/${slug}.png`;

  return (
    <div className={`size-12 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 shadow-lg group-hover:scale-108 transition-all duration-300 shrink-0`}>
      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-2 shadow-inner">
        {!imageError ? (
          <img
            src={imageSrc}
            alt={brand}
            className="w-full h-full object-contain rounded-[6px] group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-lg font-black text-zinc-900 group-hover:scale-110 transition-transform">
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AllBrandsPageContent({ initialBrandStats = [], initialDevices = [] }: AllBrandsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Grouped brands with their device counts (pre-computed on server if provided)
  const brandStats = useMemo(() => {
    if (initialBrandStats && initialBrandStats.length > 0) {
      return initialBrandStats;
    }
    const stats: Record<string, { total: number; categories: Set<string> }> = {};
    initialDevices.forEach((device) => {
      if (!device.brand) return;
      const bName = device.brand.trim();
      if (!stats[bName]) {
        stats[bName] = { total: 0, categories: new Set() };
      }
      stats[bName].total += 1;
      if (device.category) stats[bName].categories.add(device.category);
    });

    return Object.entries(stats)
      .map(([brand, data]) => ({
        brand,
        total: data.total,
        categories: Array.from(data.categories),
      }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [initialBrandStats, initialDevices]);

  // Unique alphabet letters available
  const availableLetters = useMemo(() => {
    const letters = new Set(brandStats.map(b => b.brand.charAt(0).toUpperCase()));
    return Array.from(letters).sort();
  }, [brandStats]);

  // Filtered brands based on search & alphabet filter
  const filteredBrands = useMemo(() => {
    return brandStats.filter(({ brand }) => {
      if (searchQuery) {
        if (!brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      }
      if (selectedLetter) {
        if (brand.charAt(0).toUpperCase() !== selectedLetter) return false;
      }
      return true;
    });
  }, [brandStats, searchQuery, selectedLetter]);

  // Divide filtered brands into two balanced vertical columns (GSM Arena Style)
  const [leftColumnBrands, rightColumnBrands] = useMemo(() => {
    const mid = Math.ceil(filteredBrands.length / 2);
    return [filteredBrands.slice(0, mid), filteredBrands.slice(mid)];
  }, [filteredBrands]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'mobiles': return <span key={cat} title="Smartphones"><Smartphone className="size-3 text-cyan-400" /></span>;
      case 'watches': return <span key={cat} title="Watches"><Watch className="size-3 text-amber-400" /></span>;
      case 'earbuds': return <span key={cat} title="Audio"><Headphones className="size-3 text-pink-400" /></span>;
      case 'tablets': return <span key={cat} title="Tablets"><Tablet className="size-3 text-emerald-400" /></span>;
      case 'laptops': return <span key={cat} title="Laptops"><Laptop className="size-3 text-violet-400" /></span>;
      default: return null;
    }
  };

  const renderBrandCard = ({ brand, total, categories }: { brand: string; total: number; categories: string[] }, index: number) => {
    const palette = BRAND_PALETTES[index % BRAND_PALETTES.length];

    return (
      <Link key={brand} href={`/phone/${encodeURIComponent(brand.toLowerCase())}/p1`}>
        <div className={`bg-gradient-to-r from-zinc-900/80 via-zinc-900/50 to-zinc-950/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer group transition-all duration-300 hover:bg-zinc-850 ${palette.border} shadow-lg hover:shadow-2xl hover:-translate-y-1`}
          style={{
            // @ts-ignore
            '--hover-glow': palette.glow,
          }}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Brand Logo Avatar with Vibrant Gradient Border */}
            <BrandAvatar brand={brand} gradient={palette.gradient} />

            {/* Brand Title & Categories */}
            <div className="flex flex-col min-w-0">
              <h3 className="text-base font-black text-neutral-100 group-hover:text-white truncate tracking-tight">
                {brand}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="flex gap-1.5 bg-zinc-950/90 px-2 py-0.5 rounded-full border border-white/10">
                  {categories.map(cat => getCategoryIcon(cat))}
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${palette.badge}`}>
                  {total} {total === 1 ? 'device' : 'devices'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Arrow */}
          <div className="size-9 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/30 group-hover:bg-zinc-800 transition-all shadow-inner">
            <ArrowRight className="size-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar featuring Brand Explorer */}
      <LeftAdSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 pb-20">
          {/* Hero Header with Vibrant Neon Backdrop */}
          <section className="relative py-14 px-6 md:px-10 flex flex-col items-center text-center overflow-hidden border-b border-white/10 bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950">
            {/* Ambient Multi-color Orbs */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-600/15 to-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-l from-cyan-500/15 to-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative max-w-3xl flex flex-col items-center gap-3.5 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-black text-[#00bc7d] shadow-sm backdrop-blur-md">
                <Sparkles className="size-3.5 text-[#00bc7d]" />
                <span>GSM Arena Style Brand Directory</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Explore All <span className="bg-gradient-to-r from-[#00bc7d] via-cyan-400 to-[#ad46ff] bg-clip-text text-transparent">Tech Brands</span>
              </h1>
              <p className="text-[#9f9fa9] text-xs md:text-sm max-w-xl leading-relaxed">
                Browse our comprehensive database of {brandStats.length} smartphone, tablet, smartwatch, audio, and laptop manufacturers. Select any brand to view specs, scores, and real-time prices.
              </p>

              {/* Search & Alphabet Filter Controls */}
              <div className="w-full max-w-xl mt-4 flex flex-col gap-3">
                <div className="relative w-full">
                  <Search className="size-4 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search brand name (e.g. Samsung, Apple, Xiaomi, Nothing)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-white/15 rounded-2xl pl-10 pr-16 py-3 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded-lg"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Alphabetical Quick Jump Navigation Bar */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 bg-zinc-900/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-lg">
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      selectedLetter === null
                        ? 'bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white shadow-[0_0_12px_rgba(127,34,254,0.4)] scale-105'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                    }`}
                  >
                    ALL
                  </button>
                  {availableLetters.map(letter => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                      className={`text-[10px] font-black w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        selectedLetter === letter
                          ? 'bg-gradient-to-r from-[#00bc7d] to-teal-400 text-white shadow-[0_0_12px_rgba(0,188,125,0.4)] scale-110'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Brands Directory: GSM Arena Style Two Vertical Columns Layout */}
          <section className="py-10 px-6 md:px-10 lg:px-12 max-w-7xl mx-auto w-full">
            {filteredBrands.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-3">
                <Layers className="size-12 text-zinc-600 mb-1" />
                <h3 className="text-lg font-black text-zinc-200">No brands found</h3>
                <p className="text-xs text-zinc-400">Try clearing search filters or selecting another letter.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedLetter(null); }}
                  className="mt-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
                
                {/* Left Vertical Column */}
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
                    <span className="text-xs font-black text-[#ad46ff] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#ad46ff]" />
                      Brands ({leftColumnBrands.length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {leftColumnBrands.map((b, i) => renderBrandCard(b, i))}
                  </div>
                </div>

                {/* Right Vertical Column */}
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
                    <span className="text-xs font-black text-[#00bc7d] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#00bc7d]" />
                      Brands ({rightColumnBrands.length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {rightColumnBrands.map((b, i) => renderBrandCard(b, i + leftColumnBrands.length))}
                  </div>
                </div>

              </div>
            )}
          </section>
        </div>
        
        {/* Footer */}
        <Footer />
      </main>

      {/* Right Sidebar */}
      <AdSidebar />
    </div>
  );
}

