'use client';
/* eslint-disable */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ThemePreset {
  id: string;
  label: string;
  color: string; // hex
  gradient: string; // tailwind gradient for the swatch
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'violet',  label: 'Deep Violet',   color: '#7f22fe', gradient: 'from-violet-600 to-purple-700' },
  { id: 'teal',    label: 'Cyber Teal',    color: '#00bc7d', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'blue',    label: 'Ocean Blue',    color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
  { id: 'rose',    label: 'Rose Gold',     color: '#f43f5e', gradient: 'from-rose-500 to-pink-600' },
  { id: 'amber',   label: 'Amber Flame',   color: '#f59e0b', gradient: 'from-amber-400 to-orange-500' },
  { id: 'indigo',  label: 'Midnight Indigo', color: '#6366f1', gradient: 'from-indigo-500 to-indigo-700' },
  { id: 'cyan',    label: 'Arctic Cyan',   color: '#06b6d4', gradient: 'from-cyan-400 to-sky-600' },
  { id: 'lime',    label: 'Neon Lime',     color: '#84cc16', gradient: 'from-lime-400 to-green-500' },
];

const STORAGE_KEY_COLOR = 'techvault_accentColor';
const STORAGE_KEY_MODE = 'techvault_themeMode';
const DEFAULT_COLOR = '#7f22fe';
const DEFAULT_MODE: ThemeMode = 'dark';

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  presets: ThemePreset[];
  activePreset: ThemePreset | undefined;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_COLOR);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_MODE);

  const applyColor = (color: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--tv-accent', color);
    }
  };

  const applyMode = (mode: ThemeMode) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (mode === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    }
  };

  // Load from localStorage on mount and apply to document
  useEffect(() => {
    try {
      const savedColor = localStorage.getItem(STORAGE_KEY_COLOR) || DEFAULT_COLOR;
      const savedMode = (localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode) || DEFAULT_MODE;
      setAccentColorState(savedColor);
      setThemeModeState(savedMode);
      applyColor(savedColor);
      applyMode(savedMode);
    } catch {}
  }, []);

  const setAccentColor = (color: string) => {
    applyColor(color);
    setAccentColorState(color);
    try {
      localStorage.setItem(STORAGE_KEY_COLOR, color);
    } catch {}
  };

  const setThemeMode = (mode: ThemeMode) => {
    applyMode(mode);
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch {}
  };

  const toggleThemeMode = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const activePreset = THEME_PRESETS.find(p => p.color === accentColor);
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        accentColor,
        setAccentColor,
        presets: THEME_PRESETS,
        activePreset,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

