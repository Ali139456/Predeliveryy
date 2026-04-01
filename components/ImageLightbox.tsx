'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

export default function ImageLightbox({ isOpen, imageUrl, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-2xl w-full mx-4 bg-slate-800 rounded-xl shadow-2xl border-2 border-[#3833FF]/30 p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1.5 transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="relative w-full aspect-square max-h-[70vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Full size image"
            className="w-full h-full object-contain rounded-lg"
            decoding="async"
            referrerPolicy="same-origin"
          />
        </div>
      </div>
    </div>
  );
}

