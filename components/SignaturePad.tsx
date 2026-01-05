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
      <label className="block text-sm font-medium text-black mb-2">{label}</label>
      <div className="border-2 border-gray-300 rounded-lg bg-white relative">
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width,
            height,
            className: `w-full h-full rounded-lg ${readOnly ? 'pointer-events-none opacity-75' : ''}`,
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="flex items-center px-3 py-1.5 text-sm bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isEmpty}
            className="flex items-center px-3 py-1.5 text-sm bg-[#3833FF] text-white rounded-lg hover:bg-[#3833FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

