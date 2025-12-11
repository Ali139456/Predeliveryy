'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, LayoutDashboard, Home, Menu, X, MoreVertical, Settings, Edit } from 'lucide-react';

function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      // Not logged in - that's okay
    } finally {
      setLoading(false);
    }
  }, []);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Don't fetch auth on login page
    if (pathname === '/login') {
      setLoading(false);
      return;
    }
    
    checkAuth();
  }, [pathname, checkAuth]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null); // Clear user state immediately
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear any localStorage/sessionStorage if used
        sessionStorage.clear();
      }
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Clear user state even on error
      // Force redirect even if API call fails
      router.push('/login');
    }
  }, [router]);

  // Don't show header on login page - AFTER all hooks
  if (pathname === '/login') {
    return null;
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 shadow-lg border-b border-purple-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-purple-200 transition-colors flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/30 bg-slate-800/95 flex items-center justify-center mr-2 border border-purple-400/30">
                <span className="text-white font-bold text-xs sm:text-sm">HI</span>
              </div>
              <span className="hidden sm:inline">Pre delivery inspection</span>
              <span className="sm:hidden">Pre delivery</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center px-4 sm:px-6 py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all shadow-lg hover:shadow-xl font-semibold border border-purple-400/30"
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-orange-500';
      case 'manager':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-green-500 to-emerald-500';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/50 text-red-200';
      case 'manager':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/50 text-blue-200';
      default:
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-200';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 shadow-lg border-b border-purple-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-purple-200 transition-colors flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/30 bg-slate-800/95 flex items-center justify-center mr-2 border border-purple-400/30">
              <span className="text-white font-bold text-xs sm:text-sm">HI</span>
            </div>
            <span className="hidden sm:inline">PreDelivery</span>
            <span className="sm:hidden">PD</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Home Button */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md hover:shadow-lg border ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/50 shadow-purple-500/50'
                  : 'bg-slate-800/80 text-purple-200 hover:bg-slate-700/80 border-purple-500/30 hover:border-purple-400/50'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              <span>Home</span>
            </Link>

            {/* Dashboard Button */}
            {(user.role === 'admin' || user.role === 'manager') && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md hover:shadow-lg border ${
                  pathname === '/admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-400/50 shadow-indigo-500/50'
                    : 'bg-slate-800/80 text-indigo-200 hover:bg-slate-700/80 border-indigo-500/30 hover:border-indigo-400/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* User Info Section */}
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-purple-500/30">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-purple-400/20">
                <User className={`w-4 h-4 ${getRoleColor(user.role).includes('red') ? 'text-red-400' : getRoleColor(user.role).includes('blue') ? 'text-blue-400' : 'text-green-400'}`} />
                <div className="text-white">
                  <div className="text-sm font-bold text-white leading-tight">
                    {user.name || user.email}
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center px-3 py-2 text-sm bg-slate-800/60 text-white rounded-lg hover:bg-slate-700/80 transition-all shadow-md hover:shadow-lg border border-purple-400/20 hover:scale-105"
                  title="Profile Menu"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 rounded-lg shadow-xl border-2 border-purple-500/30 z-20 overflow-hidden">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setShowProfileModal(true);
                          }}
                          className="w-full flex items-center px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3 text-purple-400" />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-3 text-left text-sm text-red-300 hover:bg-red-900/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 text-white hover:bg-purple-700/50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-purple-700/50 pt-4 space-y-3">
            {/* Home Button */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center w-full px-4 py-3 rounded-lg font-semibold transition-all shadow-md border ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/50'
                  : 'bg-slate-800/80 text-purple-200 border-purple-500/30'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Home</span>
            </Link>

            {/* Dashboard Button */}
            {(user.role === 'admin' || user.role === 'manager') && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center w-full px-4 py-3 rounded-lg font-semibold transition-all shadow-md border ${
                  pathname === '/admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-400/50'
                    : 'bg-slate-800/80 text-indigo-200 border-indigo-500/30'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* User Info Section */}
            <div className="px-4 py-3 bg-slate-800/60 rounded-lg border border-purple-400/20 space-y-3">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-3">
                <User className={`w-5 h-5 ${getRoleColor(user.role).includes('red') ? 'text-red-400' : getRoleColor(user.role).includes('blue') ? 'text-blue-400' : 'text-green-400'}`} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">
                    {user.name || user.email}
                  </div>
                  <div className={`mt-1 inline-block px-2 py-1 rounded border text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </div>
                </div>
              </div>

              {/* Profile Edit Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowProfileModal(true);
                }}
                className="flex items-center justify-center w-full px-4 py-2 text-sm bg-slate-800/60 text-white rounded-lg hover:bg-slate-700/80 transition-all shadow-md border border-purple-400/20 mb-2"
              >
                <Settings className="w-4 h-4 mr-2 text-purple-400" />
                <span>Edit Profile</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center w-full px-4 py-2 text-sm bg-red-600/40 bg-slate-800/95 text-white rounded-lg hover:bg-red-500/50 transition-all shadow-md border border-red-400/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Profile Edit Modal */}
        {showProfileModal && user && (
          <ProfileEditModal
            user={user}
            onClose={() => {
              setShowProfileModal(false);
              checkAuth(); // Refresh user data
            }}
          />
        )}
      </div>
    </div>
  );
}

// Profile Edit Modal Component
function ProfileEditModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber.trim(),
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 rounded-2xl shadow-2xl w-full max-w-md p-8 border-2 border-purple-500/30 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg shadow-purple-500/50">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-purple-200">Edit Profile</h2>
        </div>

        {success && (
          <div className="p-3 mb-4 bg-green-900/50 border border-green-500/50 text-green-300 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg">
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
            <label className="block text-sm font-medium text-slate-200 mb-2">Phone Number</label>
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
              New Password <span className="text-xs text-slate-400">(leave blank to keep current)</span>
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

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!emailError || !!phoneError || (!!formData.password && !!passwordError)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(UserHeader);
