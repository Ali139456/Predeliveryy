'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, KeyRound } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4">
      <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-2xl w-full max-w-md p-8 border-2 border-purple-500/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-2">Pre delivery inspection</h1>
          <p className="text-purple-200">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-900/50 border-2 border-red-500/50 rounded-xl flex items-start bg-slate-800/95">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-4 mb-2">
              <label className="block text-sm font-semibold text-slate-200">
                {usePhone ? 'Phone Number' : 'Email Address'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setUsePhone(!usePhone);
                  setEmail('');
                  setPhoneNumber('');
                }}
                className="text-xs text-purple-300 hover:text-purple-200 hover:underline transition-colors"
              >
                {usePhone ? 'Use Email' : 'Use Phone'}
              </button>
            </div>
            <div className="relative">
              {usePhone ? (
                <>
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
                    placeholder="+1234567890"
                  />
                </>
              ) : (
                <>
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
                    placeholder="your@email.com"
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-200">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-purple-300 hover:text-purple-200 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
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

        {/* Reset Password Modal */}
        {showResetPassword && (
          <div className="fixed inset-0 bg-black/70 bg-slate-800/95 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/95 rounded-2xl shadow-2xl w-full max-w-md p-8 border-2 border-purple-500/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
                  Reset Password
                </h2>
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setResetMessage(null);
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {resetMessage && (
                <div className="p-4 bg-green-900/50 border-2 border-green-500/50 rounded-xl flex items-start mb-4 bg-slate-800/95">
                  <AlertCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">{resetMessage}</p>
                </div>
              )}

              {error && !resetMessage && (
                <div className="p-4 bg-red-900/50 border-2 border-red-500/50 rounded-xl flex items-start mb-4 bg-slate-800/95">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="block text-sm font-semibold text-slate-200">
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
                        className="text-xs text-purple-300 hover:text-purple-200 hover:underline transition-colors"
                      >
                        {resetUsePhone ? 'Use Email' : 'Use Phone'}
                      </button>
                    </div>
                    <div className="relative">
                      {resetUsePhone ? (
                        <>
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={resetPhone}
                            onChange={(e) => setResetPhone(e.target.value)}
                            required
                            disabled={resetLoading}
                            className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 disabled:opacity-50"
                            placeholder="+1234567890"
                          />
                        </>
                      ) : (
                        <>
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            disabled={resetLoading}
                            className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 disabled:opacity-50"
                            placeholder="your@email.com"
                          />
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {resetUsePhone 
                        ? 'Enter your phone number and we'll send you an OTP to reset your password.'
                        : 'Enter your email address and we'll send you instructions to reset your password.'}
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
                      className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
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
                  if (newPassword.length < 6) {
                    setError('Password must be at least 6 characters');
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
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70 text-center text-2xl tracking-widest font-bold"
                      placeholder="000000"
                    />
                    <p className="mt-2 text-xs text-slate-400 text-center">
                      Enter the 6-digit OTP sent to {resetPhone}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
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
                      className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading || otp.length !== 6 || !newPassword || !confirmPassword}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
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
    </div>
  );
}

