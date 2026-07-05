'use client';

import { Package } from 'lucide-react';
import {
  DEALER_ACCESSORY_OPTIONS,
  type DealerAccessoriesFitted,
  type DealerAccessoryKey,
} from '@/lib/dealer-accessories';

interface DealerAccessoriesPickerProps {
  value: DealerAccessoriesFitted;
  onChange: (next: DealerAccessoriesFitted) => void;
  readOnly?: boolean;
}

export default function DealerAccessoriesPicker({
  value,
  onChange,
  readOnly = false,
}: DealerAccessoriesPickerProps) {
  const toggle = (key: DealerAccessoryKey) => {
    if (readOnly) return;
    const next = { ...value, [key]: !value[key] };
    if (!next[key]) delete next[key];
    onChange(next);
  };

  const selectedCount = DEALER_ACCESSORY_OPTIONS.filter(({ key }) => value[key] === true).length;

  return (
    <div className="rounded-2xl border-2 border-[#0033FF]/20 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-[#EEF2FF] border-b border-[#0033FF]/10">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-[#0033FF] text-white flex items-center justify-center">
            <Package className="w-4 h-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <h4 className="text-[15px] font-semibold text-slate-900">Dealer accessories fitted</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Select all accessories fitted to this vehicle ({selectedCount} selected)
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {readOnly ? (
          <ul className="space-y-1.5 text-sm text-slate-800">
            {selectedCount === 0 ? (
              <li className="text-slate-500 italic">None recorded</li>
            ) : (
              DEALER_ACCESSORY_OPTIONS.filter(({ key }) => value[key] === true).map(({ key, label }) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#0033FF]" aria-hidden />
                  {label}
                </li>
              ))
            )}
          </ul>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEALER_ACCESSORY_OPTIONS.map(({ key, label }) => {
              const checked = value[key] === true;
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                    checked
                      ? 'border-[#0033FF] bg-[#0033FF]/5'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(key)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0033FF] focus:ring-[#0033FF]"
                  />
                  <span className="text-sm font-medium text-slate-800">{label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
