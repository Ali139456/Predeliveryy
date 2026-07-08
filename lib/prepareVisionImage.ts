import 'server-only';

import sharp from 'sharp';

/** Optimise stored inspection photos for OpenAI vision (high detail, not over-compressed). */
export async function prepareImageForVisionAnalysis(buffer: Buffer): Promise<Buffer> {
  if (!buffer.length) return buffer;

  try {
    const image = sharp(buffer, { failOn: 'none' });
    const meta = await image.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const longEdge = Math.max(width, height);

    // Already a good size for vision — avoid re-encoding and losing detail.
    if (longEdge >= 1200 && longEdge <= 2560 && buffer.length <= 2.5 * 1024 * 1024) {
      return buffer;
    }

    return image
      .rotate()
      .resize({
        width: 2048,
        height: 2048,
        fit: 'inside',
        withoutEnlargement: false,
      })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();
  } catch {
    return buffer;
  }
}
