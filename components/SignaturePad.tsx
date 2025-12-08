'use client';

import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  label: string;
  value?: string;
  width?: number;
  height?: number;
  readOnly?: boolean;
}

export default function SignaturePad({ onSave, label, value, width = 400, height = 200, readOnly = false }: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (value && sigPadRef.current) {
      sigPadRef.current.fromDataURL(value);
      setIsEmpty(false);
    }
  }, [value]);

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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200 mb-2">{label}</label>
      <div className="border-2 border-slate-500/50 rounded-lg bg-slate-800 relative">
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width,
            height,
            className: `w-full h-full rounded-lg ${readOnly ? 'pointer-events-none opacity-75' : ''}`,
          }}
          onEnd={readOnly ? undefined : handleEnd}
          backgroundColor="#1e293b"
          penColor="#ffffff"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-400 text-sm">Sign here</p>
          </div>
        )}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="flex items-center px-3 py-1.5 text-sm bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isEmpty}
            className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Signature
          </button>
        </div>
      )}
      {value && !isEmpty && (
        <div className="p-2 bg-green-900/50 border border-green-500/50 rounded-lg bg-slate-800/95">
          <p className="text-xs text-green-300">✓ Signature saved</p>
        </div>
      )}
    </div>
  );
}

