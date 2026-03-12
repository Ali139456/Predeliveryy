'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

type User = {
  id: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
} | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  setUser: (u: User) => void;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname === '/login') {
      setLoading(false);
      return;
    }
    refetch();
  }, [pathname, refetch]);

  const value: AuthContextValue = { user, loading, setUser, refetch };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
