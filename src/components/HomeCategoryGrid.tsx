import React from 'react';
import Link from 'next/link';
import { Smartphone, Tablet, Watch, Headphones, Laptop } from 'lucide-react';

const categories = [
  {
    name: 'Phones',
    id: 'mobiles',
    icon: Smartphone,
    count: '12,000+ Devices',
    desc: 'Flagships & Budgets',
  },
  {
    name: 'Tablets',
    id: 'tablets',
    icon: Tablet,
    count: '1,500+ Devices',
    desc: 'For Work & Art',
  },
  {
    name: 'Smartwatches',
    id: 'watches',
    icon: Watch,
    count: '800+ Devices',
    desc: 'Fitness & Smart Wearables',
  },
  {
    name: 'Audio',
    id: 'earbuds',
    icon: Headphones,
    count: '600+ Devices',
    desc: 'ANC Buds & Earbuds',
  },
  {
    name: 'Laptops',
    id: 'laptops',
    icon: Laptop,
    count: '0 Devices',
    desc: 'Workstations & Gaming',
  },
];

export default function HomeCategoryGrid() {
  return (
    <section className="py-12 px-8 bg-zinc-900/10 border-t border-white/5">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-neutral-50 mb-2">Browse by Category</h2>
          <p className="text-xs text-[#9f9fa9] max-w-sm mx-auto">
            Select a category to view detailed specification sheets and filter lists.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/devices?category=${cat.id}`}
                className="group backdrop-blur-md cursor-pointer rounded-2xl bg-zinc-900/20 border border-white/5 tv-hover-border-35 p-5 flex flex-col items-center text-center transition-all hover:-translate-y-1 tv-hover-bg-10"
              >
                <div className="size-11 rounded-full bg-zinc-950/60 border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="size-6 tv-text" />
                </div>
                <h3 className="font-bold text-neutral-50 text-sm mb-0.5">{cat.name}</h3>
                <span className="text-[10px] font-bold text-[#00bc7d] mb-0.5">{cat.count}</span>
                <p className="text-[10px] text-zinc-500 leading-tight">{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
