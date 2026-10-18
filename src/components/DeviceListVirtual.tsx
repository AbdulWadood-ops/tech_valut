'use client';

/**
 * Part 1.3 — List Virtualization Component (React / Next.js)
 * 
 * Only renders the 10–20 rows currently visible on screen instead of 20,000 DOM nodes.
 * Critical for low-spec mobile device rendering and zero lag scrolling.
 */

import React, { CSSProperties } from 'react';
import * as ReactWindow from 'react-window';

const FixedSizeList = (ReactWindow as any).FixedSizeList || (ReactWindow as any).default?.FixedSizeList || (ReactWindow as any);
type ListChildComponentProps = {
  index: number;
  style: CSSProperties;
  data?: any;
  isScrolling?: boolean;
};

export interface VirtualDeviceItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  status?: string;
  searchCount?: number;
  requestCount?: number;
  basePrice?: number;
}

interface DeviceListVirtualProps {
  devices: VirtualDeviceItem[];
  height?: number;
  itemHeight?: number;
  onSelect?: (device: VirtualDeviceItem) => void;
}

export default function DeviceListVirtual({
  devices,
  height = 650,
  itemHeight = 64,
  onSelect,
}: DeviceListVirtualProps) {
  const Row = ({ index, style }: ListChildComponentProps) => {
    const device = devices[index];
    if (!device) return null;

    const isOnline = device.status === 'active';

    return (
      <div
        style={style}
        onClick={() => onSelect && onSelect(device)}
        className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-slate-950/40 hover:bg-slate-900/80 transition-colors cursor-pointer text-sm"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-500 w-8">
            #{(index + 1).toString().padStart(4, '0')}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-slate-100">{device.name}</span>
            <span className="text-xs text-slate-400">
              {device.brand} • {device.category || 'Device'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {device.searchCount !== undefined && (
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              🔍 {device.searchCount.toLocaleString()}
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {device.status || 'active'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-xl border border-slate-800 overflow-hidden bg-slate-950/80">
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span>Device ({devices.length.toLocaleString()} total in memory)</span>
        <span>Status</span>
      </div>
      <FixedSizeList
        height={height}
        itemCount={devices.length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
