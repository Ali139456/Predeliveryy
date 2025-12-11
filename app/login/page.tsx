'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setResetMessage('Password reset instructions have been sent to your email.');
        setResetEmail('');
        setTimeout(() => {
          setShowResetPassword(false);
          setResetMessage(null);
        }, 3000);
      } else {
        setError(data.error || 'Failed to send reset email');
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
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
                placeholder="your@email.com"
              />
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

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-slate-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 hover:bg-slate-600/70"
                      placeholder="your@email.com"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmail('');
                      setResetMessage(null);
                      setError(null);
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
                        Send Reset Link
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

