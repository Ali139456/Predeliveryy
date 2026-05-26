'use client';

import { useState, useEffect } from 'react';
import { Shield, Download, Filter } from 'lucide-react';
import {
  AdminPageHeader,
  AdminPanel,
  AdminBtn,
  AdminInput,
  AdminSelect,
  AdminLabel,
  AdminTable,
  AdminThead,
  AdminTh,
  AdminTr,
  AdminTd,
} from '@/components/admin/AdminUI';

interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

function getActionBadgeClass(action: string) {
  if (action.includes('created')) return 'bg-emerald-50 text-emerald-700 ring-emerald-200/80';
  if (action.includes('updated')) return 'bg-blue-50 text-blue-700 ring-blue-200/80';
  if (action.includes('deleted') || action.includes('deactivated')) return 'bg-rose-50 text-rose-700 ring-rose-200/80';
  return 'bg-slate-100 text-slate-600 ring-slate-200/80';
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
      alert('Failed to export audit logs');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <AdminPageHeader
        icon={Shield}
        title="Audit Logs"
        subtitle="Track who did what across inspections, users, and system actions."
        actions={
          <>
            <AdminBtn variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4" />
              Export CSV
            </AdminBtn>
            <AdminBtn onClick={() => handleExport('json')}>
              <Download className="w-4 h-4" />
              Export JSON
            </AdminBtn>
          </>
        }
      />

      <AdminPanel title="Filters" icon={Filter}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <AdminLabel>Action</AdminLabel>
            <AdminSelect
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full"
            >
              <option value="">All Actions</option>
              {availableFilters.actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>Resource Type</AdminLabel>
            <AdminSelect
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="w-full"
            >
              <option value="">All Types</option>
              {availableFilters.resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>User ID</AdminLabel>
            <AdminInput
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              placeholder="Filter by user ID"
              className="w-full"
            />
          </div>
          <div>
            <AdminLabel>Start Date</AdminLabel>
            <AdminInput
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <AdminLabel>End Date</AdminLabel>
            <AdminInput
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Activity log" subtitle={`Page ${page} of ${totalPages || 1}`}>
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading audit logs…</div>
        ) : (
          <>
            <AdminTable>
              <AdminThead>
                <AdminTh>Timestamp</AdminTh>
                <AdminTh>User</AdminTh>
                <AdminTh>Action</AdminTh>
                <AdminTh>Resource</AdminTh>
                <AdminTh>Details</AdminTh>
                <AdminTh>IP Address</AdminTh>
              </AdminThead>
              <tbody>
                {logs.map((log, index) => (
                  <AdminTr key={log._id} index={index}>
                    <AdminTd className="text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </AdminTd>
                    <AdminTd>
                      <div className="font-medium text-slate-900">{log.userName}</div>
                      <div className="text-xs text-slate-500">{log.userEmail}</div>
                    </AdminTd>
                    <AdminTd>
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ${getActionBadgeClass(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </AdminTd>
                    <AdminTd>
                      <div className="font-medium text-slate-800">{log.resourceType}</div>
                      {log.resourceId ? (
                        <div className="text-xs text-slate-500 font-mono">{log.resourceId.slice(0, 8)}…</div>
                      ) : null}
                    </AdminTd>
                    <AdminTd>
                      <details className="cursor-pointer">
                        <summary className="text-[#0033FF] text-sm font-medium hover:underline">
                          View
                        </summary>
                        <pre className="mt-2 p-3 bg-slate-50 rounded-xl text-xs overflow-auto max-w-xs border border-slate-200">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </AdminTd>
                    <AdminTd className="text-xs font-mono text-slate-600">{log.ipAddress || '-'}</AdminTd>
                  </AdminTr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                      No audit logs found for these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </AdminTable>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <AdminBtn variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </AdminBtn>
                <span className="text-sm text-slate-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <AdminBtn
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </AdminBtn>
              </div>
            )}
          </>
        )}
      </AdminPanel>
    </div>
  );
}
