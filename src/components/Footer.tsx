'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Hexagon,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gradient-to-b from-zinc-950 via-zinc-950 to-black border-t border-white/10 pt-14 pb-8 px-6 md:px-12 mt-auto w-full text-neutral-300 select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-[#7f22fe]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-[#00bc7d]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
        {/* Top Grid: Brand info, Nav columns, and Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (Span 2 cols on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer group w-fit">
              <div className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 group-hover:border-[#7f22fe]/50 transition-colors shadow-lg">
                <Hexagon className="size-5 text-[#7f22fe] group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="bg-gradient-to-r from-[#00bc7d] via-[#7f22fe] to-[#ad46ff] bg-clip-text text-transparent font-black text-xl tracking-tight">
                TechVault
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              The definitive tech specification matrix and real-time benchmark comparison platform for smartphones, laptops, wearables, and audio flagships.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/5 text-[10px] font-bold text-zinc-300">
                <span className="size-1.5 rounded-full bg-[#00bc7d] animate-ping" />
                <span>Live Spec Engine</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/5 text-[10px] font-bold text-zinc-300">
                <Zap className="size-3 text-amber-400" />
                <span>Verified Benchmarks</span>
              </div>
            </div>
          </div>

          {/* Column 1: Hardware Specs */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase font-black text-white tracking-widest flex items-center gap-1.5">
              <Smartphone className="size-3 text-[#7f22fe]" />
              Device Specs
            </span>
            <ul className="flex flex-col gap-2 text-xs text-zinc-400">
              <li>
                <Link href="/devices?category=mobiles" className="hover:text-white transition-colors">
                  Flagship Phones
                </Link>
              </li>
              <li>
                <Link href="/devices?category=tablets" className="hover:text-white transition-colors">
                  Work Tablets
                </Link>
              </li>
              <li>
                <Link href="/devices?category=watches" className="hover:text-white transition-colors">
                  Smartwatches & Bands
                </Link>
              </li>
              <li>
                <Link href="/devices?category=earbuds" className="hover:text-white transition-colors">
                  ANC Earbuds
                </Link>
              </li>
              <li>
                <Link href="/devices?category=laptops" className="hover:text-white transition-colors">
                  Performance Laptops
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Tools & Community */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase font-black text-white tracking-widest flex items-center gap-1.5">
              <Sparkles className="size-3 text-[#00bc7d]" />
              Explore
            </span>
            <ul className="flex flex-col gap-2 text-xs text-zinc-400">
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Compare Matrix
                </Link>
              </li>
              <li>
                <Link href="/all-brands" className="hover:text-white transition-colors">
                  All Brands Directory
                </Link>
              </li>
              <li>
                <Link href="/devices?category=mobiles" className="hover:text-white transition-colors">
                  Smartphone Database
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-white transition-colors">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link href="/add-device" className="hover:text-white transition-colors">
                  Submit Device Specs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter Box */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase font-black text-white tracking-widest">
              Tech Updates
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Get notified when flagship benchmark scores and official spec sheets are published.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-[#00bc7d]/10 border border-[#00bc7d]/30 text-[#00bc7d] text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="size-4" />
                <span>Subscribed! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#7f22fe] hover:bg-[#7f22fe]/90 text-white transition-all cursor-pointer"
                  >
                    <ArrowRight className="size-3" />
                  </button>
                </div>
                <span className="text-[9px] text-zinc-500">No spam. Unsubscribe anytime.</span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & System Status */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Globe className="size-3.5 text-zinc-600" />
            <span>© {new Date().getFullYear()} TechVault Media. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href="/all-brands" className="hover:text-white transition-colors">
              Brands
            </Link>
            <Link href="/compare" className="hover:text-white transition-colors">
              Matrix
            </Link>
            <Link href="/forum" className="hover:text-white transition-colors">
              Discussions
            </Link>
            <Link href="/devices" className="hover:text-white transition-colors">
              Catalog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
