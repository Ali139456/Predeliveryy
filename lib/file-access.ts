/** Shared tenant-scoped storage key checks and media content types. */

export function assertTenantScopedStorageKey(storageKey: string, tenantId: string): void {
  const normalized = storageKey.replace(/^\/+/, '');
  const prefix = `tenants/${tenantId}/`;
  if (!normalized.startsWith(prefix)) {
    throw new Error('Invalid storage key for this tenant');
  }
  if (normalized.includes('..')) {
    throw new Error('Invalid storage key');
  }
}

export function contentTypeFromStorageKey(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase().split('?')[0] ?? '';
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    m4v: 'video/mp4',
    mkv: 'video/x-matroska',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return map[ext] || 'application/octet-stream';
}

export function parseByteRange(
  rangeHeader: string | null,
  size: number
): { start: number; end: number } | null {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;
  const spec = rangeHeader.slice(6).trim();
  const [startStr, endStr] = spec.split('-');
  let start = startStr ? parseInt(startStr, 10) : 0;
  let end = endStr ? parseInt(endStr, 10) : size - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end >= size || start > end) {
    return null;
  }
  return { start, end };
}
