import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IInspection } from '@/types/db';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getCloudinaryUrl, hasCloudinaryConfig } from '@/lib/cloudinary';
import https from 'https';
import http from 'http';
import { getPhotoDisplayUrl } from '@/lib/photoDisplayUrl';
import { getS3Url } from '@/lib/s3';
import {
  hasSupabaseStorageConfig,
  getSupabaseStorageSignedOrPublicUrl,
  downloadSupabaseStorageObject,
} from '@/lib/supabase-storage';

/** Stored upload `url` may be `/api/files/signed?key=…` (no cookie on PDF server) — resolve to object key. */
function tenantKeyFromAppSignedPhotoUrl(u: string): string | null {
  try {
    const parsed = u.startsWith('http://') || u.startsWith('https://')
      ? new URL(u)
      : new URL(u, 'http://localhost');
    const pathNorm = parsed.pathname.replace(/\/$/, '');
    if (!pathNorm.endsWith('/api/files/signed')) return null;
    const key = parsed.searchParams.get('key');
    if (!key) return null;
    let decoded = decodeURIComponent(key);
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      /* single-pass decode is enough */
    }
    return decoded.startsWith('tenants/') ? decoded : null;
  } catch {
    return null;
  }
}

/** Prefer `tenants/…` path for PDF fetch so private Supabase buckets work (ignore stored getPublicUrl). */
function resolvePdfImageSource(photo: string | { fileName?: string; url?: string } | null | undefined): string | null {
  if (photo == null) return null;
  if (typeof photo === 'string') {
    const s = photo.trim();
    if (!s) return null;
    const fromSigned = tenantKeyFromAppSignedPhotoUrl(s);
    if (fromSigned) return fromSigned;
    return s;
  }
  const fn = typeof (photo as { fileName?: string }).fileName === 'string' ? (photo as { fileName: string }).fileName.trim() : '';
  if (fn.startsWith('tenants/')) {
    return fn;
  }
  const u = typeof (photo as { url?: string }).url === 'string' ? (photo as { url: string }).url.trim() : '';
  if (u) {
    const fromSigned = tenantKeyFromAppSignedPhotoUrl(u);
    if (fromSigned) return fromSigned;
    if (u.startsWith('https://') || u.startsWith('http://')) {
      return u;
    }
    if (u.startsWith('/')) return u;
  }
  if (fn) return fn;
  return null;
}

