import 'server-only';

import fs from 'fs';
import path from 'path';
import type { IInspection } from '@/types/db';
import {
  buildReportNotes,
  buildVerificationBadges,
  collectReportPhotos,
  computeReportResult,
  formatReportDateTime,
  getHeroPhotoUrl,
  orderChecklistForReport,
  reportCategoryAnchorId,
  reportItemStatusLabel,
  reportCategorySummary,
  type ReportPhoto,
} from '@/lib/inspection-report-data';
import { renderVehicleResultPanelHtml } from '@/lib/report-vehicle-panel';
import { verificationBadgesHtml } from '@/lib/report-verification-badges';
import { loadImageAsBase64 } from '@/lib/pdfGenerator';
import { wrapReportHtmlDocument } from '@/lib/report-html-document';
import { SITE_LOGO_ALT, SITE_LOGO_REPORT_SRC } from '@/lib/siteLogo';

export type BuildReportHtmlOptions = {
  origin: string;
  maxPhotos?: number;
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toAbsoluteUrl(src: string, origin: string): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  const base = origin.replace(/\/$/, '');
  return src.startsWith('/') ? `${base}${src}` : `${base}/${src}`;
}

async function embedImageSrc(src: string | null | undefined, origin: string): Promise<string | null> {
  if (!src || !src.trim()) return null;
  if (src.startsWith('data:')) return src;
  const absolute = toAbsoluteUrl(src, origin);
  const embedded = await loadImageAsBase64(absolute);
  return embedded || absolute;
}

async function loadLogoDataUrl(origin: string): Promise<string> {
  const diskPath = path.join(process.cwd(), 'public', 'Transparent Logo.png');
  if (fs.existsSync(diskPath)) {
    const buf = fs.readFileSync(diskPath);
    return `data:image/png;base64,${buf.toString('base64')}`;
  }
  return toAbsoluteUrl(SITE_LOGO_REPORT_SRC, origin);
}

async function buildEmbeddedPhotoList(
  inspection: IInspection,
  origin: string,
  maxPhotos?: number
): Promise<ReportPhoto[]> {
  const raw = collectReportPhotos(inspection);
  const capped = maxPhotos != null ? raw.slice(0, Math.max(0, maxPhotos)) : raw;
  const out: ReportPhoto[] = [];
  for (const p of capped) {
    const url = await embedImageSrc(p.url, origin);
    if (url) out.push({ ...p, url });
  }
  return out;
}

