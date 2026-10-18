'use client';

import React, { useState } from 'react';
import { Database, Cpu, Layers, Server, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function ArchitectureDiagram() {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      id: 0,
      title: '1. Primary DB (MongoDB)',
      tag: 'Raw Data Source',
      desc: 'Holds 15,000–20,000 device documents, raw usage metrics, and historical logs. Heavy queries here would saturate DB I/O.',
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      icon: Database,
      badge: '15,000 Devices',
    },
    {
      id: 1,
      title: '2. C++ Engines',
      tag: 'Heavy Computation Outside Request Path',
      desc: 'Calculates exponential decay, normalized relevance scores, and Levenshtein spec verification in < 15ms without blocking web requests.',
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      icon: Cpu,
      badge: 'C++14 / Native Binary',
    },
    {
      id: 2,
      title: '3. Redis Pre-computed Store',
      tag: 'Fast Reads (Cache-Aside + Sorted Sets)',
      desc: 'Stores pre-ranked devices in Sorted Sets (ZADD) and caches paginated chunks (30s TTL). Next.js reads in < 2ms.',
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      icon: Layers,
      badge: 'ZREVRANGE & Cache',
    },
    {
      id: 3,
      title: '4. Next.js Server Components',
      tag: 'SSR + Full SEO + Virtual DOM',
      desc: 'Renders pre-ranked HTML instantaneously for search engine crawlers, while client components virtualize 20k rows with react-window.',
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      icon: Server,
      badge: 'SSR / react-window',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            System Architecture Flow
          </h3>
          <p className="text-xs text-slate-400">
            Core design principle: Heavy computation happens outside the request path.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-800/40">
          <span>Zero Request-Path Blocking</span>
        </div>
      </div>

      {/* Interactive Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStage === stage.id;
          return (
            <div
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 relative ${
                isSelected
                  ? `${stage.color} ring-2 ring-blue-500/30 scale-[1.02] shadow-lg`
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-slate-800'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/50">
                  {stage.badge}
                </span>
              </div>

              <h4 className="font-semibold text-sm text-slate-100 mb-1">{stage.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">{stage.tag}</p>

              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel for selected stage */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{stages[activeStage].title} — Detail</span>
        </div>
        <p className="text-slate-300 leading-relaxed">{stages[activeStage].desc}</p>
      </div>
    </div>
  );
}