// Helper function to load image as base64 (fileName can be a path or a full URL)
async function loadImageAsBase64(fileName: string): Promise<string | null> {
  try {
    const fromSigned = tenantKeyFromAppSignedPhotoUrl(fileName);
    if (fromSigned) {
      return loadImageAsBase64(fromSigned);
    }
    // Browser-style path: /api/files/tenants/… (no cookie in PDF job — resolve to storage key)
    if (fileName.startsWith('/api/files/') && !fileName.startsWith('/api/files/signed')) {
      const rest = decodeURIComponent(fileName.slice('/api/files/'.length).split('?')[0]);
      if (rest.startsWith('tenants/')) {
        return loadImageAsBase64(rest);
      }
    }
    // Local static files from photoDisplayUrl (/uploads/…)
    if (fileName.startsWith('/uploads/') || fileName.startsWith('uploads/')) {
      const rel = fileName.replace(/^\/?/, '');
      const disk = path.join(process.cwd(), 'public', rel);
      if (fs.existsSync(disk)) {
        const fileBuffer = fs.readFileSync(disk);
        const ext = path.extname(disk).toLowerCase();
        const mimeType = getMimeType(ext);
        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      }
      return null;
    }
    // If it's already a full URL (e.g. presigned or public CDN), fetch directly
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      const imageBuffer = await fetchImageFromUrl(fileName);
      if (imageBuffer) {
        const mimeMatch = fileName.match(/\.(jpe?g|png|gif|webp)/i);
        const mimeType = mimeMatch ? (mimeMatch[1] === 'jpg' || mimeMatch[1] === 'jpeg' ? 'image/jpeg' : `image/${mimeMatch[1]}`) : 'image/jpeg';
        return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      }
      return null;
    }

    // Tenant-scoped keys: Supabase download (service role) first, then signed URL fetch, then S3/local
    if (fileName.startsWith('tenants/')) {
      try {
        if (hasSupabaseStorageConfig()) {
          const direct = await downloadSupabaseStorageObject(fileName);
          if (direct) {
            const ext = path.extname(fileName).toLowerCase();
            const mimeType = getMimeType(ext);
            return `data:${mimeType};base64,${direct.toString('base64')}`;
          }
          const supa = await getSupabaseStorageSignedOrPublicUrl(fileName, 7200);
          if (supa) {
            const imageBuffer = await fetchImageFromUrl(supa);
            if (imageBuffer) {
              const ext = path.extname(fileName).toLowerCase();
              const mimeType = getMimeType(ext);
              return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
            }
          }
        }
        const signed = await getS3Url(fileName);
        const imageBuffer = await fetchImageFromUrl(signed);
        if (imageBuffer) {
          const ext = path.extname(fileName).toLowerCase();
          const mimeType = getMimeType(ext);
          return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
      } catch (e) {
        console.warn(`Failed to load tenant image: ${fileName}`, e);
      }
    }

    if (hasCloudinaryConfig) {
      try {
        const cloudinaryUrl = getCloudinaryUrl(fileName);
        const imageBuffer = await fetchImageFromUrl(cloudinaryUrl);
        if (imageBuffer) {
          const ext = path.extname(fileName).toLowerCase();
          const mimeType = getMimeType(ext);
          return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
      } catch (error) {
        console.warn(`Failed to load image from Cloudinary: ${fileName}`, error);
      }
    }

    const hasAWSCredentials = 
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_ACCESS_KEY_ID !== '' &&
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_SECRET_ACCESS_KEY !== '';

    if (hasAWSCredentials) {
      try {
        const s3Client = new S3Client({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });
        
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME || 'pre-delivery-inspections',
          Key: fileName,
        });
        
        const response = await s3Client.send(command);
        if (response.Body) {
          const chunks: Buffer[] = [];
          const stream = response.Body as any;
          
          if (stream instanceof Buffer) {
            const buffer = stream;
            const ext = path.extname(fileName).toLowerCase();
            const mimeType = getMimeType(ext);
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
          } else {
            for await (const chunk of stream) {
              chunks.push(Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);
            const ext = path.extname(fileName).toLowerCase();
            const mimeType = getMimeType(ext);
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        }
      } catch (error) {
        console.warn(`Failed to load image from S3: ${fileName}`, error);
      }
    }

    const localPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    if (fs.existsSync(localPath)) {
      const fileBuffer = fs.readFileSync(localPath);
      const ext = path.extname(fileName).toLowerCase();
      const mimeType = getMimeType(ext);
      return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to load image: ${fileName}`, error);
    return null;
  }
}

const IMAGE_FETCH_TIMEOUT_MS = 20000;
/** Downloaded PDF: up to 50 images total (25 general + 25 checklist; per-item max below). */
const MAX_GENERAL_PHOTOS = 25;
const MAX_PHOTOS_PER_CHECKLIST_ITEM = 12;
/** Checklist photos embedded after general section (same form order; rest omitted). */
const MAX_CHECKLIST_PHOTOS_TOTAL_PDF = 25;

/** Email PDF: up to 50 images total with compression (20 general + 30 checklist). */
const MAX_GENERAL_PHOTOS_EMAIL = 20;
const MAX_PHOTOS_PER_CHECKLIST_ITEM_EMAIL = 2;
const MAX_CHECKLIST_PHOTOS_TOTAL_EMAIL = 30;
const IMAGE_LOAD_CONCURRENCY = 6;

/** Ordered list of checklist image sources (respects per-item slice + optional global email cap). */
function enumerateChecklistImageSources(
  checklist: IInspection['checklist'],
  maxPerItem: number,
  maxTotal: number
): string[] {
  const out: string[] = [];
  const list = Array.isArray(checklist) ? checklist : [];
  for (const category of list) {
    if (!category?.items) continue;
    for (const item of category.items) {
      if (!item.photos?.length) continue;
      const itemPhotos = item.photos.slice(0, maxPerItem);
      for (const photo of itemPhotos) {
        const imageSrc = resolvePdfImageSource(photo as string | { fileName?: string; url?: string });
        if (!imageSrc) continue;
        out.push(imageSrc);
        if (out.length >= maxTotal) return out;
      }
    }
  }
  return out;
}

function fetchImageFromUrl(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (result: Buffer | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => done(null), IMAGE_FETCH_TIMEOUT_MS);

    const go = (targetUrl: string, depth: number): void => {
      if (depth > 10) {
        done(null);
        return;
      }
      const protocol = targetUrl.startsWith('https') ? https : http;
      const opts: https.RequestOptions = { headers: { 'User-Agent': 'PreDelivery-PDFGenerator/1.0 (Node)' } };
      const req = protocol.get(targetUrl, opts, (res) => {
        const code = res.statusCode || 0;
        if ([301, 302, 303, 307, 308].includes(code)) {
          const location = res.headers.location;
          res.resume();
          if (location) {
            const nextUrl = location.startsWith('http') ? location : new URL(location, targetUrl).href;
            go(nextUrl, depth + 1);
            return;
          }
        }
        if (code !== 200) {
          res.resume();
          done(null);
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          done(buf.length > 0 ? buf : null);
        });
        res.on('error', () => done(null));
      });
      req.on('error', () => done(null));
    };

    go(url, 0);
  });
}

function getMimeType(ext: string): string {
  const mimeMap: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeMap[ext] || 'image/jpeg';
}

/** Downscale embedded images for email PDFs (keeps total attachment under provider limits). */
async function shrinkDataUriForEmail(dataUri: string | null): Promise<string | null> {
  if (!dataUri || !dataUri.startsWith('data:image')) return dataUri;
  try {
    const sharp = (await import('sharp')).default;
    const normalized = dataUri.replace(/\s/g, '');
    const base64Match = /^data:image\/[\w+.-]+;base64,(.+)$/i.exec(normalized);
    if (!base64Match) return dataUri;
    const buf = Buffer.from(base64Match[1], 'base64');
    const out = await sharp(buf)
      .rotate()
      .resize({ width: 520, height: 520, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 46, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString('base64')}`;
  } catch {
    return dataUri;
  }
}

/** Pre Delivery logo for PDF (same asset as site: `public/Transparent Logo.png`). */
async function loadPdfHeaderLogoBase64(forEmail: boolean): Promise<string | null> {
  const cwd = process.cwd();
  const primaryLogo = path.join(cwd, 'public', 'Transparent Logo.png');
  const secondaryLogo = path.join(cwd, 'public', 'logo.png');
  const svgPath = path.join(cwd, 'public', 'branding', 'ovyt-wordmark-white.svg');
  const pngFallbacks = [
    path.join(cwd, 'public', 'branding', 'ovyt-logo.png'),
    path.join(cwd, 'public', 'ovyt-logo.png'),
  ];
  try {
    if (fs.existsSync(primaryLogo)) {
      const sharp = (await import('sharp')).default;
      const pngBuf = await sharp(primaryLogo)
        .resize({ width: 400, height: 200, fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
      let dataUri = `data:image/png;base64,${pngBuf.toString('base64')}`;
      if (forEmail) {
        dataUri = (await shrinkDataUriForEmail(dataUri)) ?? dataUri;
      }
      return dataUri;
    }
  } catch (e) {
    console.warn('PDF Pre Delivery logo (PNG):', e);
  }
  try {
    if (fs.existsSync(secondaryLogo)) {
      const sharp = (await import('sharp')).default;
      const pngBuf = await sharp(secondaryLogo)
        .resize({ width: 400, height: 200, fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
      let dataUri = `data:image/png;base64,${pngBuf.toString('base64')}`;
      if (forEmail) {
        dataUri = (await shrinkDataUriForEmail(dataUri)) ?? dataUri;
      }
      return dataUri;
    }
  } catch (e) {
    console.warn('PDF Pre Delivery logo fallback (logo.png):', e);
  }
  try {
    if (fs.existsSync(svgPath)) {
      const sharp = (await import('sharp')).default;
      const pngBuf = await sharp(svgPath)
        .resize({ width: 320, height: 96, fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
      let dataUri = `data:image/png;base64,${pngBuf.toString('base64')}`;
      if (forEmail) {
        dataUri = (await shrinkDataUriForEmail(dataUri)) ?? dataUri;
      }
      return dataUri;
    }
  } catch (e) {
    console.warn('PDF logo fallback (SVG):', e);
  }
  for (const p of pngFallbacks) {
    if (!fs.existsSync(p)) continue;
    try {
      const buf = fs.readFileSync(p);
      let dataUri = `data:image/png;base64,${buf.toString('base64')}`;
      if (forEmail) {
        dataUri = (await shrinkDataUriForEmail(dataUri)) ?? dataUri;
      }
      return dataUri;
    } catch {
      /* try next */
    }
  }
  return null;
}

/** Run promises in parallel with a concurrency limit */
async function runWithConcurrency<T>(items: T[], fn: (item: T) => Promise<string | null>, concurrency: number): Promise<Map<T, string | null>> {
  const results = new Map<T, string | null>();
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index++;
      const item = items[current];
      try {
        const value = await fn(item);
        results.set(item, value);
      } catch {
        results.set(item, null);
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function addImageToPDF(
  doc: jsPDF,
  imageData: string | null,
  x: number,
  y: number,
  width: number,
  height: number,
  fileName?: string
): Promise<void> {
  if (imageData) {
    try {
      const format =
        typeof imageData === 'string' && imageData.startsWith('data:image/png')
          ? 'PNG'
          : 'JPEG';
      // Use FAST compression to keep emailed PDFs small.
      doc.addImage(imageData, format as any, x, y, width, height, undefined, 'FAST');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(x, y, width, height);
    } catch (error) {
      doc.setFillColor(245, 245, 245);
      doc.rect(x, y, width, height, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, y, width, height);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Image unavailable', x + width / 2, y + height / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(245, 245, 245);
    doc.rect(x, y, width, height, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(x, y, width, height);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Image unavailable', x + width / 2, y + height / 2, { align: 'center' });
  }
}

/** Australian Eastern (Sydney) — AEST/AEDT handled automatically. */
const PDF_TIMEZONE_AU_EASTERN = 'Australia/Sydney';

function formatDateTimeAustraliaEastern(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return d.toLocaleString('en-AU', {
    timeZone: PDF_TIMEZONE_AU_EASTERN,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}

function formatDateAustraliaEastern(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return d.toLocaleDateString('en-AU', {
    timeZone: PDF_TIMEZONE_AU_EASTERN,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Build absolute URL for PDF link annotations (relative app paths need a site origin). */
function getAbsoluteUrlForPdfLink(href: string): string | null {
  const h = href.trim();
  if (!h) return null;
  if (h.startsWith('https://') || h.startsWith('http://')) return h;
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const base = fromEnv || vercel.replace(/\/$/, '');
  if (!base) return null;
  return h.startsWith('/') ? `${base}${h}` : `${base}/${h}`;
}

/** Underlined link text; adds click target when a public absolute URL is available. */
function drawPdfTextLink(doc: jsPDF, text: string, x: number, y: number, href: string) {
  const target = getAbsoluteUrlForPdfLink(href);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 80, 180);
  doc.text(text, x, y);
  const w = doc.getTextWidth(text);
  doc.setDrawColor(0, 80, 180);
  doc.setLineWidth(0.15);
  doc.line(x, y + 0.6, x + w, y + 0.6);
  if (target) {
    doc.link(x, y - 3.5, Math.max(w, 20), 5, { url: target });
  }
  doc.setTextColor(40, 40, 50);
}

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value instanceof Date) {
    return formatDateTimeAustraliaEastern(value);
  }
  return String(value);
}

/**
 * Checklist status from DB/UI can arrive as "'OK'", "O K", etc. Normalize so PDF shows clean codes (no stray quotes).
 */
function normalizeChecklistStatusForPdf(status: unknown): string {
  if (status === null || status === undefined || status === '') {
    return formatValue(status);
  }
  let s = String(status).trim();
  s = s
    .replace(/^[\s'"`\u2018\u2019\u201C\u201D\u00B4]+|[\s'"`\u2018\u2019\u201C\u201D\u00B4]+$/g, '')
    .trim();
  const compact = s.replace(/\s+/g, '').toUpperCase();
  if (compact === 'OK') return 'OK';
  if (compact === 'PASS') return 'PASS';
  if (compact === 'FAIL') return 'FAIL';
  if (compact === 'NA' || compact === 'N/A') return 'N/A';

  const lower = s.toLowerCase();
  if (lower === 'pass') return 'PASS';
  if (lower === 'fail') return 'FAIL';
  if (lower === 'na' || lower === 'n/a') return 'N/A';

  const u = s.toUpperCase();
  if (u === 'C') return 'C';
  if (u === 'A') return 'A';
  if (u === 'R') return 'R';
  if (u === 'RP') return 'RP';
  if (u === 'N') return 'N/A';

  return formatValue(s);
}

async function getRasterDimensionsFromDataUri(dataUri: string): Promise<{ w: number; h: number } | null> {
  if (!dataUri.startsWith('data:image')) return null;
  try {
    const sharp = (await import('sharp')).default;
    const comma = dataUri.indexOf(',');
    const b64 = comma >= 0 ? dataUri.slice(comma + 1) : '';
    if (!b64) return null;
    const buf = Buffer.from(b64, 'base64');
    const m = await sharp(buf).metadata();
    if (m.width && m.height && m.width > 0 && m.height > 0) {
      return { w: m.width, h: m.height };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Header band: logo + report title left-aligned under logo */
const PDF_HEADER_HEIGHT = 56;
/** Transparent logo intrinsic ratio (width / height) for undistorted header placement */
const PDF_HEADER_LOGO_ASPECT = 1609 / 1103;
// Theme: app primary blue #0033FF and darker #0029CC
const PDF_THEME_MAIN = [0, 51, 255] as const;
const PDF_THEME_STRIP = [0, 41, 204] as const;
/** Light blue zebra rows for inspection checklist tables (RGB) */
const PDF_CHECKLIST_ROW_ALT_BLUE = [232, 244, 255] as const;

/**
 * Full legal disclaimer appended as the last page(s) of the PDF (before footers are drawn).
 */
const PDF_DISCLAIMER_PARAGRAPHS: Array<{ kind: 'h' | 'p' | 'ul'; text?: string; items?: string[] }> = [
  {
    kind: 'p',
    text:
      'This Pre-Delivery Inspection Report ("Report") has been prepared by Predelivery.ai based on a visual and non-invasive inspection of the vehicle at the time and location recorded in this Report.',
  },
  { kind: 'h', text: '1. Nature of Inspection' },
  { kind: 'p', text: 'The inspection:' },
  {
    kind: 'ul',
    items: [
      'is limited to observable conditions at the time of inspection',
      'is conducted without dismantling, disassembly, or invasive testing',
      'relies on the checklist items, inputs, and evidence (including photos) recorded in the Report',
    ],
  },
  { kind: 'p', text: 'Accordingly, components, systems, or defects that are:' },
  {
    kind: 'ul',
    items: ['not visible', 'not accessible', 'concealed, latent, or developing'],
  },
  { kind: 'p', text: 'may not be identified.' },
  { kind: 'h', text: '2. No Guarantee or Warranty' },
  { kind: 'p', text: 'This Report:' },
  {
    kind: 'ul',
    items: [
      'does not constitute a guarantee or warranty as to the condition, performance, or future reliability of the vehicle',
      'does not confirm the absence of defects',
      'does not certify compliance with manufacturer specifications unless expressly stated',
    ],
  },
  { kind: 'h', text: '3. Reliance on Information' },
  { kind: 'p', text: 'This Report may rely on:' },
  {
    kind: 'ul',
    items: [
      'information provided by third parties (including dealers, manufacturers, or operators)',
      'system inputs, VIN data, or documentation available at the time',
    ],
  },
  { kind: 'p', text: 'Predelivery.ai does not warrant the completeness or accuracy of third-party information.' },
  { kind: 'h', text: '4. AI-Assisted Analysis (if applicable)' },
  { kind: 'p', text: 'Where applicable, this Report may incorporate:' },
  {
    kind: 'ul',
    items: ['automated systems', 'image recognition', 'AI-assisted inspection or scoring tools'],
  },
  { kind: 'p', text: 'Such outputs are:' },
  {
    kind: 'ul',
    items: [
      'assistive only',
      'subject to limitations in detection accuracy',
      'not a substitute for mechanical or engineering assessment',
    ],
  },
  { kind: 'h', text: '5. Limitation of Liability' },
  { kind: 'p', text: 'To the maximum extent permitted by law:' },
  {
    kind: 'ul',
    items: [
      'Predelivery.ai is not liable for any indirect, incidental, or consequential loss, including loss of use, profit, or opportunity',
      'Any liability arising from this Report is limited to the amount paid for the inspection service',
      'Nothing in this disclaimer excludes rights under the Australian Consumer Law.',
    ],
  },
  { kind: 'h', text: '6. Not a Mechanical or Engineering Report' },
  { kind: 'p', text: 'This Report:' },
  {
    kind: 'ul',
    items: [
      'is not a mechanical inspection, engineering certification, or roadworthy certificate',
      'should not be relied upon as a substitute for a comprehensive mechanical inspection',
    ],
  },
  { kind: 'p', text: 'Independent specialist advice should be obtained where required.' },
  { kind: 'h', text: '7. Time-Sensitive Nature' },
  { kind: 'p', text: 'Vehicle condition may change after inspection due to:' },
  {
    kind: 'ul',
    items: ['use', 'transport', 'environmental factors', 'subsequent handling'],
  },
  { kind: 'p', text: 'This Report reflects conditions at the time of inspection only.' },
  { kind: 'h', text: '8. Use and Reliance' },
  { kind: 'p', text: 'This Report is prepared for:' },
  {
    kind: 'ul',
    items: ['the commissioning party (e.g. dealer, OEM, fleet operator, or customer)'],
  },
  { kind: 'p', text: 'It must not be:' },
  {
    kind: 'ul',
    items: [
      'relied upon by third parties',
      'reproduced or used for other purposes',
      'without prior written consent from Predelivery Global Pty Ltd',
    ],
  },
  { kind: 'h', text: '9. Acceptance' },
  { kind: 'p', text: 'By using this Report, the recipient acknowledges and accepts:' },
  {
    kind: 'ul',
    items: ['the scope', 'limitations', 'and conditions set out in this disclaimer'],
  },
];

function drawDisclaimerPages(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  contentWidth: number,
  inspection: IInspection,
  logoBase64: string | null
) {
  const lineH = 4.8;
  const paraGap = 3;
  const bottomSafe = 28;

  const ensureSpace = (needed: number, yRef: { y: number }) => {
    if (yRef.y + needed > pageHeight - bottomSafe) {
      doc.addPage();
      drawPageHeader(doc, pageWidth, margin, inspection, logoBase64);
      yRef.y = PDF_HEADER_HEIGHT + 12;
    }
  };

  doc.addPage();
  drawPageHeader(doc, pageWidth, margin, inspection, logoBase64);
  const yRef = { y: PDF_HEADER_HEIGHT + 14 };

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_THEME_STRIP[0], PDF_THEME_STRIP[1], PDF_THEME_STRIP[2]);
  doc.text('Disclaimer', margin, yRef.y);
  yRef.y += 10;

  doc.setFontSize(9);
  doc.setTextColor(40, 40, 50);

  for (const block of PDF_DISCLAIMER_PARAGRAPHS) {
    if (block.kind === 'h') {
      ensureSpace(lineH * 2 + paraGap, yRef);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(block.text ?? '', contentWidth);
      for (const line of lines) {
        ensureSpace(lineH, yRef);
        doc.text(line, margin, yRef.y);
        yRef.y += lineH;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      yRef.y += paraGap * 0.5;
      continue;
    }

    if (block.kind === 'p' && block.text) {
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(block.text, contentWidth);
      for (const line of lines) {
        ensureSpace(lineH, yRef);
        doc.text(line, margin, yRef.y);
        yRef.y += lineH;
      }
      yRef.y += paraGap * 0.5;
      continue;
    }

    if (block.kind === 'ul' && block.items) {
      doc.setFont('helvetica', 'normal');
      for (const item of block.items) {
        const bullet = `\u2022 ${item}`;
        const lines = doc.splitTextToSize(bullet, contentWidth - 4);
        for (let i = 0; i < lines.length; i++) {
          ensureSpace(lineH, yRef);
          const x = i === 0 ? margin : margin + 4;
          doc.text(lines[i], x, yRef.y);
          yRef.y += lineH;
        }
      }
      yRef.y += paraGap * 0.5;
    }
  }
}

function drawPageHeader(
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  _inspection: IInspection,
  logoBase64: string | null
) {
  doc.setFillColor(...PDF_THEME_MAIN);
  doc.rect(0, 0, pageWidth, PDF_HEADER_HEIGHT, 'F');
  doc.setFillColor(...PDF_THEME_STRIP);
  doc.rect(0, 0, pageWidth, 3, 'F');

  const reportTitle = 'Pre Delivery Inspection Report';
  const logoY = 6;
  const logoHeight = 32;
  let titleTopY = 20;

  if (logoBase64) {
    try {
      const logoWidth = Math.min(logoHeight * PDF_HEADER_LOGO_ASPECT, 52);
      const fmt = logoBase64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(logoBase64, fmt as 'PNG' | 'JPEG', margin, logoY, logoWidth, logoHeight);
      // Add a bit more breathing room between logo and title
      titleTopY = logoY + logoHeight + 9;
    } catch {
      /* logo failed */
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const titleMaxW = pageWidth - margin * 2;
  let titleFont = 11;
  doc.setFontSize(titleFont);
  while (titleFont > 7.5 && doc.getTextWidth(reportTitle) > titleMaxW) {
    titleFont -= 0.5;
    doc.setFontSize(titleFont);
  }
  const titleLines = doc.splitTextToSize(reportTitle, titleMaxW);
  let lineY = titleTopY;
  for (const line of titleLines) {
    doc.text(line, margin, lineY, { align: 'left' });
    lineY += titleFont * 0.45;
  }

  // Line at bottom of header bar
  doc.setDrawColor(PDF_THEME_STRIP[0], PDF_THEME_STRIP[1], PDF_THEME_STRIP[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, PDF_HEADER_HEIGHT - 0.5, pageWidth - margin, PDF_HEADER_HEIGHT - 0.5);
  doc.setTextColor(0, 0, 0);
}

export type GeneratePDFOptions = {
  forEmail?: boolean;
  /** Override default email checklist photo cap (smaller = lighter PDF for Resend). */
  maxChecklistPhotosEmail?: number;
};

export async function generatePDF(inspection: IInspection, options?: GeneratePDFOptions): Promise<Buffer> {
  const forEmail = options?.forEmail === true;
  const maxGeneral = forEmail ? MAX_GENERAL_PHOTOS_EMAIL : MAX_GENERAL_PHOTOS;
  const maxPerItem = forEmail ? MAX_PHOTOS_PER_CHECKLIST_ITEM_EMAIL : MAX_PHOTOS_PER_CHECKLIST_ITEM;
  const maxChecklistPhotosForThisRun = forEmail
    ? Math.max(1, Math.min(options?.maxChecklistPhotosEmail ?? MAX_CHECKLIST_PHOTOS_TOTAL_EMAIL, 500))
    : MAX_CHECKLIST_PHOTOS_TOTAL_PDF;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  const headerLogo = await loadPdfHeaderLogoBase64(forEmail);
  /** Top margin for autoTable on every page so body clears the fixed header bar. */
  const autoTableTopMargin = PDF_HEADER_HEIGHT + 10;
  /** Last PDF page that already has the report header (avoids double headers when multiple tables share a page). */
  let lastHeaderPage = 0;
  const drawHeaderHere = () => {
    drawPageHeader(doc, pageWidth, margin, inspection, headerLogo);
    lastHeaderPage = doc.getNumberOfPages();
  };
  const autoTableWillDrawPage = (data: { pageNumber: number }) => {
    if (data.pageNumber !== lastHeaderPage) {
      drawPageHeader(doc, pageWidth, margin, inspection, headerLogo);
      lastHeaderPage = data.pageNumber;
    }
  };

  drawHeaderHere();
  let yPos = PDF_HEADER_HEIGHT + 10;

  // Pre-load all images in parallel (capped) for fast PDF generation
  const imageSources: string[] = [];
  if (inspection.photos && inspection.photos.length > 0) {
    const general = inspection.photos.slice(0, maxGeneral);
    for (const photo of general) {
      const imageSrc = resolvePdfImageSource(photo as string | { fileName?: string; url?: string });
      if (imageSrc) imageSources.push(imageSrc);
    }
  }
  const checklist = Array.isArray(inspection.checklist) ? inspection.checklist : [];
  const checklistSources = enumerateChecklistImageSources(checklist, maxPerItem, maxChecklistPhotosForThisRun);
  for (const src of checklistSources) {
    imageSources.push(src);
  }
  const uniqueSources = Array.from(new Set(imageSources));
  const imageCache = await runWithConcurrency(
    uniqueSources,
    async (src) => {
      const raw = await loadImageAsBase64(src);
      if (forEmail && raw) return shrinkDataUriForEmail(raw);
      return raw;
    },
    IMAGE_LOAD_CONCURRENCY
  );
  
  // ============================================
  // SECTION 1: INSPECTOR INFORMATION (Table)
  // ============================================
  // Section title
  doc.setFillColor(PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Inspector Information', margin + 6, yPos + 2);
  yPos += 12;

  const inspectorData = [
    ['Inspector Name', formatValue(inspection.inspectorName)],
    ['Email Address', formatValue(inspection.inspectorEmail)],
    ['Inspection Date', inspection.inspectionDate ? formatDateAustraliaEastern(inspection.inspectionDate) : formatValue(null)],
    ['Inspection Number', formatValue(inspection.inspectionNumber)],
  ];

  autoTable(doc, {
    startY: yPos,
    body: inspectorData,
    theme: 'striped',
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { top: autoTableTopMargin, left: margin, right: margin, bottom: 28 },
    willDrawPage: autoTableWillDrawPage,
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [...PDF_CHECKLIST_ROW_ALT_BLUE],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 2: VEHICLE INFORMATION (Table)
  // ============================================
  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (yPos > pageHeight - 100) {
    doc.addPage();
    drawHeaderHere();
    yPos = PDF_HEADER_HEIGHT + 10;
  }

  // Section title
  doc.setFillColor(PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Vehicle Information', margin + 6, yPos + 2);
  yPos += 12;

  const vehicleInfo = inspection.vehicleInfo || {};
  const vehicleData = [
    ['Dealer', formatValue(vehicleInfo.dealer)],
    ['Dealer Stock No', formatValue(vehicleInfo.dealerStockNo)],
    ['Make', formatValue(vehicleInfo.make)],
    ['Model', formatValue(vehicleInfo.model)],
    ['Year', formatValue(vehicleInfo.year)],
    ['VIN', formatValue(vehicleInfo.vin)],
    ['Engine', formatValue(vehicleInfo.engine)],
    ['Odometer', formatValue(vehicleInfo.odometer)],
    ['Compliance Date', formatValue(vehicleInfo.complianceDate)],
    ['Build Date', formatValue(vehicleInfo.buildDate)],
    ['License Plate', formatValue(vehicleInfo.licensePlate)],
  ];

  autoTable(doc, {
    startY: yPos,
    body: vehicleData,
    theme: 'striped',
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { top: autoTableTopMargin, left: margin, right: margin, bottom: 28 },
    willDrawPage: autoTableWillDrawPage,
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [...PDF_CHECKLIST_ROW_ALT_BLUE],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 3: GPS LOCATION (Table)
  // ============================================
  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (yPos > pageHeight - 100) {
    doc.addPage();
    drawHeaderHere();
    yPos = PDF_HEADER_HEIGHT + 10;
  }

  // Section title
  doc.setFillColor(PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GPS Location', margin + 6, yPos + 2);
  yPos += 12;

  const location = inspection.location || {};
  const locationData = [
    ['Start Address', formatValue(location.start?.address)],
    ['Start Time', location.start?.timestamp ? formatDateTimeAustraliaEastern(location.start.timestamp) : formatValue(null)],
    ['End Time', location.end?.timestamp ? formatDateTimeAustraliaEastern(location.end.timestamp) : formatValue(null)],
  ];

  autoTable(doc, {
    startY: yPos,
    body: locationData,
    theme: 'striped',
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { top: autoTableTopMargin, left: margin, right: margin, bottom: 28 },
    willDrawPage: autoTableWillDrawPage,
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [...PDF_CHECKLIST_ROW_ALT_BLUE],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 4: GENERAL PHOTOS
  // ============================================
  if (yPos > pageHeight - 120) {
    doc.addPage();
    drawHeaderHere();
    yPos = PDF_HEADER_HEIGHT + 10;
  }

  // Section title
  doc.setFillColor(PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('General Photos', margin + 6, yPos + 2);
  yPos += 12;

  if (inspection.photos && inspection.photos.length > 0) {
    const photosPerRow = 2;
    const photoSpacing = 8;
    const photoWidth = (contentWidth - photoSpacing) / photosPerRow;
    const photoHeight = photoWidth * 0.75;
    const generalPhotos = inspection.photos.slice(0, maxGeneral);
    
    for (let i = 0; i < generalPhotos.length; i++) {
      const photo = generalPhotos[i];
      const fileName = typeof photo === 'string' ? photo : (photo as any).fileName;
      const imageSrc = resolvePdfImageSource(photo as string | { fileName?: string; url?: string }) ?? fileName;
      
      const col = i % photosPerRow;
      const row = Math.floor(i / photosPerRow);
      
      if (row > 0 && col === 0) {
        if (yPos + photoHeight > pageHeight - 50) {
          doc.addPage();
          drawHeaderHere();
          yPos = PDF_HEADER_HEIGHT + 10;
        } else {
          yPos = yPos + (row * (photoHeight + photoSpacing));
        }
      }
      
      const x = margin + (col * (photoWidth + photoSpacing));
      const y = yPos;
      
      const imageData = imageCache.get(imageSrc) ?? (fileName ? imageCache.get(fileName) : null) ?? null;
      await addImageToPDF(doc, imageData, x, y, photoWidth, photoHeight, fileName);
      
      if ((i + 1) % photosPerRow === 0 || i === generalPhotos.length - 1) {
        yPos = y + photoHeight + photoSpacing;
      }
    }
    
    yPos += 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('No general photos provided', margin + 6, yPos);
    yPos += 15;
  }

  const walkAround = (inspection as { walkAroundVideos?: Array<{ fileName: string; url?: string } | string> }).walkAroundVideos;
  if (walkAround && walkAround.length > 0) {
    if (yPos > pageHeight - 80) {
      doc.addPage();
      drawHeaderHere();
      yPos = PDF_HEADER_HEIGHT + 10;
    }
    doc.setFillColor(PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]);
    doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Walk-around video', margin + 6, yPos + 2);
    yPos += 14;
    for (let vi = 0; vi < Math.min(walkAround.length, 5); vi++) {
      const v = walkAround[vi];
      const entry = typeof v === 'string' ? { fileName: v } : v;
      const href = getPhotoDisplayUrl(entry as { fileName: string; url?: string });
      if (!href) continue;
      const line = href.length > 96 ? `${href.slice(0, 93)}…` : href;
      drawPdfTextLink(doc, line, margin + 6, yPos, href);
      yPos += 6;
    }
    if (walkAround.length > 5) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80, 80, 100);
      doc.text(`… and ${walkAround.length - 5} more (see digital report)`, margin + 6, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 50);
      yPos += 6;
    }
    yPos += 8;
  }

  // ============================================
  // SECTION 5: INSPECTION CHECKLIST (Table Format)
  // ============================================
  let checklistPhotosRemaining = maxChecklistPhotosForThisRun;
  for (const category of checklist) {
    if (!category || !category.category) continue;
    
    if (yPos > pageHeight - 100) {
      doc.addPage();
      drawHeaderHere();
      yPos = PDF_HEADER_HEIGHT + 10;
    }

    // Category header
    doc.setFillColor(PDF_THEME_STRIP[0], PDF_THEME_STRIP[1], PDF_THEME_STRIP[2]);
    doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(category.category, margin + 6, yPos + 2);
    yPos += 12;
    
    const items = Array.isArray(category.items) ? category.items : [];
    
    if (items.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No items in this category', margin + 6, yPos);
      yPos += 10;
      continue;
    }
    
    // Table for checklist items
    const tableData: any[][] = [];
    
    for (const item of items) {
      if (!item || !item.item) continue;
      
      const statusText = normalizeChecklistStatusForPdf(item.status);

      let notes = item.notes && String(item.notes).trim() ? String(item.notes).trim() : '';
      if (/^no\s*notes?$/i.test(notes)) notes = '';
      const photoCount = item.photos && item.photos.length > 0 ? `${item.photos.length} photo(s)` : 'No photos';
      
      tableData.push([
        item.item,
        statusText,
        notes,
        photoCount
      ]);
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Status', 'Notes', 'Photos']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 75, fontStyle: 'bold', textColor: [30, 30, 40], halign: 'left' },
        1: { cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: [PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]] },
        2: { cellWidth: 'auto', textColor: [60, 60, 80], halign: 'left' },
        3: { cellWidth: 35, halign: 'center', fontSize: 8, textColor: [100, 100, 120] },
      },
      margin: { top: autoTableTopMargin, left: margin, right: margin, bottom: 28 },
      willDrawPage: autoTableWillDrawPage,
      styles: { overflow: 'linebreak', cellPadding: 3 },
      alternateRowStyles: {
        fillColor: [...PDF_CHECKLIST_ROW_ALT_BLUE],
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const raw = data.cell.text;
          const t = (Array.isArray(raw) ? raw.join(' ') : String(raw ?? '')).trim();
          if (!t || /^no\s*notes?$/i.test(t)) {
            data.cell.text = [];
          }
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 12;
    
    // Add item photos
    for (const item of items) {
      if (!item.photos || item.photos.length === 0) continue;
      
      if (yPos > pageHeight - 90) {
        doc.addPage();
        drawHeaderHere();
        yPos = PDF_HEADER_HEIGHT + 10;
      }

      // Item photo header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]);
      doc.text(`${item.item} - Photos:`, margin + 6, yPos);
      yPos += 8;
      
      // Photos grid (3 per row) - capped for speed
      const itemPhotoWidth = (contentWidth - 12) / 3;
      const itemPhotoHeight = itemPhotoWidth * 0.75;
      const photoSpacing = 6;
      let itemPhotosSlice = item.photos.slice(0, maxPerItem);
      const kept: typeof itemPhotosSlice = [] as typeof itemPhotosSlice;
      for (const photo of itemPhotosSlice) {
        if (checklistPhotosRemaining <= 0) break;
        const src = resolvePdfImageSource(photo as string | { fileName?: string; url?: string });
        if (!src) continue;
        kept.push(photo);
        checklistPhotosRemaining -= 1;
      }
      itemPhotosSlice = kept;
      if (itemPhotosSlice.length === 0) continue;

      for (let i = 0; i < itemPhotosSlice.length; i++) {
        const photo = itemPhotosSlice[i];
        const fileName = typeof photo === 'string' ? photo : (photo as any).fileName;
        const imageSrc = resolvePdfImageSource(photo as string | { fileName?: string; url?: string }) ?? fileName;
        
        if (yPos + itemPhotoHeight > pageHeight - 50) {
          doc.addPage();
          drawHeaderHere();
          yPos = PDF_HEADER_HEIGHT + 10;
        }

        const col = i % 3;
        const row = Math.floor(i / 3);
        
        const x = margin + 6 + (col * (itemPhotoWidth + photoSpacing));
        const y = yPos + (row * (itemPhotoHeight + photoSpacing));
        
        const imageData = imageCache.get(imageSrc) ?? (fileName ? imageCache.get(fileName) : null) ?? null;
        await addImageToPDF(doc, imageData, x, y, itemPhotoWidth, itemPhotoHeight, fileName);

        const markers =
          typeof photo === 'object' && photo && Array.isArray((photo as { damageMarkers?: { label: string }[] }).damageMarkers)
            ? (photo as { damageMarkers: { label: string }[] }).damageMarkers
            : null;
        if (markers?.length) {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(90, 50, 30);
          const txt = `Damage: ${markers.map((m) => m.label).join('; ')}`;
          const short = txt.length > 95 ? `${txt.slice(0, 92)}…` : txt;
          doc.text(short, x, y + itemPhotoHeight + 3);
        }
        
        if ((i + 1) % 3 === 0 || i === itemPhotosSlice.length - 1) {
          yPos = y + itemPhotoHeight + photoSpacing;
        }
      }
      
      yPos += 8;
    }
    
    yPos += 5;
  }

  // ============================================
  // SECTION 6: SIGNATURES (Table)
  // ============================================
  if (yPos > pageHeight - 100) {
    doc.addPage();
    drawHeaderHere();
    yPos = PDF_HEADER_HEIGHT + 10;
  }

  const signatureMaxWidth = contentWidth - 20;
  const signatureMaxHeight = 52;

  // Technician Signature only
  const techSigX = margin + 10;
  const techSigY = yPos + 5;

  if (inspection.signatures?.technician) {
    let sigSrc = inspection.signatures.technician;
    let sigFormat: 'PNG' | 'JPEG' = 'PNG';
    if (forEmail && typeof sigSrc === 'string' && sigSrc.startsWith('data:')) {
      const shrunk = await shrinkDataUriForEmail(sigSrc);
      if (shrunk?.startsWith('data:image/jpeg')) {
        sigSrc = shrunk;
        sigFormat = 'JPEG';
      }
    }
    try {
      let drawW = signatureMaxWidth;
      let drawH = signatureMaxHeight;
      let drawX = techSigX;
      if (typeof sigSrc === 'string' && sigSrc.startsWith('data:image')) {
        const dim = await getRasterDimensionsFromDataUri(sigSrc);
        if (dim) {
          const scale = Math.min(signatureMaxWidth / dim.w, signatureMaxHeight / dim.h);
          drawW = dim.w * scale;
          drawH = dim.h * scale;
          drawX = techSigX + (signatureMaxWidth - drawW) / 2;
        }
      }
      const drawY = techSigY + (signatureMaxHeight - drawH) / 2;
      doc.addImage(sigSrc, sigFormat as 'PNG' | 'JPEG', drawX, drawY, drawW, drawH);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(techSigX, techSigY, signatureMaxWidth, signatureMaxHeight);
    } catch (e) {
      doc.setFillColor(250, 250, 250);
      doc.rect(techSigX, techSigY, signatureMaxWidth, signatureMaxHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(techSigX, techSigY, signatureMaxWidth, signatureMaxHeight);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Signature on file', techSigX + signatureMaxWidth / 2, techSigY + signatureMaxHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(250, 250, 250);
    doc.rect(techSigX, techSigY, signatureMaxWidth, signatureMaxHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(techSigX, techSigY, signatureMaxWidth, signatureMaxHeight);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Not signed', techSigX + signatureMaxWidth / 2, techSigY + signatureMaxHeight / 2, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 80);
  doc.text('Technician Signature:', techSigX, yPos);

  drawDisclaimerPages(doc, pageWidth, pageHeight, margin, contentWidth, inspection, headerLogo);

  // ============================================
  // FOOTER - On Every Page
  // ============================================
  const pageCount = doc.getNumberOfPages();
  const footerY = pageHeight - 10;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(PDF_THEME_MAIN[0], PDF_THEME_MAIN[1], PDF_THEME_MAIN[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('Pre Delivery Global Pty Ltd', margin, footerY);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
