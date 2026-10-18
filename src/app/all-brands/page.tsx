import React, { Suspense } from 'react';
import { getBrandStats } from '@/lib/db';
import AllBrandsPageContent from '@/components/AllBrandsPageContent';

export const metadata = {
  title: 'All Brands | TechVault',
  description: 'Explore all the tech brands available for comparison on TechVault.',
};

export const revalidate = 21600; // 6 hours

export default async function AllBrandsPage() {
  const brandStats = await getBrandStats();
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-zinc-950 items-center justify-center text-white">Loading brands...</div>}>
      <AllBrandsPageContent initialBrandStats={brandStats} />
    </Suspense>
  );
}
