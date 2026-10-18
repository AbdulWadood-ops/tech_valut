'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function SwitchDemo() {
  const { toggleThemeMode, isDark } = useTheme();
  return (
    <button
      onClick={toggleThemeMode}
      type="button"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300 hover:text-white"
    >
      {isDark ? <Moon className="size-3.5 text-violet-400" /> : <Sun className="size-3.5 text-amber-400" />}
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export default function ThemePicker() {
  const { toggleThemeMode, isDark } = useTheme();

  return (
    <button
      onClick={toggleThemeMode}
      type="button"
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 dark:bg-zinc-900/90 border border-white/10 dark:border-white/10 hover:border-[#7f22fe]/50 hover:shadow-[0_0_15px_rgba(127,34,254,0.25)] transition-all duration-300 group cursor-pointer select-none"
    >
      <div className="relative size-4 flex items-center justify-center">
        {/* Sun Icon for Light Mode */}
        <Sun
          className={`size-3.5 text-amber-400 absolute transition-all duration-300 ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
          }`}
        />
        {/* Moon Icon for Dark Mode */}
        <Moon
          className={`size-3.5 text-violet-400 absolute transition-all duration-300 ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 drop-shadow-[0_0_8px_rgba(127,34,254,0.8)]'
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />
      </div>

      <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300 dark:text-zinc-300 hidden sm:inline-block transition-colors group-hover:text-white">
        {isDark ? 'Dark' : 'Light'}
      </span>

      {/* Indicator Glow Dot */}
      <span
        className={`size-1.5 rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-violet-400 shadow-[0_0_6px_rgba(127,34,254,0.8)]'
            : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
        }`}
      />
    </button>
  );
}

