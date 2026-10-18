import React from 'react';
import { Smartphone, Tablet, Watch, Headphones, Laptop } from 'lucide-react';

export type CategoryType = 'mobiles' | 'tablets' | 'watches' | 'earbuds' | 'laptops';

export interface CategoryItem {
  id: CategoryType;
  label: string;
  singular: string;
  iconName: string;
  catKey: CategoryType;
  count: string;
  exactCount: number;
  color: string;
  borderHover: string;
  activeBg: string;
  badgeBg: string;
}

export const CATEGORIES_LIST: CategoryItem[] = [
  {
    id: 'mobiles',
    label: 'Phones',
    singular: 'Phone',
    iconName: 'Smartphone',
    catKey: 'mobiles',
    count: '14.6k+',
    exactCount: 14643,
    color: 'text-cyan-400',
    borderHover: 'hover:border-cyan-500/50',
    activeBg: 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  {
    id: 'tablets',
    label: 'Tablets',
    singular: 'Tablet',
    iconName: 'Tablet',
    catKey: 'tablets',
    count: '945+',
    exactCount: 945,
    color: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/50',
    activeBg: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'watches',
    label: 'Smartwatches',
    singular: 'Smartwatch',
    iconName: 'Watch',
    catKey: 'watches',
    count: '325+',
    exactCount: 325,
    color: 'text-amber-400',
    borderHover: 'hover:border-amber-500/50',
    activeBg: 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'earbuds',
    label: 'Earbuds',
    singular: 'Earbuds',
    iconName: 'Headphones',
    catKey: 'earbuds',
    count: '38+',
    exactCount: 38,
    color: 'text-pink-400',
    borderHover: 'hover:border-pink-500/50',
    activeBg: 'bg-gradient-to-r from-pink-500/15 to-rose-500/15 text-pink-300 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.25)]',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  {
    id: 'laptops',
    label: 'Laptops',
    singular: 'Laptop',
    iconName: 'Laptop',
    catKey: 'laptops',
    count: '52+',
    exactCount: 52,
    color: 'text-[#ad46ff]',
    borderHover: 'hover:border-[#7f22fe]/50',
    activeBg: 'bg-gradient-to-r from-[#7f22fe]/15 to-[#ad46ff]/15 text-[#ad46ff] border-[#7f22fe]/40 shadow-[0_0_15px_rgba(127,34,254,0.25)]',
    badgeBg: 'bg-[#7f22fe]/10 text-[#ad46ff] border-[#7f22fe]/20',
  },
];

export function getCategoryDetails(catId?: string): CategoryItem {
  const found = CATEGORIES_LIST.find((c) => c.id === catId);
  return found || CATEGORIES_LIST[0];
}
