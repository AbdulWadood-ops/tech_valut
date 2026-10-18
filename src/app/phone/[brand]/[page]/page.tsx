import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPaginatedDevices } from '../../../../lib/db';
import DeviceCarouselPagination from '../../../../components/DeviceCarouselPagination';
import Footer from '../../../../components/Footer';
import AdSidebar from '../../../../components/AdSidebar';
import LeftAdSidebar from '../../../../components/LeftAdSidebar';
import JsonLd from '../../../../components/JsonLd';

const BASE_URL = 'https://techvault.com';

interface Props {
  params: Promise<{
    brand: string;
    page: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, page } = await params;
  const pageNum = parseInt(page.replace(/^p/i, ''), 10) || 1;
  const isAll = brand.toLowerCase() === 'all';
  const decodedBrand = isAll ? 'All Devices' : decodeURIComponent(brand).toUpperCase();

  const title = `${decodedBrand} Catalog - p${pageNum} | TechVault`;
  const description = `Explore official specifications, benchmarks, and real Cloudinary image renders for ${decodedBrand} on page ${pageNum}. 45 devices per page.`;
  const canonicalUrl = `${BASE_URL}/phone/${encodeURIComponent(brand.toLowerCase())}/p${pageNum}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'TechVault',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PhoneBrandPaginatedPage({ params }: Props) {
  const { brand, page } = await params;
  const cleanBrand = decodeURIComponent(brand).toLowerCase().trim();

  // /phone route is strictly for brand names like /phone/samsung/p1
  if (cleanBrand === 'all') {
    notFound();
  }

  const pageNum = parseInt(page.replace(/^p/i, ''), 10);

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  // Exactly 45 devices per page for this brand
  const result = await getPaginatedDevices({
    brand: cleanBrand,
    page: pageNum,
    limit: 45,
  });

  if (result.devices.length === 0 && pageNum > 1) {
    notFound();
  }

  const brandDisplayName = cleanBrand === 'all' ? 'All Catalog Devices' : (result.brandName || cleanBrand.toUpperCase());

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Devices', item: `${BASE_URL}/devices` },
      { '@type': 'ListItem', position: 3, name: brandDisplayName, item: `${BASE_URL}/phone/${encodeURIComponent(cleanBrand)}/p1` },
      { '@type': 'ListItem', position: 4, name: `p${pageNum}`, item: `${BASE_URL}/phone/${encodeURIComponent(cleanBrand)}/p${pageNum}` },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brandDisplayName} - p${pageNum}`,
    description: `Official specifications for ${brandDisplayName} on TechVault - p${pageNum}`,
    url: `${BASE_URL}/phone/${encodeURIComponent(cleanBrand)}/p${pageNum}`,
    numberOfItems: result.devices.length,
  };

  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)] selection:bg-[#7f22fe] selection:text-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />

      {/* Left Sidebar containing Brand Explorer */}
      <LeftAdSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 px-4 md:px-8 py-6">
        <DeviceCarouselPagination
          initialDevices={result.devices}
          total={result.total}
          currentPage={result.page}
          totalPages={result.totalPages}
          limit={45}
          brand={cleanBrand}
          brandName={brandDisplayName}
          baseRoute={`/phone/${encodeURIComponent(cleanBrand)}`}
        />

        <div className="mt-16">
          <Footer />
        </div>
      </main>

      {/* Right Advertising & Trending Sidebar */}
      <AdSidebar />
    </div>
  );
}
