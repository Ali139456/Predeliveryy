'use client';

import { useState, useRef, memo } from 'react';
import Image from 'next/image';
import { Camera, X, Upload } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import { uploadToCloudinaryDirect, getCloudinaryImageUrl } from '@/lib/cloudinaryClient';

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
}

function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 20,
  readOnly = false,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = Array.isArray(photos) ? photos.length : 0;
    if (currentCount + files.length > maxPhotos) {
      if (typeof window !== 'undefined') {
        alert(`Maximum ${maxPhotos} photos allowed`);
      }
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload directly to Cloudinary using unsigned upload preset
        const result = await uploadToCloudinaryDirect(file, 'inspections');
        
        return {
          fileName: result.public_id, // Store public_id for flexibility
          url: result.secure_url, // Store full URL for immediate use
          metadata: {
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          },
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const currentPhotos = photos.map((p: any) => typeof p === 'string' ? { fileName: p } : p);
      onPhotosChange([...currentPhotos, ...uploadedFiles]);
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        const errorMessage = error.message || 'Upload failed. Please check your Cloudinary configuration.';
        alert(`Upload failed: ${errorMessage}`);
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
    const newPhotos = photos
      .filter((_, i) => i !== index)
      .map((p: any) => typeof p === 'string' ? { fileName: p } : p) as PhotoData[];
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">
          Photos ({Array.isArray(photos) ? photos.length : 0}/{maxPhotos})
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || (Array.isArray(photos) ? photos.length >= maxPhotos : false)}
            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Add Photos'}
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

      {Array.isArray(photos) && photos.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {photos.map((photo, index) => {
            // Handle both old format (string or fileName) and new format (with url)
            let imageUrl: string;
            if (typeof photo === 'string') {
              // Old format: might be a Cloudinary public_id or old file path
              if (photo.startsWith('http')) {
                imageUrl = photo;
              } else {
                // Try to construct Cloudinary URL, fallback to API route
                imageUrl = getCloudinaryImageUrl(photo);
              }
            } else if (photo.url) {
              // New format: direct Cloudinary URL
              imageUrl = photo.url;
            } else if (photo.fileName) {
              // Old format with fileName
              if (photo.fileName.startsWith('http')) {
                imageUrl = photo.fileName;
              } else {
                // Try to construct Cloudinary URL, fallback to API route
                imageUrl = getCloudinaryImageUrl(photo.fileName);
              }
            } else {
              imageUrl = `/api/files/${photo}`;
            }
            
            return (
              <div key={`${imageUrl}-${index}`} className="relative group">
                <div
                  className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxImage(imageUrl)}
                >
                <Image
                    src={imageUrl}
                  alt={`Photo ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full aspect-square object-cover rounded-lg"
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


