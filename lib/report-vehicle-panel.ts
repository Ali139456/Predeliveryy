import type { IInspection } from '@/types/db';
import {
  extractLocationLabel,
  formatReportDateTime,
  formatValue,
  getVehicleTitle,
} from '@/lib/inspection-report-data';

export type VehicleDetailPair = { label: string; value: string };

export function getVehicleColour(vehicleInfo: IInspection['vehicleInfo']): string {
  const v = vehicleInfo as { colour?: string; color?: string } | undefined;
  return formatValue(v?.colour || v?.color);
}

export function buildVehicleDetailColumns(inspection: IInspection): {
  col1: VehicleDetailPair[];
  col2: VehicleDetailPair[];
} {
  const v = inspection.vehicleInfo;
  const startTime =
    (inspection.location as { start?: { timestamp?: string } })?.start?.timestamp ||
    inspection.inspectionDate ||
    inspection.createdAt;

  return {
    col1: [
      { label: 'VIN', value: formatValue(v?.vin) },
      { label: 'Odometer', value: formatValue(v?.odometer) },
      { label: 'Colour', value: getVehicleColour(v) },
      { label: 'Registration', value: formatValue(v?.licensePlate) },
      { label: 'Dealer', value: formatValue(v?.dealer) },
    ],
    col2: [
      { label: 'Inspection type', value: 'Pre-delivery inspection' },
      { label: 'Inspection location', value: extractLocationLabel(inspection.location) },
      { label: 'Start time', value: formatReportDateTime(startTime) },
      { label: 'Technician', value: formatValue(inspection.inspectorName) },
    ],
  };
}

export function getReportResultDisplay(isPass: boolean, needsReview: boolean) {
  return {
    label: isPass ? 'PASS' : needsReview ? 'REVIEW' : 'ATTENTION',
    summary: isPass
      ? 'Vehicle has passed all required pre-delivery inspection checks.'
      : 'Repair or review required before delivery.',
    pass: isPass,
  };
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fieldAnchorId(label: string): string | undefined {
  if (label === 'VIN') return 'report-field-vin';
  if (label === 'Odometer') return 'report-field-odometer';
  return undefined;
}

function detailColumnHtml(pairs: VehicleDetailPair[]): string {
  return pairs
    .map((p) => {
      const id = fieldAnchorId(p.label);
      const idAttr = id ? ` id="${id}"` : '';
      return `<div class="report-detail-row"${idAttr}><span class="report-detail-label">${esc(p.label)}</span><span class="report-detail-value">${esc(p.value)}</span></div>`;
    })
    .join('');
}

export function renderVehicleResultPanelHtml(
  inspection: IInspection,
  heroBlock: string,
  result: { isPass: boolean; needsReview: boolean }
): string {
  const vehicleTitle = getVehicleTitle(inspection);
  const { col1, col2 } = buildVehicleDetailColumns(inspection);
  const display = getReportResultDisplay(result.isPass, result.needsReview);
  const passRing = display.pass ? 'border-[#FF6600] bg-white' : 'border-amber-500 bg-amber-50';
  const passText = display.pass ? 'text-[#FF6600]' : 'text-amber-600';
  const checkPath = display.pass
    ? '<path d="M8 12.5l2.5 2.5L16 9" stroke="#FF6600" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M12 9v4M12 16h.01" stroke="#d97706" stroke-width="2.2" stroke-linecap="round"/>';

  return `<section class="report-page-1 report-vehicle-result-row grid grid-cols-1 lg:grid-cols-[1fr_minmax(148px,26%)] gap-2.5 p-2.5 border-b border-[var(--report-border)]">
  <div class="report-panel border border-[var(--report-border)] rounded-sm overflow-hidden bg-white flex flex-col min-h-0">
    <div class="report-panel-header bg-[#E8EEFF] px-3 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[var(--report-border)]">
      <span class="text-[10px] font-bold text-[#0033FF] uppercase tracking-wide">Vehicle information</span>
      <span class="text-[11px] sm:text-sm font-bold text-[#0033FF] text-right">${esc(vehicleTitle)}</span>
    </div>
    <div class="p-2.5 grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3 items-start flex-1">
      <div class="relative h-[76px] sm:h-[88px] bg-slate-100 border border-[var(--report-border)] overflow-hidden rounded-sm">${heroBlock}</div>
      <div class="report-vehicle-columns grid grid-cols-2 gap-0 min-w-0 divide-x divide-[var(--report-border)]">
        <div class="report-vehicle-col pr-3 space-y-2">${detailColumnHtml(col1)}</div>
        <div class="report-vehicle-col pl-3 space-y-2">${detailColumnHtml(col2)}</div>
      </div>
    </div>
  </div>
  <div class="report-panel border border-[var(--report-border)] rounded-sm overflow-hidden bg-white flex flex-col min-h-[140px]">
    <div class="report-panel-header bg-[#E8EEFF] px-3 py-2 border-b border-[var(--report-border)]">
      <span class="text-[10px] font-bold text-[#0033FF] uppercase tracking-wide">Pre-delivery result</span>
    </div>
    <div class="flex flex-1 flex-col">
      <div class="flex flex-1 items-center justify-center px-3 py-4">
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-full border-[3px] flex items-center justify-center shrink-0 ${passRing}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-7 w-7" aria-hidden="true">${checkPath}</svg>
          </div>
          <span class="text-2xl sm:text-3xl font-black tracking-tight leading-none ${passText}">${display.label}</span>
        </div>
      </div>
      <p class="text-[9px] font-medium text-[#0033FF] text-center leading-snug px-3 pb-3">${esc(display.summary)}</p>
    </div>
  </div>
</section>`;
}
