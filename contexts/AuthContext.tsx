'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';

export type AuthUser = {
  id: string;
  tenantId?: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
};

type User = AuthUser | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  setUser: (u: User) => void;
  refetch: (options?: { silent?: boolean }) => Promise<void>;
  /** After cookie-based login: set client user without a second /me round-trip (smoother transition). */
  hydrateSession: (u: AuthUser) => void;
  /** Clear client session marker so the next protected route re-validates with the server. */
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMeJson(): Promise<{ success?: boolean; user?: AuthUser }> {
  const response = await fetch('/api/auth/me', {
    cache: 'no-store',
    credentials: 'include',
  });
  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const sessionCheckedRef = useRef(false);

  const hydrateSession = useCallback((u: AuthUser) => {
    setUser(u);
    setLoading(false);
    sessionCheckedRef.current = true;
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    sessionCheckedRef.current = false;
  }, []);

  const refetch = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
    try {
      const data = await fetchMeJson();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      sessionCheckedRef.current = true;
      if (!silent) setLoading(false);
    }
  }, []);

  const authFree = pathname === '/login' || pathname === '/reset-password';

  // Avoid a one-frame “global loading” flash on auth-only pages (login / reset).
  useLayoutEffect(() => {
    if (authFree) {
      setLoading(false);
    }
  }, [authFree]);

  useEffect(() => {
    let cancelled = false;

    if (authFree) {
      void (async () => {
        try {
          const data = await fetchMeJson();
          if (cancelled) return;
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } catch {
          if (!cancelled) setUser(null);
        } finally {
          if (!cancelled) sessionCheckedRef.current = true;
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    if (!sessionCheckedRef.current) {
      void refetch();
    }
    return undefined;
  }, [pathname, authFree, refetch]);

  const value: AuthContextValue = {
    user,
    loading,
    setUser,
    refetch,
    hydrateSession,
    clearSession,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
