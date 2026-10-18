'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Tablet, Watch, Headphones, Laptop, Sparkles } from 'lucide-react';
import { CATEGORIES_LIST, CategoryType } from '../data/categories';
import { useApp } from '../context/AppContext';

interface BrowseCategorySectionProps {
  currentCategory?: string;
  onCategorySelect?: (catId: CategoryType) => void;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export default function BrowseCategorySection({
  currentCategory,
  onCategorySelect,
  orientation = 'vertical',
  className = '',
}: BrowseCategorySectionProps) {
  const router = useRouter();
  const { activeCategory: contextCategory, handleCategoryChange } = useApp();

  const active = currentCategory || contextCategory || 'mobiles';

  const getIcon = (id: CategoryType) => {
    switch (id) {
      case 'mobiles':
        return <Smartphone className="size-4 text-cyan-400 shrink-0" />;
      case 'tablets':
        return <Tablet className="size-4 text-emerald-400 shrink-0" />;
      case 'watches':
        return <Watch className="size-4 text-amber-400 shrink-0" />;
      case 'earbuds':
        return <Headphones className="size-4 text-pink-400 shrink-0" />;
      case 'laptops':
      default:
        return <Laptop className="size-4 text-[#ad46ff] shrink-0" />;
    }
  };

  const handleSelect = (catId: CategoryType) => {
    handleCategoryChange(catId);
    if (onCategorySelect) {
      onCategorySelect(catId);
    } else {
      router.push(`/devices?category=${catId}`);
    }
  };

  if (orientation === 'horizontal') {
    return (
      <div className={`flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 ${className}`}>
        {CATEGORIES_LIST.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                isActive
                  ? `${cat.activeBg} font-black scale-102 shadow-sm`
                  : `text-zinc-400 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white border-white/5 ${cat.borderHover}`
              }`}
            >
              {getIcon(cat.id)}
              <span>{cat.label}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-950 text-zinc-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-[#ad46ff]" />
          Browse By Category
        </h3>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          5 Ecosystems
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {CATEGORIES_LIST.map((cat) => {
          const isActive = active === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-left cursor-pointer border ${
                isActive
                  ? `${cat.activeBg} font-extrabold scale-[1.02] shadow-sm`
                  : `text-zinc-400 bg-zinc-900/50 hover:bg-zinc-800/80 hover:text-white border-white/5 ${cat.borderHover}`
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getIcon(cat.id)}
                <span className="truncate">{cat.label}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-950 text-zinc-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
