'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, X, Upload, Loader2 } from 'lucide-react';
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
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Convert image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process image with OCR
  const processImageWithOCR = async (imageBase64: string) => {
    setIsProcessingOCR(true);
    setError(null);
    setOcrImagePreview(imageBase64);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageBase64: imageBase64, // Send full base64 string (API will handle data URL prefix)
          provider: 'auto', // Auto-select provider
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        text?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || `OCR request failed (${response.status})`);
      }

      if (result.success && result.text) {
        const extractedText = result.text.trim();
        
        // Try to detect if it's a compliance plate
        let detectedType: 'VIN' | 'COMPLIANCE' | 'OTHER' = 'OTHER';
        if (isValidVIN(extractedText)) {
          detectedType = 'VIN';
        } else if (isCompliancePlate(extractedText) || scanType === 'COMPLIANCE') {
          detectedType = 'COMPLIANCE';
        }

        // Extract potential compliance plate numbers (alphanumeric sequences)
        const complianceMatch = extractedText.match(/[A-Z]{2,3}\d{6,8}|COMP\d+|PLATE\d+/i);
        if (complianceMatch) {
          onScan(complianceMatch[0], 'COMPLIANCE');
        } else if (extractedText.length > 0) {
          // Use the full extracted text if no specific pattern found
          onScan(extractedText, detectedType);
        } else {
          throw new Error('No text detected in the image');
        }
      } else {
        throw new Error(result.error || 'OCR extraction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process image with OCR');
      console.error('OCR error:', err);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Handle file upload for OCR
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    try {
      const imageBase64 = await fileToBase64(file);
      await processImageWithOCR(imageBase64);
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="text-sm font-medium text-black shrink-0">
          Vehicle ID scan
        </label>
        {!readOnly && (
          <div className="flex flex-wrap gap-2 min-w-0">
            {!isScanning ? (
              <>
                <button
                  type="button"
                  onClick={startScanning}
                  className="flex items-center justify-center px-3 py-2 sm:px-4 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 shadow-md text-sm whitespace-nowrap shrink-0"
                >
                  <QrCode className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Vehicle ID scan</span>
                  <span className="sm:hidden">Scan</span>
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
                      <span className="sm:hidden">...</span>
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
                <span className="hidden sm:inline">Stop Scanning</span>
                <span className="sm:hidden">Stop</span>
              </button>
            )}
          </div>
        )}
      </div>

      {value && (
        <input
          type="text"
          value={value}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black"
        />
      )}

      {isScanning && (
        <div className="relative">
          <div id="scanner-container" ref={scannerContainerRef} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-gray-600 text-center mt-2">
            Point your camera at a barcode, QR code, or compliance plate to scan
          </p>
        </div>
      )}

      {ocrImagePreview && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 font-medium">OCR Preview:</p>
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


