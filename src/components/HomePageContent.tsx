'use client';

/* eslint-disable */
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Tablet,
  SlidersHorizontal,
  Zap,
  Star,
  Check,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { type Device, hasBuyLink } from '../data/devices';
import { Button } from './ui/button';
import Footer from './Footer';
import { useApp } from '../context/AppContext';
import { formatCategoryLabel } from '../lib/utils';
import DeviceCard from './DeviceCard';
import BrowseCategorySection from './BrowseCategorySection';
import HomeHero from './HomeHero';
import HomeFeatures from './HomeFeatures';
import HomeCategoryGrid from './HomeCategoryGrid';
import HomeNewsletter from './HomeNewsletter';

const AdSidebar = dynamic(() => import('./AdSidebar'), { ssr: false });
const BrandExplorer = dynamic(() => import('./BrandExplorer'), { ssr: false });

interface HomePageContentProps {
  initialDevices: Device[];
  allBrands?: string[];
}

export default function HomePageContent({ initialDevices, allBrands = [] }: HomePageContentProps) {
  const router = useRouter();

  const handleSelectDeviceFromExplorer = (device: Device) => {
    router.push(`/devices?category=${device.category}&search=${encodeURIComponent(device.name)}`);
  };
  const {
    selectedDevices,
    handleSelectDevice,
    handleRemoveDevice,
    handleBuy,
    showToast,
    handleCategoryChange
  } = useApp();

  // Filter States for the Home Page Sidebar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  // Per-Page Devices State & Pagination State
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Custom images override: in-memory override so the UI reflects the new image
  // immediately after the API writes it to the JSON file.
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  // Efficiently extract the latest device from each brand
  const latestDevices = useMemo(() => {
    // Return all devices so pagination across 2-3 pages works correctly
    return initialDevices;
  }, [initialDevices]);

  // Extract unique brands present in the catalog
  const availableBrands = useMemo(() => {
    if (allBrands && allBrands.length > 0) return allBrands;
    const brandsSet = new Set(latestDevices.map(d => d.brand));
    return Array.from(brandsSet).sort();
  }, [latestDevices, allBrands]);

  // Filter latest releases list in real-time based on sidebar filters
  const filteredLatestDevices = useMemo(() => {
    return latestDevices.filter(device => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !device.name.toLowerCase().includes(query) &&
          !device.brand.toLowerCase().includes(query)
        )
          return false;
      }
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(device.brand)) return false;
      }
      const priceVal = parseFloat(device.price.replace(/[^0-9.]/g, '')) || 0;
      if (minPrice && priceVal < parseFloat(minPrice)) return false;
      if (maxPrice && priceVal > parseFloat(maxPrice)) return false;
      if (minRating > 0 && device.rating < minRating) return false;
      return true;
    });
  }, [latestDevices, searchQuery, selectedBrands, minPrice, maxPrice, minRating]);

  // Pagination Logic - resets to page 1 on filter or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBrands, minPrice, maxPrice, minRating, itemsPerPage]);

  const paginatedLatestDevices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLatestDevices.slice(start, start + itemsPerPage);
  }, [filteredLatestDevices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLatestDevices.length / itemsPerPage);

  // Carousel Logic (Featured Flagships)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselDeviceIds = [
    'galaxy-s26-ultra',
    'macbook-pro-m3-max',
    'pixel-9-pro-xl',
    'apple-watch-ultra-2'
  ];
  const carouselDevices = useMemo(() => {
    const hardcoded = carouselDeviceIds
      .map(id => initialDevices.find(d => d.id === id))
      .filter(Boolean) as Device[];
    
    // If hardcoded IDs don't exist (e.g. testing with mock data), just take the top 4 rated/expensive devices
    if (hardcoded.length === 0 && initialDevices.length > 0) {
      return [...initialDevices].sort((a, b) => b.rating - a.rating).slice(0, 4);
    }
    return hardcoded;
  }, [initialDevices]);

  useEffect(() => {
    if (carouselDevices.length === 0) return;
    let timer: NodeJS.Timeout | null = null;
    const startDelay = setTimeout(() => {
      timer = setInterval(() => {
        setCarouselIndex(prev => (prev + 1) % carouselDevices.length);
      }, 6000);
    }, 3500);

    return () => {
      clearTimeout(startDelay);
      if (timer) clearInterval(timer);
    };
  }, [carouselDevices.length]);

  const handlePrevSlide = () => {
    setCarouselIndex(prev => (prev - 1 + carouselDevices.length) % carouselDevices.length);
  };

  const handleNextSlide = () => {
    setCarouselIndex(prev => (prev + 1) % carouselDevices.length);
  };

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
        };
    }
  };

  const renderCardSpecs = (device: Device) => {
    const specItems = [];
    if (device.category === 'mobiles') {
      if (device.specs.chipset) {
        specItems.push(device.specs.chipset.split('(')[0].replace('Snapdragon', 'SD').trim());
      }
      if (device.specs.ram && device.specs.storageVariants) {
        specItems.push(
          `${device.specs.ram.split('/')[0].trim()} • ${device.specs.storageVariants
            .split('/')[0]
            .trim()}`
        );
      }
    } else if (device.category === 'laptops') {
      if (device.specs.chipset) specItems.push(device.specs.chipset.split('(')[0].trim());
      if (device.specs.ram) specItems.push(device.specs.ram);
    } else if (device.category === 'watches') {
      if (device.specs.displayTypeSize)
        specItems.push(device.specs.displayTypeSize.replace('display', '').trim());
      if (device.specs.resistance) specItems.push(device.specs.resistance.split('(')[0].trim());
    } else if (device.category === 'earbuds') {
      if (device.specs.bluetooth) specItems.push(`Bluetooth ${device.specs.bluetooth}`);
      if (device.performance.batteryLife) specItems.push(`Battery: ${device.performance.batteryLife}`);
    } else if (device.category === 'tablets') {
      if (device.specs.displayTypeSize)
        specItems.push(device.specs.displayTypeSize.split(',')[0].trim());
      if (device.specs.chipset) specItems.push(device.specs.chipset.split('(')[0].trim());
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2 mb-1.5">
        {specItems.map((spec, idx) => (
          <span
            key={idx}
            className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full"
          >
            {spec}
          </span>
        ))}
      </div>
    );
  };




  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Category & Filters */}
      <aside className="w-64 xl:w-72 2xl:w-80 border-r border-white/5 bg-zinc-900/20 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 hidden md:flex h-full">
        {/* Unified Categories Section */}
        <BrowseCategorySection />

        <hr className="border-white/5" />

        {/* Search Query Filter */}
        {/* <div className="relative w-full">
          <Search className="size-4 text-[#7f22fe] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search releases..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-all"
          />
        </div> */}

        <BrandExplorer
          devices={latestDevices}
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

        {/* Price Ranges */}
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

        <hr className="border-white/5" />

      {/* Rating Filter */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-neutral-300">Min Rating</h4>
          <div className="flex gap-1.5">
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

        <hr className="border-white/5" />

        {/* Most Searched & Powerful Devices */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-[#9f9fa9] tracking-wider flex items-center gap-1.5">
            <Zap className="size-3.5 text-[#00bc7d] fill-[#00bc7d]" />
            Trending & Powerful
          </h3>
          <div className="flex flex-col gap-2">
            {carouselDevices.slice(0, 3).map(device => (
              <Link key={device.id} href={`/device/${device.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-[#7f22fe]/50 hover:bg-[#7f22fe]/10 transition-all cursor-pointer group shadow-sm hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(127,34,254,0.3)]">
                  <div className="size-10 rounded-lg bg-zinc-950 p-1 flex items-center justify-center shrink-0 shadow-inner">
                    <img src={device.image?.includes('gsmarena.com') ? `/api/image-proxy?url=${encodeURIComponent(device.image)}` : device.image} alt={device.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-[#7f22fe] tracking-widest">{device.brand}</span>
                    <span className="text-xs font-extrabold text-white truncate group-hover:text-neutral-200">{device.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Center Scrollable Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Horizontal Category Bar */}
        <div className="md:hidden px-4 pt-4">
          <BrowseCategorySection orientation="horizontal" />
        </div>

        {/* Carousel Section (Flagship Showcase) */}
        {carouselDevices.length > 0 && (
          <section className="relative px-6 pt-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-900/40 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between min-h-[320px] md:min-h-[380px] gap-8 group/carousel shadow-2xl backdrop-blur-xl">
              {/* Dynamic Animated Ambient Glow */}
              <div className="absolute top-1/2 left-1/2 md:left-2/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-[#7f22fe]/20 via-[#00bc7d]/15 to-[#ad46ff]/20 rounded-full blur-[110px] pointer-events-none group-hover/carousel:scale-110 transition-all duration-1000" />

              {/* Left Details Panel */}
              <div className="flex flex-col gap-4 text-left z-10 flex-1 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest text-[#00bc7d] bg-[#00bc7d]/15 border border-[#00bc7d]/30 shadow-[0_0_12px_rgba(0,188,125,0.25)]">
                    {carouselDevices[carouselIndex].brand}
                  </span>
                  <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest text-[#ad46ff] bg-[#7f22fe]/15 border border-[#7f22fe]/30 shadow-[0_0_12px_rgba(127,34,254,0.25)] flex items-center gap-1">
                    <Zap className="size-3 text-[#ad46ff] fill-[#ad46ff]" />
                    Featured Flagship
                  </span>
                </div>

                <Link href={`/device/${carouselDevices[carouselIndex].id}`}>
                  <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight transition-all cursor-pointer hover:text-transparent hover:bg-gradient-to-r hover:from-white hover:via-neutral-200 hover:to-zinc-400 hover:bg-clip-text">
                    {carouselDevices[carouselIndex].name}
                  </h2>
                </Link>

                <p className="text-zinc-300 text-xs md:text-sm leading-relaxed max-w-md line-clamp-2">
                  Experience extreme performance with the latest{' '}
                  {carouselDevices[carouselIndex].specs.chipset || 'flagship processor'}, breathtaking{' '}
                  {carouselDevices[carouselIndex].specs.displayTypeSize || 'ultra-smooth'} display, and professional camera system.
                </p>

                {/* Quick specs pill row in carousel */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {carouselDevices[carouselIndex].specs.chipset && (
                    <span className="text-[10px] font-bold text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#ad46ff]" />
                      {carouselDevices[carouselIndex].specs.chipset.split('(')[0].trim()}
                    </span>
                  )}
                  {carouselDevices[carouselIndex].specs.displayTypeSize && (
                    <span className="text-[10px] font-bold text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      {carouselDevices[carouselIndex].specs.displayTypeSize.split(',')[0].trim()}
                    </span>
                  )}
                  {carouselDevices[carouselIndex].specs.capacity && (
                    <span className="text-[10px] font-bold text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      {carouselDevices[carouselIndex].specs.capacity.split(' ')[0]} mAh
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs text-zinc-400 font-semibold">Flagship Price</span>
                  <span className="text-2xl md:text-3xl font-black text-[#00bc7d] drop-shadow-[0_0_12px_rgba(0,188,125,0.3)]">
                    {carouselDevices[carouselIndex].price}
                  </span>
                </div>

                <div className="flex gap-3 mt-1">
                  {hasBuyLink(carouselDevices[carouselIndex]) && (
                    <button
                      onClick={() => handleBuy(carouselDevices[carouselIndex])}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-90 font-black text-xs text-white shadow-lg shadow-[#7f22fe]/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <span>Buy Now</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCompareClick(carouselDevices[carouselIndex])}
                    className={`px-5 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isDeviceInComparison(carouselDevices[carouselIndex])
                        ? 'bg-[#7f22fe]/20 border-[#7f22fe]/60 text-[#ad46ff] shadow-[0_0_12px_rgba(127,34,254,0.3)]'
                        : 'bg-zinc-900/80 border-white/10 hover:border-[#7f22fe]/50 text-neutral-200 hover:text-white'
                    }`}
                  >
                    {isDeviceInComparison(carouselDevices[carouselIndex]) ? (
                      <>
                        <Check className="size-3 text-[#ad46ff]" />
                        <span>Added to Compare</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3 text-[#7f22fe]" />
                        <span>Compare Specs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Image Panel with Floating Glass aura */}
              <div className="flex-1 flex justify-center items-center relative z-10 shrink-0">
                <Link href={`/device/${carouselDevices[carouselIndex].id}`} className="block relative group/img">
                  <div className="size-52 md:size-68 rounded-full bg-gradient-to-br from-[#7f22fe]/20 via-cyan-500/10 to-[#00bc7d]/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 blur-2xl opacity-70 group-hover/img:opacity-100 transition-opacity" />
                  <img
                    src={carouselDevices[carouselIndex].image?.includes('gsmarena.com') ? `/api/image-proxy?url=${encodeURIComponent(carouselDevices[carouselIndex].image)}` : carouselDevices[carouselIndex].image}
                    alt={carouselDevices[carouselIndex].name}
                    className="max-h-48 md:max-h-64 w-auto object-contain transition-all duration-700 group-hover/img:scale-108 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] cursor-pointer"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
                    }}
                  />
                </Link>
              </div>

              {/* Chevron Buttons */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-zinc-950/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer opacity-0 group-hover/carousel:opacity-100 transition-all z-20 hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-zinc-950/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer opacity-0 group-hover/carousel:opacity-100 transition-all z-20 hover:scale-110 shadow-lg"
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Dots & Index Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-zinc-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className="text-[10px] font-mono text-zinc-400 font-bold mr-1">
                  0{carouselIndex + 1} / 0{carouselDevices.length}
                </span>
                {carouselDevices.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      carouselIndex === idx ? 'bg-gradient-to-r from-[#7f22fe] to-[#00bc7d] w-6' : 'bg-zinc-700 hover:bg-zinc-500 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Trending Devices Horizontal Scroll Carousel ─────── */}
        {initialDevices.length > 0 && (
          <section className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Zap className="size-4 text-[#fe9a00] fill-[#fe9a00]" />
                Top Trending Devices
              </h3>
              <Link
                href="/devices"
                className="text-[11px] font-bold text-[#7f22fe] hover:text-[#ad46ff] transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="size-3" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent snap-x snap-mandatory">
              {[...initialDevices]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 10)
                .map((device, idx) => {
                  const theme = getCategoryTheme(device.category);
                  return (
                    <Link
                      key={device.id}
                      href={`/device/${device.id}`}
                      className={`flex-shrink-0 snap-start w-40 group rounded-2xl bg-zinc-900/60 border border-white/10 ${theme.hoverBorder} hover:bg-zinc-900/90 hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 p-3 flex flex-col gap-2 cursor-pointer relative overflow-hidden`}
                    >
                      {/* rank badge */}
                      <span className="absolute top-2 left-2 text-[9px] font-black text-zinc-400 bg-zinc-950/80 px-1.5 py-0.5 rounded-md border border-white/5">
                        #{idx + 1}
                      </span>
                      <div className={`aspect-square rounded-xl ${theme.imgGlow} bg-zinc-950 flex items-center justify-center overflow-hidden p-3 mt-1`}>
                        <img
                          src={device.image?.includes('gsmarena.com') ? `/api/image-proxy?url=${encodeURIComponent(device.image)}` : device.image}
                          alt={device.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80'; }}
                        />
                      </div>
                      <div>
                        <span className={`text-[8px] uppercase font-black tracking-widest ${theme.text}`}>{device.brand}</span>
                        <p className="text-[11px] font-black text-white leading-tight line-clamp-2 mt-0.5">{device.name}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star className="size-3 fill-[#fe9a00] text-[#fe9a00]" />
                          <span className="text-[10px] font-bold text-[#fe9a00]">{device.rating}</span>
                          <span className="text-[9px] text-zinc-500 ml-auto font-bold">{device.price}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        )}

        {/* Hero Banner */}
        <HomeHero />

        {/* Latest Releases Section */}
        <section className="py-10 px-8 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
                Newly Added Devices
                <span className="text-xs font-black bg-[#00bc7d]/15 text-[#00bc7d] border border-[#00bc7d]/30 px-3 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,188,125,0.2)]">
                  {filteredLatestDevices.length} Total
                </span>
              </h2>
              <p className="text-xs text-[#9f9fa9] mt-1 font-medium">
                Showing {paginatedLatestDevices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredLatestDevices.length)} of {filteredLatestDevices.length} devices
              </p>
            </div>

            {/* Per-Page Devices Selector (Skipper UI Styled Segmented Control) */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <span className="text-xs font-bold text-zinc-400">Per Page:</span>
              <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner">
                {[12, 24, 36, 48].map(count => (
                  <button
                    key={count}
                    onClick={() => setItemsPerPage(count)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      itemsPerPage === count
                        ? 'bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white shadow-[0_0_10px_rgba(127,34,254,0.4)]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>

              {/* Active Filters Summary on Mobile */}
              <div className="flex md:hidden">
                <button
                  onClick={() => {
                    const query = prompt('Search query:', searchQuery);
                    if (query !== null) setSearchQuery(query);
                  }}
                  className="text-xs bg-zinc-900 border border-white/5 text-neutral-300 px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Search className="size-3" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(selectedBrands.length > 0 || minPrice || maxPrice || minRating > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-[#9f9fa9]">Active Filters:</span>
              {selectedBrands.map(brand => (
                <span
                  key={brand}
                  className="text-[11px] font-bold bg-[#7f22fe]/15 border border-[#7f22fe]/30 text-[#ad46ff] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm"
                >
                  {brand}
                  <button
                    onClick={() => handleBrandToggle(brand)}
                    className="hover:text-red-400 cursor-pointer font-black text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
              {minPrice && (
                <span className="text-[11px] font-bold bg-zinc-900 border border-white/10 text-neutral-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  {`>= $${minPrice}`}
                  <button onClick={() => setMinPrice('')} className="hover:text-red-400 cursor-pointer font-black text-xs">
                    ×
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="text-[11px] font-bold bg-zinc-900 border border-white/10 text-neutral-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  {`<= $${maxPrice}`}
                  <button onClick={() => setMaxPrice('')} className="hover:text-red-400 cursor-pointer font-black text-xs">
                    ×
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  {`>= ${minRating}★`}
                  <button onClick={() => setMinRating(0)} className="hover:text-red-400 cursor-pointer font-black text-xs">
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {paginatedLatestDevices.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedLatestDevices.map((device, idx) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    inCompare={isDeviceInComparison(device)}
                    onCompareClick={handleCompareClick}
                    onBuyClick={handleBuy}
                    priorityImage={idx < 4 && currentPage === 1}
                  />
                ))}
              </div>

              {/* Pagination Bar with Enhanced Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 border-t border-white/10 pt-6">
                  <span className="text-xs text-zinc-400 font-medium">
                    Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredLatestDevices.length} total devices)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 hover:text-white transition-all text-xs font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      const isActive = currentPage === page;
                      // Show first, last, and surrounding pages
                      if (
                        totalPages > 8 &&
                        page !== 1 &&
                        page !== totalPages &&
                        Math.abs(page - currentPage) > 2
                      ) {
                        if (page === 2 || page === totalPages - 1) {
                          return <span key={page} className="px-1 text-xs text-zinc-600">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`size-8 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white border-transparent shadow-[0_0_12px_rgba(127,34,254,0.4)]'
                              : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 hover:text-white transition-all text-xs font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-white/5 rounded-2xl bg-zinc-900/5">
              <SlidersHorizontal className="size-8 text-zinc-650" />
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-neutral-350 text-sm">No Match Found</h3>
                <p className="text-xs text-zinc-550 max-w-xs leading-relaxed">
                  Try adjusting filters or clearing them to explore latest watches, air pods, and phones.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-neutral-200 border border-white/10 px-4 py-1.5 rounded-full cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Why Choose Us / Value Proposition */}
        <HomeFeatures />

        {/* Browse Categories */}
        <HomeCategoryGrid />

        {/* Newsletter Signup */}
        <HomeNewsletter />

        {/* Unified Shared Footer */}
        <Footer />
      </main>

      {/* Right Sidebar - Ads */}
      <AdSidebar />
    </div>
  );
}
