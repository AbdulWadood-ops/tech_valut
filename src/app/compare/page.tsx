import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLatestDevices, getDeviceById } from '../../lib/db';
import ComparePageContent from '../../components/ComparePageContent';

export const metadata: Metadata = {
  title: 'Compare Devices | TechVault',
  description: 'Compare smartphones, laptops, and more side-by-side. See which device wins in battery life, processing power, and display specs.',
  alternates: {
    canonical: 'https://techvault.com/compare',
  },
};

// ISR: revalidate every 30 minutes
export const revalidate = 1800;

interface Props {
  searchParams?: Promise<{ prefill?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const prefill = params?.prefill;

  // Fetch top 500 devices across categories for instant comparison & search
  const devices = await getLatestDevices(500);

  // If a specific device is prefilled and not in top 500, fetch and include it
  if (prefill && !devices.some(d => d.id === prefill)) {
    const prefilledDevice = await getDeviceById(prefill);
    if (prefilledDevice) {
      devices.unshift(prefilledDevice);
    }
  }
  
  // Create a lightweight version of devices to avoid Next.js payload bloat
  const lightweightDevices = devices.map(d => ({
    id: d.id,
    name: d.name,
    brand: d.brand,
    category: d.category,
    image: d.image,
    price: d.price,
    rating: d.rating,
    buyUrl: d.buyUrl,
    buyLinks: d.buyLinks,
    specs: d.specs ? {
      technology: d.specs.technology,
      bands5g: d.specs.bands5g,
      dimensions: d.specs.dimensions,
      weight: d.specs.weight,
      build: d.specs.build,
      sim: d.specs.sim,
      resistance: d.specs.resistance,
      displayTypeSize: d.specs.displayTypeSize,
      protection: d.specs.protection,
      peakBrightness: d.specs.peakBrightness,
      pixelDensity: d.specs.pixelDensity,
      chipset: d.specs.chipset,
      gpu: d.specs.gpu,
      os: d.specs.os,
      ram: d.specs.ram,
      storageVariants: d.specs.storageVariants,
      cardSlot: d.specs.cardSlot,
      mainCamera: d.specs.mainCamera,
      selfieCamera: d.specs.selfieCamera,
      video: d.specs.video,
      capacity: d.specs.capacity,
      wiredCharging: d.specs.wiredCharging,
      wirelessCharging: d.specs.wirelessCharging,
      wifi: d.specs.wifi,
      bluetooth: d.specs.bluetooth,
      nfcUsb: d.specs.nfcUsb,
      sensors: d.specs.sensors,
      colors: d.specs.colors,
      releaseDate: d.specs.releaseDate,
    } : {},
    performance: d.performance
  }));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComparePageContent initialDevices={lightweightDevices as any} />
    </Suspense>
  );
}
