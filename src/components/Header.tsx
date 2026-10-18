'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  Hexagon,
  Search,
  Home,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Laptop,
  BarChart3,
  MessageSquare,
  Menu,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ThemePicker from './ThemePicker';
import { CATEGORIES_LIST } from '../data/categories';

// In-memory query cache for instant search (0ms)
const headerSearchCache = new Map<string, any[]>();

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleCategoryChange, showToast } = useApp();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeCategory = searchParams.get('category') || 'mobiles';
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  // Instant cached search + debounced fetch
  useEffect(() => {
    const q = globalSearch.trim().toLowerCase();
    if (q.length <= 1) {
      setSearchResults([]);
      return;
    }

    if (headerSearchCache.has(q)) {
      setSearchResults(headerSearchCache.get(q)!);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/devices?search=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          const list = data.data?.slice(0, 6) || [];
          headerSearchCache.set(q, list);
          setSearchResults(list);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Search fetch error:', err);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [globalSearch]);

  const getNavItemClass = (itemHref: string, categoryParam?: string) => {
    const [basePath] = itemHref.split('?');
    const isHome = itemHref === '/';

    let isActive = false;
    if (isHome) {
      isActive = pathname === '/';
    } else if (categoryParam) {
      isActive = pathname === basePath && activeCategory === categoryParam;
    } else {
      isActive = pathname === basePath || (basePath !== '/' && pathname.startsWith(basePath));
    }

    return `cursor-pointer transition-all duration-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-gradient-to-r from-[#7f22fe]/25 to-[#ad46ff]/25 text-white border border-[#7f22fe]/50 shadow-[0_0_12px_rgba(127,34,254,0.35)]'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
    }`;
  };

  const getMobileNavItemClass = (itemHref: string, categoryParam?: string) => {
    const [basePath] = itemHref.split('?');
    const isHome = itemHref === '/';

    let isActive = false;
    if (isHome) {
      isActive = pathname === '/';
    } else if (categoryParam) {
      isActive = pathname === basePath && activeCategory === categoryParam;
    } else {
      isActive = pathname === basePath || (basePath !== '/' && pathname.startsWith(basePath));
    }

    return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-[#7f22fe]/25 to-[#ad46ff]/25 text-white border border-[#7f22fe]/50 shadow-sm'
        : 'text-neutral-300 hover:text-white hover:bg-zinc-900 border border-transparent'
    }`;
  };

  const navLinks = [
    { label: 'Home', href: '/', icon: Home, cat: undefined },
    { label: 'Phones', href: '/devices?category=mobiles', icon: Smartphone, cat: 'mobiles' },
    { label: 'Tablets', href: '/devices?category=tablets', icon: Tablet, cat: 'tablets' },
    { label: 'Watches', href: '/devices?category=watches', icon: Watch, cat: 'watches' },
    { label: 'Earbuds', href: '/devices?category=earbuds', icon: Headphones, cat: 'earbuds' },
    { label: 'Laptops', href: '/devices?category=laptops', icon: Laptop, cat: 'laptops' },
    { label: 'Brands', href: '/all-brands', icon: BarChart3, cat: undefined },
    { label: 'Compare', href: '/compare', icon: Layers, cat: undefined },
    { label: 'Forum', href: '/forum', icon: MessageSquare, cat: undefined },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] bg-zinc-950/95 border-b border-white/10 flex px-3 sm:px-6 h-16 items-center justify-between gap-2 sm:gap-4 select-none">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile Drawer Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer border border-white/5 shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="size-5 text-[#ad46ff]" /> : <Menu className="size-5" />}
          </button>

          {/* TechVault Logo with Home Link */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer shrink-0 group">
            <div className="p-1.5 rounded-xl bg-zinc-900/90 border border-[#7f22fe]/30 group-hover:border-[#7f22fe] transition-colors shadow-[0_0_12px_rgba(127,34,254,0.25)]">
              <Hexagon className="size-5 text-[#7f22fe] group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(127,34,254,0.8)]" />
            </div>
            <span className="bg-gradient-to-r from-[#00bc7d] via-[#7f22fe] to-[#ad46ff] bg-clip-text text-transparent font-black text-lg tracking-tight tv-logo-glow">
              TechVault
            </span>
          </Link>
        </div>

        {/* Center: Full Desktop & Laptop Navigation with Horizontal Scroll support */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto scrollbar-none px-2 py-1 max-w-2xl xl:max-w-3xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (item.cat) handleCategoryChange(item.cat as any);
                }}
                className={getNavItemClass(item.href, item.cat)}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side controls: Search bar, ThemePicker, Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global search */}
          <div className="relative rounded-full bg-zinc-900 border border-white/10 px-2.5 sm:px-3 py-1.5 flex items-center gap-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] focus-within:border-[#7f22fe]/60 focus-within:shadow-[0_0_12px_rgba(127,34,254,0.3)] transition-all duration-300">
            <Search className="size-3.5 text-[#7f22fe] drop-shadow-[0_0_4px_rgba(127,34,254,0.6)] shrink-0" />
            <input
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="bg-transparent outline-none text-neutral-100 text-xs w-20 xs:w-28 sm:w-36 md:w-44 focus:w-32 xs:focus:w-40 sm:focus:w-52 transition-all duration-300"
            />
            {globalSearch && (
              <div className="absolute right-0 top-11 w-72 bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-72 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        handleCategoryChange(d.category);
                        setGlobalSearch('');
                        router.push(`/device/${d.id}`);
                        showToast(`Viewing ${d.name}`);
                      }}
                      className="px-4 py-2.5 hover:bg-zinc-900 cursor-pointer flex items-center gap-3 text-xs text-left text-neutral-200 border-b border-white/5 transition-colors"
                    >
                      <img
                        src={d.image?.includes('gsmarena.com') ? `/api/image-proxy?url=${encodeURIComponent(d.image)}` : d.image}
                        alt={d.name}
                        className="size-9 object-contain rounded-lg bg-zinc-900 p-1 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
                        }}
                      />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-bold text-white truncate">{d.name}</span>
                        <span className="text-[10px] text-[#00bc7d] uppercase tracking-wider font-semibold">
                          {d.brand} • {d.category === 'mobiles' ? 'Phone' : d.category}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  globalSearch.length > 1 && (
                    <div className="px-4 py-4 text-xs text-neutral-400 text-center">No devices found for "{globalSearch}"</div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Theme Picker */}
          <ThemePicker />

          {/* User Auth Pill */}
          {isAuthenticated && user ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 pl-1 pr-2 sm:pr-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-[#7f22fe]/50 transition-all cursor-pointer shadow-sm"
                title={`Logged in as ${user.name}`}
              >
                <div className={`size-6 rounded-full ${user.avatarBg || 'bg-[#7f22fe]'} text-white font-black text-[10px] flex items-center justify-center shrink-0`}>
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-neutral-200 hidden md:inline max-w-[85px] truncate">
                  {user.name}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-10 w-52 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-white/5 flex flex-col">
                    <span className="text-xs font-bold text-white truncate">{user.name}</span>
                    <span className="text-[10px] text-[#00bc7d] flex items-center gap-1 font-semibold">
                      <ShieldCheck className="size-3" />
                      {user.role || 'Verified Member'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      showToast('Signed out successfully');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login', 'Sign in or register to comment and participate in discussions')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] hover:opacity-95 text-xs font-bold text-white shadow-[0_0_12px_rgba(127,34,254,0.3)] transition-all cursor-pointer shrink-0"
            >
              <LogIn className="size-3.5" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}
        </div>

        {/* ── Responsive Mobile Navigation Drawer ── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-black/80 backdrop-blur-md flex flex-col">
            <div className="bg-zinc-950 border-b border-white/10 p-5 flex flex-col gap-4 shadow-2xl max-h-[calc(100vh-64px)] overflow-y-auto">
              {/* User status in mobile drawer */}
              {isAuthenticated && user ? (
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-full ${user.avatarBg || 'bg-[#7f22fe]'} text-white font-black text-xs flex items-center justify-center`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{user.name}</span>
                      <span className="text-[10px] text-[#00bc7d] flex items-center gap-1 font-semibold">
                        <ShieldCheck className="size-3" />
                        {user.role || 'Member'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                      showToast('Signed out successfully');
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="size-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7f22fe]/15 to-[#00bc7d]/15 border border-[#7f22fe]/30 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-white">Join TechVault</span>
                    <span className="text-[10px] text-zinc-400">Unlock MongoDB comments & reviews</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('login', 'Sign in or register to join discussions and comment');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7f22fe] to-[#ad46ff] text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <LogIn className="size-3" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}

              {/* Mobile Navigation List */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 px-2 mb-1">
                  Ecosystems & Navigation
                </span>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        if (item.cat) handleCategoryChange(item.cat as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={getMobileNavItemClass(item.href, item.cat)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300">
                          <Icon className="size-4 text-[#7f22fe]" />
                        </div>
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      <ChevronRight className="size-4 text-zinc-600" />
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* Backdrop click dismisses */}
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}
      </header>

      {/* ── Sleek Mobile Category Bar (Visible on mobile/tablet screens for 1-tap switching) ── */}
      <div className="lg:hidden bg-zinc-950/90 border-b border-white/5 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none z-30 sticky top-16 backdrop-blur-md">
        <Link
          href="/"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
            pathname === '/'
              ? 'bg-[#7f22fe] text-white shadow-sm'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <Home className="size-3.5" />
          <span>Home</span>
        </Link>
        {CATEGORIES_LIST.map((cat) => {
          const isActive = pathname === '/devices' && activeCategory === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/devices?category=${cat.id}`}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                isActive
                  ? `${cat.activeBg} font-extrabold shadow-sm`
                  : 'bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-zinc-400">
                {cat.count}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