function renderReportBody(
  inspection: IInspection,
  opts: {
    logoSrc: string;
    heroUrl: string | null;
    photos: ReportPhoto[];
    signatureSrc: string | null | undefined;
  }
): string {
  const { logoSrc, heroUrl, photos, signatureSrc } = opts;
  const result = computeReportResult(inspection);
  const notes = buildReportNotes(inspection);
  const checklistCategories = orderChecklistForReport(inspection.checklist || []);
  const verificationBadges = buildVerificationBadges(inspection);
  const badgesHtml = verificationBadgesHtml(verificationBadges);

  const checklistHtml = checklistCategories
    .map((cat) => {
      const summary = reportCategorySummary(cat);
      const itemsHtml = (cat.items || [])
        .map((item, idx) => {
          const label = reportItemStatusLabel(item.status);
          const tone =
            label === 'PASS'
              ? 'text-[#FF6600]'
              : label === 'N/A'
                ? 'text-slate-500'
                : 'text-amber-700';
          const rowBg = idx % 2 === 1 ? 'bg-[var(--report-row-alt)]' : 'bg-white';
          return `<li class="flex justify-between gap-1 px-2 py-1 border-b border-slate-100 last:border-0 ${rowBg}">
            <span class="text-slate-800 leading-tight pr-1">${esc(item.item)}</span>
            <span class="font-bold shrink-0 ${tone}">${esc(label)}</span>
          </li>`;
        })
        .join('');
      const countLabel =
        summary.total > 0 ? `${summary.passed} / ${summary.total} checks` : 'No checks';
      return `<div id="${esc(reportCategoryAnchorId(cat.category))}" class="report-checklist-category border border-[var(--report-border)] rounded-sm overflow-hidden bg-white">
        <div class="bg-[#0033FF] text-white text-[10px] font-bold uppercase px-2 py-1.5 text-center">${esc(cat.category)}</div>
        <ul class="text-[9px]">${itemsHtml}</ul>
        <p class="border-t border-[var(--report-border)] bg-slate-50 px-2 py-1 text-center text-[8px] font-bold uppercase tracking-wide text-[#0033FF]">${esc(countLabel)}</p>
      </div>`;
    })
    .join('');

  const photosHtml =
    photos.length === 0
      ? '<p class="text-xs text-slate-500">No photos attached to this inspection.</p>'
      : `<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">${photos
          .map(
            (p) =>
              `<div class="report-photo-cell">
                <div class="aspect-square border border-[var(--report-border)] bg-slate-100 overflow-hidden">
                  <img src="${esc(p.url)}" alt="${esc(p.label)}" class="w-full h-full object-cover" />
                </div>
                <p class="text-[9px] font-bold text-[#0033FF] text-center mt-0.5 leading-tight line-clamp-2">${esc(p.label)}</p>
              </div>`
          )
          .join('')}</div>`;

  const heroBlock = heroUrl
    ? `<img src="${esc(heroUrl)}" alt="Vehicle" class="w-full h-full object-cover" />`
    : '<div class="flex items-center justify-center h-full text-[10px] text-slate-400 p-1 text-center leading-tight">No photo</div>';

  const sigBlock = signatureSrc
    ? `<img src="${esc(signatureSrc)}" alt="Signature" class="max-h-14 w-full object-contain" />`
    : '<p class="text-slate-400 italic">Not provided</p>';

  const vehicleResultHtml = renderVehicleResultPanelHtml(inspection, heroBlock, result);

  return `<div class="inspection-report-root w-full py-0">
  <article class="inspection-report-sheet overflow-hidden rounded-sm border border-slate-200">
    <header class="report-page-1 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 items-center px-3 py-2.5 text-white" style="background:linear-gradient(180deg,#002060 0%,#0033ff 100%)">
      <div class="shrink-0 w-fit max-w-full">
        <img src="${esc(logoSrc)}" alt="${esc(SITE_LOGO_ALT)}" class="h-14 sm:h-[4.25rem] w-auto max-w-[min(100%,280px)] object-contain object-left block" />
        <p class="mt-1 text-[10px] font-semibold text-white/90 tracking-wide">Pre Delivery Inspection Report</p>
      </div>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] md:text-xs md:justify-end">
        <div class="flex items-center gap-2">
          <span class="text-[#FF6600] font-bold">◷</span>
          <div>
            <p class="text-white/70 text-[9px] uppercase tracking-wider">Inspection date</p>
            <p class="font-semibold">${esc(formatReportDateTime(inspection.inspectionDate || inspection.createdAt))}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[#FF6600] font-bold">#</span>
          <div>
            <p class="text-white/70 text-[9px] uppercase tracking-wider">Report ID</p>
            <p class="font-semibold">${esc(inspection.inspectionNumber || inspection.id || '')}</p>
          </div>
        </div>
      </div>
    </header>
    ${vehicleResultHtml}
    ${badgesHtml}
    <section class="report-section-tight border-b border-[var(--report-border)]">
      <h3 class="text-[11px] font-bold text-[#0033FF] uppercase mb-2 tracking-wide">Inspection categories</h3>
      <div class="report-checklist-grid">${checklistHtml}</div>
    </section>
    <section id="report-photos" class="report-section-tight border-b border-[var(--report-border)]">
      <h3 class="text-[11px] font-bold text-[#0033FF] uppercase mb-2">Inspection photos (${photos.length})</h3>
      ${photosHtml}
    </section>
    <footer class="grid grid-cols-1 md:grid-cols-3 gap-2 p-2.5 text-[10px]">
      <div class="border border-[var(--report-border)] rounded-sm p-2 bg-slate-50/50">
        <p class="font-bold text-[#0033FF] uppercase mb-1">Notes</p>
        <p class="text-slate-700 leading-snug">${esc(notes)}</p>
      </div>
      <div class="border border-[var(--report-border)] rounded-sm p-2 flex flex-col items-center justify-center">
        <p class="font-bold text-[#0033FF] uppercase mb-1 w-full text-left">Technician signature</p>
        ${sigBlock}
        <p class="text-[9px] text-slate-500 mt-1 w-full text-center">${esc(formatReportDateTime(inspection.updatedAt || inspection.createdAt))}</p>
      </div>
      <div class="border border-[var(--report-border)] rounded-sm p-2 flex flex-col items-center justify-center">
        <p class="font-bold text-[#0033FF] text-lg mb-1">✉</p>
        <p class="font-bold text-[#0033FF]">info@predelivery.ai</p>
      </div>
    </footer>
    <p class="text-[7px] text-slate-500 px-3 pb-3 leading-tight text-center whitespace-normal">
      DISCLAIMER: This report is based on a visual and non-invasive inspection at the time and location noted above. It does not guarantee future performance or condition of the vehicle. Refer to full terms at predelivery.ai/terms.
    </p>
  </article>
</div>`;
}

export async function buildInspectionReportHtml(
  inspection: IInspection,
  options: BuildReportHtmlOptions
): Promise<string> {
  const { origin, maxPhotos } = options;
  const photoList = await buildEmbeddedPhotoList(inspection, origin, maxPhotos);
  const heroRaw = getHeroPhotoUrl(inspection);
  const heroUrl = (await embedImageSrc(heroRaw, origin)) ?? photoList[0]?.url ?? null;
  const logoSrc = await loadLogoDataUrl(origin);
  const technicianSig = inspection.signatures?.technician;
  const signatureSrc = technicianSig ? await embedImageSrc(technicianSig, origin) : null;

  const body = renderReportBody(inspection, {
    logoSrc,
    heroUrl,
    photos: photoList,
    signatureSrc: signatureSrc || technicianSig,
  });

  return wrapReportHtmlDocument(
    body,
    `Inspection ${inspection.inspectionNumber || inspection.id || ''}`
  );
}
