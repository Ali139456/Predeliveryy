'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Mail, Lock, AlertCircle, KeyRound, Home } from 'lucide-react';

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
        // Redirect based on role
        if (data.user.role === 'admin' || data.user.role === 'manager') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
      {/* Blue Navbar */}
      <nav className="bg-[#0033FF]/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <Link href="/" className="flex items-center transition-colors hover:opacity-90 min-w-0 shrink">
              <div className="flex items-center shrink-0 overflow-hidden rounded-lg transition-all hover:scale-105">
                <Image src="/Pre Delivery Logo/Original Logo Transparent Background.png" alt="Pre delivery" width={220} height={64} className="h-10 sm:h-12 md:h-16 w-auto object-contain" priority />
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center px-4 sm:px-5 py-2.5 text-sm bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all border border-white/30 font-semibold shrink-0 backdrop-blur-sm"
            >
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - full blue area, form centered */}
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Soft orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#FF6600]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md min-w-0 flex justify-center">
          {/* Login Card - white bg, original font colors */}
          <div className="relative bg-white backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl w-full p-6 sm:p-8 md:p-10 border border-[#0033FF]/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
            {/* Icon Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] mb-5 shadow-lg shadow-[#0033FF]/40">
                <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-sm sm:text-base">Sign in to your account to continue</p>
            </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
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
                          type="tel"
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
                          type="email"
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
                      onClick={() => setShowResetPassword(true)}
                      className="text-sm text-[#0033FF] hover:text-[#0033FF]/80 hover:underline transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
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
        <div className="fixed inset-0 bg-[#0033FF]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 md:p-10 border border-white/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">
                  Reset Password
                </h2>
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setResetMessage(null);
                    setError(null);
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

