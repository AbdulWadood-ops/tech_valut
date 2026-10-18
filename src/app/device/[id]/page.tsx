import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getDeviceById, getPaginatedDevices, getLatestDevices, getDeviceReviews } from '../../../lib/db';
import DeviceSpecsPageContent from '../../../components/DeviceSpecsPageContent';
import JsonLd from '../../../components/JsonLd';

const BASE_URL = 'https://techvault.com';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const device = await getDeviceById(id);

  if (!device) {
    return { title: 'Device Not Found | TechVault' };
  }

  const title = `${device.name} Full Specs, Price & Benchmarks | TechVault`;
  const description =
    device.description ||
    `${device.brand} ${device.name} full specifications including display, camera, battery, chipset, and AnTuTu benchmark scores. Price: ${device.price}. Rating: ${device.rating}/5.`;

  return {
    title,
    description,
    keywords: [
      device.name,
      device.brand,
      `${device.brand} ${device.name} specs`,
      `${device.name} price`,
      `${device.name} benchmark`,
      `${device.name} review`,
    ],
    alternates: { canonical: `${BASE_URL}/device/${id}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/device/${id}`,
      siteName: 'TechVault',
      images: device.image ? [{ url: device.image, alt: device.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: device.image ? [device.image] : [],
    },
  };
}

export const revalidate = 21600;

export default async function DeviceSpecsPage({ params }: Props) {
  const { id } = await params;

  const device = await getDeviceById(id);
  if (!device) notFound();

  // Fetch device reviews (with pros/cons) and targeted sidebar devices in parallel
  const [deviceReviews, sameBrandResult, latestBatch] = await Promise.all([
    getDeviceReviews(id, device.brand),
    getPaginatedDevices({ brand: device.brand, page: 1, limit: 30 }),
    getLatestDevices(20),
  ]);

  const sidebarDevices = [
    ...sameBrandResult.devices.filter(d => d.id !== id).slice(0, 25),
    ...latestBatch.filter(d => d.id !== id && d.brand !== device.brand).slice(0, 15),
  ];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: device.name,
    brand: { '@type': 'Brand', name: device.brand },
    description: device.description || `${device.brand} ${device.name} specifications and benchmarks.`,
    image: device.image,
    url: `${BASE_URL}/device/${id}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: String(device.price).replace(/[^0-9.]/g, '') || '0',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'TechVault' },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: device.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: 128,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Devices', item: `${BASE_URL}/devices` },
      { '@type': 'ListItem', position: 3, name: device.brand, item: `${BASE_URL}/devices/${encodeURIComponent(device.brand.toLowerCase())}/page/1` },
      { '@type': 'ListItem', position: 4, name: device.name, item: `${BASE_URL}/device/${id}` },
    ],
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <DeviceSpecsPageContent
        device={device}
        initialDevices={sidebarDevices}
        deviceReviews={deviceReviews}
      />
    </>
  );
}
