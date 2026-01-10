'use client';

import { useState, useRef, memo } from 'react';
import Image from 'next/image';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
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
      onPhotosChange([...photos, ...uploadedFiles]);
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

