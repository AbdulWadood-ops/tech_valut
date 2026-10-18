'use client';

/* eslint-disable */
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Tablet,
  Search,
  Star,
  SlidersHorizontal,
  Plus,
  Check,
  Info,
  Sparkles,
  Zap,
  Cpu,
  Flame,
  Bell,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import Link from 'next/link';
import type { Device } from '../data/devices';
import { Button } from './ui/button';
import AdSidebar from './AdSidebar';
import Footer from './Footer';
import { useApp } from '../context/AppContext';
import BrandExplorer from './BrandExplorer';
import DeviceCard from './DeviceCard';
import BrowseCategorySection from './BrowseCategorySection';

interface DevicesPageContentProps {
  initialDevices: Device[];
  totalDevices?: number;
  serverPage?: number;
  serverTotalPages?: number;
  allBrands?: string[];
}

export default function DevicesPageContent({
  initialDevices,
  totalDevices = initialDevices.length,
  serverPage = 1,
  serverTotalPages = 1,
  allBrands = []
}: DevicesPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = (searchParams.get('category') as any) || 'mobiles';

  const {
    selectedDevices,
    handleSelectDevice,
    handleRemoveDevice,
    handleBuy,
    showToast,
    setActiveCategory
  } = useApp();


  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Custom images override: in-memory override so the UI reflects the new image
  // immediately after the API writes it to the JSON file.
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  const handleSelectDeviceFromExplorer = (device: Device) => {
    if (activeCategory !== device.category) {
      router.push(`/devices?category=${device.category}`);
    }
    setSearchQuery(device.name);
    setCurrentPage(1);
    showToast(`Showing ${device.name}`);
  };

  // Helper to parse price string to number
  const parsePrice = (priceStr: string): number => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  // Get all devices in current category (or fallback to initialDevices if already server-filtered)
  const categoryDevices = useMemo(() => {
    const matched = initialDevices.filter(d => !d.category || d.category === activeCategory);
    return matched.length > 0 ? matched : initialDevices;
  }, [initialDevices, activeCategory]);

  // Dynamically extract unique brands for the current category or use server allBrands
  const availableBrands = useMemo(() => {
    if (allBrands && allBrands.length > 0) return allBrands;
    const brandsSet = new Set(initialDevices.map(d => d.brand));
    return Array.from(brandsSet).sort();
  }, [allBrands, initialDevices]);

  // Sync global context's active category with URL param
  useEffect(() => {
    setActiveCategory(activeCategory);
  }, [activeCategory, setActiveCategory]);

  // Reset filters and page when category changes
  useEffect(() => {
    setSearchQuery('');
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setCurrentPage(1);
  }, [activeCategory]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBrands, minPrice, maxPrice, minRating]);

  // Filtered Devices
  const filteredDevices = useMemo(() => {
    return categoryDevices.filter(device => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = device.name.toLowerCase().includes(query);
        const matchesBrand = device.brand.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand) return false;
      }

      // 2. Brand Filter
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(device.brand)) return false;
      }

      // 3. Price Filters
      const priceVal = parsePrice(device.price);
      if (minPrice && priceVal < parseFloat(minPrice)) return false;
      if (maxPrice && priceVal > parseFloat(maxPrice)) return false;

      // 4. Rating Filter
      if (minRating > 0 && device.rating < minRating) return false;

      return true;
    });
  }, [categoryDevices, searchQuery, selectedBrands, minPrice, maxPrice, minRating]);

  // Pagination Logic (Default 45 per page)
  const itemsPerPage = 45;
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDevices.slice(start, start + itemsPerPage);
  }, [filteredDevices, currentPage, itemsPerPage]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    showToast('Filters cleared');
  };

  const isDeviceInComparison = (device: Device) => {
    return selectedDevices.some(sd => sd?.id === device.id);
  };

  const handleCompareClick = (device: Device) => {
    // If already in comparison, remove it
    const existingIndex = selectedDevices.findIndex(sd => sd?.id === device.id);
    if (existingIndex !== -1) {
      handleRemoveDevice(existingIndex);
      showToast(`Removed ${device.name} from comparison`);
      return;
    }

    // Try to find first empty slot
    const emptySlotIndex = selectedDevices.findIndex(sd => sd === null);
    if (emptySlotIndex !== -1) {
      handleSelectDevice(emptySlotIndex, device);
      showToast(`Added ${device.name} to comparison`);
      router.push('/compare');
    } else {
      showToast('Comparison slots are full! Remove a device from comparison first.');
    }
  };

  const handleChangePicture = async (device: Device) => {
    const currentImage = customImages[device.id] || device.image;
    const url = prompt(`Enter new image URL for ${device.name}:`, currentImage);
    if (!url || url === currentImage) return;

    try {
      const res = await fetch('/api/update-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: device.id,
          brandSlug: device.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          newImageUrl: url
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update in-memory override so the card reflects the new image right away
        // without calling router.refresh() which reloads the cached module and reverts it.
        setCustomImages(prev => ({ ...prev, [device.id]: url }));
        showToast('Image updated successfully!');
      } else {
        showToast(data.error || 'Failed to update image');
      }
    } catch (err) {
      showToast('Error updating image');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="size-3.5 fill-[#fe9a00] text-[#fe9a00]" />);
      } else {
        stars.push(<Star key={i} className="size-3.5 text-zinc-650" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'mobiles':
        return {
          name: 'Phones',
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          hoverBorder: 'hover:border-cyan-400/60',
          shadow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]',
          imgGlow: 'bg-cyan-500/20',
          btn: 'glow-btn-cyan text-white font-black',
          activeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
        };
      case 'tablets':
        return {
          name: 'Tablets',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          hoverBorder: 'hover:border-emerald-400/60',
          shadow: 'hover:shadow-[0_0_25px_rgba(0,188,125,0.35)]',
          imgGlow: 'bg-emerald-500/20',
          btn: 'glow-btn-emerald text-white font-black',
          activeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(0,188,125,0.3)]'
        };
      case 'watches':
        return {
          name: 'Smartwatches',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          hoverBorder: 'hover:border-amber-400/60',
          shadow: 'hover:shadow-[0_0_25px_rgba(254,154,0,0.35)]',
          imgGlow: 'bg-amber-500/20',
          btn: 'glow-btn-amber text-white font-black',
          activeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(254,154,0,0.3)]'
        };
      case 'earbuds':
        return {
          name: 'Earbuds',
          text: 'text-pink-400',
          bg: 'bg-pink-500/10',
          border: 'border-pink-500/30',
          hoverBorder: 'hover:border-pink-400/60',
          shadow: 'hover:shadow-[0_0_25px_rgba(236,72,153,0.35)]',
          imgGlow: 'bg-pink-500/20',
          btn: 'glow-btn-pink text-white font-black',
          activeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
        };
      case 'laptops':
      default:
        return {
          name: 'Laptops',
          text: 'text-[#ad46ff]',
          bg: 'bg-[#7f22fe]/15',
          border: 'border-[#7f22fe]/30',
          hoverBorder: 'hover:border-[#7f22fe]/60',
          shadow: 'hover:shadow-[0_0_25px_rgba(127,34,254,0.35)]',
          imgGlow: 'bg-[#7f22fe]/20',
          btn: 'glow-btn-purple text-white font-black',
          activeBg: 'bg-[#7f22fe]/15 text-[#ad46ff] border-[#7f22fe]/40 shadow-[0_0_12px_rgba(127,34,254,0.3)]'
        };
    }
  };

  const renderCardSpecs = (device: Device) => {
    const specItems = [];
    if (device.category === 'mobiles') {
      const chipset = device.specs?.chipset || (device.specs as any)?.processor;
      if (chipset) {
        specItems.push(chipset.split('(')[0].replace('Snapdragon', 'SD').trim());
      }
      const storage = device.specs?.storageVariants || (device.specs as any)?.storage;
      if (device.specs?.ram && storage) {
        specItems.push(
          `${device.specs.ram.split('/')[0].trim()} • ${storage.split('/')[0].trim()}`
        );
      }
    } else if (device.category === 'laptops') {
      const chipset = device.specs?.chipset || (device.specs as any)?.processor;
      if (chipset) specItems.push(chipset.split('(')[0].trim());
      if (device.specs?.ram) specItems.push(device.specs.ram);
    } else if (device.category === 'watches') {
      if (device.specs?.displayTypeSize)
        specItems.push(device.specs.displayTypeSize.replace('display', '').trim());
      if (device.specs?.resistance) specItems.push(device.specs.resistance.split('(')[0].trim());
    } else if (device.category === 'earbuds') {
      if (device.specs?.bluetooth) specItems.push(`Bluetooth ${device.specs.bluetooth}`);
      const battery = device.performance?.batteryLife || (device.specs as any)?.battery;
      if (battery) specItems.push(`Battery: ${battery}`);
    } else if (device.category === 'tablets') {
      if (device.specs?.displayTypeSize)
        specItems.push(device.specs.displayTypeSize.split(',')[0].trim());
      const chipset = device.specs?.chipset || (device.specs as any)?.processor;
      if (chipset) specItems.push(chipset.split('(')[0].trim());
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2 mb-1.5">
        {specItems.map((spec, idx) => (
          <span
            key={idx}
            className="text-[9px] font-semibold text-zinc-300 bg-zinc-950/80 border border-white/10 px-2 py-0.5 rounded truncate max-w-full"
          >
            {spec}
          </span>
        ))}
      </div>
    );
  };


  return (
    <div className="flex flex-1 w-full bg-zinc-950 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Category & Filters */}
      <aside className="w-64 xl:w-72 2xl:w-80 border-r border-white/5 bg-zinc-900/20 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 hidden md:flex h-full">
        {/* Unified Categories Section */}
        <BrowseCategorySection currentCategory={activeCategory} />

        <hr className="border-white/5" />

        <BrandExplorer
          devices={categoryDevices}
          onSelectDevice={handleSelectDeviceFromExplorer}
          onCompareDevice={handleCompareClick}
          isDeviceInComparison={isDeviceInComparison}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
        />

        <hr className="border-white/5" />

        {/* Filters Section Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-extrabold text-[#9f9fa9] tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </h3>
          {(searchQuery ||
            selectedBrands.length > 0 ||
            minPrice ||
            maxPrice ||
            minRating > 0) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-[#00bc7d] hover:text-[#00bc7d]/80 font-semibold cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-xs font-semibold text-neutral-300">Price Range ($)</h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe]"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe]"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-neutral-300">Minimum Rating</h4>
          <div className="flex flex-wrap gap-1.5">
            {[0, 4.0, 4.5].map(rating => {
              const isActive = minRating === rating;
              return (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#fe9a00]/15 text-[#fe9a00] border-[#fe9a00]/40'
                      : 'bg-zinc-900 border-white/5 text-[#9f9fa9] hover:text-white'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}★ & Up`}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Devices Panel */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 w-full">
          {/* Unified Horizontal Category Scroller for Mobile */}
          <div className="md:hidden">
            <BrowseCategorySection orientation="horizontal" currentCategory={activeCategory} />
          </div>

          {/* Main Grid Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-black text-white capitalize flex items-center gap-2.5">
                <span>
                  {activeCategory === 'mobiles'
                    ? 'Phones & Smartphones'
                    : activeCategory === 'tablets'
                    ? 'Tablets & Media Pads'
                    : activeCategory === 'watches'
                    ? 'Smartwatches & Wearables'
                    : activeCategory === 'earbuds'
                    ? 'Wireless & ANC Earbuds'
                    : 'Ultrabooks & Laptops'}
                </span>
                <span className="text-xs bg-zinc-900 border border-white/10 text-[#00bc7d] px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {filteredDevices.length} / {categoryDevices.length} items
                </span>
              </h2>
            </div>

            {/* Search query & Mobile Filter Trigger in Main Area */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="size-4 text-[#7f22fe] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="Search by name or brand..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-all"
                />
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300 hover:text-white shrink-0 cursor-pointer"
                title="Open Filters"
              >
                <SlidersHorizontal className="size-3.5 text-[#7f22fe]" />
                <span>Filters</span>
                {(selectedBrands.length > 0 || minPrice || maxPrice || minRating > 0) && (
                  <span className="size-2 rounded-full bg-[#00bc7d]" />
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Indicators */}
          {(selectedBrands.length > 0 || minPrice || maxPrice || minRating > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#9f9fa9]">Active Filters:</span>
              {selectedBrands.map(brand => (
                <span
                  key={brand}
                  className="text-[10px] bg-zinc-900 border border-white/5 text-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  {brand}
                  <button
                    onClick={() => handleBrandToggle(brand)}
                    className="hover:text-red-450 cursor-pointer"
                  >
                    x
                  </button>
                </span>
              ))}
              {minPrice && (
                <span className="text-[10px] bg-zinc-900 border border-white/5 text-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {`>= $${minPrice}`}
                  <button onClick={() => setMinPrice('')} className="hover:text-red-450 cursor-pointer">
                    x
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="text-[10px] bg-zinc-900 border border-white/5 text-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {`<= $${maxPrice}`}
                  <button onClick={() => setMaxPrice('')} className="hover:text-red-450 cursor-pointer">
                    x
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="text-[10px] bg-zinc-900 border border-white/5 text-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {`>= ${minRating}★`}
                  <button
                    onClick={() => setMinRating(0)}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    x
                  </button>
                </span>
              )}
            </div>
          )}

          {paginatedDevices.length > 0 ? (
            <div className="flex flex-col gap-8">
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

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4 border-t border-white/5 pt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#7f22fe] hover:text-white transition-all text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[#9f9fa9]"
                  >
                    Previous
                  </button>

                  {(() => {
                    const pages: (number | string)[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push('...');
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (currentPage < totalPages - 2) pages.push('...');
                      pages.push(totalPages);
                    }

                    return pages.map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`dots-${idx}`} className="px-1 text-xs text-zinc-600 select-none">
                            ...
                          </span>
                        );
                      }
                      const pageNum = Number(p);
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`size-8 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#7f22fe]/20 text-[#ad46ff] border-[#7f22fe]/40 shadow-[0_0_10px_rgba(127,34,254,0.1)]'
                              : 'bg-zinc-900 border-white/5 text-[#9f9fa9] hover:text-white hover:border-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#7f22fe] hover:text-white transition-all text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[#9f9fa9]"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-dashed border-white/5 rounded-2xl bg-zinc-900/10 w-full">
              <SlidersHorizontal className="size-10 text-zinc-650 animate-pulse" />
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-neutral-200">No Devices Found</h3>
                <p className="text-xs text-[#9f9fa9] max-w-xs leading-relaxed">
                  We couldn't find any devices matching your filters. Try clearing some filters or searching for something else.
                </p>
              </div>
              <Button
                onClick={handleClearFilters}
                className="rounded-full bg-zinc-800 text-neutral-200 text-xs border border-white/10 px-5 py-2 cursor-pointer hover:bg-zinc-700 hover:text-white"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Shared Page Footer */}
        <Footer />
      </main>

      {/* Right Sidebar - Ads */}
      <AdSidebar />

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end">
          <div className="bg-zinc-950 border-t border-white/10 rounded-t-3xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-[#7f22fe]" />
                <h3 className="text-sm font-extrabold text-white">Device Filters</h3>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Categories in Mobile Filter Modal */}
            <BrowseCategorySection
              currentCategory={activeCategory}
              onCategorySelect={() => setIsMobileFiltersOpen(false)}
            />

            <hr className="border-white/5" />

            {/* Price Range */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-neutral-300">Price Range ($)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe]"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-neutral-300">Minimum Rating</h4>
              <div className="flex items-center gap-2">
                {[0, 3, 4, 4.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMinRating(rate)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      minRating === rate
                        ? 'bg-[#7f22fe]/20 border-[#ad46ff] text-[#ad46ff]'
                        : 'bg-zinc-900 border-white/5 text-zinc-400'
                    }`}
                  >
                    {rate === 0 ? 'All' : `${rate}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Explorer on Mobile */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-neutral-300">Brands</h4>
              <div className="max-h-48 overflow-y-auto">
                <BrandExplorer
                  devices={categoryDevices}
                  onSelectDevice={(device) => {
                    handleSelectDeviceFromExplorer(device);
                    setIsMobileFiltersOpen(false);
                  }}
                  onCompareDevice={handleCompareClick}
                  isDeviceInComparison={isDeviceInComparison}
                  selectedBrands={selectedBrands}
                  onBrandToggle={handleBrandToggle}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-xs font-bold text-white shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
