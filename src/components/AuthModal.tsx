'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, authMessage, login, register, quickDemoLogin } = useAuth();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync tab with context when modal opens
  React.useEffect(() => {
    setActiveTab(authModalTab);
    setErrorMessage('');
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter both email and password.');
        return;
      }
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        showToast(`👋 Welcome back, ${res.user?.name}!`);
        closeAuthModal();
      } else {
        setErrorMessage(res.error || 'Failed to log in.');
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Please fill in all required fields.');
        return;
      }
      if (password.length < 4) {
        setErrorMessage('Password must be at least 4 characters long.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      setLoading(true);
      const res = await register(name, email, password);
      setLoading(false);
      if (res.success) {
        showToast(`🎉 Account created! Welcome, ${res.user?.name}!`);
        closeAuthModal();
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    }
  };

  const handleQuickDemo = (role: string) => {
    quickDemoLogin(role);
    showToast(`⚡ Signed in as Verified Community Reviewer!`);
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5 advance-enter-scale overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute -top-16 -right-16 size-48 bg-[#7f22fe]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-48 bg-[#00bc7d]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7f22fe]/15 border border-[#7f22fe]/30 text-[#ad46ff]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {activeTab === 'login' ? 'Sign In to TechVault' : 'Create an Account'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {activeTab === 'login' ? 'Sign in to comment & join device discussions' : 'Join thousands of verified gadget enthusiasts'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Helpful Banner explaining auth rule */}
        <div className="z-10 p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start gap-2.5 text-[11px] text-zinc-300">
          <Sparkles className="size-4 text-[#00bc7d] shrink-0 mt-0.5" />
          <span>
            {authMessage || 'Authentication is required only for commenting and posting community discussions.'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/80 rounded-xl border border-white/5 z-10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#7f22fe] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#7f22fe] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 z-10">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 z-10">
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Your Full Name / Nickname</label>
              <div className="relative">
                <UserIcon className="size-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Alex Tech"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="size-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="size-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-colors"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Confirm Password</label>
              <div className="relative">
                <Lock className="size-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#7f22fe]/25 transition-all active:scale-98 cursor-pointer mt-1 disabled:opacity-50"
          >
            <span>{loading ? 'Please wait...' : activeTab === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 z-10 my-0.5">
          <hr className="flex-1 border-white/5" />
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">or instant 1-click</span>
          <hr className="flex-1 border-white/5" />
        </div>

        {/* 1-Click Fast Demo Login for instant testing */}
        <button
          type="button"
          onClick={() => handleQuickDemo('Verified Tech Enthusiast')}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-neutral-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer z-10"
        >
          <Sparkles className="size-3.5 text-[#00bc7d]" />
          <span>Continue as Guest Reviewer (1-Click)</span>
        </button>
      </div>
    </div>
  );
}
