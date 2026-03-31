'use client';

import { useState, useRef, memo } from 'react';
import { X, Upload, Film } from 'lucide-react';
import { uploadToVercelBlobViaAPI } from '@/lib/vercelBlobClient';
import { getPhotoDisplayUrl } from '@/lib/photoDisplayUrl';

export interface WalkAroundVideo {
  fileName: string;
  url?: string;
  metadata?: Record<string, unknown> | null;
}

interface VideoUploadProps {
  videos: WalkAroundVideo[];
  onVideosChange: (videos: WalkAroundVideo[]) => void;
  maxVideos?: number;
  readOnly?: boolean;
}

function VideoUpload({
  videos,
  onVideosChange,
  maxVideos = 3,
  readOnly = false,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (videos.length + files.length > maxVideos) {
      alert(`Maximum ${maxVideos} walk-around videos allowed`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadToVercelBlobViaAPI(file);
        return {
          fileName: result.fileName,
          url: result.url,
          metadata: result.metadata || null,
        };
      });
      const uploaded = await Promise.all(uploadPromises);
      onVideosChange([...videos, ...uploaded]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      alert(`Video upload failed: ${msg}`);
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const remove = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-sm font-medium text-gray-800 flex items-center gap-2">
          <Film className="w-4 h-4" />
          Walk-around video ({videos.length}/{maxVideos})
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || videos.length >= maxVideos}
            className="flex items-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0029CC] disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading…' : 'Add video'}
          </button>
        )}
      </div>
      <p className="text-xs text-gray-600">
        Short walk-around clips of the vehicle (MP4/WebM). Optional — stored with this inspection.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((v, index) => {
            const src = getPhotoDisplayUrl(v);
            if (!src) return null;
            return (
              <div key={`${v.fileName}-${index}`} className="relative group rounded-lg overflow-hidden border border-slate-600/50 bg-black/40">
                <video src={src} className="w-full max-h-56 object-contain" controls playsInline preload="metadata" />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-90 hover:opacity-100 z-10"
                    aria-label="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="px-2 py-1 text-[10px] text-slate-400 truncate" title={v.fileName}>
                  {v.fileName.split('/').pop()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(VideoUpload);
