import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import AppLayout from '../components/AppLayout';
import './globals.css';

// ─── Self-hosted variable fonts via next/font — eliminates extra font requests ─────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const BASE_URL = 'https://techvault.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | TechVault',
    default: 'TechVault - Ultimate Tech Specs & Benchmarks Comparison',
  },
  description:
    'Compare official specifications, Antutu scores, GPU percentages, and battery life metrics for smartphones, tablets, smartwatches, earbuds, and laptops side-by-side.',
  keywords: [
    'tech specs',
    'smartphone comparison',
    'laptop benchmarks',
    'gadget specs',
    'mobile phone comparison',
    'antutu score',
    'phone benchmark',
    'gsmarena alternative',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TechVault',
    title: 'TechVault - Ultimate Tech Specs & Benchmarks Comparison',
    description:
      'Compare official specifications, Antutu scores, GPU percentages, and battery life metrics side-by-side.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechVault - Ultimate Tech Specs & Benchmarks Comparison',
    description:
      'Compare official specifications, Antutu scores, GPU percentages, and battery life metrics side-by-side.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification token here
    // google: 'your-verification-token',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Inline critical theme script — runs before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('techvault_themeMode')||'dark';if(m==='dark'){document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');}var c=localStorage.getItem('techvault_accentColor')||'#7f22fe';document.documentElement.style.setProperty('--tv-accent',c);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-zinc-950 text-neutral-50 antialiased transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
