'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Box, Smartphone, Check, Plus, Search, SlidersHorizontal, 
  Image as ImageIcon, Info, Tablet, Watch, Headphones, Laptop, Star,
  Sparkles, Zap, Award, Flame, BarChart3
} from 'lucide-react';
import type { Device } from '../data/devices';
import { useApp } from '../context/AppContext';
import { formatCategoryLabel } from '../lib/utils';
import AdSidebar from './AdSidebar';
import LeftAdSidebar from './LeftAdSidebar';
import Footer from './Footer';
import DeviceCard from './DeviceCard';

interface BrandPageContentProps {
  brandName: string;
  devices: Device[];
  allDevices: Device[];
}

export default function BrandPageContent({ brandName, devices, allDevices }: BrandPageContentProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-high' | 'price-low' | 'rating'>('newest');
  const itemsPerPage = 20;

  const {
    selectedDevices,
    handleSelectDevice,
    handleRemoveDevice,
    handleBuy,
    showToast,
  } = useApp();

  // Scroll visibility observer for animate-on-scroll
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-device-id');
            if (id) {
              setVisibleItems((prev) => ({ ...prev, [id]: true }));
            }
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = document.querySelectorAll('[data-device-id]');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [devices, currentPage, selectedCategory, searchQuery, sortBy]);

  // Custom brand banner image state allow user custom background URL overrides
  const [customBannerUrl, setCustomBannerUrl] = useState<string>('');

  // Helper for brand specific background mapping
  const getBrandBackground = (brand: string) => {
    if (customBannerUrl) return customBannerUrl;
    const b = brand.toLowerCase();
    if (b.includes('apple')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000';
    if (b.includes('samsung')) return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2000';
    if (b.includes('google') || b.includes('pixel')) return 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?q=80&w=2000';
    if (b.includes('oneplus')) return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2000';
    if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) return 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=2000';
    if (b.includes('sony')) return 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000';
    if (b.includes('asus') || b.includes('rog')) return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000';
    if (b.includes('huawei') || b.includes('honor')) return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000';
    if (b.includes('motorola')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2000';
    if (b.includes('oppo') || b.includes('vivo') || b.includes('realme')) return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000';
    if (b.includes('nokia')) return 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=2000';
    return 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2000';
  };

  const handleSetCustomBanner = () => {
    const url = prompt(`Enter custom background image URL for ${brandName} banner:`, getBrandBackground(brandName));
    if (url && url !== getBrandBackground(brandName)) {
      setCustomBannerUrl(url);
      showToast('Brand banner background updated!');
    }
  };

  const isDeviceInComparison = (device: Device) => {
    return selectedDevices.some(sd => sd?.id === device.id);
  };

  const handleCompareClick = (device: Device) => {
    const existingIndex = selectedDevices.findIndex(sd => sd?.id === device.id);
    if (existingIndex !== -1) {
      handleRemoveDevice(existingIndex);
      showToast(`Removed ${device.name} from comparison`);
      return;
    }

    const emptySlotIndex = selectedDevices.findIndex(sd => sd === null);
    if (emptySlotIndex !== -1) {
      handleSelectDevice(emptySlotIndex, device);
      showToast(`Added ${device.name} to comparison`);
      router.push('/compare');
    } else {
      showToast('Comparison slots are full! Remove a device from comparison first.');
    }
  };

  // Top stats for this brand
  const topDevice = useMemo(() => {
    if (devices.length === 0) return null;
    return [...devices].sort((a, b) => b.rating - a.rating)[0];
  }, [devices]);

  const avgRating = useMemo(() => {
    if (devices.length === 0) return '0.0';
    const sum = devices.reduce((acc, d) => acc + (d.rating || 0), 0);
    return (sum / devices.length).toFixed(1);
  }, [devices]);

  // Filter and sort devices
  const filteredAndSortedDevices = useMemo(() => {
    let result = devices.filter(d => {
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!d.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'price-high') {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      if (sortBy === 'price-low') {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
        return pA - pB;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // 'newest' default
      return 0;
    });

    return result;
  }, [devices, selectedCategory, searchQuery, sortBy]);

  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDevices.slice(start, start + itemsPerPage);
  }, [filteredAndSortedDevices, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedDevices.length / itemsPerPage);

  const categoriesAvailable = useMemo(() => {
    const set = new Set(devices.map(d => d.category));
    return Array.from(set);
  }, [devices]);

  const renderCardSpecs = (device: Device) => {
    const specItems = [];
    if (device.specs.chipset) specItems.push(device.specs.chipset.split('(')[0].replace('Snapdragon', 'SD').trim());
    if (device.specs.displayTypeSize) specItems.push(device.specs.displayTypeSize.split(',')[0].trim());
    if (device.specs.mainCamera) specItems.push(`Cam: ${device.specs.mainCamera.split('+')[0].trim()}`);

    return (
      <div className="flex flex-wrap gap-1 my-2">
        {specItems.map((spec, idx) => (
          <span
            key={idx}
            className="text-[9px] font-semibold text-zinc-400 bg-zinc-950/80 border border-white/5 px-2 py-0.5 rounded truncate max-w-full"
          >
            {spec}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar containing Brand Explorer */}
      <LeftAdSidebar devices={allDevices && allDevices.length > 0 ? allDevices : devices} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16">
        {/* Brand Hero Banner with Vibrant Glassmorphism */}
        <div className="relative w-full h-[320px] md:h-[360px] overflow-hidden flex flex-col justify-end p-6 md:p-10 border-b border-white/10 shadow-2xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity scale-105 transform-gpu transition-all duration-1000"
            style={{ backgroundImage: `url(${getBrandBackground(brandName)})` }}
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-transparent" />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-violet-600/20 via-emerald-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
          
          {/* Hero Content */}
          <div className="relative z-10 flex flex-col gap-4 max-w-4xl">
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/all-brands" className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-300 hover:text-white transition-colors w-fit bg-zinc-900/80 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 hover:border-violet-500/60 shadow-lg">
                <ArrowLeft className="size-3.5" />
                All Brands Directory
              </Link>
              <button
                onClick={handleSetCustomBanner}
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#00bc7d] hover:text-white transition-colors w-fit bg-zinc-900/80 backdrop-blur-xl px-4 py-1.5 rounded-full border border-[#00bc7d]/30 hover:border-[#00bc7d] cursor-pointer shadow-lg"
              >
                <ImageIcon className="size-3.5 text-[#00bc7d]" />
                Change Banner
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-1">
              <div className="flex items-center gap-4">
                <div className="size-20 md:size-24 rounded-3xl bg-gradient-to-br from-[#7f22fe] via-cyan-400 to-[#00bc7d] p-0.5 shadow-2xl shadow-[#7f22fe]/40 shrink-0">
                  <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-black text-white">
                      {brandName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md truncate">
                    {brandName}
                  </h1>
                  <p className="text-zinc-400 font-bold text-xs md:text-sm mt-1 flex items-center gap-2">
                    <Smartphone className="size-4 text-[#00bc7d]" />
                    <span>{devices.length} Official Device Specifications</span>
                  </p>
                </div>
              </div>

              {/* Brand Stats Quick Summary Bar */}
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex flex-col shadow-lg">
                  <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400">Total Lineup</span>
                  <span className="text-base font-black text-white">{devices.length} Devices</span>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex flex-col shadow-lg">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">Avg Rating</span>
                  <span className="text-base font-black text-amber-400 flex items-center gap-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {avgRating} / 5.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="px-6 md:px-10 mt-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                className={`text-xs font-black px-4 py-2 rounded-2xl border transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white border-transparent shadow-[0_0_12px_rgba(127,34,254,0.4)]'
                    : 'bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                All ({devices.length})
              </button>
              {categoriesAvailable.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`text-xs font-black px-4 py-2 rounded-2xl border transition-all uppercase tracking-wider cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#00bc7d] to-teal-400 text-white border-transparent shadow-[0_0_12px_rgba(0,188,125,0.4)]'
                      : 'bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {formatCategoryLabel(cat)} ({devices.filter(d => d.category === cat).length})
                </button>
              ))}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-60">
                <Search className="size-3.5 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${brandName}...`}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-zinc-950 border border-white/15 rounded-2xl pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-violet-500 transition-all shadow-inner"
                />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-zinc-950 border border-white/15 rounded-2xl px-3.5 py-2 text-xs text-neutral-200 outline-none focus:border-violet-500 font-bold cursor-pointer shadow-inner"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedDevices.map((device, idx) => {
              const inCompare = isDeviceInComparison(device);

              return (
                <DeviceCard
                  key={device.id || `${device.name}-${idx}`}
                  device={device}
                  inCompare={inCompare}
                  onCompareClick={handleCompareClick}
                  priorityImage={idx < 4}
                />
              );
            })}
          </div>

          {filteredAndSortedDevices.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center bg-zinc-900/30 rounded-3xl border border-white/10">
              <Box className="size-14 text-zinc-600 mb-3" />
              <h3 className="text-xl font-black text-white">No products found</h3>
              <p className="text-xs text-zinc-400 mt-1">No devices matched your search or category filter for {brandName}.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 text-xs font-black bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border-t border-white/10 pt-6">
              <span className="text-zinc-400 text-xs font-bold bg-zinc-900/80 px-4 py-2 rounded-xl border border-white/5">
                Page {currentPage} of {totalPages} ({filteredAndSortedDevices.length} products)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-black disabled:opacity-40 hover:bg-zinc-800 transition-colors cursor-pointer text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-black disabled:opacity-40 hover:bg-zinc-800 transition-colors cursor-pointer text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16">
          <Footer />
        </div>
      </div>

      {/* Right Ad Sidebar */}
      <AdSidebar />
    </div>
  );
}

