'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Toast from '@/components/Toast';
import PageContainer from '@/components/PageContainer';
import { ArrowLeft, ClipboardCheck, FileCheck, FileEdit, PlusCircle, Receipt, Stamp } from 'lucide-react';
import Link from 'next/link';
import { resolveInspectionType, type InspectionType } from '@/lib/checklist-template';

const TYPE_OPTIONS: Array<{
  value: InspectionType;
  label: string;
  blurb: string;
  Icon: typeof ClipboardCheck;
  /** Card border colour class. */
  accent: string;
  /** Solid background colour class for icon tile + primary CTA. */
  iconBg: string;
  /** Hover variant of `iconBg` for the primary CTA. */
  iconBgHover: string;
  /** Text colour for the inline "Start new" outlined CTA. */
  textColor: string;
  /** Border colour for the inline "Start new" outlined CTA. */
  outlineBorder: string;
  /** Faint background for the outlined CTA on hover. */
  outlineHoverBg: string;
  badge: string;
}> = [
  {
    value: 'pdi',
    label: 'Pre-Delivery Inspection',
    blurb: 'New vehicle handover check for dealers, OEMs and fleets.',
    Icon: ClipboardCheck,
    accent: 'border-[#FF6600]',
    iconBg: 'bg-[#FF6600]',
    iconBgHover: 'hover:bg-[#E65C00]',
    textColor: 'text-[#FF6600]',
    outlineBorder: 'border-[#FF6600]/40',
    outlineHoverBg: 'hover:bg-[#FF6600]/5',
    badge: 'PDI',
  },
  {
    value: 'blue_slip',
    label: 'Blue Slip (NSW AUVIS)',
    blurb: 'Identity + comprehensive safety inspection.',
    Icon: Stamp,
    accent: 'border-[#0033FF]',
    iconBg: 'bg-[#0033FF]',
    iconBgHover: 'hover:bg-[#0029CC]',
    textColor: 'text-[#0033FF]',
    outlineBorder: 'border-[#0033FF]/40',
    outlineHoverBg: 'hover:bg-[#0033FF]/5',
    badge: 'AUVIS',
  },
  {
    value: 'pink_slip',
    label: 'Pink Slip (NSW eSafety)',
    blurb: 'Annual safety check for vehicles over 5 years.',
    Icon: Receipt,
    accent: 'border-[#EC4899]',
    iconBg: 'bg-[#EC4899]',
    iconBgHover: 'hover:bg-[#DB2777]',
    textColor: 'text-[#EC4899]',
    outlineBorder: 'border-[#EC4899]/40',
    outlineHoverBg: 'hover:bg-[#EC4899]/5',
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
  inspectionType?: InspectionType;
}

function NewInspectionPageInner() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [drafts, setDrafts] = useState<DraftInspection[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const selectedType: InspectionType | null =
    typeParam && ALLOWED_TYPES.has(typeParam) ? (typeParam as InspectionType) : null;

  // Group drafts by type (API field + number prefix fallback for legacy rows).
  const draftByType = useMemo(() => {
    const map: Partial<Record<InspectionType, DraftInspection>> = {};
    for (const d of drafts) {
      const t = resolveInspectionType(d.inspectionNumber, d.inspectionType);
      if (!map[t]) map[t] = d;
    }
    return map;
  }, [drafts]);

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
                const draft = draftByType[opt.value];
                return (
                  <div
                    key={opt.value}
                    className={`group flex flex-col rounded-2xl bg-white p-5 border-2 hover:shadow-lg transition-all ${opt.accent}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${opt.iconBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {opt.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{opt.label}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{opt.blurb}</p>
                    <div className="mt-4 flex flex-col gap-2">
                      {draft && (
                        <Link
                          href={`/inspections/${draft._id}`}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-semibold text-sm hover:bg-amber-200 transition-colors"
                        >
                          <FileEdit className="w-4 h-4" />
                          Continue draft{draft.inspectionNumber ? ` (${draft.inspectionNumber})` : ''}
                        </Link>
                      )}
                      <Link
                        href={`/inspection/new?type=${opt.value}`}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-colors ${
                          draft
                            ? `bg-white border ${opt.textColor} ${opt.outlineBorder} ${opt.outlineHoverBg}`
                            : `text-white ${opt.iconBg} ${opt.iconBgHover}`
                        }`}
                      >
                        {draft ? 'Start new' : 'Start →'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {!draftsLoading && drafts.length > 1 && (
              <p className="text-xs text-slate-500 mt-5">
                You have {drafts.length} saved drafts in total. Older drafts of each type are available in Inspection History.
              </p>
            )}
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


