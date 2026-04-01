'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Called with a JPEG File from the live camera (no gallery). */
  onCaptured: (file: File) => void | Promise<void>;
};

export default function CameraCaptureModal({ isOpen, onClose, onCaptured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setReady(false);
    let cancelled = false;

    const start = async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setError('Camera is not available in this browser.');
        return;
      }
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setError('Camera requires a secure connection (HTTPS).');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const el = videoRef.current;
        if (el) {
          el.srcObject = stream;
          await el.play();
          setReady(true);
        }
      } catch {
        setError('Could not open the camera. Allow permission and try again.');
      }
    };

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const el = videoRef.current;
      if (el) el.srcObject = null;
    };
  }, [isOpen]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || busy) return;
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.88)
      );
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await onCaptured(file);
    } finally {
      setBusy(false);
    }
  }, [busy, onCaptured]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80" role="dialog" aria-modal="true" aria-labelledby="camera-capture-title">
      <div className="bg-white rounded-xl max-w-lg w-full p-4 shadow-xl">
        <div className="flex justify-between items-center mb-2 gap-2">
          <h3 id="camera-capture-title" className="font-semibold text-black text-sm sm:text-base">
            Take photo
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error ? (
          <p className="text-red-600 text-sm py-4">{error}</p>
        ) : (
          <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video object-cover" playsInline muted />
        )}
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-800">
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || busy || !!error}
            onClick={() => void capture()}
            className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            {busy ? 'Saving…' : 'Capture'}
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-2 leading-snug">
          Only live camera capture is allowed—no photo library or file picker (fraud prevention).
        </p>
      </div>
    </div>
  );
}
