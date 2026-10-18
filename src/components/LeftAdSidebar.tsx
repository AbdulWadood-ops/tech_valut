'use client';

import React, { useEffect, useState } from 'react';
import BrandExplorer from './BrandExplorer';
import BrowseCategorySection from './BrowseCategorySection';
import type { Device } from '../data/devices';

interface LeftAdSidebarProps {
  devices?: Device[];
}

export default function LeftAdSidebar({ devices: initialDevices }: LeftAdSidebarProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices || []);

  useEffect(() => {
    // If initialDevices contains a variety of brands (> 2 unique brands), use it
    if (initialDevices && initialDevices.length > 0) {
      const uniqueBrands = new Set(initialDevices.map(d => d.brand?.trim()).filter(Boolean));
      if (uniqueBrands.size > 2) {
        setDevices(initialDevices);
        return;
      }
    }

    // Otherwise, fetch broad device list so BrandExplorer has all catalog brands
    let isMounted = true;
    fetch('/api/devices?limit=200')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setDevices(data.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [initialDevices]);

  return (
    <aside className="w-64 xl:w-72 2xl:w-80 border-r border-white/5 bg-zinc-950/40 backdrop-blur-md p-4 flex flex-col gap-5 shrink-0 hidden md:flex h-full">

      {/* Unified Categories Section */}
      <BrowseCategorySection />

      <hr className="border-white/5" />

      {/* Brand Explorer Table Grid Section */}
      <BrandExplorer devices={devices} />

      <hr className="border-white/5 my-1" />

      {/* Sidebar Label */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-[0.15em]">
          Advertisement
        </span>
        <span className="text-[8px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full text-zinc-500 font-semibold tracking-wider">
          AD
        </span>
      </div>

      {/* Medium Rectangle Ad Slot — 300×250 */}
      <div
        className="relative rounded-2xl overflow-hidden border border-dashed border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 flex flex-col items-center justify-center gap-2 group"
        style={{ minHeight: '180px' }}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7f22fe]/5 via-transparent to-[#3b82f6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/10 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10 rounded-br-xl" />

        {/* Icon + Label */}
        <div className="relative flex flex-col items-center gap-1.5 z-10 p-4 text-center">
          <div className="w-7 h-7 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3.75 4.5h16.5A.75.75 0 0121 5.25v10.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 15.75V5.25A.75.75 0 013.75 4.5z" />
            </svg>
          </div>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sponsored Space</span>
          <span className="text-[8px] text-zinc-600 font-medium">300 × 250 Banner</span>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center shrink-0 mt-auto pt-2">
        <span className="text-[8px] text-zinc-700 uppercase tracking-widest font-medium">TechVault Brand Directory</span>
      </div>

    </aside>
  );
}
