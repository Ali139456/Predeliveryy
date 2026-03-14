'use client';

import { useState, useEffect, useRef } from 'react';

const SIMULATED_DURATION_MS = 55000;
const SIMULATED_CAP = 88;

interface PdfExportProgressProps {
  isActive: boolean;
  exportUrl: string;
  getFileName: (response: Response) => string;
  onComplete: (error?: Error) => void;
}

export default function PdfExportProgress({
  isActive,
  exportUrl,
  getFileName,
  onComplete,
}: PdfExportProgressProps) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasRunRef = useRef(false);
  const getFileNameRef = useRef(getFileName);
  const onCompleteRef = useRef(onComplete);
  getFileNameRef.current = getFileName;
  onCompleteRef.current = onComplete;

  // Simulated progress 0 → SIMULATED_CAP while waiting
  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      hasRunRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    startTimeRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(SIMULATED_CAP, (elapsed / SIMULATED_DURATION_MS) * SIMULATED_CAP);
      setProgress((prev) => Math.round(Math.max(prev, p)));
    }, 250);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  // Fetch and stream PDF, then real progress 88 → 100
  useEffect(() => {
    if (!isActive || !exportUrl || hasRunRef.current) return;
    hasRunRef.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SIMULATED_DURATION_MS);
    let cancelled = false;

    const setProgressSafe = (n: number) => {
      if (!cancelled) setProgress((prev) => Math.min(100, Math.round(Math.max(prev, n))));
    };

    (async () => {
      try {
        const response = await fetch(exportUrl, {
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (cancelled) return;

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
          throw new Error(errorData.error || `Failed to export PDF. Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          const errorData = await response.json().catch(() => null);
          if (errorData) throw new Error(errorData.error || 'Failed to generate PDF');
          throw new Error('Invalid response format. Expected PDF.');
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const body = response.body;
        if (!body) throw new Error('No response body');

        const reader = body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (cancelled) return;
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total > 0) {
            const downloadPercent = (received / total) * (100 - SIMULATED_CAP);
            setProgressSafe(SIMULATED_CAP + downloadPercent);
          }
        }

        setProgressSafe(100);
        const blob = new Blob(chunks, { type: 'application/pdf' });
        if (blob.size === 0) throw new Error('PDF file is empty');
        if (cancelled) return;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getFileNameRef.current(response);
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        onCompleteRef.current();
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          const friendly =
            message === 'Failed to fetch' || (err as Error)?.name === 'AbortError'
              ? 'Export timed out or the connection was lost. Try again; if the inspection has many photos, export may take longer.'
              : message;
          onCompleteRef.current(new Error(friendly));
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isActive, exportUrl]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 flex flex-col items-center gap-5 border-2 border-[#0033FF]/30 w-full">
        <p className="text-gray-800 font-semibold text-center">Generating PDF...</p>
        <div className="w-full">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0033FF] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-gray-600 text-sm font-medium mt-2">{progress}%</p>
        </div>
        <p className="text-gray-500 text-xs text-center">This may take 40–50 seconds for large reports</p>
      </div>
    </div>
  );
}
