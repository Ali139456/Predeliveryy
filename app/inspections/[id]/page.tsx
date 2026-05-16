'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Send, FileText, Lock, List, Printer, ClipboardCheck, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageContainer from '@/components/PageContainer';
import { captureInspectionReportHtml } from '@/lib/capture-report-html';
import { isReadOnlyRole } from '@/lib/roles';

// Lazy load heavy components
const InspectionForm = dynamic(() => import('@/components/InspectionForm'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-[#0033FF]"></div>
    </div>
  ),
  ssr: false,
});

const EmailModal = dynamic(() => import('@/components/EmailModal'), {
  ssr: false,
});

const InspectionReportView = dynamic(() => import('@/components/InspectionReportView'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#0033FF]" />
    </div>
  ),
  ssr: false,
});

function InspectionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'report' | 'form'>('report');

  const isReadOnlyView = searchParams.get('view') === 'readonly';
  const isCompleted = inspection?.status === 'completed';
  const showReport = isCompleted && viewMode === 'report';

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (params.id && user) {
      fetchInspection();
    } else if (!params.id) {
      setLoading(false);
    }
  }, [params.id, user, authLoading]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${params.id}`, { credentials: 'include' });
      const result = await response.json();

      if (result.success) {
        setInspection(result.data);
      }
    } catch (error) {
      console.error('Error fetching inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSend = async (emailList: string[]) => {
    if (isCompleted && showReport) {
      const captured = captureInspectionReportHtml();
      const snapRes = await fetch(`/api/inspections/${params.id}/report-snapshot`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captured ? { html: captured, force: true } : { force: true }),
      });
      if (!snapRes.ok) {
        const snapErr = await snapRes.json().catch(() => ({}));
        throw new Error(
          (snapErr as { error?: string }).error || 'Could not save report for email. Try Print Report first.'
        );
      }
    }

    const response = await fetch(`/api/inspections/${params.id}/email`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        recipients: emailList 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP error! status: ${response.status}` 
      }));
      throw new Error(errorData.error || `Failed to send email. Status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <PageContainer className="pt-10 sm:pt-6 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 mb-4 bg-white/70 text-black rounded-full border border-[#0033FF]/25 shadow-sm backdrop-blur-md text-xs sm:text-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0033FF] flex items-center justify-center shadow-sm">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/40 border-t-white" aria-hidden />
            </div>
            <span className="font-semibold tracking-tight">Loading inspection…</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-[#0033FF]/20">
            <div className="h-7 w-64 bg-gray-100 rounded-lg animate-pulse mb-6" aria-hidden />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" aria-hidden />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" aria-hidden />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" aria-hidden />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center bg-black/80 rounded-2xl p-8 border-2 border-[#0033FF]/30">
          <p className="text-white mb-4 text-lg">Inspection not found</p>
          <Link
            href="/inspections"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-full border border-white/20 hover:border-white/35 shadow-sm hover:shadow-md transition-all duration-200 group backdrop-blur-md text-xs sm:text-sm"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0033FF] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold tracking-tight">Back to Inspections</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface min-h-screen min-w-0">
      <PageContainer className="pt-10 sm:pt-6 pb-6 sm:pb-8 print:pt-0 print:pb-0">
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <Link
            href="/inspections"
            className="inline-flex items-center gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 mt-4 sm:mt-0 bg-white/70 hover:bg-white text-black rounded-full border border-[#0033FF]/25 hover:border-[#0033FF]/40 shadow-sm hover:shadow-md transition-all duration-200 group w-fit self-start text-xs sm:text-sm backdrop-blur-md"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0033FF] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shrink-0">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold tracking-tight">Back to Inspections</span>
          </Link>

          <div className="flex flex-row flex-wrap justify-end gap-2 w-full sm:w-auto sm:ml-auto">
            {isCompleted && (
              <button
                type="button"
                onClick={() => setViewMode(showReport ? 'form' : 'report')}
                className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-slate-800 rounded-xl font-semibold border border-slate-300 hover:bg-slate-50 transition-all text-sm sm:text-base shrink-0"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                {showReport ? 'View full form' : 'View report'}
              </button>
            )}
            {showReport && isCompleted && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all text-sm sm:text-base shrink-0"
              >
                <Printer className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Print Report
              </button>
            )}
            <button
              onClick={() => setEmailModalOpen(true)}
              className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FF6600] text-white rounded-xl font-semibold hover:bg-[#E65C00] transition-all hover:scale-105 shadow-lg shadow-[#FF6600]/30 text-sm sm:text-base shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Email Report
            </button>
          </div>
        </div>

        <div
          className={`bg-white rounded-2xl shadow-2xl border-2 border-[#0033FF]/30 print:shadow-none print:border-0 print:rounded-none ${
            showReport ? 'p-0 sm:p-1 print:p-0' : 'p-4 sm:p-6 md:p-8'
          }`}
        >
          <div
            className={`no-print mb-5 sm:mb-6 ${showReport ? 'px-4 pt-4 sm:px-5 sm:pt-5' : ''}`}
          >
            {(() => {
              const isOwner =
                user &&
                inspection &&
                String(user.email || '').toLowerCase() ===
                  String(inspection.inspectorEmail || '').toLowerCase();
              const readOnly = !user
                ? false
                : isReadOnlyView || isReadOnlyRole(user.role ?? '') || (user.role !== 'admin' && !isOwner);
              const statusLabel = inspection.status === 'completed' ? 'Completed' : 'Draft';

              return (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100/80">
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#0033FF] via-[#3366FF] to-[#FF6600]"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 pl-5 sm:pl-6">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center shadow-md shadow-[#0033FF]/25 shrink-0 ring-2 ring-[#0033FF]/10">
                        {showReport ? (
                          <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />
                        ) : (
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0033FF]">
                            {showReport ? 'Pre-delivery report' : 'Inspection workspace'}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
                                : 'bg-slate-100 text-slate-600 ring-slate-200/80'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                          {showReport
                            ? 'Inspection Report'
                            : `Inspection ${inspection.inspectionNumber}`}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-mono text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md">
                            {inspection.inspectionNumber}
                          </span>
                          {inspection.inspectorName ? (
                            <>
                              <span className="text-slate-300 hidden sm:inline" aria-hidden>
                                ·
                              </span>
                              <span className="truncate max-w-[14rem] sm:max-w-none">
                                {inspection.inspectorName}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">
                      {readOnly ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 shadow-sm">
                          <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          View only
                        </span>
                      ) : user?.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0033FF]/10 text-[#0033FF] ring-1 ring-[#0033FF]/20 shadow-sm">
                          <Pencil className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          Edit mode
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          {showReport ? (
            <InspectionReportView inspection={inspection} />
          ) : (
            <InspectionForm
              inspectionId={params.id as string}
              initialData={inspection}
              readOnly={(() => {
                const isOwner =
                  user &&
                  inspection &&
                  String(user.email || '').toLowerCase() ===
                    String(inspection.inspectorEmail || '').toLowerCase();
                return !user
                  ? false
                  : isReadOnlyView || isReadOnlyRole(user.role ?? '') || (user.role !== 'admin' && !isOwner);
              })()}
            />
          )}
        </div>

        <EmailModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          onSend={handleEmailSend}
          inspectionNumber={inspection?.inspectionNumber}
        />
      </PageContainer>
    </div>
  );
}

export default function InspectionDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-[#0033FF] mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <InspectionDetailContent />
    </Suspense>
  );
}
