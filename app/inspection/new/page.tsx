'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Toast from '@/components/Toast';
import { ArrowLeft, FileCheck } from 'lucide-react';
import Link from 'next/link';

// Lazy load heavy components
const InspectionForm = dynamic(() => import('@/components/InspectionForm'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0033FF]"></div>
    </div>
  ),
  ssr: false,
});

export default function NewInspectionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Check auth when page becomes visible (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };
    
    // Check auth on browser back/forward navigation
    const handlePopState = () => {
      checkAuth();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    
    // Periodic auth check (every 2 minutes - reduced frequency)
    const authInterval = setInterval(() => {
      checkAuth();
    }, 120000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(authInterval);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        // User is not logged in
        if (user) {
          // User was logged in before, show toast
          setToast({
            message: 'Your session has expired. Please login again to continue',
            type: 'error'
          });
        } else {
          // First time check - show message but don't force redirect
          setToast({
            message: 'Please login first to start an inspection',
            type: 'error'
          });
        }
        setUser(null);
        // Don't auto-redirect - let user go back if they want
      }
    } catch (error) {
      setToast({
        message: 'Please login first to start an inspection',
        type: 'error'
      });
      setUser(null);
      // Don't auto-redirect - let user go back if they want
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0033FF] mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 overflow-x-hidden">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 mb-8 bg-[#0033FF]/10 hover:bg-[#0033FF]/20 text-black rounded-xl border-2 border-[#0033FF]/30 hover:border-[#0033FF]/50 shadow-lg transition-all duration-300 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold">Back to Home</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto animate-slide-up border-2 border-[#0033FF]/30">
            <div className="text-center py-8 sm:py-12">
              <div className="w-20 h-20 rounded-full bg-[#0033FF]/10 flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-10 h-10 text-[#0033FF]" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">Login Required</h2>
              <p className="text-black/70 mb-8 text-lg">
                You need to be logged in to start a new inspection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#0033FF] text-white rounded-xl font-semibold hover:bg-[#0029CC] transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Go to Login
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#FF6600] text-white rounded-xl font-semibold hover:bg-[#E65C00] transition-all duration-300 hover:scale-105 border-2 border-[#FF6600]/50"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 overflow-x-hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 mb-6 sm:mb-8 bg-[#0033FF]/10 hover:bg-[#0033FF]/20 text-black rounded-xl border-2 border-[#0033FF]/30 hover:border-[#0033FF]/50 shadow-lg transition-all duration-300 group text-sm sm:text-base"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto animate-slide-up border-2 border-[#0033FF]/30">
          <InspectionForm />
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}


