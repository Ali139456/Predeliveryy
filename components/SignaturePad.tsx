'use client';

import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  label: string;
  value?: string;
  width?: number;
  height?: number;
  readOnly?: boolean;
}

function readContainerSize(el: HTMLElement) {
  const w = Math.floor(el.getBoundingClientRect().width);
  if (w < 40) return null;
  const width = Math.min(Math.max(w, 200), 1200);
  const height = Math.max(140, Math.round(width * 0.42));
  return { width, height };
}

export default function SignaturePad({
  onSave,
  label,
  value,
  width: widthProp,
  height: heightProp,
  readOnly = false,
}: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null);

  const applySizeFromEl = (el: HTMLElement | null) => {
    if (!el) return;
    const next = readContainerSize(el);
    if (!next) return;
    setMeasured((prev) =>
      prev && prev.width === next.width && prev.height === next.height ? prev : next
    );
  };

  useLayoutEffect(() => {
    applySizeFromEl(measureRef.current);
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => applySizeFromEl(el));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const canvasSize =
    measured ??
    (widthProp && heightProp ? { width: widthProp, height: heightProp } : { width: 320, height: 150 });

  useEffect(() => {
    if (!value || !sigPadRef.current) return;
    try {
      sigPadRef.current.fromDataURL(value);
      setIsEmpty(false);
    } catch {
      /* ignore corrupt data URLs */
    }
  }, [value, canvasSize.width, canvasSize.height]);

  const clear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setIsEmpty(true);
      onSave('');
    }
  };

  const save = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataURL = sigPadRef.current.toDataURL('image/png');
      onSave(dataURL);
      setIsEmpty(false);
    }
  };

  const handleEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataURL = sigPadRef.current.toDataURL('image/png');
      onSave(dataURL);
      setIsEmpty(false);
    }
  };

  return (
    <div className="space-y-2 w-full max-w-full min-w-0">
      <label className="block text-sm font-medium text-black mb-2">{label}</label>
      <div
        ref={measureRef}
        className="border-2 border-gray-300 rounded-lg bg-white relative w-full max-w-full min-w-0 overflow-hidden"
      >
        <SignatureCanvas
          key={`sig-${canvasSize.width}x${canvasSize.height}`}
          ref={sigPadRef}
          canvasProps={{
            width: canvasSize.width,
            height: canvasSize.height,
            className: `block max-w-full h-auto rounded-lg touch-none ${readOnly ? 'pointer-events-none opacity-75' : ''}`,
            style: { width: '100%', height: 'auto' },
          }}
          onEnd={readOnly ? undefined : handleEnd}
          backgroundColor="#ffffff"
          penColor="#000000"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Sign here</p>
          </div>
        )}
      </div>
      {!readOnly && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <button
            type="button"
            onClick={clear}
            className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isEmpty}
            className="flex items-center justify-center px-3 py-1.5 text-sm bg-[#3833FF] text-white rounded-lg hover:bg-[#3833FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            Save Signature
          </button>
        </div>
      )}
      {value && !isEmpty && (
        <div className="p-2 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-xs text-green-700">✓ Signature saved</p>
        </div>
      )}
    </div>
  );
}
