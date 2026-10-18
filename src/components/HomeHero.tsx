import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function HomeHero() {
  return (
    <section className="relative py-12 px-8 flex flex-col items-center text-center overflow-hidden border-b border-white/5">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#7f22fe]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="relative max-w-2xl flex flex-col items-center gap-4.5 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-semibold text-[#00bc7d]">
          <Zap className="size-3.5 fill-[#00bc7d] text-[#00bc7d] stroke-none" />
          <span>Real-Time Specifications & Benchmarks</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Compare Tech with{' '}
          <span className="bg-gradient-to-r from-[#00bc7d] via-[#7f22fe] to-[#ad46ff] bg-clip-text text-transparent">
            True Specs
          </span>
        </h1>
        <p className="text-[#9f9fa9] text-xs md:text-sm max-w-lg">
          Discover official specifications and dynamic benchmark scores for phones, smartwatches, earbuds, and tablets side-by-side.
        </p>
        <div className="flex gap-3">
          <Link
            href="/compare"
            className="rounded-full bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] font-bold px-6 py-2.5 text-xs text-white cursor-pointer shadow-[0_0_15px_rgba(127,34,254,0.25)] hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Compare Now
          </Link>
          <Link
            href="/devices?category=mobiles"
            className="rounded-full border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-neutral-200 font-bold px-6 py-2.5 text-xs transition-colors flex items-center justify-center"
          >
            Browse All
          </Link>
        </div>
      </div>
    </section>
  );
}
