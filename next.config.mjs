/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Compress responses with gzip
  compress: true,
  poweredByHeader: false,
  // Include local JSON dataset files in Vercel serverless traces
  outputFileTracingIncludes: {
    '/**': ['./src/data/**/*'],
  },
  // Enable experimental features for performance
  experimental: {
    optimizeCss: false, // Avoid critters issues
    optimizePackageImports: ['lucide-react', 'radix-ui', '@radix-ui/react-slot', 'class-variance-authority'],
  },
  images: {
    // Use AVIF + WebP for 40-50% smaller images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 200, 256, 384],
    // Cache optimized images for 7 days on CDN
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Allow local image proxy with query strings (Next.js 16 forward-compat)
    localPatterns: [
      { pathname: '/api/image-proxy', search: '**' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.cloudinary.com', pathname: '/**' },
      { protocol: 'http', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'fdn2.gsmarena.com', pathname: '/**' },
      { protocol: 'https', hostname: 'fdn.gsmarena.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.gsmarena.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.rtings.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.notebookcheck.net', pathname: '/**' },
      { protocol: 'https', hostname: 'dlcdnwebimgs.asus.com', pathname: '/**' },
      { protocol: 'https', hostname: 'electronics.sony.com', pathname: '/**' },
      { protocol: 'https', hostname: 'files.gsmchoice.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.dell.com', pathname: '/**' },
      { protocol: 'https', hostname: 'mobilespecs.net', pathname: '/**' },
      { protocol: 'https', hostname: 'store.storeimages.cdn-apple.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.apple.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.techspecs.info', pathname: '/**' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // Add security + cache headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache images for 7 days
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
