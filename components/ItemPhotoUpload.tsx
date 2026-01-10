'use client';

import { useState, useRef, memo } from 'react';
import Image from 'next/image';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

interface PhotoData {
  fileName: string;
  metadata?: {
    width?: number;
    height?: number;
    make?: string;
    model?: string;
    dateTime?: string;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
  } | null;
}

interface ItemPhotoUploadProps {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  itemName?: string;
  readOnly?: boolean;
}

function ItemPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  itemName,
  readOnly = false,
}: ItemPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      if (typeof window !== 'undefined') {
        alert(`Maximum ${maxPhotos} photos allowed for this item`);
      }
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Upload failed';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || `Upload failed: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        // Check if response has content before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(text || 'Invalid response from server');
        }

        const data = await response.json();
        if (data.success) {
          return {
            fileName: data.fileName,
            metadata: data.metadata || null,
          };
        }
        throw new Error(data.error || 'Upload failed');
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      onPhotosChange([...photos, ...uploadedFiles]);
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        alert(`Upload failed: ${error.message}`);
      }
      console.error('Photo upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 flex items-center">
          <ImageIcon className="w-3 h-3 mr-1" />
          Photos ({photos.length}/{maxPhotos})
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || photos.length >= maxPhotos}
            className="flex items-center px-2 py-1 text-xs bg-[#3833FF]/50 text-white rounded-lg hover:bg-[#3833FF]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-3 h-3 mr-1" />
            {uploading ? 'Uploading...' : 'Add'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {photos.map((photo, index) => {
            const photoUrl = typeof photo === 'string' ? photo : photo.fileName;
            const fullImageUrl = `/api/files/${photoUrl}`;
            return (
              <div key={`${photoUrl}-${index}`} className="relative group">
                <div
                  className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxImage(fullImageUrl)}
                >
                <Image
                    src={fullImageUrl}
                  alt={`${itemName || 'Item'} photo ${index + 1}`}
                  width={80}
                  height={80}
                    className="w-full h-full aspect-square object-cover rounded-lg border border-slate-500/50"
                  loading="lazy"
                  unoptimized
                />
                </div>
                {!readOnly && (
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

export default memo(ItemPhotoUpload);

