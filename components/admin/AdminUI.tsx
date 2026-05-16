'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

const ACCENT = {
  blue: {
    bar: 'from-[#0033FF] to-[#3366FF]',
    icon: 'bg-[#0033FF]/10 text-[#0033FF]',
    ring: 'ring-[#0033FF]/15',
  },
  green: {
    bar: 'from-emerald-500 to-teal-500',
    icon: 'bg-emerald-500/10 text-emerald-600',
    ring: 'ring-emerald-500/15',
  },
  amber: {
    bar: 'from-amber-500 to-orange-500',
    icon: 'bg-amber-500/10 text-amber-600',
    ring: 'ring-amber-500/15',
  },
  violet: {
    bar: 'from-violet-500 to-purple-500',
    icon: 'bg-violet-500/10 text-violet-600',
    ring: 'ring-violet-500/15',
  },
  rose: {
    bar: 'from-rose-500 to-pink-500',
    icon: 'bg-rose-500/10 text-rose-600',
    ring: 'ring-rose-500/15',
  },
} as const;

export type AdminAccent = keyof typeof ACCENT;

export function AdminShell({ children }: { children: ReactNode }) {
  return <div className="admin-surface min-h-screen min-w-0">{children}</div>;
}

export function AdminTabBar({
  tabs,
  activeId,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1.5 p-1.5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [-webkit-overflow-scrolling:touch] rounded-2xl bg-slate-100/80 border border-slate-200/80 backdrop-blur-sm">
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap shrink-0 snap-start transition-all duration-200 ${
              active
                ? 'bg-white text-[#0033FF] shadow-md shadow-slate-200/80 ring-1 ring-slate-200/60'
                : 'text-slate-600 hover:text-[#0033FF] hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center shadow-lg shadow-[#0033FF]/25 shrink-0 ring-4 ring-[#0033FF]/10">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}

export function AdminSectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        {description ? <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  accent = 'blue',
  sub,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: AdminAccent;
  sub?: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg border border-slate-200/80 ring-1 ${a.ring} transition-all duration-300 hover:-translate-y-0.5`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${a.bar}`} />
      <div className="flex items-start justify-between gap-2 sm:gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 leading-tight">{title}</p>
          <p className="text-2xl sm:text-4xl font-bold text-slate-900 mt-1.5 sm:mt-2 tracking-tight tabular-nums">{value}</p>
          {sub ? <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">{sub}</div> : null}
        </div>
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}

export function AdminKpiCard({
  title,
  value,
  sub,
  positiveIsGood = true,
  icon: Icon,
  trendUp,
  trendDown,
}: {
  title: string;
  value: string;
  sub?: string | null;
  positiveIsGood?: boolean;
  icon: LucideIcon;
  trendUp?: boolean;
  trendDown?: boolean;
}) {
  const trendGood =
    (trendUp && positiveIsGood) || (trendDown && !positiveIsGood) || sub === '0% vs yesterday';
  const trendBad = (trendUp && !positiveIsGood) || (trendDown && positiveIsGood);

  return (
    <AdminStatCard
      title={title}
      value={value}
      icon={Icon}
      accent={trendBad ? 'rose' : trendGood && sub ? 'green' : 'blue'}
      sub={
        sub ? (
          <span
            className={`font-medium ${
              trendGood ? 'text-emerald-600' : trendBad ? 'text-rose-600' : 'text-slate-500'
            }`}
          >
            {sub}
          </span>
        ) : (
          <span className="text-slate-400">No prior day data</span>
        )
      }
    />
  );
}

export function AdminPanel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          {title ? (
            <div className="flex items-center gap-3 min-w-0">
              {Icon ? (
                <div className="w-9 h-9 rounded-lg bg-[#0033FF]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#0033FF]" />
                </div>
              ) : null}
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
                {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
              </div>
            </div>
          ) : (
            <div />
          )}
          {action}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function AdminTable({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200/80 ${className}`}>
      <table className="w-full text-left">{children}</table>
    </div>
  );
}

export function AdminThead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-slate-50/90 border-b border-slate-200">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTh({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`py-3.5 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminTr({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <tr
      className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-[#0033FF]/[0.03] ${
        index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
      }`}
    >
      {children}
    </tr>
  );
}

export function AdminTd({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`py-3.5 px-3 sm:px-4 text-sm text-slate-700 ${className}`}>{children}</td>;
}

export function AdminBtn({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white shadow-lg shadow-[#0033FF]/25 hover:shadow-xl hover:shadow-[#0033FF]/30 hover:brightness-105 active:scale-[0.98]',
    outline:
      'bg-white text-[#0033FF] border border-[#0033FF]/30 hover:bg-[#0033FF]/5 hover:border-[#0033FF]/50 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-[#0033FF]',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20 hover:brightness-105',
  };
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function AdminInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] transition-all ${className}`}
      {...props}
    />
  );
}

export function AdminSelect({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function AdminStatusBadge({ status }: { status: string }) {
  const completed = status === 'completed';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ${
        completed
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
          : 'bg-amber-50 text-amber-700 ring-amber-200/80'
      }`}
    >
      {status}
    </span>
  );
}

export function AdminLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <label className={`block text-xs font-semibold text-slate-600 mb-1.5 ${className}`}>{children}</label>
  );
}

/** Shared inspection form styles (aligned with admin dashboard) */
export const formPanelClass =
  'rounded-2xl bg-white/95 border border-slate-200/80 shadow-sm p-4 md:p-6 min-w-0';
export const formStepHeaderClass =
  'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4 px-1 mb-4 border-b border-slate-100 min-w-0';
export const formStepBadgeClass =
  'w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-3 sm:mr-4 shadow-md shadow-[#0033FF]/20 flex-shrink-0 ring-4 ring-[#0033FF]/10';
export const formStepTitleClass = 'text-lg sm:text-xl font-bold text-slate-900 min-w-0 pr-2 break-words';
export const formSaveBtnClass =
  'inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white shadow-md shadow-[#0033FF]/20 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 w-fit self-start sm:self-auto';
export const formFieldClass =
  'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] transition-all';
export const formProgressShellClass =
  'sticky top-0 z-30 -mx-0.5 px-3 py-3 mb-2 rounded-2xl bg-black border border-white/15 shadow-lg shadow-black/30';
