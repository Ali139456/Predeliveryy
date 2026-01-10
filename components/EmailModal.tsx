'use client';

import { useState, useEffect } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emails: string[]) => Promise<void>;
  inspectionNumber?: string;
}

export default function EmailModal({ isOpen, onClose, onSend, inspectionNumber }: EmailModalProps) {
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmails('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!emails.trim()) {
      setError('Please enter at least one email address');
      return;
    }

    const emailList = emails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailList.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    // Validate all emails
    const invalidEmails = emailList.filter((email) => !validateEmail(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    setSending(true);
    try {
      await onSend(emailList);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setEmails('');
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
            <textarea
              value={emails}
              onChange={(e) => {
                setEmails(e.target.value);
                setError(null);
              }}
              placeholder="Enter email addresses separated by commas&#10;Example: john@example.com, jane@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3833FF] focus:border-[#3833FF] focus:bg-white transition-all bg-white text-black resize-none"
              rows={4}
              disabled={sending || success}
            />
            <p className="text-xs text-gray-500 mt-2">
              Separate multiple emails with commas
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
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

