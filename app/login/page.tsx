'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Mail, Lock, AlertCircle, KeyRound, Home } from 'lucide-react';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '@/lib/siteLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [usePhone, setUsePhone] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetUsePhone, setResetUsePhone] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  /** Remount inputs so browser autofill cannot leave stale values after we clear state */
  const [loginInputKey, setLoginInputKey] = useState(0);
  const prevPathnameRef = useRef<string | null>(null);

  /** Clear when navigating *to* /login from another route (not on first mount / refresh). */
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    if (pathname !== '/login') return;
    if (prev === null || prev === '/login') return;
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setError(null);
    setLoginInputKey((k) => k + 1);
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loginData = usePhone 
        ? { phoneNumber: phoneNumber.trim(), password }
        : { email: email.toLowerCase(), password };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        setEmail('');
        setPhoneNumber('');
        setPassword('');
        setError(null);
        setLoginInputKey((k) => k + 1);
        const redirectParam =
          typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;
        const safeRedirect = (() => {
          if (!redirectParam || redirectParam.includes('://') || redirectParam.includes('\\')) return null;
          const pathPart = redirectParam.split('?')[0];
          if (!pathPart.startsWith('/') || pathPart.startsWith('//')) return null;
          if (
            pathPart.startsWith('/inspections') ||
            pathPart.startsWith('/inspection/') ||
            pathPart.startsWith('/admin')
          ) {
            return redirectParam;
          }
          return null;
        })();
        if (safeRedirect) {
          router.push(safeRedirect);
        } else if (data.user.role === 'admin' || data.user.role === 'manager') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
        setEmail('');
        setPhoneNumber('');
        setPassword('');
        setLoginInputKey((k) => k + 1);
        // Autofill can repopulate after React clears; remount again on the next tick.
        setTimeout(() => setLoginInputKey((k) => k + 1), 0);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setLoginInputKey((k) => k + 1);
      setTimeout(() => setLoginInputKey((k) => k + 1), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);
    setError(null);

    try {
      const resetData = resetUsePhone
        ? { phoneNumber: resetPhone.trim() }
        : { email: resetEmail.toLowerCase() };

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });

      const data = await response.json();

      if (data.success) {
        if (resetUsePhone && data.requiresOTP) {
          setResetMessage('OTP has been sent to your phone number.');
          setOtpSent(true);
        } else {
          setResetMessage('Password reset instructions have been sent to your email.');
          setTimeout(() => {
            setShowResetPassword(false);
            setResetMessage(null);
            setResetEmail('');
            setResetPhone('');
            setResetUsePhone(false);
            setEmail('');
            setPhoneNumber('');
            setPassword('');
            setLoginInputKey((k) => k + 1);
          }, 3000);
        }
      } else {
        setError(data.error || 'Failed to send reset instructions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0033FF] via-[#0029CC] to-[#001a80]">
      <nav className="border-b border-white/10 bg-[#0033FF]/95 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <Link href="/" className="flex min-w-0 shrink items-center transition-colors hover:opacity-90">
              <div className="flex shrink-0 items-center overflow-hidden rounded-lg transition-all hover:scale-105">
                <Image src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} width={322} height={221} className="h-14 w-auto object-contain sm:h-20 md:h-24" unoptimized priority />
              </div>
            </Link>
            <Link
              href="/"
              className="flex shrink-0 items-center rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:px-5"
            >
              <Home className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center p-4 py-8 sm:p-6 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#FF6600]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex w-full max-w-md min-w-0 justify-center">
          <div className="relative w-full rounded-2xl border border-[#0033FF]/20 bg-white p-6 shadow-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:rounded-3xl sm:p-8 md:p-10">
            {/* Icon Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] mb-5 shadow-lg shadow-[#0033FF]/40">
                <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-sm sm:text-base">Sign in to your account to continue</p>
            </div>

              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                {error && (
                  <div role="alert" className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">
                      {error.includes('NEXT_PUBLIC_SUPABASE_URL') || error.includes('deployment platform')
                        ? 'Sign-in is temporarily unavailable. Please try again later or contact support.'
                        : error}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="block text-sm font-semibold text-black">
                      {usePhone ? 'Phone Number' : 'Email Address'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUsePhone(!usePhone);
                        setEmail('');
                        setPhoneNumber('');
                        setPassword('');
                        setError(null);
                        setLoginInputKey((k) => k + 1);
                      }}
                      className="text-xs text-[#0033FF] hover:text-[#0033FF]/80 hover:underline transition-colors font-medium"
                    >
                      {usePhone ? 'Use Email' : 'Use Phone'}
                    </button>
                  </div>
                  <div className="relative">
                    {usePhone ? (
                      <>
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          key={`login-phone-${loginInputKey}`}
                          type="tel"
                          name="tel"
                          autoComplete="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:border-gray-300 hover:bg-white focus:hover:bg-white"
                          placeholder="+1234567890"
                        />
                      </>
                    ) : (
                      <>
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          key={`login-email-${loginInputKey}`}
                          type="email"
                          name="email"
                          autoComplete="username"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:border-gray-300 hover:bg-white focus:hover:bg-white"
                          placeholder="your@email.com"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-black">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(true);
                        setError(null);
                      }}
                      className="text-sm text-[#0033FF] hover:text-[#0033FF]/80 hover:underline transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      key={`login-password-${loginInputKey}`}
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:border-gray-300 hover:bg-white focus:hover:bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white rounded-xl font-bold hover:from-[#0033FF]/90 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0033FF]/50 hover:shadow-xl hover:shadow-[#0033FF]/70 hover:scale-[1.02] transform"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0033FF]/80 p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 md:p-10 border border-white/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">
                  Reset Password
                </h2>
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setResetPhone('');
                    setResetUsePhone(false);
                    setResetMessage(null);
                    setError(null);
                    setOtpSent(false);
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setEmail('');
                    setPhoneNumber('');
                    setPassword('');
                    setLoginInputKey((k) => k + 1);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {resetMessage && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start mb-4">
                  <AlertCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 font-medium">{resetMessage}</p>
                </div>
              )}

              {error && !resetMessage && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="block text-sm font-semibold text-black">
                        {resetUsePhone ? 'Phone Number' : 'Email Address'}
                      </label>
                      <button
                        type="button"
                      onClick={() => {
                        setResetUsePhone(!resetUsePhone);
                        setResetEmail('');
                        setResetPhone('');
                        setOtpSent(false);
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                        className="text-xs text-[#0033FF] hover:text-[#0033FF]/80 hover:underline transition-colors"
                      >
                        {resetUsePhone ? 'Use Email' : 'Use Phone'}
                      </button>
                    </div>
                    <div className="relative">
                      {resetUsePhone ? (
                        <>
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={resetPhone}
                            onChange={(e) => setResetPhone(e.target.value)}
                            required
                            disabled={resetLoading}
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:border-gray-300 hover:bg-white focus:hover:bg-white disabled:opacity-50 disabled:bg-gray-100"
                            placeholder="+1234567890"
                          />
                        </>
                      ) : (
                        <>
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            disabled={resetLoading}
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:border-gray-300 hover:bg-white focus:hover:bg-white disabled:opacity-50 disabled:bg-gray-100"
                            placeholder="your@email.com"
                          />
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {resetUsePhone 
                        ? "Enter your phone number and we'll send you an OTP to reset your password."
                        : "Enter your email address and we'll send you instructions to reset your password."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetEmail('');
                        setResetPhone('');
                        setResetUsePhone(false);
                        setResetMessage(null);
                        setError(null);
                        setOtpSent(false);
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setEmail('');
                        setPhoneNumber('');
                        setPassword('');
                        setLoginInputKey((k) => k + 1);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-[#0033FF] text-white rounded-xl font-semibold hover:bg-[#0033FF]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0033FF]/50"
                    >
                      {resetLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-5 h-5 mr-2" />
                          {resetUsePhone ? 'Send OTP' : 'Send Reset Link'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                  }
                  if (newPassword.length < 8) {
                    setError('Password must be at least 8 characters long');
                    return;
                  }

                  // Validate strong password
                  if (!/[A-Z]/.test(newPassword)) {
                    setError('Password must contain at least one uppercase letter');
                    return;
                  }

                  if (!/[a-z]/.test(newPassword)) {
                    setError('Password must contain at least one lowercase letter');
                    return;
                  }

                  if (!/[0-9]/.test(newPassword)) {
                    setError('Password must contain at least one number');
                    return;
                  }

                  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
                    setError('Password must contain at least one special character');
                    return;
                  }
                  
                  setResetLoading(true);
                  setError(null);
                  
                  try {
                    const response = await fetch('/api/auth/verify-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        phoneNumber: resetPhone.trim(),
                        otp,
                        newPassword,
                      }),
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      setResetMessage('Password has been reset successfully! You can now login.');
                      setTimeout(() => {
                        setShowResetPassword(false);
                        setResetEmail('');
                        setResetPhone('');
                        setResetUsePhone(false);
                        setResetMessage(null);
                        setError(null);
                        setOtpSent(false);
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setEmail('');
                        setPhoneNumber('');
                        setPassword('');
                        setLoginInputKey((k) => k + 1);
                      }, 2000);
                    } else {
                      setError(data.error || 'Failed to reset password');
                    }
                  } catch (err: any) {
                    setError(err.message || 'Failed to reset password');
                  } finally {
                    setResetLoading(false);
                  }
                }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:bg-white focus:hover:bg-white text-center text-2xl tracking-widest font-bold"
                      placeholder="000000"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Enter the 6-digit OTP sent to {resetPhone}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:bg-white focus:hover:bg-white"
                      placeholder="Enter new password (min 8 chars)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must contain: uppercase, lowercase, number, special character
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 hover:bg-white focus:hover:bg-white"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setResetMessage(null);
                        setError(null);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading || otp.length !== 6 || !newPassword || !confirmPassword}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-[#0033FF] text-white rounded-xl font-semibold hover:bg-[#0033FF]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0033FF]/50"
                    >
                      {resetLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting...
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-5 h-5 mr-2" />
                          Reset Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

