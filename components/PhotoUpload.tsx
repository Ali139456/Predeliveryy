'use client';

import { useState, useRef, memo, useCallback, useEffect } from 'react';
import { Camera, X, Loader2, Sparkles } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import CameraCaptureModal from './CameraCaptureModal';
import { uploadToVercelBlobViaAPI } from '@/lib/vercelBlobClient';
import { compressInspectionImage } from '@/lib/compressInspectionImage';
import { getPhotoDisplayUrl } from '@/lib/photoDisplayUrl';
import { requestVisionDamageDetect } from '@/lib/visionDamageClient';
import { applyVisionResultToPhoto, formatAiDamageNotice } from '@/lib/applyVisionToPhoto';
import type { PhotoAiDamageMetadata } from '@/types/vision-damage';
import { isTyreWheelSlot } from '@/lib/general-photo-slots';

interface PhotoData {
  fileName: string;
  url?: string; // Cloudinary secure_url for direct access
  metadata?: {
    width?: number;
    height?: number;
    make?: string;
    model?: string;
    dateTime?: string;
    latitude?: number;
    longitude?: number;
    format?: string;
    bytes?: number;
    aiDamage?: PhotoAiDamageMetadata;
    slot?: string;
    [key: string]: unknown;
  } | null;
  damageMarkers?: { id: string; x: number; y: number; label: string }[];
}

