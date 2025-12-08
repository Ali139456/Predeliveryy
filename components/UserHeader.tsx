'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, LayoutDashboard, Home } from 'lucide-react';

export default function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Don't fetch auth on login page
    if (pathname === '/login') {
      setLoading(false);
      return;
    }
    
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      // Not logged in - that's okay
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      router.push('/login');
    }
  };

  // Don't show header on login page - AFTER all hooks
  if (pathname === '/login') {
    return null;
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 shadow-lg border-b border-purple-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white hover:text-purple-200 transition-colors flex items-center">
              <div className="w-8 h-8 rounded-lg bg-purple-500/30 bg-slate-800/95 flex items-center justify-center mr-2 border border-purple-400/30">
                <span className="text-white font-bold text-sm">HI</span>
              </div>
              Hazard Inspect
            </Link>
            <Link
              href="/login"
              className="flex items-center px-6 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all shadow-lg hover:shadow-xl font-semibold border border-purple-400/30"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-orange-500';
      case 'manager':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 shadow-lg border-b border-purple-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white hover:text-purple-200 transition-colors flex items-center">
            <div className="w-8 h-8 rounded-lg bg-purple-500/30 bg-slate-800/95 flex items-center justify-center mr-2 border border-purple-400/30">
              <span className="text-white font-bold text-sm">HI</span>
            </div>
            Hazard Inspect
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center px-4 py-2 text-sm bg-purple-600/40 bg-slate-800/95 text-white rounded-lg hover:bg-purple-500/50 transition-all shadow-md hover:shadow-lg border border-purple-400/20"
            >
              <Home className="w-4 h-4 mr-2" />
              <span>Home</span>
            </Link>
            {(user.role === 'admin' || user.role === 'manager') && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-2 text-sm bg-indigo-600/40 bg-slate-800/95 text-white rounded-lg hover:bg-indigo-500/50 transition-all shadow-md hover:shadow-lg border border-indigo-400/20"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-700/40 bg-slate-800/95 rounded-lg border border-purple-400/20">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-md border border-white/20`}>
                <span className="text-white text-xs font-bold">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white">
                <div className="text-sm font-semibold">{user.name || user.email}</div>
                <div className="text-xs opacity-90 capitalize text-purple-200">{user.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm bg-red-600/40 bg-slate-800/95 text-white rounded-lg hover:bg-red-500/50 transition-all shadow-md hover:shadow-lg border border-red-400/20"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
