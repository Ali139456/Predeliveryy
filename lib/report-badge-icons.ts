/** Inline SVG icons for report verification badges (24×24, brand blue stroke). */
export const REPORT_BADGE_SVG: Record<string, string> = {
  vin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0033FF" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7v10M7 7v10M10 7v10M13 7v10M16 7v10M19 7v10M6 7H5M9 7H8M12 7h-1M15 7h-1M18 7h-1M6 17H5M9 17H8M12 17h-1M15 17h-1M18 17h-1"/></svg>`,
  odometer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0033FF" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 13V9M12 13l3 2"/><path d="M9 5h6"/></svg>`,
  condition: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0033FF" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8l2 3v13H6V7l2-3z"/><circle cx="13" cy="13" r="2.5"/><path d="M15 15l2 2"/></svg>`,
  accessories: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0033FF" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M5 14c0-2.5 1.5-4 3.5-5.5C10.5 7 12 6 12 6s1.5 1 3.5 2.5C17.5 10 19 11.5 19 14"/><path d="M7 14h10v3H7z"/><circle cx="8.5" cy="17.5" r="1.5"/><circle cx="15.5" cy="17.5" r="1.5"/></svg>`,
  ev: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0033FF" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="11" rx="2"/><path d="M8 7V5h8v2"/><path d="M10 12h4M12 10v4"/></svg>`,
  photos: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0033FF" stroke-width="1.6" aria-hidden="true"><path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"/><circle cx="9" cy="10" r="1.5"/><path d="M4 16l4.5-4.5 3 3L15 11l5 5"/></svg>`,
};

export function badgeIconSvg(key: string): string {
  return REPORT_BADGE_SVG[key] || REPORT_BADGE_SVG.photos;
}

export function badgeIconHtml(key: string): string {
  return `<span class="report-badge-icon inline-flex h-6 w-6 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">${badgeIconSvg(key)}</span>`;
}
