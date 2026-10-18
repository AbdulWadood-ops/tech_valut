'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Smartphone,
  Cpu,
  Battery,
  HardDrive,
  Star,
  Loader2,
  Sparkles,
  ArrowRight,
  Plus,
  Check,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import type { Device } from '../data/devices';
import { useApp } from '../context/AppContext';
import { formatCategoryLabel } from '../lib/utils';
import DeviceCard from './DeviceCard';

interface DeviceCarouselPaginationProps {
  initialDevices: Device[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit?: number;
  brand?: string;
  brandName?: string;
  baseRoute: string; // e.g. "/phone/samsung" or "/phone/all"
}

export default function DeviceCarouselPagination({
  initialDevices,
  total,
  currentPage: initialPage,
  totalPages: initialTotalPages,
  limit = 45,
  brand = 'all',
  brandName,
  baseRoute,
}: DeviceCarouselPaginationProps) {
  const router = useRouter();
  const { selectedDevices, handleSelectDevice, handleRemoveDevice, showToast } = useApp();

  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [totalCount, setTotalCount] = useState<number>(total);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Sync state with server props
  useEffect(() => {
    setDevices(initialDevices);
    setPage(initialPage);
    setTotalPages(initialTotalPages);
    setTotalCount(total);
  }, [initialDevices, initialPage, initialTotalPages, total]);

  // Construct URL matching /phone/{brand}/p{page}
  const getPageUrl = (p: number) => {
    const cleanBase = baseRoute.replace(/\/p\d+$/, '').replace(/\/+$/, '');
    return `${cleanBase}/p${p}`;
  };

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/\/p(\d+)/i);
      const urlPage = match ? parseInt(match[1], 10) : 1;
      if (urlPage !== page) {
        navigateToPage(urlPage, false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [page]);

  /**
   * Client-side seamless navigation using fetch + history.pushState
   * Only fetches the 45 devices and loads only their 45 images!
   */
  const navigateToPage = async (targetPage: number, updateHistory = true) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page || isLoading) {
      return;
    }

    const targetUrl = getPageUrl(targetPage);
    if (updateHistory) {
      window.history.pushState({ page: targetPage }, '', targetUrl);
    }

    setIsLoading(true);

