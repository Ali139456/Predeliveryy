'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, LayoutDashboard, Home, Menu, X, MoreVertical, Settings, Edit } from 'lucide-react';

function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    // Skip auth check on login page
    if (pathname === '/login') {
      return;
    }
    
    setLoading(true);
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
  }, [pathname]);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

  // Render navbar immediately - show logged out state while loading
  if (!user) {
    return (
      <div className="bg-black shadow-lg border-b border-[#3833FF]/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-[#3833FF] transition-colors flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#3833FF] flex items-center justify-center mr-2 border border-[#3833FF]/30">
                <span className="text-white font-bold text-xs sm:text-sm">HI</span>
              </div>
              <span className="hidden sm:inline">Pre delivery inspection</span>
              <span className="sm:hidden">Pre delivery</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center px-4 sm:px-6 py-2 text-xs sm:text-sm bg-[#3833FF] text-white rounded-lg hover:bg-[#3833FF]/90 transition-all shadow-lg hover:shadow-xl font-semibold border border-[#3833FF]/30"
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
    <div className="bg-black shadow-lg border-b border-[#3833FF]/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-[#3833FF] transition-colors flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#3833FF] flex items-center justify-center mr-2 border border-[#3833FF]/30">
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
                  ? 'bg-[#3833FF] text-white border-[#3833FF]/50 shadow-[#3833FF]/50'
                  : 'bg-black/50 text-white hover:bg-black/70 border-[#3833FF]/30 hover:border-[#3833FF]/50'
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
                    ? 'bg-[#3833FF] text-white border-[#3833FF]/50 shadow-[#3833FF]/50'
                    : 'bg-white text-black hover:bg-gray-50 border-[#3833FF]/30 hover:border-[#3833FF]/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* User Info Section */}
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-[#3833FF]/30">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-lg border border-[#3833FF]/30">
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
                  className="flex items-center px-3 py-2 text-sm bg-black/50 text-white rounded-lg hover:bg-black/70 transition-all shadow-md hover:shadow-lg border border-[#3833FF]/30 hover:scale-105"
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
                    <div className="absolute right-0 mt-2 w-56 bg-black rounded-lg shadow-xl border-2 border-[#3833FF]/30 z-20 overflow-hidden">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setShowProfileModal(true);
                          }}
                          className="w-full flex items-center px-4 py-3 text-left text-sm text-white hover:bg-black/80 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3 text-[#3833FF]" />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/30 transition-colors"
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
            className="lg:hidden flex items-center justify-center w-10 h-10 text-white hover:bg-[#3833FF]/50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Full Screen Menu */}
            <div className="fixed inset-0 bg-black z-50 lg:hidden flex flex-col">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#3833FF]/30">
                <Link href="/" className="text-lg font-bold text-white hover:text-[#3833FF] transition-colors flex items-center" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-[#3833FF] flex items-center justify-center mr-2 border border-[#3833FF]/30">
                    <span className="text-white font-bold text-sm">HI</span>
                  </div>
                  <span>PD</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-10 h-10 text-white hover:bg-[#3833FF]/50 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                {/* Home Button */}
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center w-full px-4 py-4 rounded-lg font-semibold transition-all shadow-md border-2 ${
                    pathname === '/'
                      ? 'bg-[#3833FF] text-white border-white'
                      : 'bg-black/50 text-white border-white hover:bg-black/70'
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
                    className={`flex items-center w-full px-4 py-4 rounded-lg font-semibold transition-all shadow-md border-2 ${
                      pathname === '/admin'
                        ? 'bg-[#3833FF] text-white border-white'
                        : 'bg-black/50 text-white border-white hover:bg-black/70'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* User Info Section */}
                <div className="px-4 py-4 bg-black/50 rounded-lg border-2 border-white space-y-4 mt-4">
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
                    className="flex items-center justify-center w-full px-4 py-3 text-sm bg-black/70 text-white rounded-lg hover:bg-black/90 transition-all shadow-md border-2 border-white"
                  >
                    <Settings className="w-4 h-4 mr-2 text-[#3833FF]" />
                    <span>Edit Profile</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all shadow-md border-2 border-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </>
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
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-2 border-[#3833FF]/30 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/60 hover:text-black transition-colors"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#3833FF] flex items-center justify-center mr-4 shadow-lg shadow-[#3833FF]/50">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black">Edit Profile</h2>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 hover:bg-white focus:bg-white focus:hover:bg-white"
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
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 hover:bg-white focus:bg-white focus:hover:bg-white ${
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
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 hover:bg-white focus:bg-white focus:hover:bg-white ${
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
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 hover:bg-white focus:bg-white focus:hover:bg-white ${
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
              className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!emailError || !!phoneError || (!!formData.password && !!passwordError)}
              className="flex-1 px-4 py-2 bg-[#3833FF] text-white rounded-lg hover:bg-[#3833FF]/90 disabled:opacity-50 transition-all shadow-lg shadow-[#3833FF]/50"
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
