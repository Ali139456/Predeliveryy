'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-gradient-to-r from-green-600/95 to-emerald-600/95 border-green-400/50 text-white shadow-green-500/50',
    error: 'bg-gradient-to-r from-red-600/95 to-rose-600/95 border-red-400/50 text-white shadow-red-500/50',
    info: 'bg-gradient-to-r from-blue-600/95 to-cyan-600/95 border-blue-400/50 text-white shadow-blue-500/50',
  };

  const Icon = icons[type];

  if (!visible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border-2 shadow-2xl backdrop-blur-sm flex items-center gap-3 min-w-[320px] max-w-md animate-slide-up ${colors[type]}`}>
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <p className="flex-1 text-sm font-semibold">{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 hover:opacity-70 transition-opacity p-1 rounded hover:bg-white/10"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

