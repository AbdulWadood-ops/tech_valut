import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCategoryLabel(cat?: string): string {
  if (!cat) return 'Phone';
  const c = cat.toLowerCase().trim();
  if (c === 'mobiles' || c === 'mobile' || c === 'phone' || c === 'phones' || c === 'smartphone' || c === 'smartphones') return 'Phone';
  if (c === 'tablets' || c === 'tablet' || c === 'pad') return 'Tablet';
  if (c === 'watches' || c === 'watch' || c === 'smartwatch' || c === 'wearable') return 'Smartwatch';
  if (c === 'earbuds' || c === 'audio' || c === 'headphones') return 'Earbuds';
  if (c === 'laptops' || c === 'laptop' || c === 'notebook') return 'Laptop';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

