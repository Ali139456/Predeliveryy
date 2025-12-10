'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, LayoutDashboard, Home, Menu, X } from 'lucide-react';

function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      // Not logged in - that's okay
    } finally {
      setLoading(false);
    }
  }, []);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Don't fetch auth on login page
    if (pathname === '/login') {
      setLoading(false);
      return;
    }
    
    checkAuth();
  }, [pathname, checkAuth]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null); // Clear user state immediately
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear any localStorage/sessionStorage if used
        sessionStorage.clear();
      }
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Clear user state even on error
      // Force redirect even if API call fails
      router.push('/login');
    }
  }, [router]);

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
            <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-purple-200 transition-colors flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/30 bg-slate-800/95 flex items-center justify-center mr-2 border border-purple-400/30">
                <span className="text-white font-bold text-xs sm:text-sm">HI</span>
              </div>
              <span className="hidden sm:inline">Pre delivery inspection</span>
              <span className="sm:hidden">Pre delivery</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center px-4 sm:px-6 py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all shadow-lg hover:shadow-xl font-semibold border border-purple-400/30"
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Login</span>
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/50 text-red-200';
      case 'manager':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/50 text-blue-200';
      default:
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-200';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 shadow-lg border-b border-purple-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-purple-200 transition-colors flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/30 bg-slate-800/95 flex items-center justify-center mr-2 border border-purple-400/30">
              <span className="text-white font-bold text-xs sm:text-sm">HI</span>
            </div>
            <span className="hidden sm:inline">PreDelivery</span>
            <span className="sm:hidden">PD</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Home Button */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md hover:shadow-lg border ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/50 shadow-purple-500/50'
                  : 'bg-slate-800/80 text-purple-200 hover:bg-slate-700/80 border-purple-500/30 hover:border-purple-400/50'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              <span>Home</span>
            </Link>

            {/* Dashboard Button */}
            {(user.role === 'admin' || user.role === 'manager') && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md hover:shadow-lg border ${
                  pathname === '/admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-400/50 shadow-indigo-500/50'
                    : 'bg-slate-800/80 text-indigo-200 hover:bg-slate-700/80 border-indigo-500/30 hover:border-indigo-400/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* User Info Section */}
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-purple-500/30">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-purple-400/20">
                <User className={`w-4 h-4 ${getRoleColor(user.role).includes('red') ? 'text-red-400' : getRoleColor(user.role).includes('blue') ? 'text-blue-400' : 'text-green-400'}`} />
                <div className="text-white">
                  <div className="text-sm font-bold text-white leading-tight">
                    {user.name || user.email}
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm bg-red-600/40 bg-slate-800/95 text-white rounded-lg hover:bg-red-500/50 transition-all shadow-md hover:shadow-lg border border-red-400/20 hover:scale-105"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 text-white hover:bg-purple-700/50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-purple-700/50 pt-4 space-y-3">
            {/* Home Button */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center w-full px-4 py-3 rounded-lg font-semibold transition-all shadow-md border ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/50'
                  : 'bg-slate-800/80 text-purple-200 border-purple-500/30'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Home</span>
            </Link>

            {/* Dashboard Button */}
            {(user.role === 'admin' || user.role === 'manager') && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center w-full px-4 py-3 rounded-lg font-semibold transition-all shadow-md border ${
                  pathname === '/admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-400/50'
                    : 'bg-slate-800/80 text-indigo-200 border-indigo-500/30'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* User Info Section */}
            <div className="px-4 py-3 bg-slate-800/60 rounded-lg border border-purple-400/20 space-y-3">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-3">
                <User className={`w-5 h-5 ${getRoleColor(user.role).includes('red') ? 'text-red-400' : getRoleColor(user.role).includes('blue') ? 'text-blue-400' : 'text-green-400'}`} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">
                    {user.name || user.email}
                  </div>
                  <div className={`mt-1 inline-block px-2 py-1 rounded border text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center w-full px-4 py-2 text-sm bg-red-600/40 bg-slate-800/95 text-white rounded-lg hover:bg-red-500/50 transition-all shadow-md border border-red-400/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(UserHeader);
