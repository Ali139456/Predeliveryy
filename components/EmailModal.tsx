'use client';

import { useState, useEffect } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emails: string[]) => Promise<void>;
  inspectionNumber?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default function EmailModal({ isOpen, onClose, onSend, inspectionNumber }: EmailModalProps) {
  const [emails, setEmails] = useState(['', '', '']);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyErrorToClipboard = () => {
    if (!error) return;
    navigator.clipboard.writeText(error).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (isOpen) {
      setEmails(['', '', '']);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const setEmailAt = (idx: number, value: string) => {
    setEmails((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const rawList = emails.map((e) => e.trim()).filter(Boolean);
    if (rawList.length === 0) {
      setError('Enter at least one email address');
      return;
    }

    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const addr of rawList) {
      const lower = addr.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      if (!validateEmail(addr)) {
        setError(`Invalid email: ${addr}`);
        return;
      }
      deduped.push(addr);
    }

    if (deduped.length > 3) {
      setError('Maximum 3 email addresses');
      return;
    }

    setSending(true);
    try {
      await onSend(deduped);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setEmails(['', '', '']);
        setSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 bg-slate-800/95" onClick={onClose} />

      <div className="relative glass rounded-xl shadow-soft w-full max-w-sm animate-slide-up">
        <div className="flex items-start justify-between gap-2 p-4 border-b border-gray-200">
          <div className="flex items-start min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3 shrink-0">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Send report</h2>
              {inspectionNumber && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{inspectionNumber}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            disabled={sending}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <p className="text-xs text-gray-600">Up to 3 recipients (optional fields can stay empty).</p>

          {[0, 1, 2].map((idx) => (
            <div key={idx}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email {idx + 1}
                {idx === 0 && <span className="text-red-500"> *</span>}
              </label>
              <input
                type="email"
                value={emails[idx]}
                onChange={(e) => setEmailAt(idx, e.target.value)}
                placeholder={idx === 0 ? 'name@example.com' : 'Optional'}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF]"
                disabled={sending || success}
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-700 font-medium whitespace-pre-wrap break-words max-h-20 overflow-y-auto">
                  {error}
                </p>
                {error.includes('RESEND_FROM_EMAIL') && (
                  <p className="text-[11px] text-red-600 mt-1.5 font-semibold leading-snug">
                    Quick fix: In Vercel → Project → Settings → Environment Variables, add RESEND_FROM_EMAIL = Pre Delivery &lt;noreply@predelivery.ai&gt; then redeploy.
                  </p>
                )}
                <button
                  type="button"
                  onClick={copyErrorToClipboard}
                  className="mt-1.5 text-[11px] text-red-600 hover:text-red-800 underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy error'}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-start animate-fade-in">
              <CheckCircle className="w-4 h-4 text-accent-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-accent-700 font-medium">Sent. Closing…</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || success}
              className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
