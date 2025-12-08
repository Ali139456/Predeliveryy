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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 mb-6 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group backdrop-blur-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg shadow-purple-500/50">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-2">Inspection History</h1>
              <p className="text-purple-200">Search and manage all your inspection reports</p>
            </div>
          </div>
          
          <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-xl p-6 space-y-4 border-2 border-purple-500/30">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by inspection number, inspector, barcode, VIN, booking number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white hover:bg-slate-600/70"
              >
                <option value="" className="bg-slate-700">All Status</option>
                <option value="draft" className="bg-slate-700">Draft</option>
                <option value="completed" className="bg-slate-700">Completed</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="px-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white hover:bg-slate-600/70"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="px-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white hover:bg-slate-600/70"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-purple-300 text-lg">Loading inspections...</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-xl border-2 border-purple-500/30">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/50">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-purple-200 mb-2">No inspections found</h3>
            <p className="text-purple-300 mb-6">Get started by creating your first inspection</p>
            <Link
              href="/inspection/new"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              Create New Inspection
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-xl overflow-hidden border-2 border-purple-500/30">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Inspection Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Inspector
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-700/50 divide-y divide-slate-600/50">
                  {inspections.map((inspection, index) => (
                    <tr 
                      key={inspection._id} 
                      className={`hover:bg-slate-600/50 transition-colors ${
                        index % 2 === 0 ? 'bg-slate-700/30' : 'bg-slate-700/50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-purple-200">{inspection.inspectionNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{inspection.inspectorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-300">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          {format(new Date(inspection.inspectionDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-md ${
                            inspection.status === 'completed'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                          }`}
                        >
                          {inspection.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/inspections/${inspection._id}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            View
                          </Link>
                          <button
                            onClick={() => handleExport(inspection._id)}
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Download className="w-4 h-4 mr-1.5" />
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


