'use client';

import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  label: string;
  value?: string;
  height?: number;
  readOnly?: boolean;
}

function readContainerSize(el: HTMLElement, heightHint?: number) {
  const w = Math.floor(el.getBoundingClientRect().width);
  if (w < 40) return null;
  const width = Math.min(Math.max(w, 200), 1200);
  const height = heightHint ?? Math.max(160, Math.round(width * 0.38));
  return { width, height };
}

export default function SignaturePad({
  onSave,
  label,
  value,
  height: heightHint,
  readOnly = false,
}: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null);
  /** Preview uses the saved PNG so on-screen matches the report; pad is for drawing only. */
  const [mode, setMode] = useState<'pad' | 'preview'>(value ? 'preview' : 'pad');

  const applySizeFromEl = (el: HTMLElement | null) => {
    if (!el) return;
    const next = readContainerSize(el, heightHint);
    if (!next) return;
    setMeasured((prev) =>
      prev && prev.width === next.width && prev.height === next.height ? prev : next
    );
  };

  useLayoutEffect(() => {
    applySizeFromEl(measureRef.current);
  }, [heightHint]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => applySizeFromEl(el));
    ro.observe(el);
    return () => ro.disconnect();
  }, [heightHint]);

  const boxHeight = measured?.height ?? heightHint ?? 180;

  useEffect(() => {
    if (value) {
      setMode('preview');
      setIsEmpty(false);
    } else {
      setMode('pad');
      setIsEmpty(true);
    }
  }, [value]);

  const clear = () => {
    sigPadRef.current?.clear();
    setIsEmpty(true);
    setMode('pad');
    onSave('');
  };

  const save = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataURL = sigPadRef.current.toDataURL('image/png');
      onSave(dataURL);
      setIsEmpty(false);
      setMode('preview');
    }
  };

  const handleEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataURL = sigPadRef.current.toDataURL('image/png');
      onSave(dataURL);
      setIsEmpty(false);
      setMode('preview');
    }
  };

  const startResign = () => {
    if (readOnly) return;
    setMode('pad');
    setIsEmpty(true);
    onSave('');
    requestAnimationFrame(() => sigPadRef.current?.clear());
  };

  const showPad = mode === 'pad' && !readOnly;
  const showPreview = mode === 'preview' && !!value;

  return (
    <div className="space-y-2 w-full max-w-full min-w-0">
      <label className="block text-sm font-medium text-black mb-2">{label}</label>
      <div
        ref={measureRef}
        className="border-2 border-gray-300 rounded-lg bg-white relative w-full max-w-full min-w-0 overflow-hidden"
        style={{ height: boxHeight }}
      >
        {showPreview ? (
          <img
            src={value}
            alt="Saved signature"
            className="block w-full h-full object-contain bg-white p-1"
          />
        ) : showPad ? (
          <SignatureCanvas
            ref={sigPadRef}
            clearOnResize={false}
            canvasProps={{
              className: 'block w-full h-full touch-none',
              style: { width: '100%', height: '100%', touchAction: 'none' },
            }}
            onEnd={handleEnd}
            backgroundColor="#ffffff"
            penColor="#000000"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400 text-sm">No signature</p>
          </div>
        )}

        {showPad && isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Sign here</p>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {showPreview ? (
            <button
              type="button"
              onClick={startResign}
              className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Re-sign
            </button>
          ) : (
            <>
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
                className="flex items-center justify-center px-3 py-1.5 text-sm bg-[#0033FF] text-white rounded-lg hover:bg-[#0029CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                Save Signature
              </button>
            </>
          )}
        </div>
      )}

      {showPreview && (
        <div className="p-2 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-xs text-green-700">✓ Signature saved</p>
        </div>
      )}
    </div>
  );
}
