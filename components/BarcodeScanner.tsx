'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, X, Upload, Loader2, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  parseVinPlateText,
  primaryScanValue,
  scanTypeFromParse,
  type VinPlateParseResult,
} from '@/lib/vin-plate-parser';

export interface VehicleScanPayload {
  raw: string;
  type: 'VIN' | 'COMPLIANCE' | 'OTHER';
  vin?: string;
  make?: string;
  model?: string;
  engine?: string;
}

interface BarcodeScannerProps {
  onScan: (payload: VehicleScanPayload) => void;
  value?: string;
  scanType?: 'VIN' | 'COMPLIANCE' | 'ANY';
  readOnly?: boolean;
}

// VIN validation: 17 characters, alphanumeric, excludes I, O, Q
const isValidVIN = (code: string): boolean => {
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(code) && code.length === 17;
};

// Compliance plate detection (Australian format examples)
const isCompliancePlate = (code: string): boolean => {
  const compliancePatterns = [
    /^[A-Z]{2,3}\d{6,8}$/i,
    /^COMP\d+/i,
    /^PLATE\d+/i,
  ];
  return compliancePatterns.some((pattern) => pattern.test(code));
};

function payloadFromBarcode(code: string, type: 'VIN' | 'COMPLIANCE' | 'OTHER'): VehicleScanPayload {
  const parsed = parseVinPlateText(code);
  if (type === 'VIN' && isValidVIN(code)) {
    return {
      raw: code,
      type: 'VIN',
      vin: code.toUpperCase(),
      make: parsed.make,
      model: parsed.model,
      engine: parsed.engine,
    };
  }
  return {
    raw: code,
    type,
    vin: parsed.vin,
    make: parsed.make,
    model: parsed.model,
    engine: parsed.engine,
  };
}

function payloadFromOcrText(
  text: string,
  apiParsed?: {
    vin?: string | null;
    make?: string | null;
    model?: string | null;
    engine?: string | null;
  } | null
): VehicleScanPayload {
  const local = parseVinPlateText(text);
  const vin = apiParsed?.vin ?? local.vin;
  const make = apiParsed?.make ?? local.make;
  const model = apiParsed?.model ?? local.model;
  const engine = apiParsed?.engine ?? local.engine;
  const norm = (v: string | null | undefined) => (v == null ? undefined : v);
  const merged: VinPlateParseResult = {
    rawText: text,
    vin: norm(vin),
    make: norm(make),
    model: norm(model),
    engine: norm(engine),
  };
  const type = scanTypeFromParse(merged);
  return {
    raw: text,
    type,
    vin: merged.vin,
    make: merged.make,
    model: merged.model,
    engine: merged.engine,
  };
}

