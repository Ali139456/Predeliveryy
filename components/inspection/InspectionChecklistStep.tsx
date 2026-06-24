'use client';

import { useMemo, useRef } from 'react';
import {
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Cog,
  MinusCircle,
  Save,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import ItemPhotoUpload from '@/components/ItemPhotoUpload';
import VoiceNotesButton from '@/components/VoiceNotesButton';

type ChecklistField = {
  id?: string;
  category: string;
  items: Array<{
    item: string;
    status: string;
    notes?: string;
    photos?: unknown[];
  }>;
};

function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('exterior')) return Car;
  if (n.includes('interior')) return Car;
  if (n.includes('under vehicle') || n.includes('under bonnet')) return Wrench;
  if (n.includes('final')) return ClipboardCheck;
  return Cog;
}

type StatusKey = 'OK' | 'C' | 'A' | 'R' | 'RP' | 'N';

const STATUS_OPTIONS: Array<{ value: StatusKey; label: string }> = [
  { value: 'OK', label: 'OK - Satisfactory' },
  { value: 'C', label: 'Clean' },
  { value: 'A', label: 'Adjust' },
  { value: 'R', label: 'Repair' },
  { value: 'RP', label: 'Replace' },
  { value: 'N', label: 'N/A' },
];

function normalizeStatus(s: string): StatusKey {
  const u = String(s || '').trim().toUpperCase();
  if (u === 'OK' || u === 'PASS') return 'OK';
  if (u === 'C') return 'C';
  if (u === 'A') return 'A';
  if (u === 'R') return 'R';
  if (u === 'RP') return 'RP';
  if (u === 'N' || u === 'N/A') return 'N';
  return 'OK';
}

function statusVisual(status: StatusKey) {
  switch (status) {
    case 'OK':
      return {
        label: 'OK - Satisfactory',
        Icon: CheckCircle2,
        wrap: 'border-emerald-300 bg-emerald-50/50',
        text: 'text-emerald-700',
        icon: 'text-emerald-600',
      };
    case 'C':
      return {
        label: 'Clean',
        Icon: Sparkles,
        wrap: 'border-orange-300 bg-orange-50/50',
        text: 'text-orange-700',
        icon: 'text-orange-500',
      };
    case 'A':
      return {
        label: 'Adjust',
        Icon: Wrench,
        wrap: 'border-amber-300 bg-amber-50/50',
        text: 'text-amber-700',
        icon: 'text-amber-600',
      };
    case 'R':
      return {
        label: 'Repair',
        Icon: Wrench,
        wrap: 'border-red-300 bg-red-50/50',
        text: 'text-red-700',
        icon: 'text-red-500',
      };
    case 'RP':
      return {
        label: 'Replace',
        Icon: Wrench,
        wrap: 'border-red-300 bg-red-50/50',
        text: 'text-red-700',
        icon: 'text-red-500',
      };
    case 'N':
    default:
      return {
        label: 'N/A',
        Icon: MinusCircle,
        wrap: 'border-slate-300 bg-slate-50',
        text: 'text-slate-600',
        icon: 'text-slate-400',
      };
  }
}

function countSectionDone(items: { status?: string }[]) {
  return items.filter((i) => {
    const s = String(i.status || '').toUpperCase();
    return s === 'OK' || s === 'N' || s === 'PASS';
  }).length;
}

interface InspectionChecklistStepProps {
  fields: ChecklistField[];
  activeCategoryIndex: number;
  onCategoryChange: (index: number) => void;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  readOnly?: boolean;
  inspectionId?: string;
  onSaveSection?: () => void;
  sectionSaving?: boolean;
  sectionSaved?: boolean;
  vehicleTitle: string;
  vinLabel: string;
}

const NOTES_MAX = 500;

interface ChecklistItemCardProps {
  number: number;
  itemTitle: string;
  categoryIndex: number;
  itemIndex: number;
  categoryName: string;
  watch: UseFormWatch<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  readOnly: boolean;
}

