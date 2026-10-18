import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Specs-Algorithm | C++ Engines + Next.js Platform',
  description: 'High performance device rendering, C++ ranking engine with Redis SSR SEO, and C++ Spec verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-500/30 selection:text-cyan-200">
        {/* Background gradient decorative glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl opacity-70" />
          <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-cyan-600/10 blur-3xl rounded-full" />
          <div className="absolute bottom-10 -right-40 w-[500px] h-[500px] bg-indigo-600/10 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          
          <footer className="border-t border-slate-800/60 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Specs-Algorithm Engine</span>
                <span>•</span>
                <span>C++14 Native Binaries + Node.js/Next.js Architecture</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Redis Sorted Sets (ZADD/ZREVRANGE)</span>
                <span>•</span>
                <span>react-window Virtualization</span>
                <span>•</span>
                <span>Supercluster</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