export default function BarcodeScanner({ onScan, value, scanType = 'ANY', readOnly = false }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [lastScanSummary, setLastScanSummary] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerStartPendingRef = useRef(false);
  const scannerStartGenerationRef = useRef(0);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const emitScan = (payload: VehicleScanPayload) => {
    const primary = payload.vin || primaryScanValue({ ...payload, rawText: payload.raw });
    if (!primary) {
      setError('No vehicle ID detected. Try a closer, well-lit photo of the compliance plate.');
      return;
    }
    const parts: string[] = [];
    if (payload.vin) parts.push(`VIN ${payload.vin}`);
    if (payload.make) parts.push(payload.make);
    if (payload.model) parts.push(`Model ${payload.model}`);
    setLastScanSummary(parts.length ? parts.join(' · ') : primary.slice(0, 40));
    onScan({ ...payload, raw: primary });
    setError(null);
  };

  const startScanning = () => {
    if (scannerRef.current || scannerStartPendingRef.current) return;
    setError(null);
    setIsScanning(true);
    scannerStartPendingRef.current = true;
    const gen = ++scannerStartGenerationRef.current;
    window.setTimeout(async () => {
      if (gen !== scannerStartGenerationRef.current) {
        scannerStartPendingRef.current = false;
        return;
      }
      const el = document.getElementById('scanner-container');
      if (!el) {
        setError('Scanner could not start. Please try again.');
        setIsScanning(false);
        scannerStartPendingRef.current = false;
        return;
      }
      const scanner = new Html5Qrcode('scanner-container');
      let lastErr: unknown;
      try {
        const tryConfigs = [{ facingMode: 'environment' } as const, { facingMode: 'user' } as const];
        let started = false;
        for (const cameraConfig of tryConfigs) {
          try {
            await scanner.start(
              cameraConfig,
              {
                fps: 10,
                qrbox: { width: 280, height: 180 },
              },
              (decodedText) => {
                let detectedType: 'VIN' | 'COMPLIANCE' | 'OTHER' = 'OTHER';

                if (isValidVIN(decodedText)) {
                  detectedType = 'VIN';
                  if (scanType === 'VIN' || scanType === 'ANY') {
                    emitScan(payloadFromBarcode(decodedText, detectedType));
                    void stopScanning();
                    return;
                  }
                } else if (isCompliancePlate(decodedText)) {
                  detectedType = 'COMPLIANCE';
                  if (scanType === 'COMPLIANCE' || scanType === 'ANY') {
                    emitScan(payloadFromBarcode(decodedText, detectedType));
                    void stopScanning();
                    return;
                  }
                } else if (scanType === 'ANY') {
                  emitScan(payloadFromBarcode(decodedText, detectedType));
                  void stopScanning();
                  return;
                }
              },
              () => {}
            );
            if (gen !== scannerStartGenerationRef.current) {
              try {
                await scanner.stop();
                scanner.clear();
              } catch {
                /* */
              }
              setIsScanning(false);
              return;
            }
            started = true;
            scannerRef.current = scanner;
            break;
          } catch (e) {
            lastErr = e;
            try {
              await scanner.stop();
              scanner.clear();
            } catch {
              /* */
            }
          }
        }
        if (!started) {
          try {
            scanner.clear();
          } catch {
            /* */
          }
          throw lastErr ?? new Error('Failed to start scanner');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (/Permission|NotAllowed|denied/i.test(msg)) {
          setError('Camera access was blocked. Allow camera for this site, or use Photo scan / Upload.');
        } else if (/HTTPS|secure context/i.test(msg)) {
          setError('Camera needs HTTPS. Use Photo scan or Upload image on this device.');
        } else {
          setError(msg || 'Failed to start scanner');
        }
        setIsScanning(false);
        scannerRef.current = null;
      } finally {
        scannerStartPendingRef.current = false;
      }
    }, 0);
  };

  const stopScanning = async () => {
    scannerStartGenerationRef.current += 1;
    scannerStartPendingRef.current = false;
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        /* */
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processImageWithOCR = async (imageBase64: string) => {
    setIsProcessingOCR(true);
    setError(null);
    setOcrImagePreview(imageBase64);
    setLastScanSummary(null);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageBase64,
          provider: 'auto',
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        text?: string;
        error?: string;
        parsed?: {
          vin?: string | null;
          make?: string | null;
          model?: string | null;
          engine?: string | null;
        };
      };

      if (!response.ok) {
        throw new Error(result.error || `OCR request failed (${response.status})`);
      }

      if (result.success && result.text) {
        const payload = payloadFromOcrText(result.text, result.parsed ?? undefined);
        if (!payload.vin && !payload.make && !payload.model) {
          throw new Error(
            'Could not read VIN or vehicle details. Zoom in on the compliance plate, hold steady, and ensure good lighting.'
          );
        }
        emitScan(payload);
      } else {
        throw new Error(result.error || 'OCR extraction failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process image with OCR';
      setError(msg);
      console.error('OCR error:', err);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }
    try {
      const imageBase64 = await fileToBase64(file);
      await processImageWithOCR(imageBase64);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div className="space-y-4 min-w-0 w-full max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
        <label className="text-sm font-medium text-black shrink-0 min-w-0">
          Vehicle ID scan
        </label>
        {!readOnly && (
          <div className="flex flex-wrap gap-2 min-w-0 w-full sm:w-auto sm:justify-end">
            {!isScanning ? (
              <>
                <button
                  type="button"
                  onClick={startScanning}
                  className="flex items-center justify-center px-3 py-2 sm:px-4 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 shadow-md text-sm whitespace-nowrap shrink-0"
                >
                  <QrCode className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Barcode scan</span>
                  <span className="sm:hidden">Barcode</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessingOCR}
                  className="flex items-center justify-center px-3 py-2 sm:px-4 bg-[#0033FF] text-white rounded-lg hover:bg-[#0029CC] shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap shrink-0"
                >
                  {isProcessingOCR ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin flex-shrink-0" />
                  ) : (
                    <Camera className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  )}
                  <span className="hidden sm:inline">Photo scan (plate)</span>
                  <span className="sm:hidden">Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingOCR}
                  className="flex items-center justify-center px-3 py-2 sm:px-4 bg-[#0033FF]/90 text-white rounded-lg hover:bg-[#0033FF]/80 border-2 border-[#0033FF]/50 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap shrink-0"
                >
                  {isProcessingOCR ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 sm:mr-2 animate-spin flex-shrink-0" />
                      <span className="hidden sm:inline">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Upload image</span>
                      <span className="sm:hidden">Upload</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={stopScanning}
                className="flex items-center justify-center px-3 py-2 sm:px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 shadow-md text-sm whitespace-nowrap shrink-0"
              >
                <X className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                Stop scanning
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        For compliance / VIN plates (like Audi, BMW stickers), use <strong>Photo scan</strong> or{' '}
        <strong>Upload image</strong> after zooming in. Barcode scan is for QR/barcodes only.
      </p>

      {value && (
        <input
          type="text"
          value={value}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black"
        />
      )}

      {lastScanSummary && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Detected: {lastScanSummary}
        </p>
      )}

      <div className="relative" hidden={!isScanning}>
        <div
          id="scanner-container"
          ref={scannerContainerRef}
          className="w-full max-w-md mx-auto min-h-[260px] rounded-lg bg-black/[0.03]"
        />
        {isScanning && (
          <p className="text-sm text-gray-600 text-center mt-2">
            Point at a barcode or QR on the vehicle. For VIN plates, stop and use Photo scan instead.
          </p>
        )}
      </div>

      {ocrImagePreview && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 font-medium">OCR preview</p>
          <img
            src={ocrImagePreview}
            alt="OCR preview"
            className="max-w-full h-auto rounded-lg border-2 border-gray-300"
            style={{ maxHeight: '200px' }}
          />
          <button
            type="button"
            onClick={() => setOcrImagePreview(null)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear preview
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
