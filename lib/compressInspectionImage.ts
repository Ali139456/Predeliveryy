/** Client-side image compression before inspection upload (preserves detail for AI damage scan). */

export async function compressInspectionImage(
  file: File,
  options: { maxDim?: number; quality?: number } = {}
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const maxDim = options.maxDim ?? 2048;
  const quality = options.quality ?? 0.92;

  try {
    const bitmap = await createImageBitmap(file);
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
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.(png|webp|heic|heif|jpg|jpeg)$/i, '.jpg');
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
