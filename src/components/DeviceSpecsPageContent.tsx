'use client';

/* eslint-disable */
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Plus,
  Cpu,
  Smartphone,
  MonitorSmartphone,
  BatteryCharging,
  Wifi,
  Signal,
  Fingerprint,
  Info,
  Tablet,
  Watch,
  Headphones,
  Laptop,
  SlidersHorizontal,
  Search,
  Camera,
  HardDrive,
  Star,
  BarChart3,
  Newspaper,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { type Device, type DeviceReview, type NewsArticle, hasBuyLink } from '../data/devices';
import BrandExplorer from './BrandExplorer';
import Footer from './Footer';
import AdSidebar from './AdSidebar';
import DeviceCommentsSection from './DeviceCommentsSection';
import BrowseCategorySection from './BrowseCategorySection';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';

function RelatedNewsSection({ device }: { device: Device }) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // 1. First search by exact deviceId
    fetch(`/api/news?deviceId=${encodeURIComponent(device.id)}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setNews(data.data.slice(0, 6));
          setLoading(false);
        } else {
          // 2. Fallback: Search by brand name
          fetch(`/api/news?search=${encodeURIComponent(device.brand)}&limit=6`)
            .then(res => res.json())
            .then(fallbackData => {
              if (!isMounted) return;
              if (fallbackData.success && Array.isArray(fallbackData.data)) {
                setNews(fallbackData.data.slice(0, 6));
              }
              setLoading(false);
            })
            .catch(() => setLoading(false));
        }
      })
      .catch(() => setLoading(false));

    return () => { isMounted = false; };
  }, [device.id, device.brand]);

  if (loading) return null;
  if (news.length === 0) return null;

  return (
    <section className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden mt-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00bc7d]/15 border border-[#00bc7d]/30 text-[#00bc7d] shadow-[0_0_12px_rgba(0,188,125,0.3)]">
            <Newspaper className="size-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-neutral-50 text-xl tracking-tight">
              Related News & Reviews
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Latest coverage for {device.name}</span>
          </div>
        </div>

        <Link
          href="/forum"
          className="text-xs font-black text-[#00bc7d] hover:text-white transition-colors flex items-center gap-1 bg-zinc-950 px-3 py-1.5 rounded-full border border-white/10"
        >
          Tech Discussions →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item) => (
          <div
            key={item.link}
            className="bg-zinc-950/80 rounded-2xl border border-white/5 p-4 flex flex-col justify-between gap-3 hover:border-[#7f22fe]/50 transition-all group"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                  item.type === 'review' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-[#7f22fe]/15 text-[#ad46ff] border-[#7f22fe]/30'
                }`}>
                  {item.type}
                </span>
                <span className="text-[9px] font-bold text-zinc-500">{item.source}</span>
              </div>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-sm text-neutral-200 group-hover:text-white line-clamp-2 leading-snug hover:underline cursor-pointer"
              >
                {item.title}
              </a>

              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between text-[10px] font-black text-zinc-400 group-hover:text-[#00bc7d] transition-colors mt-1 pt-2 border-t border-white/5"
            >
              <span>Read original article</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ── Pros & Cons Section ─────────────────────────────────── */
function ProsConsSection({ reviews, deviceName }: { reviews: DeviceReview; deviceName: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const hasPros = reviews.pros && reviews.pros.length > 0;
  const hasCons = reviews.cons && reviews.cons.length > 0;
  if (!hasPros && !hasCons) return null;

  return (
    <section
      ref={ref}
      className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden mt-8"
    >
      {/* Glow accents */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-red-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 relative z-10">
        <div className="p-2 rounded-xl  bg-gradient-to-br from-blue-400 to-purple-500/20 border border-white/10 shadow-lg">
          <SlidersHorizontal className="size-5 text-white" />
        </div>
        <div>
          <h2 className="font-black text-neutral-50 text-xl tracking-tight">Pros & Cons</h2>
          <span className="text-xs text-zinc-400 font-medium">Expert verdict on {deviceName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Pros */}
        {hasPros && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">What We Love</span>
            </div>
            <div className="flex flex-col gap-2">
              {reviews.pros.map((pro, i) => (
                <div
                  key={i}
                  suppressHydrationWarning
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/12 transition-all duration-300 group"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
                  }}
                >
                  <div className="mt-0.5 size-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                    <Check className="size-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-zinc-200 leading-relaxed">{pro}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cons */}
        {hasCons && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
              <span className="text-xs font-black uppercase tracking-widest text-red-400">Room to Improve</span>
            </div>
            <div className="flex flex-col gap-2">
              {reviews.cons.map((con, i) => (
                <div
                  key={i}
                  suppressHydrationWarning
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-500/8 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/12 transition-all duration-300 group"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(20px)',
                    transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
                  }}
                >
                  <div className="mt-0.5 size-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 group-hover:bg-red-500/30 transition-colors">
                    <span className="text-red-400 font-black text-xs leading-none">✕</span>
                  </div>
                  <span className="text-sm text-zinc-200 leading-relaxed">{con}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


/* ── User Reviews Section ────────────────────────────────── */
function UserReviewsSection({ reviews, deviceName }: { reviews: DeviceReview; deviceName: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!reviews.reviews || reviews.reviews.length === 0) return null;

  // Generate deterministic initials / avatar colors from index
  const avatarColors = [
    { bg: 'bg-[#7f22fe]/30', border: 'border-[#7f22fe]/50', text: 'text-[#ad46ff]', glow: 'shadow-[0_0_12px_rgba(127,34,254,0.4)]' },
    { bg: 'bg-[#00bc7d]/25', border: 'border-[#00bc7d]/40', text: 'text-[#00bc7d]', glow: 'shadow-[0_0_12px_rgba(0,188,125,0.3)]' },
    { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400', glow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]' },
    { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]' },
    { bg: 'bg-pink-500/20', border: 'border-pink-500/40', text: 'text-pink-400', glow: 'shadow-[0_0_12px_rgba(236,72,153,0.3)]' },
    { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]' },
    { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]' },
  ];

  const userNames = [
    'Alex K.', 'Morgan T.', 'Sam L.', 'Jordan R.', 'Casey M.',
    'Riley B.', 'Taylor N.', 'Drew P.', 'Quinn H.', 'Avery S.',
  ];

  const starRatings = [5, 4, 5, 4, 5, 4, 5, 4, 5, 4];

  const renderMiniStars = (count: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3 ${i < count ? 'fill-[#fe9a00] text-[#fe9a00]' : 'text-zinc-700'}`} />
      ))}
    </div>
  );

  return (
    <section
      ref={ref}
      className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden mt-8"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7f22fe]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
            <Star className="size-5 fill-amber-400" />
          </div>
          <div>
            <h2 className="font-black text-neutral-50 text-xl tracking-tight">User Reviews</h2>
            <span className="text-xs text-zinc-400 font-medium">{reviews.reviews.length} verified owners share their experience</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
          <span className="text-xs font-black text-amber-400">{reviews.reviews.length} Reviews</span>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {reviews.reviews.map((review, i) => {
          const color = avatarColors[i % avatarColors.length];
          const name = userNames[i % userNames.length];
          
          // Handle both old string format (if any) and new object format {title, body, rating}
          const isObject = typeof review === 'object' && review !== null;
          const bodyText = isObject ? (review as any).body : review;
          const titleText = isObject ? (review as any).title : null;
          const starsCount = isObject && (review as any).rating ? (review as any).rating : starRatings[i % starRatings.length];
          const initial = name.charAt(0);

          return (
            <div
              key={i}
              suppressHydrationWarning
              className="flex flex-col gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-white/5 hover:border-[#7f22fe]/30 hover:bg-zinc-900/60 transition-all duration-400 group relative overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.55s ease ${i * 0.07}s, transform 0.55s ease ${i * 0.07}s`,
              }}
            >
              {/* Quote mark decoration */}
              <span
                className="absolute top-3 right-4 text-6xl font-black leading-none text-white/4 group-hover:text-white/7 select-none transition-colors"
                aria-hidden
              >
                &ldquo;
              </span>

              {/* Review text */}
              <div className="relative z-10 flex flex-col gap-1.5">
                {titleText && <h4 className="font-bold text-white text-sm">{titleText}</h4>}
                <p className="text-sm text-zinc-300 leading-relaxed italic">&ldquo;{bodyText}&rdquo;</p>
              </div>

              {/* Footer: avatar + name + stars */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`size-8 rounded-full ${color.bg} border ${color.border} ${color.glow} flex items-center justify-center shrink-0`}
                  >
                    <span className={`text-xs font-black ${color.text}`}>{initial}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-200">{name}</span>
                    <div className="text-[10px] text-zinc-500">Verified owner</div>
                  </div>
                </div>
                {renderMiniStars(starsCount)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


interface DeviceSpecsPageContentProps {
  device: Device;
  initialDevices: Device[];
  deviceReviews: DeviceReview | null;
}

export default function DeviceSpecsPageContent({
  device,
  initialDevices,
  deviceReviews
}: DeviceSpecsPageContentProps) {
  const router = useRouter();

  const {
    selectedDevices,
    handleSelectDevice,
    handleRemoveDevice,
    handleBuy,
    showToast,
    handleCategoryChange
  } = useApp();

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

  // Sidebar Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  // Interactive Aura lighting for Device Image Showcase
  const [activeAura, setActiveAura] = useState<'violet' | 'emerald' | 'cyan' | 'amber'>('violet');

  // Scroll observer for performance bars animation
  const [perfVisible, setPerfVisible] = useState(false);
  const perfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPerfVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (perfRef.current) observer.observe(perfRef.current);
    return () => observer.disconnect();
  }, []);

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

  const handleSelectDeviceFromExplorer = (selectedDevice: Device) => {
    router.push(`/device/${selectedDevice.id}`);
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

  const categoryConfig = [
    { id: 'mobiles' as const, label: 'Phones', icon: <Smartphone className="size-4 text-cyan-400" /> },
    { id: 'tablets' as const, label: 'Tablets', icon: <Tablet className="size-4 text-emerald-400" /> },
    { id: 'watches' as const, label: 'Smartwatches', icon: <Watch className="size-4 text-amber-400" /> },
    { id: 'earbuds' as const, label: 'Earbuds', icon: <Headphones className="size-4 text-pink-400" /> },
    { id: 'laptops' as const, label: 'Laptops', icon: <Laptop className="size-4 text-[#ad46ff]" /> }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="size-4 fill-[#fe9a00] text-[#fe9a00]" />);
      } else {
        stars.push(<Star key={i} className="size-4 text-zinc-650" />);
      }
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  const inCompare = isDeviceInComparison(device);

  const specSections = [
    {
      title: 'Network',
      icon: <Signal className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Technology', key: 'technology' as keyof typeof device.specs },
        { label: '5G Bands', key: 'bands5g' as keyof typeof device.specs }
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
        { label: 'Chipset', key: ['chipset', 'processor'] },
        { label: 'GPU', key: 'gpu' },
        { label: 'OS', key: 'os' }
      ]
    },
    {
      title: 'Memory',
      icon: <HardDrive className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'RAM', key: 'ram' },
        { label: 'Storage Variants', key: ['storageVariants', 'storage'] },
        { label: 'Card Slot', key: 'cardSlot' }
      ]
    },
    {
      title: 'Camera',
      icon: <Camera className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Main Camera', key: ['mainCamera', 'cameras'] },
        { label: 'Selfie Camera', key: 'selfieCamera' },
        { label: 'Video', key: 'video' }
      ]
    },
    {
      title: 'Battery',
      icon: <BatteryCharging className="size-4 text-[#7f22fe]" />,
      specs: [
        { label: 'Capacity', key: ['capacity', 'battery'] },
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

  const renderSpecRow = (label: string, specKeys: string | string[], isAlternateBg = false) => {
    const keys = Array.isArray(specKeys) ? specKeys : [specKeys];
    let val: any;
    for (const key of keys) {
      if ((device.specs as any)[key]) {
        val = (device.specs as any)[key];
        break;
      }
    }
    if (!val || val === 'N/A') return null;

    // Safely convert any non-string values (objects, arrays) to a readable string
    let displayVal: string;
    if (typeof val === 'string') {
      displayVal = val;
    } else if (Array.isArray(val)) {
      displayVal = val.map((v: any) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
    } else if (typeof val === 'object' && val !== null) {
      // e.g. {title, body, rating} — pick the most descriptive field or stringify
      displayVal = val.title || val.body || val.name || val.value || JSON.stringify(val);
    } else {
      displayVal = String(val);
    }

    const rowKey = Array.isArray(specKeys) ? specKeys[0] : specKeys;

    return (
      <div
        key={rowKey}
        className={`grid grid-cols-1 sm:grid-cols-[1fr_2fr] px-4 sm:px-6 py-3 sm:py-4 items-center border-b border-white/5 ${
          isAlternateBg ? 'bg-zinc-900/10' : ''
        }`}
      >
        <div className="font-semibold text-zinc-400 text-sm leading-5 sm:border-[#7f22fe]/40 sm:border-l-2 sm:pl-3 mb-1 sm:mb-0">
          {label}
        </div>
        <div className="text-sm leading-5 break-words text-neutral-250">
          {displayVal}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 w-full bg-zinc-950 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Mirrored from HomePage */}
      <aside className="w-64 xl:w-72 2xl:w-80 border-r border-white/5 bg-zinc-900/20 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 hidden md:flex h-full self-stretch">
        {/* Unified Categories Section */}
        <BrowseCategorySection currentCategory={device.category} />

        <hr className="border-white/5" />

        {/* Search Query Filter */}
        <div className="relative w-full">
          <Search className="size-4 text-[#7f22fe] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search releases..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-all"
          />
        </div>

        <BrandExplorer
          devices={initialDevices}
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

        {/* Most Searched Devices Widget */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-2">
            <Search className="size-3 text-[#7f22fe]" />
            Most Searched
          </h4>
          <div className="flex flex-col gap-2">
            {initialDevices.slice(0, 3).map((d, i) => (
              <div
                key={`search-${d.id}`}
                onClick={() => handleSelectDeviceFromExplorer(d)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/60 border border-transparent hover:border-white/5 cursor-pointer transition-colors group"
              >
                <span className="text-[#9f9fa9] font-bold text-xs w-3">{i + 1}</span>
                <img src={d.image} alt={d.name} className="size-8 object-contain rounded bg-zinc-900 p-1 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white group-hover:text-[#00bc7d] transition-colors line-clamp-1">{d.name}</span>
                  <span className="text-[10px] text-zinc-500">{d.brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Most Powerful Devices Widget */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="size-3 text-pink-500" />
            Most Powerful
          </h4>
          <div className="flex flex-col gap-2">
            {[...initialDevices].sort((a, b) => (b.performance?.antutuPercent || 0) - (a.performance?.antutuPercent || 0)).slice(0, 3).map((d, i) => (
              <div
                key={`power-${d.id}`}
                onClick={() => handleSelectDeviceFromExplorer(d)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/60 border border-transparent hover:border-white/5 cursor-pointer transition-colors group"
              >
                <span className="text-pink-500/80 font-bold text-xs w-3">{i + 1}</span>
                <img src={d.image} alt={d.name} className="size-8 object-contain rounded bg-zinc-900 p-1 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white group-hover:text-pink-400 transition-colors line-clamp-1">{d.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/50 px-1 rounded self-start mt-0.5">
                    {d.performance.antutuScore} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tall Skyscraper Ad Slot for Left Sidebar — 160×600 */}
        <div
          className="relative rounded-2xl overflow-hidden border border-dashed border-white/10 bg-gradient-to-b from-zinc-900/60 via-zinc-950/60 to-zinc-900/60 flex flex-col items-center justify-center gap-3 group flex-1 min-h-[300px]"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#7f22fe]/5 via-transparent to-[#3b82f6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />

          {/* Vertical text label */}
          <div className="relative flex flex-col items-center gap-3 z-10">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">
              Advertisement
            </span>
            <span className="text-[9px] text-zinc-700 font-medium">Left Sidebar Ad Slot</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Device Specs */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 w-full max-w-5xl mx-auto advance-enter-fade-up">
          
          {/* 1. Top Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-white transition-all bg-zinc-900/80 hover:bg-zinc-800 px-4 py-2 rounded-2xl border border-white/10 shadow-md cursor-pointer hover:-translate-x-0.5"
            >
              <ArrowLeft className="size-4 text-zinc-300" />
              <span>Back to Devices</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-[11px] uppercase font-black tracking-widest bg-zinc-950 border border-white/15 text-[#00bc7d] shadow-sm">
                {device.brand}
              </span>
              <span className="px-3.5 py-1 rounded-full text-[11px] uppercase font-black tracking-widest bg-[#7f22fe]/20 border border-[#7f22fe]/40 text-[#ad46ff] shadow-[0_0_10px_rgba(127,34,254,0.3)]">
                {device.category}
              </span>
            </div>
          </div>

          {/* Mobile Category Navigation */}
          <div className="md:hidden">
            <BrowseCategorySection orientation="horizontal" currentCategory={device.category} />
          </div>

          {/* 2. Primary Device Name Header */}
          <section className="backdrop-blur-xl rounded-3xl bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 border border-white/10 p-5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-600/15 via-emerald-500/10 to-transparent rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] uppercase font-black tracking-widest bg-[#00bc7d]/15 text-[#00bc7d] border border-[#00bc7d]/30 px-3 py-0.5 rounded-full shadow-sm">
                    {device.brand} Official
                  </span>
                  {device.specs?.releaseDate && (
                    <span className="text-[11px] text-zinc-400 font-bold bg-zinc-950/80 px-3 py-0.5 rounded-full border border-white/5">
                      Released: {device.specs.releaseDate}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md break-words">
                  {device.name}
                </h1>

                <div className="flex items-center gap-3 mt-0.5">
                  {renderStars(device.rating)}
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    {device.rating} / 5.0 Rating
                  </span>
                  <span className="text-xs font-bold text-zinc-400">
                    Official Flagship Database
                  </span>
                </div>
              </div>

              {/* Header Quick Action Buttons */}
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
                {hasBuyLink(device) && (
                  <button
                    onClick={() => handleBuy(device)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00bc7d] to-teal-500 hover:opacity-90 font-black text-white text-xs shadow-lg shadow-[#00bc7d]/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    Buy Device
                  </button>
                )}
                <button
                  onClick={() => handleCompareClick(device)}
                  className={`px-5 py-3 rounded-2xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 ${
                    inCompare
                      ? 'bg-[#7f22fe]/20 border-[#7f22fe]/60 text-[#ad46ff] shadow-[0_0_15px_rgba(127,34,254,0.4)]'
                      : 'bg-zinc-950 border-white/10 hover:border-violet-500/50 text-neutral-200 hover:text-white'
                  }`}
                >
                  {inCompare ? <><Check className="size-4 text-[#ad46ff]" /> In Comparison</> : <><Plus className="size-4 text-[#7f22fe]" /> Compare</>}
                </button>
              </div>
            </div>
          </section>

          {/* 3. About Device Overview Section (Positioned directly below the Name Header) */}
          {device.description && (
            <section className="backdrop-blur-xl rounded-3xl bg-gradient-to-r from-zinc-900/60 via-zinc-900/40 to-zinc-950/80 border border-white/10 p-6 md:p-7 shadow-xl relative overflow-hidden advance-card-hover">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="size-7 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(127,34,254,0.3)]">
                  <Info className="size-4 text-violet-400" />
                </div>
                <h2 className="text-sm uppercase tracking-wider font-black text-white">
                  About {device.name} Overview
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300 font-normal">
                {device.description}
              </p>
            </section>
          )}

          {/* 4. Beautiful & Interactive Picture Section + Key Specs Highlights */}
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8">
            <div className="flex flex-col lg:flex-row items-stretch gap-8 bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-zinc-950/90 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              
              {/* Dynamic Aura Color Backdrop */}
              <div
                className={`absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[110px] pointer-events-none transition-all duration-700 ${
                  activeAura === 'emerald'
                    ? 'bg-emerald-500/25'
                    : activeAura === 'cyan'
                    ? 'bg-cyan-500/25'
                    : activeAura === 'amber'
                    ? 'bg-amber-500/25'
                    : 'bg-[#7f22fe]/25'
                }`}
              />
              
              {/* Interactive Device Image Showcase (Device name removed as requested) */}
              <div className="w-full lg:w-88 shrink-0 bg-gradient-to-b from-zinc-950/95 via-zinc-900/80 to-zinc-950 rounded-3xl p-6 border border-white/15 flex flex-col items-center justify-between relative shadow-2xl group/pic overflow-hidden">
                
                {/* Top Lighting Selector */}
                <div className="w-full flex items-center justify-between z-20 mb-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/10 text-[10px] font-black text-zinc-300 shadow-inner">
                    <span className="size-2 rounded-full bg-[#00bc7d] animate-pulse" />
                    <span>Studio 3D View</span>
                  </div>

                  {/* Aura Color Switcher Pills */}
                  <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-full border border-white/10">
                    {[
                      { id: 'violet' as const, bg: 'bg-violet-500', glow: 'shadow-[0_0_8px_#8b5cf6]' },
                      { id: 'emerald' as const, bg: 'bg-emerald-500', glow: 'shadow-[0_0_8px_#10b981]' },
                      { id: 'cyan' as const, bg: 'bg-cyan-500', glow: 'shadow-[0_0_8px_#06b6d4]' },
                      { id: 'amber' as const, bg: 'bg-amber-500', glow: 'shadow-[0_0_8px_#f59e0b]' },
                    ].map(aura => (
                      <button
                        key={aura.id}
                        onClick={() => setActiveAura(aura.id)}
                        className={`size-3.5 rounded-full ${aura.bg} transition-all cursor-pointer ${
                          activeAura === aura.id ? `scale-125 ${aura.glow} ring-2 ring-white/50` : 'opacity-40 hover:opacity-100'
                        }`}
                        title={`${aura.id} aura`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating Interactive High-Res Device Image */}
                <div className="my-auto py-4 flex items-center justify-center relative w-full group/zoom cursor-pointer">
                  <img
                    src={
                      device.image?.includes('gsmarena.com')
                        ? `/api/image-proxy?url=${encodeURIComponent(device.image)}`
                        : (device.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80')
                    }
                    alt={device.name}
                    className="max-h-68 max-w-full object-contain relative z-10 transition-all duration-700 group-hover/pic:scale-110 group-hover/pic:rotate-1 filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80';
                    }}
                  />
                </div>

                {/* Bottom Gallery Quality Tag */}
                <div className="w-full flex items-center justify-center mt-2 z-10">
                  <span className="text-[10px] font-black text-zinc-400 bg-zinc-900/90 border border-white/10 px-3.5 py-1 rounded-full shadow-inner flex items-center gap-1.5">
                    <Sparkles className="size-3 text-[#00bc7d]" />
                    <span>Ultra HD Official Render</span>
                  </span>
                </div>
              </div>

              {/* Single Specs Details Dashboard & Complete Highlights Block */}
              <div className="flex flex-col justify-between gap-6 flex-1 w-full z-10">
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-black tracking-widest text-[#ad46ff]">
                    Hardware Overview
                  </span>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    Verified specification metrics benchmarked against modern industry standards.
                  </p>
                </div>

                {/* Complete Key Specs Highlight Block (Clean 6-grid icons + formatted key specs) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  {/* 1. Display */}
                  <div className="flex items-start gap-3 bg-zinc-950/85 p-3.5 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 shadow-inner group/spec">
                    <MonitorSmartphone className="size-5 text-cyan-400 mt-0.5 shrink-0 group-hover/spec:scale-110 transition-transform" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Display</span>
                      <span className="text-[12px] font-black text-white leading-tight truncate">
                        {device.specs?.displayTypeSize?.split(',')[0] || 'OLED / AMOLED'}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {device.specs?.displayTypeSize?.split(',')[1] || device.specs?.pixelDensity || 'High Refresh Rate'}
                      </span>
                    </div>
                  </div>

                  {/* 2. Chipset & Processor */}
                  <div className="flex items-start gap-3 bg-zinc-950/85 p-3.5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-inner group/spec">
                    <Cpu className="size-5 text-[#ad46ff] mt-0.5 shrink-0 group-hover/spec:scale-110 transition-transform" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Chipset</span>
                      <span className="text-[12px] font-black text-white leading-tight truncate">
                        {device.specs?.chipset?.split('(')[0] || (device.specs as any)?.processor || 'Flagship SoC'}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {device.specs?.gpu || 'Next-Gen GPU'}
                      </span>
                    </div>
                  </div>

                  {/* 3. Camera Setup */}
                  <div className="flex items-start gap-3 bg-zinc-950/85 p-3.5 rounded-2xl border border-white/10 hover:border-[#7f22fe]/50 transition-all duration-300 shadow-inner group/spec">
                    <Camera className="size-5 text-[#7f22fe] mt-0.5 shrink-0 group-hover/spec:scale-110 transition-transform" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Camera</span>
                      <span className="text-[12px] font-black text-white leading-tight truncate">
                        {device.specs?.mainCamera?.split('(')[0] || 'Multi-Lens Setup'}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {device.specs?.video?.split(',')[0] || '4K/8K Video'}
                      </span>
                    </div>
                  </div>

                  {/* 4. Memory & Storage */}
                  <div className="flex items-start gap-3 bg-zinc-950/85 p-3.5 rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 shadow-inner group/spec">
                    <HardDrive className="size-5 text-pink-400 mt-0.5 shrink-0 group-hover/spec:scale-110 transition-transform" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">RAM & Storage</span>
                      <span className="text-[12px] font-black text-white leading-tight truncate">
                        {device.specs?.ram?.split(',')[0] || '8GB/12GB/16GB'}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {device.specs?.storageVariants || (device.specs as any)?.storage || 'Fast Storage'}
                      </span>
                    </div>
                  </div>

                  {/* 5. Battery & Charging */}
                  <div className="flex items-start gap-3 bg-zinc-950/85 p-3.5 rounded-2xl border border-white/10 hover:border-amber-500/50 transition-all duration-300 shadow-inner group/spec">
                    <BatteryCharging className="size-5 text-amber-400 mt-0.5 shrink-0 group-hover/spec:scale-110 transition-transform" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Battery</span>
                      <span className="text-[12px] font-black text-white leading-tight truncate">
                        {device.specs?.capacity?.split(' ')[0] ? `${device.specs.capacity.split(' ')[0]} mAh` : 'All-Day Battery'}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {device.specs?.wiredCharging || 'Fast Charge'}
                      </span>
                    </div>
                  </div>

                  {/* 6. OS & Network */}
                  <div className="flex items-start gap-3 bg-zinc-950/85 p-3.5 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 shadow-inner group/spec">
                    <Signal className="size-5 text-emerald-400 mt-0.5 shrink-0 group-hover/spec:scale-110 transition-transform" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">OS & 5G</span>
                      <span className="text-[12px] font-black text-white leading-tight truncate">
                        {device.specs?.os?.split(',')[0] || 'Latest OS'}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {device.specs?.bands5g ? '5G SA/NSA' : 'Global Network'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price and Glowing Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div className="flex flex-col text-center sm:text-left">
                    <span className="text-xs font-bold text-zinc-400">Official Retail Price</span>
                    <span className="text-3xl font-black text-[#00bc7d] drop-shadow-[0_0_12px_rgba(0,188,125,0.3)]">{device.price}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {hasBuyLink(device) && (
                      <button
                        onClick={() => handleBuy(device)}
                        className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-[#00bc7d] to-teal-500 hover:opacity-90 font-black text-white shadow-xl text-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        Buy Now
                      </button>
                    )}
                    <button
                      onClick={() => handleCompareClick(device)}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl border font-black transition-all duration-300 text-sm flex items-center justify-center gap-2 cursor-pointer ${
                        inCompare
                          ? 'bg-[#7f22fe]/20 border-[#7f22fe]/60 text-[#ad46ff] shadow-[0_0_15px_rgba(127,34,254,0.4)]'
                          : 'bg-zinc-950 border-white/10 hover:border-violet-500/60 text-neutral-200 hover:text-white hover:scale-105'
                      }`}
                    >
                      {inCompare ? <Check className="size-4 text-[#ad46ff]" /> : <Plus className="size-4 text-[#7f22fe]" />}
                      {inCompare ? 'Added' : 'Add to Compare'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Detailed Sheets */}
          <section className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border z-0 border-white/10 overflow-hidden shadow-2xl mt-4 relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7f22fe]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00bc7d]/5 rounded-full blur-[80px] pointer-events-none" />

            {specSections.map(section => {
              const hasVisibleSpecs = section.specs.some(spec => {
                const keys = Array.isArray(spec.key) ? spec.key : [spec.key];
                return keys.some(k => (device.specs as any)[k] && (device.specs as any)[k] !== 'N/A');
              });

              if (!hasVisibleSpecs) return null;

              return (
                <div key={section.title} className="relative z-10">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-[#7f22fe]/20 via-[#7f22fe]/5 to-transparent border-l-4 border-[#7f22fe] flex px-6 py-4 items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#7f22fe]/20 border border-[#7f22fe]/30 shadow-[0_0_10px_rgba(127,34,254,0.3)]">
                      {section.icon}
                    </div>
                    <span className="font-black uppercase text-neutral-100 text-xs tracking-wider drop-shadow-md">
                      {section.title}
                    </span>
                  </div>
                  {section.specs.map((spec, idx) => renderSpecRow(spec.label, spec.key, idx % 2 === 0))}
                </div>
              );
            })}
            
            {/* Performance Benchmark Scores Section */}
            {device.performance && (
              <div className="relative z-10">
                <div className="bg-gradient-to-r from-[#00bc7d]/25 via-[#00bc7d]/10 to-transparent border-l-4 border-[#00bc7d] flex px-6 py-4 items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#00bc7d]/20 border border-[#00bc7d]/30 shadow-[0_0_10px_rgba(0,188,125,0.3)]">
                      <Cpu className="size-4 text-[#00bc7d]" />
                    </div>
                    <span className="font-black uppercase text-neutral-100 text-xs tracking-wider drop-shadow-md">
                      Performance Benchmark Scores
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00bc7d] bg-[#00bc7d]/15 border border-[#00bc7d]/40 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(0,188,125,0.3)]">
                    Verified Specs
                  </span>
                </div>
                
                {device.performance.cpuScore && (
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] px-6 py-4 items-center border-b border-white/5 bg-zinc-900/20 hover:bg-zinc-800/40 transition-colors">
                    <div className="font-bold text-zinc-400 text-sm leading-5 sm:border-emerald-500/65 sm:border-l-2 sm:pl-3 mb-1 sm:mb-0">CPU Score</div>
                    <div className="text-sm leading-5 font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">{device.performance.cpuScore}</div>
                  </div>
                )}
                {device.performance.gpuScore && (
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] px-6 py-4 items-center border-b border-white/5 bg-zinc-950/20 hover:bg-zinc-800/40 transition-colors">
                    <div className="font-bold text-zinc-400 text-sm leading-5 sm:border-[#ad46ff]/65 sm:border-l-2 sm:pl-3 mb-1 sm:mb-0">GPU Score</div>
                    <div className="text-sm leading-5 font-black text-[#ad46ff] drop-shadow-[0_0_12px_rgba(173,70,255,0.5)]">{device.performance.gpuScore}</div>
                  </div>
                )}
                {device.performance.batteryLife && (
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] px-6 py-4 items-center border-b border-white/5 bg-zinc-900/20 hover:bg-zinc-800/40 transition-colors">
                    <div className="font-bold text-zinc-400 text-sm leading-5 sm:border-cyan-400/65 sm:border-l-2 sm:pl-3 mb-1 sm:mb-0">Battery Life</div>
                    <div className="text-sm leading-5 font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">{device.performance.batteryLife}</div>
                  </div>
                )}
                {device.performance.antutuScore && (
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] px-6 py-4 items-center border-b border-white/5 bg-zinc-950/20 hover:bg-zinc-800/40 transition-colors">
                    <div className="font-bold text-zinc-400 text-sm leading-5 sm:border-amber-400/65 sm:border-l-2 sm:pl-3 mb-1 sm:mb-0">AnTuTu Score</div>
                    <div className="text-sm leading-5 font-black text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">{device.performance.antutuScore}</div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Performance Benchmark Glowing Progress Bar Section with Scroll-in Animation */}
          {device.performance && (
            <section
              ref={perfRef}
              className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden mt-6"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00bc7d]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/10 pb-4 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#7f22fe]/15 border border-[#7f22fe]/30 text-[#ad46ff] shadow-[0_0_12px_rgba(127,34,254,0.3)]">
                    <BarChart3 className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-black text-neutral-50 text-xl tracking-tight">
                      Performance Power Bars
                    </h2>
                    <span className="text-xs text-zinc-400 font-medium">Real-time benchmark score percentage comparison</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 z-10">
                {[
                  { label: 'CPU Score', val: device.performance.cpuScore, pct: device.performance.cpuPercent, barClass: 'perf-bar-emerald', badgeClass: 'perf-badge-emerald', dotColor: '#34d399' },
                  { label: 'GPU Score', val: device.performance.gpuScore, pct: device.performance.gpuPercent, barClass: 'perf-bar-purple', badgeClass: 'perf-badge-purple', dotColor: '#c084fc' },
                  { label: 'Battery Life', val: device.performance.batteryLife, pct: device.performance.batteryPercent, barClass: 'perf-bar-cyan', badgeClass: 'perf-badge-cyan', dotColor: '#22d3ee' },
                  { label: 'AnTuTu Score', val: device.performance.antutuScore, pct: device.performance.antutuPercent, barClass: 'perf-bar-amber', badgeClass: 'perf-badge-amber', dotColor: '#fbbf24' }
                ].map(item => item.val && (
                  <div key={item.label} className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-zinc-200 text-xs tracking-wider uppercase flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dotColor, boxShadow: `0 0 8px ${item.dotColor}` }} />
                        {item.label}
                      </span>
                      <span className={`${item.badgeClass} text-xs font-black px-3 py-1 rounded-full`}>
                        {item.val} ({item.pct || 0}%)
                      </span>
                    </div>
                    <div className="perf-bar-track">
                      <div
                        className={`perf-bar-fill ${item.barClass}`}
                        style={{
                          width: perfVisible ? `${item.pct || 0}%` : '0%',
                          transition: 'width 1.4s cubic-bezier(0.22, 1, 0.36, 1)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pros & Cons Section */}
          {deviceReviews && (
            <ProsConsSection reviews={deviceReviews} deviceName={device.name} />
          )}

          {/* User Reviews Section */}
          {deviceReviews && (
            <UserReviewsSection reviews={deviceReviews} deviceName={device.name} />
          )}

          {/* Interactive Community Comments & Discussions (Auth-protected commenting) */}
          <DeviceCommentsSection
            deviceId={device.id}
            deviceName={device.name}
            deviceBrand={device.brand}
          />

          {/* Related News & Reviews Section (Queries news collection by deviceId) */}
          <RelatedNewsSection device={device} />
        </div>

        <Footer />
      </main>

      {/* Right Sidebar - Ad */}
      <AdSidebar />
    </div>
  );
}
