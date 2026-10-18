import type { Metadata } from 'next';
import { getLatestDevices, getBrands } from '../lib/db';
import HomePageContent from '../components/HomePageContent';
import JsonLd from '../components/JsonLd';

const BASE_URL = 'https://techvault.com';

export const metadata: Metadata = {
  title: 'TechVault - The Ultimate Device Comparison Tool',
  description: 'Explore the latest smartphones, laptops, tablets and wearables. Compare performance, battery life, and Antutu scores side-by-side on TechVault.',
  keywords: ['phone specs', 'smartphone comparison', 'tech benchmarks', 'device comparison', 'antutu score', 'gsmarena alternative'],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'TechVault - The Ultimate Device Comparison Tool',
    description: 'Explore the latest smartphones, laptops, and tablets. Compare performance, battery life, and Antutu scores side-by-side.',
    type: 'website',
    url: BASE_URL,
    siteName: 'TechVault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechVault - The Ultimate Device Comparison Tool',
    description: 'Explore the latest smartphones, laptops, and tablets. Compare specs side-by-side.',
  },
};

// ISR: revalidate every 10 minutes
export const revalidate = 600;

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TechVault',
  url: BASE_URL,
  description: 'Compare official specifications, benchmarks, and prices for smartphones, tablets, laptops, and wearables.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/devices?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TechVault',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  sameAs: [],
};

export default async function HomePage() {
  const [latestDevices, allBrands] = await Promise.all([
    getLatestDevices(45),
    getBrands(),
  ]);

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <HomePageContent initialDevices={latestDevices} allBrands={allBrands} />
    </>
  );
}
