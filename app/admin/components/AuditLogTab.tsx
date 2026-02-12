'use client';

import { useState, useEffect } from 'react';
import { Shield, Download, Filter, Search } from 'lucide-react';

interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export default function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [availableFilters, setAvailableFilters] = useState({
    actionTypes: [] as string[],
    resourceTypes: [] as string[],
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination.pages);
        if (data.filters) {
          setAvailableFilters(data.filters);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({ format });
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/audit/export?${params.toString()}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      if (typeof window !== 'undefined') {
        alert('Failed to export audit logs');
      }
      console.error('Export failed:', error);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-700';
    if (action.includes('updated')) return 'bg-blue-100 text-blue-700';
    if (action.includes('deleted') || action.includes('deactivated')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center mr-4 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black">Audit Logs</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center px-6 py-3 bg-[#0033FF] text-white rounded-xl hover:bg-[#0033FF]/90 transition-all shadow-lg shadow-[#0033FF]/50 hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center px-6 py-3 bg-[#0033FF] text-white rounded-xl hover:bg-[#0033FF]/90 transition-all shadow-lg shadow-[#0033FF]/50 hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0033FF] flex items-center justify-center mr-3 shadow-lg shadow-[#0033FF]/50">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-black text-lg">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black hover:bg-white focus:hover:bg-white"
            >
              <option value="">All Actions</option>
              {availableFilters.actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Resource Type</label>
            <select
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black hover:bg-white focus:hover:bg-white"
            >
              <option value="">All Types</option>
              {availableFilters.resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">User ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              placeholder="Filter by user ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] transition-all bg-white text-black placeholder-gray-400 hover:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black hover:bg-white focus:hover:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black hover:bg-white focus:hover:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30">
        {loading ? (
          <div className="text-center py-8 text-black">Loading audit logs...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
            <thead>
              <tr className="bg-[#0033FF] border-b-2 border-[#0033FF]/50">
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Timestamp</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">User</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Action</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Resource</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Details</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">IP Address</th>
              </tr>
            </thead>
                <tbody>
              {logs.map((log, index) => (
                <tr 
                  key={log._id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <div>
                          <div className="font-medium text-black">{log.userName}</div>
                          <div className="text-xs text-black/70">{log.userEmail}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${getActionColor(log.action)} shadow-md`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">
                        <div>
                          <div className="font-medium">{log.resourceType}</div>
                          {log.resourceId && (
                            <div className="text-xs text-black/70">{log.resourceId.substring(0, 8)}...</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">
                        <details className="cursor-pointer">
                          <summary className="text-[#0033FF] hover:text-[#0033FF]/80">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-w-xs">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">
                        {log.ipAddress || 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-black/70">
                        No audit logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

