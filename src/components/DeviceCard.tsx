'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Cpu,
  Battery,
  HardDrive,
  Star,
  Plus,
  Check,
  ArrowRight,
  Tablet,
  Watch,
  Headphones,
  Laptop,
  Shield,
  Wifi,
  Sparkles
} from 'lucide-react';
import type { Device } from '../data/devices';
import { formatCategoryLabel } from '../lib/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80';

interface DeviceCardProps {
  device: Device;
  inCompare?: boolean;
  onCompareClick?: (device: Device) => void;
  onBuyClick?: (device: Device) => void;
  priorityImage?: boolean;
}

function DeviceCardComponent({
  device,
  inCompare = false,
  onCompareClick,
  priorityImage = false
}: DeviceCardProps) {
  const category = (device.category || 'mobiles').toLowerCase();
  const categoryLabel = formatCategoryLabel(category);
  const ratingValue = Number(device.rating) > 0 ? Number(device.rating).toFixed(1) : '4.5';

  // Proxied or direct image URL
  const initialImageUrl = device.image?.includes('gsmarena.com')
    ? `/api/image-proxy?url=${encodeURIComponent(device.image)}`
    : (device.image || FALLBACK_IMG);

  const [imgSrc, setImgSrc] = useState(initialImageUrl);

  useEffect(() => {
    const nextUrl = device.image?.includes('gsmarena.com')
      ? `/api/image-proxy?url=${encodeURIComponent(device.image)}`
      : (device.image || FALLBACK_IMG);
    setImgSrc(nextUrl);
  }, [device.image]);

  // Category specific accent theme
  const getCategoryTheme = () => {
    switch (category) {
      case 'tablets':
        return {
          pillBg: 'border-emerald-500/35 bg-emerald-950/70 text-emerald-300',
          dot: 'bg-emerald-400',
          hoverBorder: 'group-hover:border-emerald-500/50',
          aura: 'from-emerald-600/20 to-teal-500/15',
          btnGrad: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
          btnShadow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
          icon: <Tablet className="size-3 text-emerald-400 shrink-0" />
        };
      case 'watches':
        return {
          pillBg: 'border-amber-500/35 bg-amber-950/70 text-amber-300',
          dot: 'bg-amber-400',
          hoverBorder: 'group-hover:border-amber-500/50',
          aura: 'from-amber-600/20 to-orange-500/15',
          btnGrad: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
          btnShadow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
          icon: <Watch className="size-3 text-amber-400 shrink-0" />
        };
      case 'earbuds':
        return {
          pillBg: 'border-pink-500/35 bg-pink-950/70 text-pink-300',
          dot: 'bg-pink-400',
          hoverBorder: 'group-hover:border-pink-500/50',
          aura: 'from-pink-600/20 to-rose-500/15',
          btnGrad: 'from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500',
          btnShadow: 'shadow-[0_0_12px_rgba(236,72,153,0.3)]',
          icon: <Headphones className="size-3 text-pink-400 shrink-0" />
        };
      case 'laptops':
        return {
          pillBg: 'border-violet-500/35 bg-violet-950/70 text-violet-300',
          dot: 'bg-violet-400',
          hoverBorder: 'group-hover:border-violet-500/50',
          aura: 'from-violet-600/20 to-purple-500/15',
          btnGrad: 'from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500',
          btnShadow: 'shadow-[0_0_12px_rgba(139,92,246,0.3)]',
          icon: <Laptop className="size-3 text-violet-400 shrink-0" />
        };
      case 'mobiles':
      default:
        return {
          pillBg: 'border-cyan-500/35 bg-cyan-950/70 text-cyan-300',
          dot: 'bg-cyan-400',
          hoverBorder: 'group-hover:border-[#7f22fe]/60',
          aura: 'from-[#7f22fe]/20 to-[#00bc7d]/15',
          btnGrad: 'from-[#7f22fe] to-[#9333ea] hover:from-[#6b1cd4] hover:to-[#7f22fe]',
          btnShadow: 'shadow-[0_0_12px_rgba(127,34,254,0.3)]',
          icon: <Smartphone className="size-3 text-cyan-400 shrink-0" />
        };
    }
  };

  const theme = getCategoryTheme();

  // Dynamic specs extraction for the 2x2 matrix
  const getSpecsMatrix = () => {
    const s = device.specs || {};
    
    // Display / Main screen
    let spec1 = {
      label: s.displayTypeSize ? s.displayTypeSize.split(',')[0].trim() : (category === 'earbuds' ? 'Dynamic Driver' : 'OLED Screen'),
      icon: theme.icon
    };

    // Processor / Chip / Sound Engine
    let spec2 = {
      label: s.chipset ? s.chipset.split('(')[0].replace('Snapdragon', 'SD').trim() : (s.os || `${device.brand || 'Core'} Chip`),
      icon: <Cpu className="size-3 text-violet-400 shrink-0" />
    };

    // Battery / Endurance
    let spec3 = {
      label: s.capacity ? (s.capacity.includes('mAh') ? s.capacity.split(' ')[0] + ' mAh' : s.capacity) : (category === 'watches' ? 'Multi-Day Battery' : '5000 mAh'),
      icon: <Battery className="size-3 text-emerald-400 shrink-0" />
    };

    // Storage / RAM / Extra
    let spec4 = {
      label: s.storageVariants ? s.storageVariants.split('/')[0].split(',')[0].trim() : (s.ram ? `${s.ram} RAM` : (s.resistance || 'Fast Charging')),
      icon: <HardDrive className="size-3 text-amber-400 shrink-0" />
    };

    return [spec1, spec2, spec3, spec4];
  };

  const specsMatrix = getSpecsMatrix();

  // Format price cleanly
  const formattedPrice = device.price
    ? (device.price.startsWith('$') ? device.price : `$${device.price}`)
    : '$299';

  return (
    <div className={`group rounded-2xl bg-zinc-900/80 border border-white/10 ${theme.hoverBorder} transition-all duration-300 p-4 flex flex-col justify-between relative shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden select-none`}>
      <div>
        {/* Device Image Box with ambient glow */}
        <Link
          href={`/device/${device.id}`}
          className="block relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950/80 border border-white/10 mb-3.5 p-3 sm:p-4 flex items-center justify-center group/img"
        >
          {/* Subtle Ambient Aura */}
          <div className={`absolute inset-4 rounded-full blur-xl bg-gradient-to-br ${theme.aura} opacity-25 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none`} />

          {/* Actual Device Image with responsive sizes */}
          <img
            src={imgSrc}
            alt={device.name}
            loading={priorityImage ? 'eager' : 'lazy'}
            className="relative max-h-32 sm:max-h-36 w-auto object-contain transition-transform duration-500 group-hover:scale-108 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] z-10"
            onError={() => {
              if (imgSrc !== FALLBACK_IMG) {
                setImgSrc(FALLBACK_IMG);
              }
            }}
          />

          {/* Top Left: Category Badge */}
          <div className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 backdrop-blur-md border px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider z-10 shadow-sm ${theme.pillBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-pulse`} />
            <span>{categoryLabel}</span>
          </div>

          {/* Top Right: Rating Star Pill */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/85 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-black text-amber-400 z-10 shadow-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span>{ratingValue}</span>
          </div>
        </Link>

        {/* Brand & Price Header */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ad46ff] drop-shadow-[0_0_8px_rgba(173,70,255,0.2)] truncate max-w-[55%]">
            {device.brand || 'TECH'}
          </span>
          <span className="text-xs sm:text-sm font-black text-[#00bc7d] drop-shadow-[0_0_8px_rgba(0,188,125,0.35)] shrink-0 font-mono">
            {formattedPrice}
          </span>
        </div>

        {/* Device Name */}
        <Link
          href={`/device/${device.id}`}
          className="text-sm font-black text-white group-hover:text-violet-300 transition-colors line-clamp-1 block leading-tight mb-2.5 cursor-pointer"
          title={device.name}
        >
          {device.name}
        </Link>

        {/* 2x2 Specs Grid Matrix */}
        <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-zinc-400">
          {specsMatrix.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 truncate" title={item.label}>
              {item.icon}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Row: View Specs & Compare Button */}
      <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center gap-2">
        <Link
          href={`/device/${device.id}`}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r ${theme.btnGrad} text-white text-xs font-black transition-all duration-200 ${theme.btnShadow} cursor-pointer text-center`}
        >
          <span>View Specs</span>
          <ArrowRight className="size-3.5" />
        </Link>

        {onCompareClick && (
          <button
            type="button"
            onClick={() => onCompareClick(device)}
            title={inCompare ? 'Remove from compare' : 'Add to compare'}
            className={`p-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              inCompare
                ? 'bg-[#7f22fe]/20 border-[#7f22fe]/60 text-[#ad46ff] shadow-[0_0_10px_rgba(127,34,254,0.3)]'
                : 'bg-zinc-950 border-white/10 hover:border-white/30 text-zinc-400 hover:text-white'
            }`}
          >
            {inCompare ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

const DeviceCard = React.memo(DeviceCardComponent);
export default DeviceCard;
