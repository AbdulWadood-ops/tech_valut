'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';

export default function HomeNewsletter() {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast('🔔 Newsletter subscription successfully registered!');
    setEmail('');
  };

  return (
    <section className="py-14 px-8 bg-gradient-to-b from-zinc-950 via-zinc-900/5 to-zinc-950 border-t border-white/5 text-center">
      <div className="max-w-xl mx-auto flex flex-col items-center gap-5 relative">
        <div className="absolute w-[200px] h-[200px] tv-bg-5 rounded-full blur-[80px] -top-12 pointer-events-none" />
        <h2 className="text-xl font-bold text-neutral-50">Never Miss a Spec Release</h2>
        <p className="text-xs text-[#9f9fa9] max-w-sm leading-relaxed">
          Subscribe to get weekly tech news, benchmarking scores, and new product specification sheets sent directly to your inbox.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm mt-1 relative z-10">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2.5 rounded-full bg-zinc-900 border border-white/10 text-neutral-100 placeholder-[#9f9fa9] text-xs outline-none tv-hover-border-45 transition-all"
            required
          />
          <Button
            type="submit"
            className="rounded-full tv-bg font-bold px-5 py-2.5 cursor-pointer text-white text-xs"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
