import { MetadataRoute } from 'next';
import { getDevices, getBrands } from '../lib/db';

const BASE_URL = 'https://techvault.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allDevices, brands] = await Promise.all([getDevices(), getBrands()]);

  const categories = ['mobiles', 'laptops', 'watches', 'earbuds', 'tablets'];

  // ─── Static core pages ───────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/devices`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
  ];

  // ─── Category listing pages ───────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/devices?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ─── Individual device pages (the most important!) ───────────
  const devicePages: MetadataRoute.Sitemap = allDevices.map((device) => ({
    url: `${BASE_URL}/device/${device.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8, // High priority — these are the main content pages
  }));

  // ─── Brand pages ─────────────────────────────────────────────
  const uniqueBrands = [...new Set(allDevices.map((d) => d.brand.toLowerCase()))];
  const brandPages: MetadataRoute.Sitemap = uniqueBrands.map((brand) => ({
    url: `${BASE_URL}/brand/${encodeURIComponent(brand)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...devicePages,   // ✅ Now includes all /device/[id] URLs
    ...brandPages,
  ].slice(0, 50000); // Google's 50k URL limit per sitemap
}
