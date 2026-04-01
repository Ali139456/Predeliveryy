'use client';

import { useState, memo, useCallback } from 'react';
import { Camera, X } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import CameraCaptureModal from './CameraCaptureModal';
import { uploadToVercelBlobViaAPI } from '@/lib/vercelBlobClient';
import { getPhotoDisplayUrl } from '@/lib/photoDisplayUrl';

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
    [key: string]: any;
  } | null;
}

interface PhotoUploadProps {
  photos: PhotoData[] | string[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  readOnly?: boolean;
  label?: string;
  buttonLabel?: string;
  uploadTag?: Record<string, unknown>;
}

function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 20,
  readOnly = false,
  label = 'Photos',
  buttonLabel = 'Take photo',
  uploadTag,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

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

  const uploadSingleFile = useCallback(
    async (file: File) => {
      const currentCount = Array.isArray(photos) ? photos.length : 0;
      if (currentCount >= maxPhotos) {
        if (typeof window !== 'undefined') alert(`Maximum ${maxPhotos} photos allowed`);
        return;
      }
      setUploading(true);
      try {
        const toUpload = await compressImage(file);
        const result = await uploadToVercelBlobViaAPI(toUpload);
        const next = {
          fileName: result.fileName,
          url: result.url,
          metadata:
            uploadTag && Object.keys(uploadTag).length
              ? { ...(result.metadata || {}), ...uploadTag }
              : result.metadata || null,
        };
        const currentPhotos = photos.map((p: any) => (typeof p === 'string' ? { fileName: p } : p));
        onPhotosChange([...currentPhotos, next]);
        setCameraOpen(false);
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
    [compressImage, maxPhotos, onPhotosChange, photos, uploadTag]
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
            disabled={uploading || (Array.isArray(photos) ? photos.length >= maxPhotos : false)}
            className="flex items-center justify-center px-4 py-2 min-h-11 bg-pink-600 text-white rounded-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md whitespace-nowrap"
          >
            <Camera className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : buttonLabel}
          </button>
        )}
      </div>

      <CameraCaptureModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCaptured={(file) => uploadSingleFile(file)} />

      {Array.isArray(photos) && photos.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {photos.map((photo, index) => {
            const imageUrl = getPhotoDisplayUrl(photo);
            if (!imageUrl) return null;
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


