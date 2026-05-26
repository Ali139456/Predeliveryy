'use client';

import { useState, useRef, memo, useCallback, useEffect } from 'react';
import { X, Camera, Image as ImageIcon, MapPin, Sparkles, Loader2 } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import CameraCaptureModal from './CameraCaptureModal';
import { uploadToVercelBlobViaAPI } from '@/lib/vercelBlobClient';
import { getPhotoDisplayUrl } from '@/lib/photoDisplayUrl';
import { requestVisionDamageDetect } from '@/lib/visionDamageClient';
import { applyVisionResultToPhoto } from '@/lib/applyVisionToPhoto';
import type { PhotoAiDamageMetadata } from '@/types/vision-damage';

export interface DamageMarker {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface PhotoData {
  fileName: string;
  url?: string;
  damageMarkers?: DamageMarker[];
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
    [key: string]: unknown;
  } | null;
}

interface ItemPhotoUploadProps {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  itemName?: string;
  categoryName?: string;
  readOnly?: boolean;
  /** Run OpenAI vision damage scan after each upload (default true). */
  enableAiDamage?: boolean;
  /** Hide the built-in header row (label + Take button) when the parent renders its own controls. */
  hideHeader?: boolean;
  /** Parent can trigger the camera by calling this ref's current callback. */
  openCameraRef?: React.MutableRefObject<(() => void) | null>;
}