    try {
      const queryBrand = brand === 'all' ? '' : `&brand=${encodeURIComponent(brand)}`;
      const res = await fetch(`/api/devices?page=${targetPage}&limit=${limit}${queryBrand}`);
      if (!res.ok) throw new Error('Failed to load page');

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        startTransition(() => {
          setDevices(data.data);
          setPage(data.page || targetPage);
          setTotalPages(data.totalPages || totalPages);
          setTotalCount(data.total || totalCount);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push(targetUrl);
      }
    } catch (err) {
      console.error('Error navigating:', err);
      window.location.href = targetUrl;
    } finally {
      setIsLoading(false);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const isDeviceInComparison = (device: Device) => {
    return selectedDevices.some(sd => sd?.id === device.id);
  };

  const handleCompareToggle = (device: Device) => {
    const existingIndex = selectedDevices.findIndex(sd => sd?.id === device.id);
    if (existingIndex !== -1) {
      handleRemoveDevice(existingIndex);
      showToast(`Removed ${device.name} from comparison`);
      return;
    }

    const emptySlot = selectedDevices.findIndex(sd => sd === null);
    if (emptySlot !== -1) {
      handleSelectDevice(emptySlot, device);
      showToast(`Added ${device.name} to comparison`);
    } else {
      showToast('Comparison slots full (max 3 devices)');
    }
  };

  const displayName = brandName || (brand === 'all' ? 'All Catalog Devices' : brand.toUpperCase());

  return (
    <div className="w-full">
      {/* Top Banner & Pager Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white capitalize">
              {displayName}
            </h1>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#ad46ff] bg-[#7f22fe]/15 border border-[#7f22fe]/30 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(127,34,254,0.25)]">
              p{page} of {totalPages}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2">
            <span>Showing {devices.length} of {totalCount} devices</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{limit} devices per page</span>
            <span>•</span>
            <span className="text-zinc-500">Live Cloudinary CDN</span>
          </p>
        </div>

        {/* Carousel Prev/Next & Page Jumpers */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-2xl">
          {/* First */}
          <Link
            href={getPageUrl(1)}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(1);
            }}
            aria-disabled={page <= 1 || isLoading}
            className={`p-2 rounded-xl transition-all ${
              page <= 1 || isLoading
                ? 'opacity-30 cursor-not-allowed text-zinc-600'
                : 'hover:bg-white/10 text-white cursor-pointer'
            }`}
            title="First Page (p1)"
          >
            <ChevronsLeft className="size-4" />
          </Link>

          {/* Previous */}
          <Link
            href={getPageUrl(Math.max(1, page - 1))}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(page - 1);
            }}
            aria-disabled={page <= 1 || isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              page <= 1 || isLoading
                ? 'opacity-30 cursor-not-allowed text-zinc-600'
                : 'hover:bg-[#7f22fe]/20 hover:text-violet-300 text-white cursor-pointer border border-white/5'
            }`}
          >
            <ChevronLeft className="size-4" />
            <span>Prev</span>
          </Link>

          {/* Page Number Chips */}
          <div className="hidden sm:flex items-center gap-1 px-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-1 text-xs text-zinc-600 select-none">
                    ...
                  </span>
                );
              }
              const pNum = Number(p);
              const isActive = pNum === page;
              return (
                <Link
                  key={`p-${pNum}`}
                  href={getPageUrl(pNum)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage(pNum);
                  }}
                  className={`size-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7f22fe] to-[#9333ea] text-white shadow-[0_0_15px_rgba(127,34,254,0.6)] scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  p{pNum}
                </Link>
              );
            })}
          </div>

          {/* Next */}
          <Link
            href={getPageUrl(Math.min(totalPages, page + 1))}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(page + 1);
            }}
            aria-disabled={page >= totalPages || isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              page >= totalPages || isLoading
                ? 'opacity-30 cursor-not-allowed text-zinc-600'
                : 'hover:bg-[#7f22fe]/20 hover:text-violet-300 text-white cursor-pointer border border-white/5'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="size-4" />
          </Link>

          {/* Last */}
          <Link
            href={getPageUrl(totalPages)}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(totalPages);
            }}
            aria-disabled={page >= totalPages || isLoading}
            className={`p-2 rounded-xl transition-all ${
              page >= totalPages || isLoading
                ? 'opacity-30 cursor-not-allowed text-zinc-600'
                : 'hover:bg-white/10 text-white cursor-pointer'
            }`}
            title={`Last Page (p${totalPages})`}
          >
            <ChevronsRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-violet-400">
          <Loader2 className="size-10 animate-spin text-[#7f22fe]" />
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">
            Loading batch for p{page}...
          </p>
        </div>
      )}

      {/* Premium Device Cards Grid (Strictly 4 devices in a row on desktop/brand page) */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
          {devices.map((device, idx) => {
            const inCompare = isDeviceInComparison(device);

            return (
              <DeviceCard
                key={device.id || `${device.name}-${idx}`}
                device={device}
                inCompare={inCompare}
                onCompareClick={handleCompareToggle}
                priorityImage={idx < 4}
              />
            );
          })}
        </div>
      )}

      {/* Bottom Pager Bar */}
      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-500 font-semibold">
          Page p{page} of p{totalPages} ({totalCount} devices catalogued)
        </p>

        <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 p-1.5 rounded-2xl shadow-xl">
          <Link
            href={getPageUrl(Math.max(1, page - 1))}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(page - 1);
            }}
            aria-disabled={page <= 1 || isLoading}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              page <= 1 || isLoading
                ? 'opacity-30 cursor-not-allowed text-zinc-600'
                : 'hover:bg-[#7f22fe]/20 hover:text-violet-300 text-white cursor-pointer border border-white/5'
            }`}
          >
            <ChevronLeft className="size-4" />
            <span>Previous (p{Math.max(1, page - 1)})</span>
          </Link>

          <span className="text-xs font-black text-violet-400 px-3 py-1 bg-zinc-950 rounded-xl border border-white/5">
            p{page} / p{totalPages}
          </span>

          <Link
            href={getPageUrl(Math.min(totalPages, page + 1))}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(page + 1);
            }}
            aria-disabled={page >= totalPages || isLoading}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              page >= totalPages || isLoading
                ? 'opacity-30 cursor-not-allowed text-zinc-600'
                : 'hover:bg-[#7f22fe]/20 hover:text-violet-300 text-white cursor-pointer border border-white/5'
            }`}
          >
            <span>Next (p{Math.min(totalPages, page + 1)})</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
