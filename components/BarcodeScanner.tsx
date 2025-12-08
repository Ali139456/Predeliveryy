'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string, type?: 'VIN' | 'COMPLIANCE' | 'OTHER') => void;
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
  // Common compliance plate formats
  const compliancePatterns = [
    /^[A-Z]{2,3}\d{6,8}$/i, // Format like ABC123456
    /^COMP\d+/i, // Starts with COMP
    /^PLATE\d+/i, // Starts with PLATE
  ];
  return compliancePatterns.some(pattern => pattern.test(code));
};

export default function BarcodeScanner({ onScan, value, scanType = 'ANY', readOnly = false }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('scanner-container');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          let detectedType: 'VIN' | 'COMPLIANCE' | 'OTHER' = 'OTHER';
          
          if (isValidVIN(decodedText)) {
            detectedType = 'VIN';
            if (scanType === 'VIN' || scanType === 'ANY') {
              onScan(decodedText, detectedType);
              stopScanning();
              return;
            }
          } else if (isCompliancePlate(decodedText)) {
            detectedType = 'COMPLIANCE';
            if (scanType === 'COMPLIANCE' || scanType === 'ANY') {
              onScan(decodedText, detectedType);
              stopScanning();
              return;
            }
          } else if (scanType === 'ANY') {
            onScan(decodedText, detectedType);
            stopScanning();
            return;
          }
          
          // If scan type doesn't match, continue scanning
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start scanner');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">
          {scanType === 'VIN' ? 'VIN Scanner' : scanType === 'COMPLIANCE' ? 'Compliance Plate Scanner' : 'Barcode Scanner'}
        </label>
        {!readOnly && (
          !isScanning ? (
            <button
              type="button"
              onClick={startScanning}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 shadow-md"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {scanType === 'VIN' ? 'Scan VIN' : scanType === 'COMPLIANCE' ? 'Scan Compliance Plate' : 'Scan Barcode'}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopScanning}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 shadow-md"
            >
              <X className="w-4 h-4 mr-2" />
              Stop Scanning
            </button>
          )
        )}
      </div>

      {value && (
        <input
          type="text"
          value={value}
          readOnly
          className="w-full px-4 py-2 border border-slate-500/50 rounded-lg bg-slate-600/50 text-white"
        />
      )}

      {isScanning && (
        <div className="relative">
          <div id="scanner-container" ref={scannerContainerRef} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-slate-300 text-center mt-2">
            Point your camera at a barcode to scan
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300 text-sm bg-slate-800/95">
          {error}
        </div>
      )}
    </div>
  );
}


