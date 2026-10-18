'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarBg: string;
  role: string;
  joinedAt?: string;
}

export interface UserPermissions {
  canPostTopic: boolean;
  canComment: boolean;
  canModerate: boolean;
  canPinTopic: boolean;
  canDeleteComments: boolean;
  canVerifyBenchmark: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authMessage: string;
  openAuthModal: (tab?: 'login' | 'register', customMessage?: string, onSuccess?: (user: User) => void) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  quickDemoLogin: (role?: string) => void;
  refreshAccessToken: () => Promise<string | null>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'techvault_auth_user';
const STORAGE_KEY_ACCESS = 'techvault_access_token';
const STORAGE_KEY_REFRESH = 'techvault_refresh_token';

const AVATAR_BG_COLORS = [
  'bg-emerald-500',
  'bg-purple-600',
  'bg-cyan-500',
  'bg-blue-600',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function derivePermissions(role: string = 'Verified Reviewer'): UserPermissions {
  const r = role.toLowerCase();
  const isAdmin = r.includes('admin');
  const canModerate = isAdmin || r.includes('mod') || r.includes('guru') || r.includes('team');
  const canVerifyBenchmark = canModerate || r.includes('reviewer') || r.includes('tester');

  return {
    canPostTopic: true,
    canComment: true,
    canModerate,
    canPinTopic: canModerate,
    canDeleteComments: canModerate,
    canVerifyBenchmark,
    isAdmin,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authMessage, setAuthMessage] = useState('Sign in to comment or join discussions');
  const [pendingCallback, setPendingCallback] = useState<((user: User) => void) | null>(null);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      const savedAccess = localStorage.getItem(STORAGE_KEY_ACCESS);
      const savedRefresh = localStorage.getItem(STORAGE_KEY_REFRESH);

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.name) {
          setUser(parsed);
          setPermissions(derivePermissions(parsed.role));
        }
      }
      if (savedAccess) setAccessToken(savedAccess);
      if (savedRefresh) setRefreshToken(savedRefresh);
    } catch {}
  }, []);

  const saveAuthSession = (
    userData: User,
    newAccessToken?: string | null,
    newRefreshToken?: string | null
  ) => {
    setUser(userData);
    setPermissions(derivePermissions(userData.role));

    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        localStorage.setItem(STORAGE_KEY_ACCESS, newAccessToken);
      }
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
        localStorage.setItem(STORAGE_KEY_REFRESH, newRefreshToken);
      }
    } catch {}

    if (pendingCallback) {
      pendingCallback(userData);
      setPendingCallback(null);
    }
    setIsAuthModalOpen(false);
  };

  // Automated token refresh helper
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const currentRefresh = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_REFRESH) : null);
    if (!currentRefresh) return null;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefresh }),
      });

      const data = await res.json();
      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        try {
          localStorage.setItem(STORAGE_KEY_ACCESS, data.accessToken);
          if (data.refreshToken) {
            setRefreshToken(data.refreshToken);
            localStorage.setItem(STORAGE_KEY_REFRESH, data.refreshToken);
          }
        } catch {}
        return data.accessToken;
      }
    } catch (err) {
      console.warn('[Silent Token Refresh Failed]:', err);
    }
    return null;
  }, [refreshToken]);

  // Periodic proactive token refresh (every 12 minutes to keep access token fresh)
  useEffect(() => {
    if (user && refreshToken) {
      refreshTimerRef.current = setInterval(() => {
        refreshAccessToken();
      }, 12 * 60 * 1000);
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [user, refreshToken, refreshAccessToken]);

  // Authenticated fetch wrapper with automated token renewal on 401
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ACCESS) : null);

      const headers = new Headers(options.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      let res = await fetch(url, { ...options, headers });

      // If unauthorized and we have a refresh token, attempt silent renewal and retry once
      if (res.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          headers.set('Authorization', `Bearer ${refreshedToken}`);
          res = await fetch(url, { ...options, headers });
        }
      }

      return res;
    },
    [accessToken, refreshAccessToken]
  );

  const openAuthModal = useCallback((
    tab: 'login' | 'register' = 'login',
    customMessage = 'Sign in or register to comment and participate in discussions',
    onSuccess?: (user: User) => void
  ) => {
    setAuthModalTab(tab);
    setAuthMessage(customMessage);
    if (onSuccess) {
      setPendingCallback(() => onSuccess);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        saveAuthSession(data.user, data.accessToken, data.refreshToken);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err: any) {
      // Offline fallback
      if (email.trim() && pass.trim().length >= 4) {
        const fallbackUser: User = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email,
          avatarBg: AVATAR_BG_COLORS[Math.floor(Math.random() * AVATAR_BG_COLORS.length)],
          role: 'Verified Reviewer',
          joinedAt: new Date().toLocaleDateString(),
        };
        saveAuthSession(fallbackUser, 'mock_access_token_demo', 'mock_refresh_token_demo');
        return { success: true, user: fallbackUser };
      }
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        saveAuthSession(data.user, data.accessToken, data.refreshToken);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Failed to create account' };
    } catch (err: any) {
      if (name.trim() && email.trim() && pass.trim().length >= 4) {
        const fallbackUser: User = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email,
          avatarBg: AVATAR_BG_COLORS[Math.floor(Math.random() * AVATAR_BG_COLORS.length)],
          role: 'Verified Reviewer',
          joinedAt: new Date().toLocaleDateString(),
        };
        saveAuthSession(fallbackUser, 'mock_access_token_demo', 'mock_refresh_token_demo');
        return { success: true, user: fallbackUser };
      }
      return { success: false, error: 'Network error during registration' };
    }
  };

  const quickDemoLogin = (role = 'Verified Tech Enthusiast') => {
    const demoNames = ['Alex Morgan', 'David Kim', 'Elena Rostova', 'Marcus Vance', 'Sarah Jenkins'];
    const chosenName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const demoUser: User = {
      id: `usr-demo-${Date.now().toString(36)}`,
      name: chosenName,
      email: `${chosenName.toLowerCase().replace(/\s+/g, '.')}@techvault.io`,
      avatarBg: AVATAR_BG_COLORS[Math.floor(Math.random() * AVATAR_BG_COLORS.length)],
      role,
      joinedAt: 'Active Reviewer',
    };
    saveAuthSession(demoUser, 'demo_jwt_access_token_mock', 'demo_jwt_refresh_token_mock');
  };

  const logout = async () => {
    const currentRefresh = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_REFRESH) : null);
    if (currentRefresh) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefresh }),
        });
      } catch {}
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setPermissions(null);

    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_ACCESS);
      localStorage.removeItem(STORAGE_KEY_REFRESH);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        permissions,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        authMessage,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshAccessToken,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
