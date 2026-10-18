'use client';

import React, { Suspense } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import AuthModal from './AuthModal';
import Header from './Header';

import AdSidebar from './AdSidebar';
import LeftAdSidebar from './LeftAdSidebar';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { toastMessage } = useApp();

  return (
    <div className="tv-ambient-bg bg-zinc-950 text-neutral-50 min-h-screen flex flex-col font-sans antialiased overflow-x-hidden relative">
      {/* Sticky Header */}
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {/* Global Auth Modal for forum & device commenting */}
      <AuthModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-[#00bc7d] text-neutral-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className="size-2 rounded-full bg-[#00bc7d] animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
