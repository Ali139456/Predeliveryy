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
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8 overflow-x-hidden">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 mb-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group backdrop-blur-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold">Back to Home</span>
          </Link>

          <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-2xl p-8 md:p-12 max-w-7xl mx-auto animate-slide-up border-2 border-red-500/30">
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-red-300 mb-4">Login Required</h2>
              <p className="text-purple-200 mb-8 text-lg">
                You need to be logged in to start a new inspection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/50"
                >
                  Go to Login
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-700/80 text-purple-300 rounded-xl font-semibold hover:bg-slate-600/80 transition-all duration-300 hover:scale-105 border-2 border-purple-500/50"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 mb-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group backdrop-blur-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-2xl p-8 md:p-12 max-w-7xl mx-auto animate-slide-up border-2 border-purple-500/30">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg shadow-purple-500/50">
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-2">New Pre delivery inspection</h1>
              <p className="text-purple-200">Complete the form below to create a new inspection report</p>
            </div>
          </div>
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


