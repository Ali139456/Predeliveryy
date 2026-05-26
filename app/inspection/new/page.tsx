'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Toast from '@/components/Toast';
import PageContainer from '@/components/PageContainer';
import { ArrowLeft, ClipboardCheck, FileCheck, FileEdit, PlusCircle, Stamp, Wrench, X } from 'lucide-react';
import Link from 'next/link';
import type { InspectionType } from '@/lib/checklist-template';

const TYPE_OPTIONS: Array<{
  value: InspectionType;
  label: string;
  blurb: string;
  Icon: typeof ClipboardCheck;
  accent: string;
  badge: string;
}> = [
  {
    value: 'pdi',
    label: 'Pre-Delivery Inspection',
    blurb: 'New vehicle handover check for dealers, OEMs and fleets.',
    Icon: ClipboardCheck,
    accent: 'border-[#0033FF]',
    badge: 'PDI',
  },
  {
    value: 'blue_slip',
    label: 'Blue Slip (NSW AUVIS)',
    blurb: 'Identity + comprehensive safety inspection.',
    Icon: Stamp,
    accent: 'border-[#0033FF]',
    badge: 'AUVIS',
  },
  {
    value: 'pink_slip',
    label: 'Pink Slip (NSW eSafety)',
    blurb: 'Annual safety check for vehicles over 5 years.',
    Icon: Wrench,
    accent: 'border-[#FF6600]',
    badge: 'eSafety',
  },
];

const ALLOWED_TYPES: ReadonlySet<string> = new Set(['pdi', 'blue_slip', 'pink_slip']);

// Lazy load heavy components
const InspectionForm = dynamic(() => import('@/components/InspectionForm'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0033FF]"></div>
    </div>
  ),
  ssr: false,
});

interface DraftInspection {
  _id: string;
  inspectionNumber: string;
}

function NewInspectionPageInner() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [drafts, setDrafts] = useState<DraftInspection[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const selectedType: InspectionType | null =
    typeParam && ALLOWED_TYPES.has(typeParam) ? (typeParam as InspectionType) : null;

  // Fetch user's drafts when logged in (for "Continue draft" choice)
  useEffect(() => {
    if (!user?.email) {
      setDrafts([]);
      return;
    }
    let cancelled = false;
    setDraftsLoading(true);
    fetch('/api/inspections?status=draft', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success || !Array.isArray(data.data)) return;
        const userDrafts = data.data.filter(
          (d: any) => d.status === 'draft' && (d.inspectorEmail || '').toLowerCase() === (user.email || '').toLowerCase()
        );
        const sorted = userDrafts.sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
        );
        setDrafts(sorted);
      })
      .catch(() => { if (!cancelled) setDrafts([]); })
      .finally(() => { if (!cancelled) setDraftsLoading(false); });
    return () => { cancelled = true; };
  }, [user?.email]);

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
      const response = await fetch('/api/auth/me', { credentials: 'include' });
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
      <div className="app-surface min-h-screen min-w-0">
        <PageContainer className="pt-10 sm:pt-6 pb-6 sm:pb-8">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 mt-4 mb-5 sm:mb-8 bg-white/70 hover:bg-white text-black rounded-full border border-[#0033FF]/25 hover:border-[#0033FF]/40 shadow-sm hover:shadow-md transition-all duration-200 group backdrop-blur-md text-xs sm:text-sm"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0033FF] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold tracking-tight">Back to Home</span>
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
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="app-surface min-h-screen min-w-0">
      <PageContainer className="pt-10 sm:pt-6 pb-6 sm:pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 mt-4 mb-4 sm:mb-8 bg-white/70 hover:bg-white text-black rounded-full border border-[#0033FF]/25 hover:border-[#0033FF]/40 shadow-sm hover:shadow-md transition-all duration-200 group text-xs sm:text-sm backdrop-blur-md"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0033FF] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shrink-0">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold tracking-tight">Back to Home</span>
        </Link>

        {!draftsLoading && drafts.length > 0 && !draftBannerDismissed && (
          <div className="mb-6 p-4 sm:p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl max-w-7xl mx-auto relative">
            <button
              type="button"
              onClick={() => setDraftBannerDismissed(true)}
              className="absolute top-3 right-3 p-1 rounded-lg text-amber-700 hover:bg-amber-200/80 focus:ring-2 focus:ring-amber-400 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-sm font-semibold text-amber-900 mb-3 pr-8">You have a saved draft. Choose one:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/inspections/${drafts[0]._id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0033FF] text-white rounded-xl font-semibold hover:bg-[#0029CC] transition-all shadow-md"
              >
                <FileEdit className="w-4 h-4" />
                Continue draft {drafts[0].inspectionNumber ? `(${drafts[0].inspectionNumber})` : ''}
              </Link>
              <span className="self-center text-black/60 text-sm">or scroll down to start a new inspection</span>
            </div>
            {drafts.length > 1 && (
              <p className="text-xs text-amber-800/80 mt-2">
                You have {drafts.length} drafts. Opening the most recent above; others are in Inspection History.
              </p>
            )}
          </div>
        )}

        {!selectedType ? (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 max-w-5xl mx-auto animate-slide-up border-2 border-[#0033FF]/30 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-2 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#0033FF]" />
              Choose inspection type
            </h2>
            <p className="text-sm text-black/70 mb-6">
              Pick which inspection you&apos;re about to perform. The checklist and authorisation fields adjust automatically.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.Icon;
                return (
                  <Link
                    key={opt.value}
                    href={`/inspection/new?type=${opt.value}`}
                    className={`group block rounded-2xl bg-white p-5 border-2 hover:shadow-lg transition-all ${opt.accent}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0033FF] text-white">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {opt.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{opt.label}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{opt.blurb}</p>
                    <p className="mt-4 text-sm font-semibold text-[#0033FF] group-hover:underline">
                      Start →
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto animate-slide-up border-2 border-[#0033FF]/30 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#0033FF]" />
                New inspection
              </h2>
              <Link
                href="/inspection/new"
                className="text-xs font-semibold text-[#0033FF] hover:underline"
              >
                Change type
              </Link>
            </div>
            <InspectionForm inspectionType={selectedType} />
          </div>
        )}
      </PageContainer>
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

export default function NewInspectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0033FF]" />
        </div>
      }
    >
      <NewInspectionPageInner />
    </Suspense>
  );
}


