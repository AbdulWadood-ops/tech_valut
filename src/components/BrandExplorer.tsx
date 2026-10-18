'use client';

import React, { useMemo } from 'react';
import { Compass, Sparkles, Flame, ChevronRight } from 'lucide-react';
import type { Device } from '../data/devices';
import Link from 'next/link';

interface BrandExplorerProps {
  devices?: Device[];
  onSelectDevice?: (device: Device) => void;
  onCompareDevice?: (device: Device) => void;
  isDeviceInComparison?: (device: Device) => boolean;
  selectedBrands?: string[];
  onBrandToggle?: (brand: string) => void;
}

const DEFAULT_POPULAR_BRANDS = [
  'Acer', 'Alcatel', 'Apple', 'Asus',
  'Blackview', 'Google', 'Honor', 'HTC',
  'Huawei', 'Infinix', 'Lava', 'Lenovo',
  'LG', 'Meizu', 'Motorola', 'Nokia',
  'Nothing', 'OnePlus', 'Oppo', 'Poco',
  'Realme', 'Samsung', 'Sony', 'Tecno',
  'Vivo', 'Xiaomi', 'ZTE', 'Zopo'
];

export default function BrandExplorer({
  devices = [],
  selectedBrands = [],
  onBrandToggle,
}: BrandExplorerProps) {
  // Extract and alphabetize available brands, merging existing MongoDB device brands
  const sortedBrands = useMemo(() => {
    let brandList = [...DEFAULT_POPULAR_BRANDS];
    if (devices && devices.length > 0) {
      const dbBrands = devices.map(d => d.brand?.trim()).filter(Boolean) as string[];
      const combined = Array.from(new Set([...brandList, ...dbBrands]));
      brandList = combined;
    }
    // Sort alphabetically (case-insensitive)
    const sorted = brandList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    // Keep 28 items (7 rows x 4 cols) for balanced layout
    const targetCount = Math.min(28, sorted.length);
    return sorted.slice(0, targetCount);
  }, [devices]);

  // Split into 4 vertical columns (top-to-bottom alphabetized)
  const columns = useMemo(() => {
    const cols: string[][] = [[], [], [], []];
    const total = sortedBrands.length;
    const itemsPerCol = Math.ceil(total / 4);

    for (let i = 0; i < 4; i++) {
      cols[i] = sortedBrands.slice(i * itemsPerCol, (i + 1) * itemsPerCol);
    }
    return cols;
  }, [sortedBrands]);

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/90 shadow-2xl text-neutral-100 text-[11px] select-none font-sans backdrop-blur-xl transition-all duration-300">
      {/* Header Row: PHONE FINDER with sleek Skipper UI gradient & badge */}
      <div className="flex items-center justify-between px-3.5 py-3 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-gradient-to-br from-[#00bc7d]/20 to-[#7f22fe]/20 border border-white/10 flex items-center justify-center">
            <Compass className="size-3.5 text-[#00bc7d]" />
          </div>
          <span className="font-extrabold uppercase tracking-wider text-[11px] bg-gradient-to-r from-white via-neutral-200 to-zinc-400 bg-clip-text text-transparent">
            Brand Directory
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#7f22fe]/15 text-[#ad46ff] font-extrabold border border-[#7f22fe]/30 shadow-[0_0_10px_rgba(127,34,254,0.2)]">
          {sortedBrands.length} Brands
        </span>
      </div>

      {/* 4-Column Compact Grid (Top-to-Bottom Alphabetical) */}
      <div className="grid grid-cols-4 divide-x divide-white/5 bg-zinc-950/70 p-1">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-0.5">
            {col.map((brand) => {
              const isSelected = selectedBrands.some(
                b => b.toLowerCase() === brand.toLowerCase()
              );

              return (
                <Link
                  key={brand}
                  href={`/phone/${encodeURIComponent(brand.toLowerCase())}/p1`}
                  className={`block w-full px-2 py-1.5 rounded-lg transition-all duration-200 group border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7f22fe] to-[#7f22fe] text-white font-black border-[#ad46ff]/50 shadow-[0_0_12px_rgba(127,34,254,0.4)]'
                      : 'text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-[#7f22fe]/20 hover:to-[#7f22fe]/20 border-transparent hover:border-white/10 hover:shadow-sm'
                  }`}
                  title={`View ${brand} Devices`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[10.5px] font-semibold tracking-tight group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                      {brand}
                    </span>
                    <ChevronRight className="size-2.5 text-zinc-600 group-hover:text-[#00bc7d] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Row: ALL BRANDS & RUMOR MILL as stylish interactive Skipper UI buttons */}
      <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-zinc-900/90">
        <Link
          href="/all-brands"
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-[#7f22fe]/20 hover:to-transparent transition-all font-extrabold uppercase tracking-wider text-[10px] group"
        >
          <Sparkles className="size-3.5 text-[#ad46ff] group-hover:scale-110 transition-transform" />
          <span>All Brands</span>
        </Link>
        <Link
          href="/forum"
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-[#00bc7d]/20 hover:to-transparent transition-all font-extrabold uppercase tracking-wider text-[10px] group"
        >
          <Flame className="size-3.5 text-[#00bc7d] group-hover:scale-110 transition-transform" />
          <span>Forum</span>
        </Link>
      </div>
    </div>
  );
}
