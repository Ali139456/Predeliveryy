'use client';

import { useState, useEffect } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emails: string[]) => Promise<void>;
  inspectionNumber?: string;
}

export default function EmailModal({ isOpen, onClose, onSend, inspectionNumber }: EmailModalProps) {
  const [input, setInput] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
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
      setInput('');
      setEmailList([]);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const addEmail = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    if (!validateEmail(next)) {
      setError(`Invalid email address: ${next}`);
      return;
    }
    if (emailList.some((e) => e.toLowerCase() === next.toLowerCase())) return;
    if (emailList.length >= 3) {
      setError('Maximum 3 email addresses');
      return;
    }
    setEmailList((prev) => [...prev, next]);
    setInput('');
    setError(null);
  };

  const removeEmail = (idx: number) => {
    setEmailList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const finalList = [...emailList];
    // If user typed a last email without pressing enter/comma
    if (input.trim()) {
      if (finalList.length >= 3) {
        setError('Maximum 3 email addresses');
        return;
      }
      if (!validateEmail(input.trim())) {
        setError(`Invalid email address: ${input.trim()}`);
        return;
      }
      finalList.push(input.trim());
    }

    if (finalList.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    setSending(true);
    try {
      await onSend(finalList);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setInput('');
        setEmailList([]);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 bg-slate-800/95"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass rounded-2xl shadow-soft w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mr-4">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Send Email Report</h2>
              {inspectionNumber && (
                <p className="text-sm text-gray-500">Inspection: {inspectionNumber}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={sending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Addresses <span className="text-red-500">*</span>
            </label>
            <div className="w-full px-4 py-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#0033FF] focus-within:border-[#0033FF] bg-white text-black">
              <div className="flex flex-wrap gap-2 mb-2">
                {emailList.map((email, idx) => (
                  <span
                    key={`${email}-${idx}`}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-800 border border-gray-200"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(idx)}
                      disabled={sending || success}
                      className="text-gray-500 hover:text-gray-800"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addEmail(input.replace(/,+$/, ''));
                  }
                  if (e.key === 'Backspace' && !input && emailList.length) {
                    removeEmail(emailList.length - 1);
                  }
                }}
                onBlur={() => addEmail(input)}
                placeholder="Type an email and press Enter (max 3)"
                className="w-full outline-none bg-white text-black placeholder-gray-400"
                disabled={sending || success}
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <p className="text-xs text-gray-500 mt-2">
                Up to 3 recipients. Press Enter after each address.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-700 font-medium whitespace-pre-wrap break-words max-h-24 overflow-y-auto pr-1">{error}</p>
                {error.includes('RESEND_FROM_EMAIL') && (
                  <p className="text-xs text-red-600 mt-2 font-semibold">
                    Quick fix: In Vercel → Project → Settings → Environment Variables, add RESEND_FROM_EMAIL = Pre Delivery &lt;noreply@predelivery.ai&gt; then redeploy.
                  </p>
                )}
                <button
                  type="button"
                  onClick={copyErrorToClipboard}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy instructions'}
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-accent-50 border-2 border-accent-200 rounded-xl flex items-start animate-fade-in">
              <CheckCircle className="w-5 h-5 text-accent-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-accent-700 font-medium">
                Email sent successfully! The report has been delivered to all recipients.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || success}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

