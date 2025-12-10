'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Send, Download, FileText, Lock } from 'lucide-react';

// Lazy load heavy components
const InspectionForm = dynamic(() => import('@/components/InspectionForm'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
    </div>
  ),
  ssr: false,
});

const EmailModal = dynamic(() => import('@/components/EmailModal'), {
  ssr: false,
});

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchUser();
    if (params.id) {
      fetchInspection();
    }
    
    // Check auth when page becomes visible (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };
    
    // Check auth on browser back/forward navigation
    const handlePopState = () => {
      fetchUser();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    
    // Periodic auth check (every 2 minutes - reduced frequency)
    const authInterval = setInterval(() => {
      fetchUser();
    }, 120000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(authInterval);
    };
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        // User is not logged in - redirect to login
        if (user) {
          // User was logged in before, session expired
          router.push('/login');
        } else {
          // First time check, not logged in
          router.push('/login');
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      router.push('/login');
    }
  };

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${params.id}`);
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

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export?id=${params.id}`);
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || `Failed to export PDF. Status: ${response.status}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        // Try to get error message if it's JSON
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          throw new Error(errorData.error || 'Failed to generate PDF');
        }
        throw new Error('Invalid response format. Expected PDF.');
      }
      
      const blob = await response.blob();
      
      // Verify blob is not empty
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `inspection-${inspection?.inspectionNumber || params.id}.pdf`.replace(/[^a-z0-9.-]/gi, '_');
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error: any) {
      console.error('Export error:', error);
      if (typeof window !== 'undefined') {
        alert(`Error exporting PDF: ${error.message || 'Unknown error'}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-purple-300">Loading inspection...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/90 bg-slate-800/95 rounded-2xl p-8 border-2 border-purple-500/30">
          <p className="text-purple-300 mb-4 text-lg">Inspection not found</p>
          <Link
            href="/inspections"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group backdrop-blur-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold">Back to Inspections</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/inspections"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group backdrop-blur-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold">Back to Inspections</span>
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => setEmailModalOpen(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg shadow-pink-500/50"
            >
              <Send className="w-5 h-5 mr-2" />
              Email Report
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105 shadow-lg shadow-blue-500/50"
            >
              <Download className="w-5 h-5 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg shadow-purple-500/50">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
                  Inspection: {inspection.inspectionNumber}
                </h1>
              </div>
            </div>
            {user && user.role !== 'admin' && (
              <div className="flex items-center px-4 py-2 bg-yellow-900/50 border-2 border-yellow-500/50 rounded-lg bg-slate-800/95">
                <Lock className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-300 font-semibold">View Only Mode</span>
              </div>
            )}
          </div>
          <InspectionForm 
            inspectionId={params.id as string} 
            initialData={inspection}
            readOnly={user?.role !== 'admin'}
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


