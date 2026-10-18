import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getPaginatedDevices, getBrands } from '../../lib/db';
import DevicesPageContent from '../../components/DevicesPageContent';

export const metadata: Metadata = {
  title: 'All Devices | TechVault',
  description: 'Browse our complete database of smartphones, tablets, laptops, and wearables. Filter by brand, price, and rating.',
  alternates: {
    canonical: 'https://techvault.com/devices',
  },
};

export const dynamic = 'force-dynamic';

interface DevicesPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function DevicesPage({ searchParams }: DevicesPageProps) {
  const params = await searchParams;
  const category = params?.category || 'mobiles';
  const page = Math.max(1, parseInt(params?.page || '1', 10));
  const brand = params?.brand;
  const search = params?.search;

  const [paginated, allBrands] = await Promise.all([
    getPaginatedDevices({
      category: category === 'all' ? undefined : category,
      brand,
      page,
      limit: 48,
      search,
    }),
    getBrands(),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading devices...</div>}>
      <DevicesPageContent
        initialDevices={paginated.devices}
        totalDevices={paginated.total}
        serverPage={paginated.page}
        serverTotalPages={paginated.totalPages}
        allBrands={allBrands}
      />
    </Suspense>
  );
}
