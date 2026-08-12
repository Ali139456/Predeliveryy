import type { RavinConfig } from '@/lib/ravin/config';
import { fetchRavinPresignedPost } from '@/lib/ravin/parse-report';
import { loadInspectionImageBuffer } from '@/lib/vision-damage';

export interface RavinS3UploadResult {
  uploaded: number;
  failed: string[];
}

function slotToRavinFileName(slot: string | undefined, index: number, ext: string): string {
  const base = slot?.replace(/[^a-z0-9_-]/gi, '_') || `angle_${index + 1}`;
  return `${base}.${ext}`;
}

function extFromKey(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase().split('?')[0];
  if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  return 'jpg';
}

async function postToRavinS3(
  url: string,
  fields: Record<string, string>,
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<void> {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    form.append(k, v);
  }
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: contentType });
  form.append('file', blob, fileName);

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Ravin S3 upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

/** Upload inspection photos to Ravin ingest S3 (Appendix C). */
export async function uploadInspectionPhotosToRavin(
  config: RavinConfig,
  params: {
    inspectionId: string;
    vehicleId?: string;
    photos: { key: string; slot?: string }[];
  }
): Promise<RavinS3UploadResult> {
  const failed: string[] = [];
  let uploaded = 0;

  for (let i = 0; i < params.photos.length; i++) {
    const { key, slot } = params.photos[i];
    try {
      const buffer = await loadInspectionImageBuffer(key);
      if (!buffer?.length) {
        failed.push(`${key}: could not load image`);
        continue;
      }

      const ext = extFromKey(key);
      const fileName = slotToRavinFileName(slot, i, ext);
      const contentType =
        ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const presigned = await fetchRavinPresignedPost(config, {
        inspectionId: params.inspectionId,
        vehicleId: params.vehicleId,
        fileName,
      });

      const fields = { ...presigned.fields };
      if (!fields['x-amz-meta-inspection-id']) {
        fields['x-amz-meta-inspection-id'] = params.inspectionId;
      }
      if (params.vehicleId && !fields['x-amz-meta-vehicle-id']) {
        fields['x-amz-meta-vehicle-id'] = params.vehicleId;
      }
      if (!fields.key && fields.Key) fields.key = fields.Key;

      await postToRavinS3(presigned.url, fields, buffer, fileName, contentType);
      uploaded += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'upload failed';
      failed.push(`${key}: ${msg}`);
    }
  }

  return { uploaded, failed };
}
