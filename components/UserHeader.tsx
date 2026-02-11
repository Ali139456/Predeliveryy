'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, User, LayoutDashboard, Home, Menu, X, MoreVertical, Settings, Edit } from 'lucide-react';

const LOGO_SRC = '/Pre Delivery Logo/Original logo.png';

function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Handle scroll for navbar text color change
  useEffect(() => {
    if (pathname !== '/') return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Change text color after scrolling past hero section (approximately 100vh)
      setScrolled(scrollPosition > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      setUser(null); // Clear user state immediately
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear any localStorage/sessionStorage if used
        sessionStorage.clear();
        localStorage.clear();
      }
      
      // Call logout API
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Important: include cookies
      });
      
      // Redirect to login
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Clear user state even on error
      // Force redirect even if API call fails
      router.push('/login');
      router.refresh();
    }
  }, [router]);

  // Don't show header on login page - AFTER all hooks
  if (pathname === '/login') {
    return null;
  }

  // Render navbar immediately - show logged out state while loading
  if (!user) {
    const isHomePage = pathname === '/';
    const textColor = 'text-white';
    const linkHoverColor = 'hover:text-[#FFB366]';
    const navBg = isHomePage && !scrolled ? 'bg-transparent' : 'bg-[#0040FF] shadow-lg border-b border-white/20';
    
    return (
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="transition-colors flex items-center group hover:opacity-90">
              <div className="flex items-center shrink-0 overflow-hidden rounded-lg transition-all group-hover:scale-105">
                <Image src={LOGO_SRC} alt="Pre delivery" width={220} height={64} className="h-10 w-auto sm:h-12 object-contain" priority />
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/#features" className={`${textColor} ${linkHoverColor} transition-colors font-medium text-sm`}>Features</Link>
              <Link href="/#how-it-works" className={`${textColor} ${linkHoverColor} transition-colors font-medium text-sm`}>How it Works</Link>
              <Link href="/#benefits" className={`${textColor} ${linkHoverColor} transition-colors font-medium text-sm`}>Benefits</Link>
              <Link href="/contact" className={`${textColor} ${linkHoverColor} transition-colors font-medium text-sm`}>Contact</Link>
              <Link
                href="/login"
                className="flex items-center px-5 py-2 text-sm bg-[#FF7F00] text-white rounded-lg hover:bg-[#E66A00] transition-all shadow-lg hover:shadow-xl font-semibold border border-white/30 hover:scale-105"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden flex items-center justify-center w-10 h-10 ${textColor} hover:bg-white/10 rounded-lg transition-colors`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-[#0040FF]/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 left-0 right-0 bg-[#0040FF] z-50 md:hidden border-b border-white/20">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center shrink-0 overflow-hidden rounded-lg">
                      <Image src={LOGO_SRC} alt="Pre delivery" width={220} height={64} className="h-10 w-auto object-contain" />
                    </div>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex flex-col gap-3 pb-4">
                  <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#FFB366] transition-colors font-medium py-2">Features</Link>
                  <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#FFB366] transition-colors font-medium py-2">How it Works</Link>
                  <Link href="/#benefits" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#FFB366] transition-colors font-medium py-2">Benefits</Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#FFB366] transition-colors font-medium py-2">Contact</Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-5 py-2 text-sm bg-[#FF7F00] text-white rounded-lg hover:bg-[#E66A00] transition-all font-semibold border border-white/30 mt-2"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
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
    <div className="bg-white shadow-lg border-b border-[#0040FF]/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - blue pill so white logo visible on white nav */}
          <Link href="/" className="flex items-center transition-colors hover:opacity-90">
            <div className="flex items-center shrink-0 overflow-hidden rounded-lg bg-[#0040FF]/90 p-1.5">
              <Image src={LOGO_SRC} alt="Pre delivery" width={220} height={64} className="h-10 w-auto sm:h-12 object-contain" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Home Button */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md hover:shadow-lg border ${
                pathname === '/'
                  ? 'bg-[#0040FF] text-white border-[#0040FF]/50 shadow-[#0040FF]/30'
                  : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-[#0040FF]/40'
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
                    ? 'bg-[#0040FF] text-white border-[#0040FF]/50 shadow-[#0040FF]/30'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-[#0040FF]/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* User Info Section */}
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <User className={`w-4 h-4 ${getRoleColor(user.role).includes('red') ? 'text-red-500' : getRoleColor(user.role).includes('blue') ? 'text-[#0040FF]' : 'text-green-600'}`} />
                <div className="text-gray-800">
                  <div className="text-sm font-bold text-gray-900 leading-tight">
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
                  className="flex items-center px-3 py-2 text-sm bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg border border-gray-200 hover:border-[#0040FF]/40"
                  title="Profile Menu"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[100]"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-[200] overflow-hidden pointer-events-auto">
                      <div className="py-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                            setShowProfileModal(true);
                          }}
                          className="w-full flex items-center px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer relative z-[201]"
                        >
                          <Settings className="w-4 h-4 mr-3 text-[#0040FF]" />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer relative z-[201]"
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
            className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-800 hover:bg-[#0040FF]/10 rounded-lg transition-colors"
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Full Screen Menu */}
            <div className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <Link href="/" className="flex items-center transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center shrink-0 overflow-hidden rounded-lg bg-[#0040FF]/90 p-1.5">
                    <Image src={LOGO_SRC} alt="Pre delivery" width={220} height={64} className="h-10 w-auto object-contain" />
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-10 h-10 text-gray-800 hover:bg-[#0040FF]/10 rounded-lg transition-colors"
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
                      ? 'bg-[#0040FF] text-white border-[#0040FF]'
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
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
                        ? 'bg-[#0040FF] text-white border-[#0040FF]'
                        : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* User Info Section */}
                <div className="px-4 py-4 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4 mt-4">
                  {/* User Avatar & Name */}
                  <div className="flex items-center gap-3">
                    <User className={`w-5 h-5 ${getRoleColor(user.role).includes('red') ? 'text-red-500' : getRoleColor(user.role).includes('blue') ? 'text-[#0040FF]' : 'text-green-600'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-900">
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
                    className="flex items-center justify-center w-full px-4 py-3 text-sm bg-[#0040FF] text-white rounded-lg hover:bg-[#0033CC] transition-all shadow-md border border-[#0040FF]"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Edit Profile</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-md border border-red-200"
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-2 border-[#0040FF]/30 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/60 hover:text-black transition-colors"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0040FF] flex items-center justify-center mr-4 shadow-lg shadow-[#0040FF]/50">
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
              className="flex-1 px-4 py-2 bg-[#0040FF] text-white rounded-lg hover:bg-[#0040FF]/90 disabled:opacity-50 transition-all shadow-lg shadow-[#0040FF]/50"
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
