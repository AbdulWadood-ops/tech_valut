import React from 'react';
import { Layers, BarChart3, Tag } from 'lucide-react';

export default function HomeFeatures() {
  return (
    <section className="relative py-16 px-8 max-w-6xl mx-auto w-full mt-8">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#7f22fe]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative text-center mb-12 z-10">
        <h2 className="text-3xl font-black text-neutral-50 mb-3 tracking-tight">Designed for Tech Enthusiasts</h2>
        <p className="text-[#9f9fa9] text-sm max-w-lg mx-auto leading-relaxed">
          Unbiased spec comparisons and real-time benchmarking metrics to help you select the best hardware without the noise.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        <div className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-8 hover:bg-zinc-900/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 group">
          <div className="w-12 h-12 rounded-2xl bg-[#7f22fe]/15 border border-[#7f22fe]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(127,34,254,0.3)]">
            <Layers className="size-6 text-[#ad46ff]" />
          </div>
          <h3 className="text-lg font-black text-neutral-50 mb-3">Side-by-Side Specs</h3>
          <p className="text-xs text-[#9f9fa9] leading-relaxed font-medium">
            Full GSM Arena-style spec grids covering network bands, dimensions, sensors, and resistance ratings in meticulous detail.
          </p>
        </div>
        <div className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-8 hover:bg-zinc-900/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 group">
          <div className="w-12 h-12 rounded-2xl bg-[#00bc7d]/15 border border-[#00bc7d]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,188,125,0.3)]">
            <BarChart3 className="size-6 text-[#00bc7d]" />
          </div>
          <h3 className="text-lg font-black text-neutral-50 mb-3">Live Benchmarks</h3>
          <p className="text-xs text-[#9f9fa9] leading-relaxed font-medium">
            Compare actual performance metrics like AnTuTu scores, CPU throttling, and real-world battery life tests instantly.
          </p>
        </div>
        <div className="backdrop-blur-xl rounded-3xl bg-zinc-900/40 border border-white/10 p-8 hover:bg-zinc-900/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 group">
          <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Tag className="size-6 text-[#3b82f6]" />
          </div>
          <h3 className="text-lg font-black text-neutral-50 mb-3">Unbiased Pricing</h3>
          <p className="text-xs text-[#9f9fa9] leading-relaxed font-medium">
            We pull the official launch prices and standard retail brackets so you can accurately measure price-to-performance.
          </p>
        </div>
      </div>
    </section>
  );
}