function ChecklistItemCard({
  number,
  itemTitle,
  categoryIndex,
  itemIndex,
  categoryName,
  watch,
  register,
  setValue,
  getValues,
  readOnly,
}: ChecklistItemCardProps) {
  const statusPath = `checklist.${categoryIndex}.items.${itemIndex}.status` as const;
  const notesPath = `checklist.${categoryIndex}.items.${itemIndex}.notes` as const;
  const photosPath = `checklist.${categoryIndex}.items.${itemIndex}.photos` as const;

  const rawStatus = (watch(statusPath) as string) ?? 'OK';
  const status = normalizeStatus(rawStatus);
  const visual = statusVisual(status);
  const StatusIcon = visual.Icon;

  const notes = (watch(notesPath) as string) ?? '';
  const notesLen = (notes || '').length;
  const photos = (watch(photosPath) as unknown[]) ?? [];

  const openCameraRef = useRef<(() => void) | null>(null);
  const triggerPhoto = () => {
    openCameraRef.current?.();
  };

  return (
    <div className="rounded-2xl border-2 border-[#0033FF]/15 bg-white shadow-sm overflow-hidden">
      <input type="hidden" {...register(`checklist.${categoryIndex}.items.${itemIndex}.item`)} />

      {/* Header strip: number + title (full line on mobile), status pill right-aligned below on mobile / inline on sm+ */}
      <div className="px-3 sm:px-4 py-3 bg-[#EEF2FF]">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-[#0033FF] text-white text-sm font-bold flex items-center justify-center">
            {number}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-slate-900 leading-snug">
              {itemTitle}
            </p>
          </div>

          {/* Inline on sm+ */}
          <div className="hidden sm:block shrink-0">
            <div className={`relative rounded-xl border-2 ${visual.wrap}`}>
              <StatusIcon
                className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${visual.icon}`}
                aria-hidden
              />
              <select
                {...register(statusPath)}
                disabled={readOnly}
                aria-label="Status"
                className={`appearance-none bg-transparent pl-8 pr-7 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20 rounded-xl disabled:opacity-70 ${visual.text}`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${visual.icon}`}
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* Full row on mobile, right-aligned */}
        <div className="mt-3 flex justify-end sm:hidden">
          <div className={`relative rounded-xl border-2 ${visual.wrap}`}>
            <StatusIcon
              className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${visual.icon}`}
              aria-hidden
            />
            <select
              {...register(statusPath)}
              disabled={readOnly}
              aria-label="Status (mobile)"
              className={`appearance-none bg-transparent pl-8 pr-7 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20 rounded-xl disabled:opacity-70 ${visual.text}`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${visual.icon}`}
              aria-hidden
            />
          </div>
        </div>
      </div>

      {/* Notes label */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 mb-2">
        <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Notes</p>
      </div>

      {/* Notes textarea + action buttons */}
      <div className="px-3 sm:px-4 pb-3 flex flex-col sm:flex-row gap-2 items-stretch">
        <div className="relative flex-1">
          <textarea
            {...register(notesPath)}
            disabled={readOnly}
            rows={1}
            maxLength={NOTES_MAX}
            placeholder="Type notes here..."
            className="w-full px-3 py-2.5 pr-14 text-sm border border-slate-200 rounded-xl bg-slate-50/60 resize-y min-h-[44px] focus:bg-white focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] disabled:opacity-60 placeholder:text-slate-400"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums">
            {notesLen}/{NOTES_MAX}
          </span>
        </div>

        <div className="flex gap-2 shrink-0">
          {!readOnly && (
            <VoiceNotesButton
              disabled={readOnly}
              variant="solid"
              onAppend={(text) => {
                const cur = (getValues(notesPath) as string) || '';
                const next = `${cur}${text}`.slice(0, NOTES_MAX);
                setValue(notesPath, next, { shouldDirty: true });
              }}
            />
          )}
          {!readOnly && (
            <button
              type="button"
              onClick={triggerPhoto}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0033FF] text-white text-sm font-semibold shadow-sm hover:bg-[#0029cc] transition-colors"
            >
              <Camera className="w-4 h-4" aria-hidden />
              Take photo
            </button>
          )}
        </div>
      </div>

      {/* Photos thumbnails + camera modal (modal lives inside even when no thumbs yet) */}
      <div className={photos.length === 0 ? 'px-3 sm:px-4' : 'px-3 sm:px-4 pb-3'}>
        <ItemPhotoUpload
          photos={photos as never}
          onPhotosChange={(newPhotos: unknown) => {
            if (!readOnly) setValue(photosPath, newPhotos as never);
          }}
          maxPhotos={5}
          itemName={itemTitle}
          categoryName={categoryName}
          readOnly={readOnly}
          hideHeader
          openCameraRef={openCameraRef}
        />
      </div>
    </div>
  );
}

