'use client';

import { useEffect } from 'react';
import Image from 'next/image';
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
      <div className="relative max-w-2xl w-full mx-4 bg-slate-800 rounded-xl shadow-2xl border-2 border-purple-500/30 p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1.5 transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="relative w-full aspect-square max-h-[70vh]">
          <Image
            src={imageUrl}
            alt="Full size image"
            width={800}
            height={800}
            className="w-full h-full object-contain rounded-lg"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

