'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '@/lib/siteLogo';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const emailParam = searchParams.get('email')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const missingLink = !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/complete-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Could not reset password');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/login?reset=1'), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0033FF] via-[#0029CC] to-[#001a80]">
      <nav className="border-b border-white/10 bg-[#0033FF]/95 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <Link
              href="/"
              className="flex shrink-0 items-center pl-0.5 transition-colors hover:opacity-90"
              aria-label="Pre Delivery home"
            >
              <Image
                src={SITE_LOGO_SRC}
                alt={SITE_LOGO_ALT}
                width={322}
                height={221}
                className="h-12 w-auto max-w-[min(280px,82vw)] object-contain object-left sm:h-16 md:h-20"
                unoptimized
                priority
              />
            </Link>
            <Link
              href="/login"
              className="flex shrink-0 items-center rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:px-5"
            >
              <Home className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative flex min-h-[calc(100dvh-6.5rem)] flex-col items-center justify-center p-4 py-8 sm:p-6">
        <div className="relative w-full max-w-md min-w-0">
          <div className="rounded-2xl border border-[#0033FF]/20 bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8 md:p-10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] mb-4 shadow-lg shadow-[#0033FF]/40">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
              {emailParam ? (
                <p className="mt-2 text-sm text-gray-600 break-all">{emailParam}</p>
              ) : null}
            </div>

            {missingLink ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500" />
                <p className="text-gray-700 text-sm">
                  This reset link is missing a token. Open the link from your latest email, or request a new reset from
                  the login page.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-[#0033FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0029CC]"
                >
                  Back to login
                </Link>
              </div>
            ) : done ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <p className="text-gray-800 font-medium">Your password has been updated.</p>
                <p className="text-sm text-gray-600">Taking you to sign in…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Use at least 8 characters with uppercase, lowercase, a number, and a special character.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#0033FF] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0029CC] disabled:opacity-60"
                >
                  {loading ? 'Saving…' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0033FF] via-[#0029CC] to-[#001a80] text-white text-sm">
      Loading…
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
