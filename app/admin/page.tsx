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
  Download,
  Search,
  Eye,
  Edit,
  Check
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
    id?: string;
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-[#0033FF] mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs */}
      <div className="bg-white border-b border-[#0033FF]/30 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-px -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-[#0033FF] border-b-2 border-[#0033FF] bg-[#0033FF]/10'
                  : 'text-black/70 hover:text-[#0033FF] hover:bg-gray-50'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-[#0033FF] border-b-2 border-[#0033FF] bg-[#0033FF]/10'
                  : 'text-black/70 hover:text-[#0033FF] hover:bg-gray-50'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'text-[#0033FF] border-b-2 border-[#0033FF] bg-[#0033FF]/10'
                  : 'text-black/70 hover:text-[#0033FF] hover:bg-gray-50'
              }`}
            >
              🔒 Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all rounded-t-lg whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-[#0033FF] border-b-2 border-[#0033FF] bg-[#0033FF]/10'
                  : 'text-black/70 hover:text-[#0033FF] hover:bg-gray-50'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'users' && <UsersTab userRole={user?.role} />}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: Stats | null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInspections, setFilteredInspections] = useState(stats?.recent || []);

  useEffect(() => {
    if (!stats?.recent) {
      setFilteredInspections([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredInspections(stats.recent);
      return;
    }

    const filtered = stats.recent.filter((inspection) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        inspection.inspectionNumber?.toLowerCase().includes(searchLower) ||
        inspection.inspectorName?.toLowerCase().includes(searchLower) ||
        inspection.status?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredInspections(filtered);
  }, [searchTerm, stats?.recent]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-black rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform border-2 border-[#0033FF]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/80">Total Inspections</h3>
            <div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.inspections.total || 0}</p>
        </div>

        <div className="bg-black rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform border-2 border-[#0033FF]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/80">Completed</h3>
            <div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.inspections.completed || 0}</p>
        </div>

        <div className="bg-black rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform border-2 border-[#0033FF]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/80">Drafts</h3>
            <div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.inspections.draft || 0}</p>
        </div>

        <div className="bg-[#0033FF] rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Total Users</h3>
            <div className="w-12 h-12 rounded-xl bg-[#0033FF]/10 flex items-center justify-center bg-white">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold">{stats?.users.total || 0}</p>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-[#0033FF] flex items-center justify-center mr-3 shadow-lg shadow-[#0033FF]/50">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-black">Recent Inspections</h2>
          </div>
          
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:bg-white focus:hover:bg-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0033FF] border-b-2 border-[#0033FF]/50">
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Inspection #</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Inspector</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Status</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Date</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((inspection, index) => (
                <tr 
                  key={inspection.id ?? inspection._id ?? index} 
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-black">{inspection.inspectionNumber}</td>
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">{inspection.inspectorName}</td>
                  <td className="py-3 px-2 sm:px-4">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                      inspection.status === 'completed' 
                        ? 'bg-green-100 text-green-700 shadow-md' 
                        : 'bg-yellow-100 text-yellow-700 shadow-md'
                    }`}>
                      {inspection.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">
                    {new Date(inspection.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 sm:px-4">
                    <Link
                      href={`/inspections/${inspection.id ?? inspection._id}?view=readonly`}
                      className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredInspections.length === 0 && (
                <tr key="no-inspections">
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {searchTerm ? 'No inspections found matching your search' : 'No inspections yet'}
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
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-[#0033FF]"></div>
        <p className="mt-4 text-black">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center mr-4 shadow-lg shadow-[#0033FF]/50">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black">Users</h2>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-[#0033FF] text-white rounded-xl hover:bg-[#0033FF]/90 transition-all shadow-lg shadow-[#0033FF]/50 hover:shadow-xl transform hover:scale-105"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add User
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0033FF] border-b-2 border-[#0033FF]/50">
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Name</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Email</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Phone</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Role</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Status</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user._id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-black">{user.name}</td>
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">{user.email}</td>
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-black">{user.phoneNumber || '-'}</td>
                  <td className="py-3 px-2 sm:px-4">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-700'
                        : user.role === 'manager'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    } shadow-md`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full shadow-md ${
                      user.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4">
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-xs sm:text-sm font-medium text-[#0033FF] hover:text-[#0033FF]/80 hover:underline cursor-pointer transition-colors"
                      >
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

      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
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
    phoneNumber: '',
    password: '',
    role: 'technician',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Validate email uniqueness
  const checkEmail = async (email: string) => {
    if (!email) {
      setEmailError(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/check-email?email=${encodeURIComponent(email.toLowerCase())}`);
      const data = await response.json();
      if (data.exists) {
        setEmailError('This email is already in use');
      } else {
        setEmailError(null);
      }
    } catch (err) {
      // Silently fail - validation will happen on submit
    }
  };

  // Validate phone uniqueness
  const checkPhone = async (phone: string) => {
    if (!phone || !phone.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/check-phone?phone=${encodeURIComponent(phone.trim())}`);
      const data = await response.json();
      if (data.exists) {
        setPhoneError('This phone number is already in use');
      } else {
        setPhoneError(null);
      }
    } catch (err) {
      // Silently fail - validation will happen on submit
    }
  };

  // Validate password strength
  const validatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordError(null);
      setPasswordStrength('weak');
      return;
    }

    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length < 8) {
      errors.push('At least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('One special character');
    }

    if (errors.length === 0) {
      if (password.length >= 12) {
        strength = 'strong';
      } else {
        strength = 'medium';
      }
      setPasswordError(null);
    } else {
      setPasswordError(`Password must contain: ${errors.join(', ')}`);
    }

    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (emailError || phoneError || passwordError) {
      setError('Please fix the validation errors before submitting');
      return;
    }

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
      <div className="bg-black/95 rounded-xl shadow-2xl p-8 w-full max-w-md border-2 border-[#0033FF]/30">
        <h2 className="text-2xl font-bold mb-6 text-white">Add User</h2>
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
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                checkEmail(e.target.value);
              }}
              onBlur={() => checkEmail(formData.email)}
              required
              className={`w-full px-4 py-2 border rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 ${
                emailError ? 'border-red-500' : 'border-slate-500/50'
              }`}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-400">{emailError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                setFormData({ ...formData, phoneNumber: e.target.value });
                checkPhone(e.target.value);
              }}
              onBlur={() => checkPhone(formData.phoneNumber)}
              required
              className={`w-full px-4 py-2 border rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 ${
                phoneError ? 'border-red-500' : 'border-slate-500/50'
              }`}
              placeholder="+1234567890"
            />
            {phoneError && (
              <p className="mt-1 text-xs text-red-400">{phoneError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Password <span className="text-xs text-slate-400">(min 8 chars, uppercase, lowercase, number, special char)</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                validatePasswordStrength(e.target.value);
              }}
              required
              minLength={8}
              className={`w-full px-4 py-2 border rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 ${
                passwordError ? 'border-red-500' : passwordStrength === 'strong' ? 'border-green-500' : passwordStrength === 'medium' ? 'border-yellow-500' : 'border-slate-500/50'
              }`}
            />
            {formData.password && (
              <div className="mt-1">
                {passwordError ? (
                  <p className="text-xs text-red-400">{passwordError}</p>
                ) : (
                  <p className={`text-xs ${
                    passwordStrength === 'strong' ? 'text-green-400' : 
                    passwordStrength === 'medium' ? 'text-yellow-400' : 
                    'text-slate-400'
                  }`}>
                    Password strength: <span className="font-semibold capitalize">{passwordStrength}</span>
                  </p>
                )}
              </div>
            )}
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
              className="flex-1 px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 transition-all shadow-lg shadow-[#0033FF]/50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    password: '',
    role: user.role || 'technician',
    isActive: user.isActive !== undefined ? user.isActive : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Validate email uniqueness (only if changed)
  const checkEmail = async (email: string) => {
    if (!email || email.toLowerCase() === user.email?.toLowerCase()) {
      setEmailError(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/check-email?email=${encodeURIComponent(email.toLowerCase())}`);
      const data = await response.json();
      if (data.exists) {
        setEmailError('This email is already in use');
      } else {
        setEmailError(null);
      }
    } catch (err) {
      // Silently fail - validation will happen on submit
    }
  };

  // Validate phone uniqueness (only if changed)
  const checkPhone = async (phone: string) => {
    if (!phone || !phone.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    if (phone.trim() === user.phoneNumber) {
      setPhoneError(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/check-phone?phone=${encodeURIComponent(phone.trim())}`);
      const data = await response.json();
      if (data.exists) {
        setPhoneError('This phone number is already in use');
      } else {
        setPhoneError(null);
      }
    } catch (err) {
      // Silently fail - validation will happen on submit
    }
  };

  // Validate password strength
  const validatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordError(null);
      setPasswordStrength('weak');
      return;
    }

    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length < 8) {
      errors.push('At least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('One special character');
    }

    if (errors.length === 0) {
      if (password.length >= 12) {
        strength = 'strong';
      } else {
        strength = 'medium';
      }
      setPasswordError(null);
    } else {
      setPasswordError(`Password must contain: ${errors.join(', ')}`);
    }

    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (emailError || phoneError || (formData.password && passwordError)) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        onClose();
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-slate-800/95 flex items-center justify-center z-50 p-4">
      <div className="bg-black/95 rounded-xl shadow-2xl p-8 w-full max-w-md border-2 border-[#0033FF]/30 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Edit className="w-6 h-6 mr-2" />
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>
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
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                checkEmail(e.target.value);
              }}
              onBlur={() => checkEmail(formData.email)}
              required
              className={`w-full px-4 py-2 border rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 ${
                emailError ? 'border-red-500' : 'border-slate-500/50'
              }`}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-400">{emailError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                setFormData({ ...formData, phoneNumber: e.target.value });
                checkPhone(e.target.value);
              }}
              onBlur={() => checkPhone(formData.phoneNumber)}
              required
              className={`w-full px-4 py-2 border rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 ${
                phoneError ? 'border-red-500' : 'border-slate-500/50'
              }`}
              placeholder="+1234567890"
            />
            {phoneError && (
              <p className="mt-1 text-xs text-red-400">{phoneError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              New Password <span className="text-xs text-slate-400">(leave blank to keep current, min 8 chars if changing)</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                validatePasswordStrength(e.target.value);
              }}
              minLength={formData.password ? 8 : undefined}
              className={`w-full px-4 py-2 border rounded-lg bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 ${
                passwordError ? 'border-red-500' : formData.password && passwordStrength === 'strong' ? 'border-green-500' : formData.password && passwordStrength === 'medium' ? 'border-yellow-500' : 'border-slate-500/50'
              }`}
              placeholder="Enter new password (optional)"
            />
            {formData.password && (
              <div className="mt-1">
                {passwordError ? (
                  <p className="text-xs text-red-400">{passwordError}</p>
                ) : (
                  <p className={`text-xs ${
                    passwordStrength === 'strong' ? 'text-green-400' : 
                    passwordStrength === 'medium' ? 'text-yellow-400' : 
                    'text-slate-400'
                  }`}>
                    Password strength: <span className="font-semibold capitalize">{passwordStrength}</span>
                  </p>
                )}
              </div>
            )}
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
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-3 w-5 h-5 rounded border-white/20 text-[#0033FF] focus:ring-2 focus:ring-[#0033FF] bg-black/50 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-200">Active User</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
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
              className="flex-1 px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 transition-all shadow-lg shadow-[#0033FF]/50"
            >
              {loading ? 'Updating...' : 'Update User'}
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

