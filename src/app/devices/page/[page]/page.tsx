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
    page: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page, 10) || 1;

  const title = `All Devices Catalog - Page ${pageNum} | TechVault`;
  const description = `Browse official specifications, benchmarks, and prices for all smartphones, tablets, and wearables on page ${pageNum}.`;
  const canonicalUrl = `${BASE_URL}/devices/page/${pageNum}`;

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

export const revalidate = 3600;

export default async function GlobalPaginatedDevicesPage({ params }: Props) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const result = await getPaginatedDevices({
    brand: 'all',
    page: pageNum,
    limit: 45,
  });

  if (result.devices.length === 0 && pageNum > 1) {
    notFound();
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Devices', item: `${BASE_URL}/devices` },
      { '@type': 'ListItem', position: 3, name: `Page ${pageNum}`, item: `${BASE_URL}/devices/page/${pageNum}` },
    ],
  };

  return (
    <div className="flex flex-1 w-full bg-zinc-950 text-neutral-50 min-h-[calc(100vh-64px)] selection:bg-[#7f22fe] selection:text-white">
      <JsonLd data={breadcrumbSchema} />

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
          brand="all"
          brandName="All Devices Catalog"
          baseRoute="/devices"
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