function PhotoDamageEditor({
  imageUrl,
  markers,
  readOnly,
  onSave,
  onClose,
}: {
  imageUrl: string;
  markers: DamageMarker[];
  readOnly: boolean;
  onSave: (next: DamageMarker[]) => void;
  onClose: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState<DamageMarker[]>(() =>
    markers.map((m, i) => ({ ...m, id: m.id || `m-${i}` }))
  );
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [labelInput, setLabelInput] = useState('');

  const addMarker = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPending({ x, y });
      setLabelInput('');
    },
    [readOnly]
  );

  const commitPending = () => {
    if (!pending) return;
    const label = labelInput.trim() || 'Damage';
    setLocal((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, x: pending.x, y: pending.y, label },
    ]);
    setPending(null);
    setLabelInput('');
  };

  const removeMarker = (id: string) => {
    setLocal((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b flex justify-between items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">Damage locations on photo</p>
          <div className="flex gap-2">
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  onSave(local);
                  onClose();
                }}
                className="px-3 py-1.5 text-sm bg-[#0033FF] text-white rounded-lg"
              >
                Save
              </button>
            )}
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg">
              Close
            </button>
          </div>
        </div>
        <p className="px-3 pt-2 text-xs text-gray-600">
          {readOnly ? 'Labels show where damage was recorded.' : 'Click the image to place a marker, then describe the damage.'}
        </p>
        <div className="p-3">
          <div
            ref={wrapRef}
            className="relative w-full cursor-crosshair select-none"
            onClick={addMarker}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Annotate" className="w-full h-auto rounded-lg border border-gray-200" />
            {local.map((m) => (
              <button
                key={m.id}
                type="button"
                title={m.label}
                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-[#FF6600] border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white z-10"
                style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!readOnly && window.confirm('Remove this marker?')) removeMarker(m.id);
                }}
              >
                <MapPin className="w-3 h-3" />
              </button>
            ))}
            {pending && (
              <span
                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-[#0033FF] border-2 border-white animate-pulse"
                style={{ left: `${pending.x * 100}%`, top: `${pending.y * 100}%` }}
              />
            )}
          </div>
          {pending && !readOnly && (
            <div className="mt-3 flex flex-wrap gap-2 items-end">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="e.g. Scratch - left door"
                className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm text-black"
                autoFocus
              />
              <button type="button" onClick={commitPending} className="px-4 py-2 bg-[#0033FF] text-white rounded-lg text-sm">
                Add label
              </button>
              <button type="button" onClick={() => setPending(null)} className="px-3 py-2 border rounded-lg text-sm">
                Cancel
              </button>
            </div>
          )}
          {local.some((m) => m.id.startsWith('ai-')) && !readOnly && (
            <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
              Orange markers are AI suggestions - review and edit before saving the inspection.
            </p>
          )}
          {local.length > 0 && (
            <ul className="mt-3 text-sm text-gray-800 space-y-1">
              {local.map((m) => (
                <li key={m.id} className={m.id.startsWith('ai-') ? 'text-amber-900' : undefined}>
                  • {m.label}
                  {m.id.startsWith('ai-') ? ' (AI)' : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  itemName,
  categoryName,
  readOnly = false,
  enableAiDamage = true,
  hideHeader = false,
  openCameraRef,
}: ItemPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzingFileName, setAnalyzingFileName] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [annotateIndex, setAnnotateIndex] = useState<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    if (!openCameraRef) return;
    openCameraRef.current = () => {
      if (readOnly) return;
      if (photos.length >= maxPhotos) {
        if (typeof window !== 'undefined') alert(`Maximum ${maxPhotos} photos allowed for this item`);
        return;
      }
      setCameraOpen(true);
    };
    return () => {
      if (openCameraRef) openCameraRef.current = null;
    };
  }, [openCameraRef, maxPhotos, photos.length, readOnly]);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;
    try {
      const bitmap = await createImageBitmap(file);
      const maxDim = 1400;
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const targetW = Math.max(1, Math.round(bitmap.width * scale));
      const targetH = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, targetW, targetH);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.76)
      );
      if (!blob) return file;

      const name = file.name.replace(/\.(png|webp|heic|heif|jpg|jpeg)$/i, '.jpg');
      return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
    } catch {
      return file;
    }
  }, []);

  const runVisionOnPhoto = useCallback(
    async (fileName: string) => {
      if (!enableAiDamage || readOnly) return;
      setAnalyzingFileName(fileName);
      setAiNotice(null);
      try {
        const context = [categoryName, itemName].filter(Boolean).join(' - ');
        const res = await requestVisionDamageDetect({
          storageKey: fileName,
          itemName,
          context: context || undefined,
        });
        if (!res.success) {
          if (!res.disabled) {
            setAiNotice(res.error);
          }
          return;
        }
        const current = photosRef.current;
        const idx = current.findIndex((p) => p.fileName === fileName);
        if (idx < 0) return;
        const merged = applyVisionResultToPhoto(current[idx], res.result);
        const updated = current.map((p, i) => (i === idx ? merged : p));
        photosRef.current = updated;
        onPhotosChange(updated);
        if (res.result.noDamageFound) {
          setAiNotice('AI: no obvious damage detected - review the photo.');
        } else if (res.result.findings.length > 0) {
          setAiNotice(
            `AI noted ${res.result.findings.length} possible issue(s). Check markers on the photo.`
          );
        }
      } catch (e) {
        console.error('Vision damage detect:', e);
      } finally {
        setAnalyzingFileName(null);
      }
    },
    [categoryName, enableAiDamage, itemName, onPhotosChange, readOnly]
  );

  const uploadSingleFile = useCallback(
    async (file: File) => {
      if (photos.length >= maxPhotos) {
        if (typeof window !== 'undefined') {
          alert(`Maximum ${maxPhotos} photos allowed for this item`);
        }
        return;
      }
      setUploading(true);
      setAiNotice(null);
      try {
        const toUpload = await compressImage(file);
        const result = await uploadToVercelBlobViaAPI(toUpload);
        const next = {
          fileName: result.fileName,
          url: result.url,
          metadata: result.metadata || null,
          damageMarkers: [] as DamageMarker[],
        };
        const updated = [...photos, next];
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
    [compressImage, maxPhotos, onPhotosChange, photos, runVisionOnPhoto]
  );

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const updateMarkers = (index: number, markers: DamageMarker[]) => {
    const next = photos.map((p, i) => (i === index ? { ...p, damageMarkers: markers } : p));
    onPhotosChange(next);
  };

  const annotateUrl =
    annotateIndex !== null && photos[annotateIndex] ? getPhotoDisplayUrl(photos[annotateIndex]) : '';

  return (
    <div className="space-y-2">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <ImageIcon className="w-3 h-3 mr-1" />
            Photos ({photos.length}/{maxPhotos})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              disabled={uploading || !!analyzingFileName || photos.length >= maxPhotos}
              className="flex items-center px-2 py-1 text-xs bg-[#3833FF]/50 text-white rounded-lg hover:bg-[#3833FF]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Camera className="w-3 h-3 mr-1" />
              {uploading ? 'Uploading...' : analyzingFileName ? 'AI scan…' : 'Take'}
            </button>
          )}
        </div>
      )}

      {aiNotice && (
        <p className="flex items-start gap-1.5 text-xs text-violet-200 bg-violet-950/40 border border-violet-500/30 rounded-lg px-2 py-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>{aiNotice}</span>
        </p>
      )}

      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCaptured={(file) => uploadSingleFile(file)}
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {photos.map((photo, index) => {
            const imageUrl = getPhotoDisplayUrl(photo);
            if (!imageUrl) return null;
            const markerCount = photo.damageMarkers?.length ?? 0;
            const isAnalyzing = analyzingFileName === photo.fileName;
            return (
              <div key={`${imageUrl}-${index}`} className="relative group">
                <div
                  className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxImage(imageUrl)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`${itemName || 'Item'} photo ${index + 1}`}
                    className="w-full h-full aspect-square object-cover rounded-lg border border-slate-500/50 bg-slate-800/30"
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
                  {markerCount > 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#FF6600] text-white text-[9px] font-bold">
                      {markerCount} label{markerCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {!readOnly && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnnotateIndex(index);
                      }}
                      className="absolute bottom-1 right-1 bg-[#0033FF] text-white rounded px-1 text-[9px] font-medium opacity-90 hover:opacity-100 z-10"
                      title="Mark damage on photo"
                    >
                      Mark
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
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

      {annotateIndex !== null && annotateUrl && (
        <PhotoDamageEditor
          key={`annotate-${annotateIndex}-${photos[annotateIndex]?.fileName ?? ''}`}
          imageUrl={annotateUrl}
          markers={photos[annotateIndex]?.damageMarkers ?? []}
          readOnly={readOnly}
          onSave={(next) => updateMarkers(annotateIndex, next)}
          onClose={() => setAnnotateIndex(null)}
        />
      )}
    </div>
  );
}

export default memo(ItemPhotoUpload);