export default function InspectionChecklistStep({
  fields,
  activeCategoryIndex,
  onCategoryChange,
  register,
  watch,
  setValue,
  getValues,
  readOnly = false,
  inspectionId,
  onSaveSection,
  sectionSaving = false,
  sectionSaved = false,
  vehicleTitle,
  vinLabel,
}: InspectionChecklistStepProps) {
  const total = fields.length;
  const safeIndex = Math.max(0, Math.min(activeCategoryIndex, Math.max(0, total - 1)));
  const category = fields[safeIndex];
  const items = category?.items || [];
  const categoryName = category?.category || '';
  const Icon = categoryIcon(categoryName);
  const watchedItems = watch(`checklist.${safeIndex}.items`) ?? items;
  const doneCount = countSectionDone(watchedItems);
  const sectionPct = total ? Math.round(((safeIndex + 1) / total) * 100) : 0;

  if (!total || !category) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 text-center">
        Checklist is loading…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#0a1628] text-white px-4 py-3">
          <p className="text-[11px] text-white/75 truncate">VIN: {vinLabel || 'Not provided'}</p>
          <p className="text-sm sm:text-base font-semibold truncate mt-0.5">{vehicleTitle}</p>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between text-sm text-slate-800">
            <span className="font-medium">
              Section {safeIndex + 1} of {total}
            </span>
            <span className="font-semibold tabular-nums text-slate-600">{sectionPct}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0033FF] transition-[width] duration-300"
              style={{ width: `${sectionPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/80">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-5 h-5 text-[#0033FF] shrink-0" aria-hidden />
            <h3 className="text-base font-bold text-slate-900 truncate">{categoryName}</h3>
          </div>
          <span className="text-sm font-semibold text-slate-600 shrink-0 tabular-nums">
            {doneCount}/{items.length}
          </span>
        </div>

        {!readOnly && inspectionId && onSaveSection && (
          <div className="px-4 py-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onSaveSection}
              disabled={sectionSaving}
              className="inline-flex items-center text-xs font-semibold text-[#0033FF] hover:underline disabled:opacity-50"
            >
              {sectionSaving ? (
                'Saving…'
              ) : sectionSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save section
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <input type="hidden" {...register(`checklist.${safeIndex}.category`)} />

      {/* Item cards */}
      <div className="space-y-3">
        {items.map((item, itemIndex) => (
          <ChecklistItemCard
            key={`${safeIndex}-${itemIndex}`}
            number={itemIndex + 1}
            itemTitle={item.item}
            categoryIndex={safeIndex}
            itemIndex={itemIndex}
            categoryName={categoryName}
            watch={watch}
            register={register}
            setValue={setValue}
            getValues={getValues}
            readOnly={readOnly}
          />
        ))}
      </div>

      {total > 1 && (
        <div className="flex gap-2 p-3 rounded-2xl border border-slate-200 bg-white sm:hidden">
          <button
            type="button"
            disabled={readOnly || safeIndex === 0}
            onClick={() => onCategoryChange(Math.max(0, safeIndex - 1))}
            className="flex-1 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40"
          >
            Previous section
          </button>
          <button
            type="button"
            disabled={readOnly || safeIndex >= total - 1}
            onClick={() => onCategoryChange(Math.min(total - 1, safeIndex + 1))}
            className="flex-1 py-2 text-sm font-semibold rounded-xl bg-[#0033FF] text-white disabled:opacity-40"
          >
            {safeIndex >= total - 1 ? 'Last section' : 'Next section'}
          </button>
        </div>
      )}

      <details className="rounded-2xl border border-slate-200 bg-white text-xs text-slate-600">
        <summary className="px-4 py-2 cursor-pointer font-semibold text-slate-700">
          Action codes
        </summary>
        <div className="px-4 pb-3 grid grid-cols-2 gap-1">
          <span>
            <strong>OK</strong> = Pass
          </span>
          <span>
            <strong>N</strong> = N/A
          </span>
          <span>
            <strong>C,A,R,RP</strong> = Review
          </span>
        </div>
      </details>
    </div>
  );
}
