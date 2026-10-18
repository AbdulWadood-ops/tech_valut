'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BarChart3,
  BatteryCharging,
  Camera,
  Cpu,
  Fingerprint,
  HardDrive,
  Info,
  MonitorSmartphone,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Signal,
  Smartphone,
  Star,
  StarHalf,
  Wifi,
  X,
  Tablet,
  Watch,
  Headphones,
  Laptop,
  SlidersHorizontal
} from 'lucide-react';
import { type Device, type DeviceSpecs, hasBuyLink } from '../data/devices';
import { Button } from './ui/button';
import Footer from './Footer';
import { useApp } from '../context/AppContext';
import BrandExplorer from './BrandExplorer';
import BrowseCategorySection from './BrowseCategorySection';
import AdSidebar from './AdSidebar';
import { useRouter } from 'next/navigation';

interface ComparePageContentProps {
  initialDevices: Device[];
}

interface SpecSection {
  title: string;
  icon: React.ReactNode;
  specs: { label: string; key: keyof DeviceSpecs }[];
}

export default function ComparePageContent({ initialDevices }: ComparePageContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillId = searchParams.get('prefill');

  const {
    activeCategory,
    handleCategoryChange,
    selectedDevices,
    handleSelectDevice,
    handleRemoveDevice,
    handleBuy,
    showToast
  } = useApp();

  // Local States
  const [activeChangeSlot, setActiveChangeSlot] = useState<number | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [slotSearchQueries, setSlotSearchQueries] = useState<string[]>(['', '', '']);

  // Sidebar Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    showToast('Filters cleared');
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleSelectDeviceFromExplorer = (device: Device) => {
    router.push(`/device/${device.id}`);
  };

  const isDeviceInComparison = (deviceToCheck: Device) => {
    return selectedDevices.some(sd => sd?.id === deviceToCheck.id);
  };

  const handleCompareClick = (deviceToAdd: Device) => {
    const existingIndex = selectedDevices.findIndex(sd => sd?.id === deviceToAdd.id);
    if (existingIndex !== -1) {
      handleRemoveDevice(existingIndex);
      showToast(`Removed ${deviceToAdd.name} from comparison`);
      return;
    }

    const emptySlotIndex = selectedDevices.findIndex(sd => sd === null);
    if (emptySlotIndex !== -1) {
      handleSelectDevice(emptySlotIndex, deviceToAdd);
      showToast(`Added ${deviceToAdd.name} to comparison`);
    } else {
      showToast('Comparison slots are full! Remove a device from comparison first.');
    }
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'mobiles': return { activeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]' };
      case 'tablets': return { activeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(0,188,125,0.3)]' };
      case 'watches': return { activeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(254,154,0,0.3)]' };
      case 'earbuds': return { activeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.3)]' };
      case 'laptops':
      default: return { activeBg: 'bg-[#7f22fe]/15 text-[#ad46ff] border-[#7f22fe]/40 shadow-[0_0_12px_rgba(127,34,254,0.3)]' };
    }
  };


  // Handle deep-link pre-fill from search autocomplete
  useEffect(() => {
    if (prefillId && initialDevices.length > 0) {
      const device = initialDevices.find(d => d.id === prefillId);
      if (device) {
        // Change category context if needed
        if (device.category !== activeCategory) {
          handleCategoryChange(device.category);
        }

        // Find if already comparing
        const isAlreadySelected = selectedDevices.some(sd => sd?.id === device.id);
        if (!isAlreadySelected) {
          const emptySlotIndex = selectedDevices.findIndex(sd => sd === null);
          const targetIndex = emptySlotIndex !== -1 ? emptySlotIndex : 0;
          handleSelectDevice(targetIndex, device);
        }
      }
    }
  }, [prefillId, initialDevices, activeCategory]);

  // Helper to extract first float/integer number from strings
  const extractScoreNumber = (score: string | number): number => {
    if (typeof score === 'number') return score;
    if (!score || score === 'N/A' || score === '—') return 0;

    const match = score.toString().match(/([0-9.]+)/);
    if (match) {
      let val = parseFloat(match[1]);
      // Extract total battery hours e.g. "6h (30h total)" -> 30
      const totalMatch = score.toString().match(/(\d+)\s*h\s*total/i);
      if (totalMatch) {
        val = parseFloat(totalMatch[1]);
      }
      // Handle AnTuTu millions formatting e.g. "1.78M" -> 1780000
      if (score.toString().toLowerCase().includes('m')) {
        val = val * 1000000;
      } else if (score.toString().toLowerCase().includes('k')) {
        val = val * 1000;
      }
      return val;
    }
    return 0;
  };

  const isSpecSuperior = (key: keyof DeviceSpecs, val: string | undefined, allDevices: Device[]): boolean => {
    if (!val) return false;
    if (allDevices.length <= 1) return false;
    if (val === 'N/A' || val === 'No' || val === '—') return false;

    const extractNum = (s?: string) => {
      if (!s) return null;
      const match = s.match(/([0-9.]+)/);
      return match ? parseFloat(match[1]) : null;
    };

    const currentNum = extractNum(val);
    if (currentNum === null) return false;

    const nums = allDevices.map(d => extractNum(d.specs[key])).filter((n): n is number => n !== null);
    if (nums.length <= 1) return false;

    if (key === 'weight') {
      // Lower weight is better
      return currentNum === Math.min(...nums);
    }

    if (
      [
        'peakBrightness',
        'pixelDensity',
        'ram',
        'capacity',
        'wiredCharging',
        'bluetooth'
      ].includes(key)
    ) {
      return currentNum === Math.max(...nums);
    }

    if (key === 'displayTypeSize') {
      return currentNum === Math.max(...nums);
    }

    return false;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="size-4 fill-[#fe9a00] text-[#fe9a00]" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<StarHalf key={i} className="size-4 fill-[#fe9a00] text-[#fe9a00]" />);
      } else {
        stars.push(<Star key={i} className="size-4 text-zinc-650" />);
      }
    }
    return <div className="flex justify-center gap-0.5">{stars}</div>;
  };

  const specSections: SpecSection[] = [
    {
      title: 'Network',
      icon: <Signal className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Technology', key: 'technology' },
        { label: '5G Bands', key: 'bands5g' }
      ]
    },
    {
      title: 'Body',
      icon: <Smartphone className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Dimensions', key: 'dimensions' },
        { label: 'Weight', key: 'weight' },
        { label: 'Build', key: 'build' },
        { label: 'SIM', key: 'sim' },
        { label: 'Resistance', key: 'resistance' }
      ]
    },
    {
      title: 'Display',
      icon: <MonitorSmartphone className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Type / Size', key: 'displayTypeSize' },
        { label: 'Protection', key: 'protection' },
        { label: 'Peak Brightness', key: 'peakBrightness' },
        { label: 'Pixel Density', key: 'pixelDensity' }
      ]
    },
    {
      title: 'Platform',
      icon: <Cpu className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Chipset', key: 'chipset' },
        { label: 'GPU', key: 'gpu' },
        { label: 'OS', key: 'os' }
      ]
    },
    {
      title: 'Memory',
      icon: <HardDrive className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'RAM', key: 'ram' },
        { label: 'Storage Variants', key: 'storageVariants' },
        { label: 'Card Slot', key: 'cardSlot' }
      ]
    },
    {
      title: 'Camera',
      icon: <Camera className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Main Camera', key: 'mainCamera' },
        { label: 'Selfie Camera', key: 'selfieCamera' },
        { label: 'Video', key: 'video' }
      ]
    },
    {
      title: 'Battery',
      icon: <BatteryCharging className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Capacity', key: 'capacity' },
        { label: 'Wired Charging', key: 'wiredCharging' },
        { label: 'Wireless Charging', key: 'wirelessCharging' }
      ]
    },
    {
      title: 'Connectivity',
      icon: <Wifi className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Wi-Fi', key: 'wifi' },
        { label: 'Bluetooth', key: 'bluetooth' },
        { label: 'NFC / USB', key: 'nfcUsb' }
      ]
    },
    {
      title: 'Features',
      icon: <Fingerprint className="size-4 text-[#7f22fe]" />,
      specs: [{ label: 'Sensors', key: 'sensors' }]
    },
    {
      title: 'Misc',
      icon: <Info className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Colors', key: 'colors' },
        { label: 'Release Date', key: 'releaseDate' }
      ]
    }
  ];

  const renderSpecRow = (label: string, specKey: keyof DeviceSpecs, isAlternateBg = false) => {
    const activeDevices = selectedDevices.filter(Boolean) as Device[];

    // Check if all active devices have "N/A" for this spec
    const allNAs = activeDevices.every(d => d.specs[specKey] === 'N/A' || !d.specs[specKey]);
    if (allNAs) return null;

    return (
      <div
        key={specKey}
        className={`grid grid-cols-4 px-6 py-4 items-center border-b border-white/5 ${isAlternateBg ? 'bg-zinc-900/10' : ''
          }`}
      >
        <div className="font-semibold text-zinc-400 text-sm leading-5 border-[#7f22fe]/40 border-t-0 border-r-0 border-b-0 border-l-2 border-solid pl-3">
          {label}
        </div>
        {selectedDevices.map((device, idx) => {
          if (!device) {
            return (
              <div key={`spec-empty-${idx}`} className="text-center text-[#9f9fa9] text-sm leading-5">
                —
              </div>
            );
          }
          const val = device.specs[specKey];
          const isHighlighted = isSpecSuperior(specKey, val, activeDevices);
          return (
            <div key={`spec-val-${idx}`} className="text-center text-sm leading-5 px-1.5 break-words">
              {isHighlighted ? (
                <span className="rounded-full bg-[#7f22fe]/15 text-[#ad46ff] border border-[#7f22fe]/35 px-2.5 py-0.5 font-bold shadow-[0_0_10px_rgba(127,34,254,0.1)]">
                  {val}
                </span>
              ) : (
                <span className="text-neutral-250">{val || '—'}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPerformanceSpecRow = (
    label: string,
    valueExtractor: (device: Device) => string | number,
    isAlternateBg = false
  ) => {
    const activeDevices = selectedDevices.filter(Boolean) as Device[];
    if (activeDevices.length === 0) return null;

    // Extract raw numbers to evaluate winner
    const rawScores = activeDevices.map(d => {
      const val = valueExtractor(d);
      return { deviceId: d.id, rawVal: extractScoreNumber(val), displayVal: val };
    });

    const maxRawScore = Math.max(...rawScores.map(s => s.rawVal));
    const hasMultiple = activeDevices.length > 1;

    return (
      <div
        className={`grid grid-cols-4 px-6 py-3.5 items-center border-b border-white/5 ${isAlternateBg ? 'bg-zinc-900/10' : ''
          }`}
      >
        <div className="font-semibold text-zinc-400 text-sm leading-5 border-[#00bc7d]/65 border-t-0 border-r-0 border-b-0 border-l-2 border-solid pl-3">
          {label}
        </div>
        {selectedDevices.map((device, idx) => {
          if (!device) {
            return (
              <div key={`perf-empty-${idx}`} className="text-center text-[#9f9fa9] text-sm leading-5">
                —
              </div>
            );
          }
          const val = valueExtractor(device);
          const rawVal = extractScoreNumber(val);
          const isWinner = hasMultiple && maxRawScore > 0 && rawVal === maxRawScore;

          return (
            <div key={`perf-val-${idx}`} className="text-center text-sm leading-5">
              {isWinner ? (
                <span className="rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-0.5 font-bold shadow-[0_0_10px_rgba(234,179,8,0.15)] flex items-center justify-center gap-1.5 w-fit mx-auto">
                  {val} ⭐ Win
                </span>
              ) : (
                <span className="text-neutral-250 font-medium">{val}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBenchmarkBar = (
    label: string,
    valueExtractor: (device: Device) => {
      score: string | number;
      displayScore: string | number;
      originalPercent: number;
    }
  ) => {
    const activeDevices = selectedDevices
      .map((d, i) => ({ device: d, index: i }))
      .filter(item => item.device !== null) as { device: Device; index: number }[];

    const hasValidMetric = activeDevices.some(item => {
      const val = valueExtractor(item.device);
      return val.score !== 'N/A' && val.score !== 0 && val.score !== '';
    });

    if (!hasValidMetric) return null;

    const scores = activeDevices.map(({ device }) => {
      const val = valueExtractor(device);
      return {
        device,
        rawScore: extractScoreNumber(val.score),
        displayScore: val.displayScore,
        originalPercent: val.originalPercent
      };
    });

    const maxRawScore = Math.max(...scores.map(s => s.rawScore));

    // Each slot gets its own color — proper CSS classes for real animations
    const barStyles = [
      { barClass: 'perf-bar-emerald', badgeClass: 'perf-badge-emerald', dotColor: '#34d399' },
      { barClass: 'perf-bar-purple', badgeClass: 'perf-badge-purple', dotColor: '#c084fc' },
      { barClass: 'perf-bar-cyan', badgeClass: 'perf-badge-cyan', dotColor: '#22d3ee' },
    ];

    return (
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-sm">
        {/* Label */}
        <div className="flex items-center gap-2 mb-1">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #7f22fe, #00bc7d)' }} />
          <span className="font-black text-zinc-200 text-sm tracking-wider uppercase">
            {label}
          </span>
        </div>

        {/* Bars */}
        <div className="flex flex-col gap-4">
          {activeDevices.map(({ device, index }) => {
            const matchedScoreInfo = scores.find(s => s.device.id === device.id);
            const rawScore = matchedScoreInfo?.rawScore || 0;
            const displayVal = matchedScoreInfo?.displayScore || '—';
            const originalPercent = matchedScoreInfo?.originalPercent || 0;
            const isWinner = activeDevices.length > 1 && maxRawScore > 0 && rawScore === maxRawScore;

            let computedPercent = originalPercent;
            if (activeDevices.length > 1 && maxRawScore > 0) {
              computedPercent = Math.round((rawScore / maxRawScore) * 100);
            }

            const styleSet = barStyles[index % barStyles.length];

            return (
              <div key={device.id} className="flex flex-col gap-2">
                {/* Device name + score badge row */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: styleSet.dotColor, boxShadow: `0 0 8px ${styleSet.dotColor}` }} />
                    {device.name}
                    {isWinner && (
                      <span style={{ fontSize: '9px', fontWeight: 900, color: '#fbbf24', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', padding: '2px 8px', borderRadius: '9999px', boxShadow: '0 0 10px rgba(245,158,11,0.5)', marginLeft: '4px' }}>
                        ⭐ BEST
                      </span>
                    )}
                  </span>
                  <span className={`${styleSet.badgeClass} text-xs font-black px-3 py-1 rounded-full`}>
                    {displayVal} ({computedPercent}%)
                  </span>
                </div>

                {/* Glowing animated bar */}
                <div className="perf-bar-track">
                  <div
                    className={`perf-bar-fill ${styleSet.barClass}`}
                    style={{ width: `${computedPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const categoryTitles = {
    mobiles: {
      title: 'Compare Mobiles',
      desc: 'Full Digital spec sheet — side-by-side detailed comparison'
    },
    tablets: {
      title: 'Compare Tablets',
      desc: 'Premium, active, and budget tablets side-by-side spec comparison'
    },
    watches: {
      title: 'Compare Smartwatches',
      desc: 'Explore health metrics, battery life, and smart watch features'
    },
    earbuds: {
      title: 'Compare Earbuds',
      desc: 'Compare ANC levels, sound quality, and battery specs'
    },
    laptops: {
      title: 'Compare Laptops',
      desc: 'High-performance laptops side-by-side spec sheet comparison'
    }
  };

  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)] overflow-y-auto">
      {/* Left Sidebar - Mirrored from HomePage */}
      <aside className="w-64 xl:w-72 2xl:w-80 border-r border-white/5 bg-zinc-900/20 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 hidden md:flex h-full self-stretch">
        {/* Unified Categories Section */}
        <BrowseCategorySection currentCategory={activeCategory} />

        <hr className="border-white/5" />

        {/* Search Query Filter
        <div className="relative w-full">
          <Search className="size-4 text-[#7f22fe] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search releases..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-all"
          />
        </div> */}

        <BrandExplorer
          devices={initialDevices}
          // onSelectDevice={()=>{}}
          onSelectDevice={handleSelectDeviceFromExplorer}
          onCompareDevice={handleCompareClick}
          isDeviceInComparison={isDeviceInComparison}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
        />

        {/* <hr className="border-white/5" /> */}

        {/* Filters Section Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-extrabold text-[#9f9fa9] tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </h3>
          {(searchQuery || selectedBrands.length > 0 || minPrice || maxPrice || minRating > 0) && (
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
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${isActive
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto advance-enter-fade-up">
          {/* Mobile Category Navigation */}
          <div className="md:hidden">
            <BrowseCategorySection orientation="horizontal" currentCategory={activeCategory} />
          </div>

          {/* Category header info */}
          <section className="bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.18_293/.35),oklch(0.141_0.005_285.823))] text-center rounded-3xl border border-white/10 flex p-6 sm:p-8 flex-col items-center gap-2.5 relative overflow-hidden shadow-2xl">
            <h1 className="font-black text-neutral-50 text-2xl sm:text-3xl tracking-tight drop-shadow-md">
              {categoryTitles[activeCategory]?.title || 'Compare Devices'}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl">
              {categoryTitles[activeCategory]?.desc || 'View comparison'}
            </p>
          </section>

          {/* Selected Devices Top Header Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-30">
            {selectedDevices.map((device, index) => {
              if (device) {
                return (
                  <div
                    key={device.id}
                    className="relative backdrop-blur-md shadow-[0_0_30px_rgba(127,34,254,0.15)] rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-[#7f22fe]/40 border-2 p-6 flex flex-col items-center gap-4 group advance-card-hover"
                  >
                    <button
                      onClick={() => {
                        handleRemoveDevice(index);
                        showToast('Removed device from comparison');
                      }}
                      className="absolute top-4 right-4 text-[#9f9fa9] hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-zinc-800/60 cursor-pointer"
                      title="Remove device"
                    >
                      <X className="size-4" />
                    </button>

                    <div className="relative mt-2">
                      <div className="blur-2xl rounded-full bg-[#00bc7d]/10 absolute inset-0" />
                      <img
                        src={device.image}
                        alt={device.name}
                        className="relative object-contain rounded-xl w-auto h-36 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="font-extrabold text-neutral-55 text-base leading-snug">
                        {device.name}
                      </span>
                      <span className="text-[#00bc7d] text-xs font-semibold uppercase tracking-wider">
                        {device.brand}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        setActiveChangeSlot(index);
                        setModalSearchQuery('');
                      }}
                      className="rounded-full bg-zinc-850 text-neutral-200 text-xs border border-white/10 px-4 py-1.5 gap-2 cursor-pointer hover:bg-zinc-800 transition-colors"
                    >
                      <RefreshCw className="size-3" />
                      Change Device
                    </Button>
                  </div>
                );
              } else {
                return (
                  <div
                    key={`empty-${index}`}
                    className="relative backdrop-blur-md shadow-[0_0_30px_rgba(127,34,254,0.02)] rounded-3xl bg-zinc-950/30 border-2 border-dashed border-[#7f22fe]/30 hover:border-[#7f22fe]/60 hover:bg-[#7f22fe]/5 transition-all duration-300 flex p-6 flex-col justify-center items-center gap-4 min-h-[220px]"
                  >
                    <div className="relative flex justify-center items-center">
                      <div className="blur-xl rounded-full bg-[#7f22fe]/10 absolute inset-0" />
                      <div className="relative size-14 rounded-full border-[#7f22fe]/30 border-2 flex justify-center items-center">
                        <Plus className="size-6 text-[#7f22fe]" />
                      </div>
                    </div>
                    <span className="text-[#9f9fa9] text-xs">Add a device to compare</span>

                    {/* Search query box unique to this slot index */}
                    <div className="relative rounded-full bg-zinc-900 border border-white/10 flex px-3 py-1.5 items-center gap-2 w-full max-w-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                      <Search className="size-3.5  text-[#7f22fe]" />
                      <input
                        placeholder="Search devices..."
                        value={slotSearchQueries[index]}
                        onChange={e => {
                          const updated = [...slotSearchQueries];
                          updated[index] = e.target.value;
                          setSlotSearchQueries(updated);
                        }}
                        className="bg-transparent outline-none text-neutral-50 text-xs w-full"
                      />
                      {slotSearchQueries[index] && (
                        <div className="absolute left-0 right-0 top-11 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden z-30 shadow-2xl max-h-48 overflow-y-auto">
                          {initialDevices
                            .filter(
                              d =>
                                d.category === activeCategory &&
                                !selectedDevices.some(sd => sd?.id === d.id) &&
                                (d.name
                                  .toLowerCase()
                                  .includes(slotSearchQueries[index].toLowerCase()) ||
                                  d.brand
                                    .toLowerCase()
                                    .includes(slotSearchQueries[index].toLowerCase()))
                            )
                            .map(d => (
                              <div
                                key={d.id}
                                onClick={() => {
                                  handleSelectDevice(index, d);
                                  const updated = [...slotSearchQueries];
                                  updated[index] = '';
                                  setSlotSearchQueries(updated);
                                  showToast(`Added ${d.name} to comparison`);
                                }}
                                className="px-4 py-2 hover:bg-zinc-800 cursor-pointer flex items-center gap-3 text-xs text-neutral-200 border-b border-white/5 text-left"
                              >
                                <img
                                  src={d.image}
                                  alt={d.name}
                                  className="size-8 object-contain rounded bg-zinc-950 p-1"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
                                  }}
                                />
                                <div className="flex flex-col text-left">
                                  <span className="font-semibold text-neutral-200">{d.name}</span>
                                  <span className="text-[10px] text-neutral-400">{d.brand}</span>
                                </div>
                              </div>
                            ))}
                          {initialDevices.filter(
                            d =>
                              d.category === activeCategory &&
                              !selectedDevices.some(sd => sd?.id === d.id) &&
                              (d.name
                                .toLowerCase()
                                .includes(slotSearchQueries[index].toLowerCase()) ||
                                d.brand
                                  .toLowerCase()
                                  .includes(slotSearchQueries[index].toLowerCase()))
                          ).length === 0 && (
                              <div className="px-4 py-3 text-xs text-neutral-400 text-center">
                                No other devices found
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })}
          </section>

          {/* Specifications Detailed Sheets */}
          <section className="backdrop-blur-md rounded-2xl bg-zinc-900/20 border z-0 border-white/15 overflow-hidden shadow-xl">
            {/* Sticky Header fixed height layout to prevent overlapping. */}
            <div className="grid grid-cols-4 sticky bg-zinc-900/90 backdrop-blur-md border-b border-white/10  z-20 px-6 py-4">
              <div className="font-extrabold text-[#9f9fa9] text-xs uppercase tracking-wider flex items-center">
                Specifications
              </div>
              {selectedDevices.map((device, idx) => (
                <div key={idx} className="font-bold text-center text-neutral-55 text-sm truncate px-2">
                  {device ? device.name : '—'}
                </div>
              ))}
            </div>

            {specSections.map(section => {
              const activeDevices = selectedDevices.filter(Boolean) as Device[];

              const hasVisibleSpecs = section.specs.some(spec =>
                activeDevices.some(d => d.specs[spec.key] !== 'N/A' && d.specs[spec.key])
              );

              if (!hasVisibleSpecs) return null;

              return (
                <div key={section.title}>
                  {/* Specification Category Section Separator Heading */}
                  <div className="bg-gradient-to-r from-[#7f22fe]/15 to-transparent border-l-4 border-[#7f22fe] flex px-6 py-4 items-center gap-2">
                    {section.icon}
                    <span className="font-extrabold uppercase text-neutral-50 text-xs tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  {section.specs.map((spec, idx) => renderSpecRow(spec.label, spec.key, idx % 2 === 0))}
                </div>
              );
            })}

            {/* Performance Benchmark Scores Section */}
            <div>
              <div className="bg-gradient-to-r from-[#00bc7d]/15 to-transparent border-l-4 border-[#00bc7d] flex px-6 py-3 items-center gap-2">
                <Cpu className="size-4 text-[#00bc7d]" />
                <span className="font-extrabold uppercase text-neutral-50 text-xs tracking-wider">
                  Performance Scores
                </span>
              </div>
              {renderPerformanceSpecRow('CPU Score', d => d.performance.cpuScore, true)}
              {renderPerformanceSpecRow('GPU Score', d => d.performance.gpuScore, false)}
              {renderPerformanceSpecRow('Battery Life', d => d.performance.batteryLife, true)}
              {renderPerformanceSpecRow('AnTuTu Score', d => d.performance.antutuScore, false)}
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-4 bg-zinc-900/30 px-6 py-4 items-center border-t border-white/10">
              <div className="font-extrabold text-[#00bc7d] text-sm border-l-2 border-[#00bc7d] pl-3">
                Price
              </div>
              {selectedDevices.map((device, idx) => {
                if (!device) {
                  return (
                    <div key={`price-empty-${idx}`} className="text-center text-[#9f9fa9] text-sm">
                      —
                    </div>
                  );
                }
                return (
                  <div key={`price-${idx}`} className="font-black text-center text-[#00bc7d] text-lg">
                    {device.price}
                  </div>
                );
              })}
            </div>

            {/* Rating Row */}
            <div className="grid grid-cols-4 px-6 py-4 items-center border-t border-white/10 bg-zinc-900/10">
              <div className="font-extrabold text-[#9f9fa9] text-sm border-l-2 border-[#7f22fe] pl-3">
                Rating
              </div>
              {selectedDevices.map((device, idx) => {
                if (!device) {
                  return (
                    <div key={`rating-empty-${idx}`} className="text-center text-[#9f9fa9] text-sm">
                      —
                    </div>
                  );
                }
                return (
                  <div key={`rating-${idx}`} className="flex justify-center">
                    {renderStars(device.rating)}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Performance Benchmark Section with Glowing Bars */}
          <section className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
            {/* Background glow accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#7f22fe]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00bc7d]/8 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#7f22fe]/15 border border-[#7f22fe]/30 shadow-[0_0_12px_rgba(127,34,254,0.3)]">
                  <BarChart3 className="size-5 text-[#ad46ff]" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-black text-neutral-50 text-xl tracking-tight">
                    Performance Power Bars
                  </h2>
                  <span className="text-xs text-zinc-400 font-medium">
                    Relative benchmark comparison — winner highlighted
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7f22fe] bg-[#7f22fe]/10 border border-[#7f22fe]/30 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(127,34,254,0.2)] hidden sm:block">
                Live Compare
              </span>
            </div>

            <div className="flex flex-col gap-4 z-10">
              {renderBenchmarkBar('CPU Score', d => ({
                score: d.performance.cpuScore,
                displayScore: d.performance.cpuScore,
                originalPercent: d.performance.cpuPercent
              }))}
              {renderBenchmarkBar('GPU Score', d => ({
                score: d.performance.gpuScore,
                displayScore: d.performance.gpuScore,
                originalPercent: d.performance.gpuPercent
              }))}
              {renderBenchmarkBar('Battery Life', d => ({
                score: d.performance.batteryLife,
                displayScore: d.performance.batteryLife,
                originalPercent: d.performance.batteryPercent
              }))}
              {renderBenchmarkBar('AnTuTu / Performance Score', d => ({
                score: d.performance.antutuScore,
                displayScore: d.performance.antutuScore,
                originalPercent: d.performance.antutuPercent
              }))}
            </div>
          </section>

          {/* Purchase Actions CTA - Only rendered if device has a buy link */}
          {selectedDevices.some(d => d && hasBuyLink(d)) && (
            <section className="flex justify-center items-center flex-wrap gap-6 mt-2">
              {selectedDevices.map((device, index) => {
                if (!device || !hasBuyLink(device)) return null;
                const gradients = [
                  'from-cyan-400 to-[#7f22fe] shadow-[0_0_20px_rgba(34,211,238,0.2)]',
                  'from-[#7f22fe] to-indigo-500 shadow-[0_0_20px_rgba(127,34,254,0.2)]',
                  'from-blue-500 to-cyan-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                ];
                const gradient = gradients[index % gradients.length];
                return (
                  <Button
                    key={`buy-${device.id}`}
                    onClick={() => handleBuy(device)}
                    className={`bg-gradient-to-r ${gradient} font-bold rounded-full text-white text-sm px-6 py-4.5 gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95`}
                  >
                    <ShoppingBag className="size-4" />
                    Buy {device.name}
                  </Button>
                );
              })}
            </section>
          )}

        </div>

        {/* Shared Page Footer */}
        <Footer />
      </main>

      {/* Right Sidebar - Ads */}
      <AdSidebar />

      {/* Modal - Select Device to Swap Slot */}
      {activeChangeSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4">
            <button
              onClick={() => {
                setActiveChangeSlot(null);
                setModalSearchQuery('');
              }}
              className="absolute top-4 right-4 text-[#9f9fa9] hover:text-neutral-50 p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-extrabold text-neutral-50 text-lg">
              Swap Slot {activeChangeSlot + 1} Device
            </h3>

            <div className="relative rounded-full bg-zinc-800 border border-white/10 flex px-3.5 py-2 items-center gap-2">
              <Search className="size-4 text-[#7f22fe]" />
              <input
                placeholder="Search device name or brand..."
                value={modalSearchQuery}
                onChange={e => setModalSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-neutral-50 text-sm w-full"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {initialDevices
                .filter(
                  d =>
                    d.category === activeCategory &&
                    (d.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                      d.brand.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                )
                .map(d => {
                  const isAlreadySelected = selectedDevices.some(sd => sd?.id === d.id);
                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        if (!isAlreadySelected) {
                          handleSelectDevice(activeChangeSlot, d);
                          setActiveChangeSlot(null);
                          setModalSearchQuery('');
                          showToast(`Added ${d.name} to comparison`);
                        }
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all text-left ${isAlreadySelected
                        ? 'bg-zinc-800/40 border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-zinc-800/60 border-white/10 hover:border-[#7f22fe]/50 hover:bg-zinc-800 cursor-pointer'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={d.image}
                          alt={d.name}
                          className="size-11 object-contain rounded bg-zinc-950 p-1"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
                          }}
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-neutral-50 text-sm">{d.name}</span>
                          <span className="text-xs text-[#9f9fa9]">{d.brand}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[#00bc7d] font-bold text-sm">{d.price}</span>
                        {isAlreadySelected && (
                          <span className="text-[9px] text-[#7f22fe] bg-[#7f22fe]/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Comparing
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              {initialDevices.filter(
                d =>
                  d.category === activeCategory &&
                  (d.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                    d.brand.toLowerCase().includes(modalSearchQuery.toLowerCase()))
              ).length === 0 && (
                  <div className="text-[#9f9fa9] text-sm text-center py-6">
                    No devices found in this category.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
