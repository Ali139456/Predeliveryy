'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Send, Download, FileText, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

const PdfExportProgress = dynamic(() => import('@/components/PdfExportProgress'), { ssr: false });

function InspectionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const isReadOnlyView = searchParams.get('view') === 'readonly';

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

  const handleExport = () => {
    setExportUrl(`/api/export?id=${params.id}`);
    setExportingPdf(true);
  };

  const handleExportComplete = (error?: Error) => {
    setExportingPdf(false);
    setExportUrl(null);
    if (error && typeof window !== 'undefined') {
      alert(`Error exporting PDF: ${error.message}`);
    }
  };

  const getExportFileName = (response: Response) => {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="?([^";\s]+)"?/);
    return filenameMatch ? filenameMatch[1] : `${(inspection?.inspectionNumber || params.id)?.toString().replace(/[^a-z0-9.-]/gi, '_')}.pdf`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-10 sm:pt-6 pb-6 sm:pb-8 min-w-0">
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
        </div>
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
    <div className="h-screen overflow-y-auto overflow-x-hidden scrollbar-hide bg-white">
      {exportingPdf && exportUrl && (
        <PdfExportProgress
          isActive={exportingPdf}
          exportUrl={exportUrl}
          getFileName={getExportFileName}
          onComplete={handleExportComplete}
        />
      )}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-10 sm:pt-6 pb-6 sm:pb-8 overflow-x-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <Link
            href="/inspections"
            className="inline-flex items-center gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white/70 hover:bg-white text-black rounded-full border border-[#0033FF]/25 hover:border-[#0033FF]/40 shadow-sm hover:shadow-md transition-all duration-200 group w-fit text-xs sm:text-sm backdrop-blur-md"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0033FF] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shrink-0">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold tracking-tight">Back to Inspections</span>
          </Link>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEmailModalOpen(true)}
              className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FF6600] text-white rounded-xl font-semibold hover:bg-[#E65C00] transition-all hover:scale-105 shadow-lg shadow-[#FF6600]/30 text-sm sm:text-base"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Email Report
            </button>
            <button
              onClick={handleExport}
              disabled={exportingPdf}
              className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0033FF] text-white rounded-xl font-semibold hover:bg-[#0033FF]/90 transition-all hover:scale-105 shadow-lg shadow-[#0033FF]/50 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-[#0033FF]/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black truncate">
                Inspection: {inspection.inspectionNumber}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {(() => {
                const isOwner = user && inspection && String(user.email || '').toLowerCase() === String(inspection.inspectorEmail || '').toLowerCase();
                const readOnly = !user ? false : (isReadOnlyView || (!isOwner && user.role !== 'admin'));
                if (readOnly) {
                  return (
                    <div className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-900/50 border-2 border-yellow-500/50 rounded-lg bg-slate-800/95 text-sm sm:text-base">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1.5 sm:mr-2 shrink-0" />
                      <span className="text-yellow-300 font-semibold">View Only Mode</span>
                    </div>
                  );
                }
                if (user?.role === 'admin') {
                  return (
                    <div className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-900/50 border-2 border-green-500/50 rounded-lg bg-slate-800/95 text-sm sm:text-base">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-1.5 sm:mr-2 shrink-0" />
                      <span className="text-green-300 font-semibold">Edit Mode</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          <InspectionForm 
            inspectionId={params.id as string} 
            initialData={inspection}
            readOnly={(() => {
              const isOwner = user && inspection && String(user.email || '').toLowerCase() === String(inspection.inspectorEmail || '').toLowerCase();
              return !user ? false : (isReadOnlyView || (!isOwner && user.role !== 'admin'));
            })()}
          />
        </div>

        <EmailModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          onSend={handleEmailSend}
          inspectionNumber={inspection?.inspectionNumber}
        />
      </div>
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
