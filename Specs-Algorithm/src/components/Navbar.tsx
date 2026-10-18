'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Cpu, 
  Layers, 
  SearchCheck, 
  MapPin, 
  Zap, 
  Activity, 
  Server, 
  TrendingUp 
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview & Architecture', icon: Layers },
  { href: '/devices', label: 'Ranked SSR (SEO)', icon: TrendingUp },
  { href: '/virtual-list', label: '20k Virtual List', icon: Zap },
  { href: '/map', label: 'Map Clusters', icon: MapPin },
  { href: '/verify', label: 'Spec Verification', icon: SearchCheck },
  { href: '/benchmark', label: 'C++ Benchmark Lab', icon: Cpu },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Cpu className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                Specs<span className="text-cyan-400">Engine</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                C++ & Next.js
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              20k Device Virtualization • C++ Ranking • Spec Verifier
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Live Engine Status Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Redis & C++ Engines</span> Active
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 gap-2 border-t border-slate-800/50 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              <Icon className="h-3 w-3" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
