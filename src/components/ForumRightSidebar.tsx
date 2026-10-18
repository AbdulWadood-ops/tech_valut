'use client';

import React, { useState } from 'react';
import {
  Flame,
  Trophy,
  Vote,
  CheckCircle2,
  HelpCircle,
  Users,
  Tag,
  TrendingUp,
  Cpu,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

const INITIAL_POLL_OPTIONS: PollOption[] = [
  { id: '1', label: '6,000mAh+ Silicon-Carbon Batteries', votes: 412 },
  { id: '2', label: 'On-Device Generative AI Tools', votes: 215 },
  { id: '3', label: '200MP Periscope Optical Zoom', votes: 154 },
  { id: '4', label: 'Ultra-flat Matte Ceramic Displays', votes: 89 },
];

const BENCHMARK_LEADERBOARD = [
  { rank: 1, device: 'Asus ROG Phone 9 Pro', soc: 'SD 8 Elite', score: '3,142,800', type: 'AnTuTu v10' },
  { rank: 2, device: 'Vivo X200 Pro Satellite', soc: 'Dimensity 9400', score: '2,980,500', type: 'AnTuTu v10' },
  { rank: 3, device: 'iPhone 16 Pro Max', soc: 'Apple A18 Pro', score: '8,490', type: 'Geekbench 6 Multi' },
  { rank: 4, device: 'Galaxy S25 Ultra', soc: 'SD 8 Elite OC', score: '2,890,200', type: 'AnTuTu v10' },
];

const SOLVED_TROUBLESHOOTS = [
  { id: 't1', title: 'Fixed: Google Play Services battery drain on Android 15', solvedBy: 'Alex_Kernel', upvotes: 94 },
  { id: 't2', title: 'Resolved: 4K 60fps stutter during HDR10+ recording', solvedBy: 'Sarah M.', upvotes: 68 },
  { id: 't3', title: 'How to bypass 80W charging thermal throttle limit', solvedBy: 'HardwareGuru', upvotes: 52 },
];

const TOP_CONTRIBUTORS = [
  { name: 'David Tech', role: 'Hardware Tester', score: '14.2k Karma', avatarBg: 'bg-[#7f22fe]' },
  { name: 'Sarah M.', role: 'Mobile Enthusiast', score: '11.8k Karma', avatarBg: 'bg-cyan-500' },
  { name: 'Alex_Kernel', role: 'Kernel Dev', score: '9.4k Karma', avatarBg: 'bg-emerald-500' },
];

const POPULAR_TAGS = [
  'Snapdragon 8 Elite',
  'Camera Shootout',
  'Battery SOT',
  'AnTuTu v10',
  'HyperOS 2.0',
  'One UI 7',
  'Pixel 9 RAW',
  'Thermal Throttling'
];

export default function ForumRightSidebar() {
  const { showToast } = useApp();
  const [pollOptions, setPollOptions] = useState<PollOption[]>(INITIAL_POLL_OPTIONS);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const totalVotes = pollOptions.reduce((acc, curr) => acc + curr.votes, 0);

  const handleVote = (id: string) => {
    if (hasVoted) {
      showToast('You have already voted in this week’s community poll!');
      return;
    }
    setPollOptions(prev =>
      prev.map(opt => (opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt))
    );
    setHasVoted(true);
    setSelectedOptionId(id);
    showToast('🎉 Your vote has been recorded!');
  };

  return (
    <aside className="w-80 xl:w-88 border-l border-white/5 bg-zinc-950/40 backdrop-blur-md p-4.5 flex flex-col gap-6 shrink-0 hidden lg:flex h-full self-stretch overflow-y-auto">
      
      {/* ── 1. Weekly Community Poll ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-white/10 shadow-lg relative overflow-hidden flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#7f22fe]/20 text-[#ad46ff] border border-[#7f22fe]/30">
              <Vote className="size-4" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Community Poll
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#00bc7d] border border-emerald-500/20 font-bold">
            Live
          </span>
        </div>

        <p className="text-xs font-bold text-zinc-200 leading-snug">
          Which 2026 smartphone hardware innovation are you most excited for?
        </p>

        <div className="flex flex-col gap-2 mt-1">
          {pollOptions.map(option => {
            const percentage = Math.round((option.votes / (totalVotes || 1)) * 100);
            const isSelected = selectedOptionId === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className={`relative w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer overflow-hidden group ${
                  isSelected
                    ? 'border-[#7f22fe] bg-[#7f22fe]/15'
                    : 'border-white/5 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-white/20'
                }`}
              >
                {/* Progress bar background */}
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-[#7f22fe]/25 transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between text-xs gap-2">
                  <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-white font-bold' : 'text-zinc-300'}`}>
                    {option.label}
                  </span>
                  {hasVoted && (
                    <span className="text-[11px] font-mono font-bold text-[#ad46ff] shrink-0">
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/5">
          <span>{totalVotes.toLocaleString()} votes cast</span>
          <span>Closes in 3 days</span>
        </div>
      </div>

      {/* ── 2. Verified Benchmark Leaderboard ── */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Trophy className="size-4" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Benchmark Records
            </span>
          </div>
          <span className="text-[9px] text-zinc-400 uppercase font-mono">Q3 Verified</span>
        </div>

        <div className="flex flex-col gap-2">
          {BENCHMARK_LEADERBOARD.map(item => (
            <div
              key={item.device}
              className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`size-5 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 ${
                  item.rank === 1 ? 'bg-amber-400 text-black' :
                  item.rank === 2 ? 'bg-zinc-300 text-black' :
                  item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {item.rank}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-extrabold text-white truncate">{item.device}</span>
                  <span className="text-[9px] text-zinc-400">{item.soc}</span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-[11px] font-black text-[#00bc7d] font-mono">{item.score}</span>
                <span className="text-[8px] text-zinc-500 uppercase">{item.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Solved Community Troubleshooting ── */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-[#00bc7d] border border-emerald-500/30">
              <CheckCircle2 className="size-4" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Solved Solutions
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase">This Week</span>
        </div>

        <div className="flex flex-col gap-2">
          {SOLVED_TROUBLESHOOTS.map(t => (
            <div
              key={t.id}
              className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 hover:border-[#00bc7d]/40 transition-colors flex flex-col gap-1.5 cursor-pointer group"
              onClick={() => showToast(`Opened solution: ${t.title}`)}
            >
              <span className="text-[11px] font-bold text-zinc-200 group-hover:text-white leading-snug">
                {t.title}
              </span>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>By <strong className="text-zinc-400">{t.solvedBy}</strong></span>
                <span className="text-[#00bc7d] font-bold">+{t.upvotes} helped</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Top Tech Contributors ── */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Users className="size-4" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-wider">
            Top Tech Gurus
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {TOP_CONTRIBUTORS.map(user => (
            <div key={user.name} className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/50 border border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`size-7 rounded-full ${user.avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{user.name}</span>
                  <span className="text-[9px] text-zinc-400">{user.role}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#ad46ff] bg-[#7f22fe]/10 px-2 py-0.5 rounded-full border border-[#7f22fe]/20">
                {user.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Popular Tags Cloud ── */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Tag className="size-3.5 text-zinc-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">
            Popular Tags
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map(tag => (
            <span
              key={tag}
              onClick={() => showToast(`Filtered forum topics by #${tag}`)}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-[#7f22fe]/20 hover:text-white border border-white/5 hover:border-[#7f22fe]/40 text-zinc-400 transition-all cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

    </aside>
  );
}
