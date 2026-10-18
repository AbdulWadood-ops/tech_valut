import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getPaginatedDevices } from '../../../lib/db';
import BrandPageContent from '../../../components/BrandPageContent';
import JsonLd from '../../../components/JsonLd';

const BASE_URL = 'https://techvault.com';

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand).toUpperCase();

  return {
    title: `${decodedBrand} Devices, Specs & Prices | TechVault`,
    description: `Explore all ${decodedBrand} devices with full specs, AnTuTu benchmark scores, and prices. Compare ${decodedBrand} phones, tablets, and laptops side-by-side.`,
    alternates: {
      canonical: `${BASE_URL}/brand/${encodeURIComponent(brand.toLowerCase())}`,
    },
    openGraph: {
      title: `${decodedBrand} Devices, Specs & Prices | TechVault`,
      description: `Explore all ${decodedBrand} devices with full specs, AnTuTu benchmark scores, and prices.`,
      type: 'website',
      url: `${BASE_URL}/brand/${encodeURIComponent(brand.toLowerCase())}`,
      siteName: 'TechVault',
    },
  };
}

export const revalidate = 21600;

export default async function BrandPage({ params }: Props) {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand).toLowerCase().trim();

  const paged = await getPaginatedDevices({ brand: decodedBrand, page: 1, limit: 100 });
  const brandDevices = paged.devices;

  if (brandDevices.length === 0) {
    notFound();
  }

  const brandName = brandDevices[0]?.brand || decodedBrand.toUpperCase();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Devices', item: `${BASE_URL}/devices` },
      { '@type': 'ListItem', position: 3, name: brandName, item: `${BASE_URL}/brand/${encodeURIComponent(decodedBrand)}` },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brandName} Devices`,
    description: `All devices from ${brandName} with specs and benchmarks`,
    url: `${BASE_URL}/brand/${encodeURIComponent(decodedBrand)}`,
    numberOfItems: brandDevices.length,
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <BrandPageContent
        brandName={brandName}
        devices={brandDevices}
        allDevices={brandDevices.slice(0, 30)}
      />
    </>
  );
}