interface PhotoUploadProps {
  photos: PhotoData[] | string[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  readOnly?: boolean;
  label?: string;
  buttonLabel?: string;
  uploadTag?: Record<string, unknown>;
  panelHint?: string;
  enableAiDamage?: boolean;
}

const TYRE_WHEEL_HINT =
  'Tyres and alloy wheels — closely inspect outer rim lips for curb rash, gouges and scrapes; wheel face scuffs; tyre sidewall abrasions and scuff marks';

const SLOT_PANEL_HINTS: Record<string, string> = {
  front: 'Front of vehicle - bonnet, grille, bumper',
  rear: 'Rear of vehicle - tailgate, bumper',
  left: 'Left side - doors and panels',
  right: 'Right side - doors and panels',
  bonnet: 'Bonnet / hood',
  tyres: TYRE_WHEEL_HINT,
  tyre_fl: TYRE_WHEEL_HINT,
  tyre_fr: TYRE_WHEEL_HINT,
  tyre_rl: TYRE_WHEEL_HINT,
  tyre_rr: TYRE_WHEEL_HINT,
};

function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 20,
  readOnly = false,
  label = 'Photos',
  buttonLabel = 'Take photo',
  uploadTag,
  panelHint,
  enableAiDamage = true,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzingFileName, setAnalyzingFileName] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const photosRef = useRef(
    (Array.isArray(photos) ? photos : []).map((p: PhotoData | string) =>
      typeof p === 'string' ? { fileName: p } : p
    )
  );

  useEffect(() => {
    photosRef.current = (Array.isArray(photos) ? photos : []).map((p: PhotoData | string) =>
      typeof p === 'string' ? { fileName: p } : p
    );
  }, [photos]);

  const resolvedPanelHint =
    panelHint ||
    (typeof uploadTag?.slot === 'string' ? SLOT_PANEL_HINTS[uploadTag.slot] : undefined) ||
    label;

  const compressImage = useCallback(async (file: File): Promise<File> => {
    const slot = typeof uploadTag?.slot === 'string' ? uploadTag.slot : undefined;
    const isTyreSlot = isTyreWheelSlot(slot);
    return compressInspectionImage(
      file,
      isTyreSlot ? { maxDim: 2560, quality: 0.94 } : { maxDim: 2048, quality: 0.92 }
    );
  }, [uploadTag?.slot]);

  const runVisionOnPhoto = useCallback(
    async (fileName: string) => {
      if (!enableAiDamage || readOnly) return;
      setAnalyzingFileName(fileName);
      setAiNotice(null);
      try {
        const res = await requestVisionDamageDetect({
          storageKey: fileName,
          itemName: label,
          panelHint: resolvedPanelHint,
          context: label,
        });
        if (!res.success) {
          if (!res.disabled) setAiNotice(res.error);
          return;
        }
        const idx = photosRef.current.findIndex((p) => p.fileName === fileName);
        if (idx < 0) return;
        const merged = applyVisionResultToPhoto(photosRef.current[idx], res.result);
        const updated = photosRef.current.map((p, i) => (i === idx ? merged : p));
        photosRef.current = updated;
        onPhotosChange(updated);
        setAiNotice(formatAiDamageNotice(res.result));
      } catch (e) {
        console.error('Vision damage detect:', e);
      } finally {
        setAnalyzingFileName(null);
      }
    },
    [enableAiDamage, label, onPhotosChange, readOnly, resolvedPanelHint]
  );

  const uploadSingleFile = useCallback(
    async (file: File) => {
      const currentPhotos = (Array.isArray(photos) ? photos : []).map((p: PhotoData | string) =>
        typeof p === 'string' ? { fileName: p } : p
      );
      if (currentPhotos.length >= maxPhotos) {
        if (typeof window !== 'undefined') alert(`Maximum ${maxPhotos} photos allowed`);
        return;
      }
      setUploading(true);
      setAiNotice(null);
      try {
        const toUpload = await compressImage(file);
        const result = await uploadToVercelBlobViaAPI(toUpload);
        const next: PhotoData = {
          fileName: result.fileName,
          url: result.url,
          metadata:
            uploadTag && Object.keys(uploadTag).length
              ? { ...(result.metadata || {}), ...uploadTag }
              : result.metadata || null,
          damageMarkers: [],
        };
        const updated = [...currentPhotos, next];
        photosRef.current = updated;
        onPhotosChange(updated);
        setCameraOpen(false);
        void runVisionOnPhoto(result.fileName);
      } catch (error: unknown) {
        if (typeof window !== 'undefined') {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please check your storage configuration.';
          alert(`Upload failed: ${errorMessage}`);
        }
        console.error('Photo upload error:', error);
      } finally {
        setUploading(false);
      }
    },
    [compressImage, maxPhotos, onPhotosChange, photos, uploadTag, runVisionOnPhoto]
  );

  const removePhoto = (index: number) => {
    const newPhotos = photos
      .filter((_, i) => i !== index)
      .map((p: any) => typeof p === 'string' ? { fileName: p } : p) as PhotoData[];
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="text-sm font-semibold text-black">
          {label} <span className="text-gray-500 font-medium">({Array.isArray(photos) ? photos.length : 0}/{maxPhotos})</span>
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            disabled={
              uploading ||
              !!analyzingFileName ||
              (Array.isArray(photos) ? photos.length >= maxPhotos : false)
            }
            className="flex items-center justify-center px-4 py-2 min-h-11 bg-pink-600 text-white rounded-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md whitespace-nowrap"
          >
            <Camera className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : analyzingFileName ? 'AI scan…' : buttonLabel}
          </button>
        )}
      </div>

      {aiNotice && (
        <p className="flex items-start gap-1.5 text-xs text-violet-800 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-violet-600" aria-hidden />
          <span><span className="font-semibold">AI:</span> {aiNotice}</span>
        </p>
      )}

      <CameraCaptureModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCaptured={(file) => uploadSingleFile(file)} />

      {Array.isArray(photos) && photos.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {photos.map((photo, index) => {
            const p = typeof photo === 'string' ? { fileName: photo } : photo;
            const imageUrl = getPhotoDisplayUrl(p);
            if (!imageUrl) return null;
            const isAnalyzing = analyzingFileName === p.fileName;
            const aiSummary = p.metadata?.aiDamage?.summary;
            const aiRepair = p.metadata?.aiDamage?.totalRepairEstimateAud;
            return (
              <div key={`${imageUrl}-${index}`} className="relative group">
                <div
                  className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxImage(imageUrl)}
                >
                {/* eslint-disable-next-line @next/next/no-img-element -- API/signed/redirect URLs; next/image breaks cookies/redirects */}
                <img
                  src={imageUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full aspect-square object-cover rounded-lg bg-gray-100"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="same-origin"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/50 text-white text-[10px] font-medium gap-1">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                    AI scan
                  </div>
                )}
                {aiSummary && !isAnalyzing && (
                  <span className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] leading-tight text-white bg-violet-900/80 rounded-b-lg line-clamp-2">
                    AI: {aiSummary.length > 50 ? `${aiSummary.slice(0, 47)}…` : aiSummary}
                    {aiRepair ? ` · ${aiRepair}` : ''}
                  </span>
                )}
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ImageLightbox
        isOpen={lightboxImage !== null}
        imageUrl={lightboxImage || ''}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}

export default memo(PhotoUpload);


