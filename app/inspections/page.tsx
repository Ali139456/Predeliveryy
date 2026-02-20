'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Download, Eye, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Inspection {
  _id: string;
  inspectionNumber: string;
  inspectorName: string;
  inspectionDate: string;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  barcode?: string;
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchInspections();
  }, [searchTerm, statusFilter, startDate, endDate]);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/inspections?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setInspections(result.data);
      }
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id: string) => {
    try {
      const response = await fetch(`/api/export?id=${id}`);
      
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
      const fileName = `inspection-${id}.pdf`.replace(/[^a-z0-9.-]/gi, '_');
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 mb-4 sm:mb-6 bg-[#0033FF]/10 hover:bg-[#0033FF]/20 text-black rounded-xl border-2 border-[#0033FF]/30 hover:border-[#0033FF]/50 shadow-lg transition-all duration-300 group text-sm sm:text-base"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#0033FF] flex items-center justify-center shadow-lg shadow-[#0033FF]/50 shrink-0">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-1 sm:mb-2">Inspection History</h1>
                <p className="text-sm sm:text-base text-black/70">Search and manage all your inspection reports</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 space-y-4 border-2 border-[#0033FF]/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:bg-white focus:hover:bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black hover:bg-white focus:hover:bg-white"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black hover:bg-white focus:hover:bg-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black hover:bg-white focus:hover:bg-white"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0033FF] mb-4"></div>
            <p className="text-black text-lg">Loading inspections...</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border-2 border-[#0033FF]/30">
            <div className="w-24 h-24 rounded-full bg-[#0033FF] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0033FF]/50">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">No inspections found</h3>
            <p className="text-black/70 mb-6">Get started by creating your first inspection</p>
            <Link
              href="/inspection/new"
              className="inline-flex items-center px-8 py-4 bg-[#0033FF] text-white rounded-xl font-semibold hover:bg-[#0033FF]/90 transition-all hover:scale-105 shadow-lg"
            >
              Create New Inspection
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {inspections.map((inspection) => (
                <div
                  key={inspection._id}
                  className="bg-white rounded-2xl shadow-xl p-4 border-2 border-[#0033FF]/30 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-black mb-1">{inspection.inspectionNumber}</div>
                      <div className="text-xs text-black/70">{inspection.inspectorName}</div>
                    </div>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-md ${
                        inspection.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {inspection.status}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-black/70">
                    <Calendar className="w-3 h-3 mr-2 text-black/50" />
                    {format(new Date(inspection.inspectionDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/inspections/${inspection._id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 transition-all shadow-md"
                    >
                      <Eye className="w-3 h-3 mr-1.5" />
                      View
                    </Link>
                    <button
                      onClick={() => handleExport(inspection._id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold bg-[#FF6600] text-white rounded-lg hover:bg-[#E65C00] transition-all shadow-md"
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0033FF] border-b-2 border-[#0033FF]/50">
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Inspection Number</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Inspector</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Date</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Status</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map((inspection, index) => (
                      <tr 
                        key={inspection._id} 
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-black">{inspection.inspectionNumber}</td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">{inspection.inspectorName}</td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-black/50" />
                            {format(new Date(inspection.inspectionDate), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                              inspection.status === 'completed'
                                ? 'bg-green-100 text-green-700 shadow-md'
                                : 'bg-yellow-100 text-yellow-700 shadow-md'
                            }`}
                          >
                            {inspection.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/inspections/${inspection._id}`}
                              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                            <button
                              onClick={() => handleExport(inspection._id)}
                              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-[#FF6600] text-white rounded-lg hover:bg-[#E65C00] transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                              <span className="hidden sm:inline">Export</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


