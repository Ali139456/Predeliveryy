'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  UserPlus,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Download
} from 'lucide-react';
import AuditLogTab from './components/AuditLogTab';

interface Stats {
  inspections: {
    total: number;
    completed: number;
    draft: number;
    monthly: Array<{ _id: { year: number; month: number }; count: number }>;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  recent: Array<{
    _id: string;
    inspectionNumber: string;
    inspectorName: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'settings'>('overview');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success) {
        if (data.user.role !== 'admin' && data.user.role !== 'manager') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Tabs */}
      <div className="bg-slate-800/90 bg-slate-800/95 border-b border-slate-700/50 shadow-lg">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-purple-300 border-b-2 border-purple-500 bg-slate-700/50'
                  : 'text-slate-300 hover:text-purple-300 hover:bg-slate-700/30'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-blue-300 border-b-2 border-blue-500 bg-slate-700/50'
                  : 'text-slate-300 hover:text-blue-300 hover:bg-slate-700/30'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'text-indigo-300 border-b-2 border-indigo-500 bg-slate-700/50'
                  : 'text-slate-300 hover:text-indigo-300 hover:bg-slate-700/30'
              }`}
            >
              🔒 Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-green-300 border-b-2 border-green-500 bg-slate-700/50'
                  : 'text-slate-300 hover:text-green-300 hover:bg-slate-700/30'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'users' && <UsersTab userRole={user?.role} />}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: Stats | null }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-100">Total Inspections</h3>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center bg-slate-800/95">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.inspections.total || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-100">Completed</h3>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center bg-slate-800/95">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.inspections.completed || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-yellow-100">Drafts</h3>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center bg-slate-800/95">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.inspections.draft || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-100">Total Users</h3>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center bg-slate-800/95">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.users.total || 0}</p>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-xl p-6 border-2 border-purple-500/30">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg shadow-purple-500/50">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-purple-200">Recent Inspections</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 border-b-2 border-purple-500/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-purple-200">Inspection #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-purple-200">Inspector</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-purple-200">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-purple-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent.map((inspection, index) => (
                <tr 
                  key={inspection._id} 
                  className={`border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-purple-200">{inspection.inspectionNumber}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{inspection.inspectorName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      inspection.status === 'completed' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                    }`}>
                      {inspection.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300">
                    {new Date(inspection.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.recent || stats.recent.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No inspections yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ userRole }: { userRole?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        <p className="mt-4 text-purple-300">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-4 shadow-lg shadow-blue-500/50">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-blue-200">Users</h2>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl transform hover:scale-105"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add User
          </button>
        )}
      </div>

      <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-xl p-6 border-2 border-blue-500/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600/50 to-purple-600/50 border-b-2 border-blue-500/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-blue-200">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-blue-200">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-blue-200">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-blue-200">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-blue-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user._id} 
                  className={`border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-blue-200">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : user.role === 'manager'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    } shadow-md`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${
                      user.isActive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                    }`}>
                      {user.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {userRole === 'admin' && (
                      <button className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddUserModal
          onClose={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'technician',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        onClose();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-slate-800/95 flex items-center justify-center z-50">
      <div className="bg-slate-800/95 bg-slate-800/95 rounded-xl shadow-2xl p-8 w-full max-w-md border-2 border-purple-500/30">
        <h2 className="text-2xl font-bold mb-6 text-purple-200">Add User</h2>
        {error && (
          <div className="p-3 mb-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg bg-slate-800/95">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-500/50 rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-500/50 rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-500/50 rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-slate-500/50 rounded-lg bg-slate-600/50 text-white hover:bg-slate-600/70"
            >
              <option value="technician" className="bg-slate-700">Technician</option>
              <option value="manager" className="bg-slate-700">Manager</option>
              <option value="admin" className="bg-slate-700">Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-xl p-6 border-2 border-green-500/30">
      <h2 className="text-2xl font-bold text-green-200 mb-4">System Settings</h2>
      <p className="text-slate-300">Settings configuration coming soon...</p>
    </div>
  );
}

