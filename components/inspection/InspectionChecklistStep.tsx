'use client';

import { useMemo, useState } from 'react';
import {
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ClipboardCheck,
  Cog,
  Save,
  Wrench,
} from 'lucide-react';
import type { UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import ItemPhotoUpload from '@/components/ItemPhotoUpload';
import VoiceNotesButton from '@/components/VoiceNotesButton';
import {
  isReportItemPass,
  isReportItemReview,
  reportItemStatusLabel,
} from '@/lib/checklist-template';

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

function displayStatus(status: string) {
  const label = reportItemStatusLabel(status);
  if (label === 'PASS') return { text: 'Pass', tone: 'pass' as const };
  if (label === 'N/A') return { text: 'N/A', tone: 'na' as const };
  return { text: 'Review', tone: 'review' as const };
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const total = fields.length;
  const safeIndex = Math.max(0, Math.min(activeCategoryIndex, Math.max(0, total - 1)));
  const category = fields[safeIndex];
  const items = category?.items || [];
  const categoryName = category?.category || '';
  const Icon = categoryIcon(categoryName);
  const watchedItems = watch(`checklist.${safeIndex}.items`) ?? items;
  const doneCount = countSectionDone(watchedItems);
  const sectionPct = total ? Math.round(((safeIndex + 1) / total) * 100) : 0;

  const toggleExpand = (itemIndex: number) => {
    const key = `${safeIndex}-${itemIndex}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const statusToneClass = useMemo(
    () => ({
      pass: 'text-emerald-600',
      review: 'text-amber-600',
      na: 'text-slate-500',
    }),
    []
  );

  if (!total || !category) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 text-center">
        Checklist is loading…
      </div>
    );
  }

  return (
    <div className="-mx-1 sm:mx-0 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
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

      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-5 h-5 text-[#0033FF] shrink-0" aria-hidden />
          <h3 className="text-base font-bold text-slate-900 truncate">{categoryName}</h3>
        </div>
        <span className="text-sm font-semibold text-slate-600 shrink-0 tabular-nums">
          {doneCount}/{items.length}
        </span>
      </div>

      {!readOnly && inspectionId && onSaveSection && (
        <div className="px-4 py-2 border-b border-slate-100 flex justify-end">
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

      <input type="hidden" {...register(`checklist.${safeIndex}.category`)} />

      <ul className="divide-y divide-slate-100">
        {items.map((item, itemIndex) => {
          const itemKey = `${safeIndex}-${itemIndex}`;
          const isOpen = !!expanded[itemKey];
          const itemStatus =
            watch(`checklist.${safeIndex}.items.${itemIndex}.status`) ?? item.status ?? 'OK';
          const display = displayStatus(itemStatus);
          const itemPhotos =
            watch(`checklist.${safeIndex}.items.${itemIndex}.photos`) ?? item.photos ?? [];
          const photoRequired = itemStatus === 'R' || itemStatus === 'RP';
          const RowIcon = isReportItemPass(itemStatus)
            ? CheckCircle2
            : isReportItemReview(itemStatus)
              ? AlertCircle
              : ClipboardCheck;

          return (
            <li key={itemKey}>
              <input type="hidden" {...register(`checklist.${safeIndex}.items.${itemIndex}.item`)} />
              <button
                type="button"
                onClick={() => !readOnly && toggleExpand(itemIndex)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/80 transition-colors"
              >
                <Icon className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
                <span className="flex-1 min-w-0 text-sm font-medium text-slate-900 leading-snug pr-1">
                  {item.item}
                </span>
                <span
                  className={`inline-flex items-center gap-1 shrink-0 text-sm font-semibold ${statusToneClass[display.tone]}`}
                >
                  <RowIcon className="w-4 h-4" aria-hidden />
                  {display.text}
                </span>
                {!readOnly &&
                  (isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ))}
              </button>

              {(readOnly || isOpen) && (
                <div className="px-4 pb-4 pt-0 bg-slate-50/90 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select
                      {...register(`checklist.${safeIndex}.items.${itemIndex}.status`)}
                      disabled={readOnly}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] disabled:opacity-60"
                    >
                      <option value="OK">OK — Satisfactory (Pass)</option>
                      <option value="C">C — Clean (Review)</option>
                      <option value="A">A — Adjust (Review)</option>
                      <option value="R">R — Repair (Review)</option>
                      <option value="RP">RP — Replace (Review)</option>
                      <option value="N">N — Not applicable</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-600">Notes</span>
                      {!readOnly && (
                        <VoiceNotesButton
                          disabled={readOnly}
                          onAppend={(text) => {
                            const key = `checklist.${safeIndex}.items.${itemIndex}.notes`;
                            const cur =
                              (getValues(
                                key as `checklist.${number}.items.${number}.notes`
                              ) as string) || '';
                            setValue(
                              key as `checklist.${number}.items.${number}.notes`,
                              `${cur}${text}`,
                              { shouldDirty: true }
                            );
                          }}
                        />
                      )}
                    </div>
                    <textarea
                      {...register(`checklist.${safeIndex}.items.${itemIndex}.notes`)}
                      placeholder="Add notes or use voice input"
                      disabled={readOnly}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white resize-y focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] disabled:opacity-60"
                    />
                  </div>
                  <div>
                    {photoRequired && (
                      <p className="text-xs font-medium text-amber-700 mb-1">
                        Photo required for repair items
                      </p>
                    )}
                    <ItemPhotoUpload
                      photos={itemPhotos}
                      onPhotosChange={(newPhotos: unknown) => {
                        if (!readOnly) {
                          setValue(
                            `checklist.${safeIndex}.items.${itemIndex}.photos`,
                            newPhotos as never
                          );
                        }
                      }}
                      maxPhotos={5}
                      itemName={item.item}
                      categoryName={categoryName}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {total > 1 && (
        <div className="flex gap-2 p-3 border-t border-slate-100 bg-white sm:hidden">
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

      <details className="border-t border-slate-100 text-xs text-slate-600">
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
