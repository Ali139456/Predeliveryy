/**
 * Official Pre Delivery logo - orange PD mark + white wordmark (`public/Transparent Logo.png`).
 */
export const SITE_LOGO_SRC = '/Transparent%20Logo.png' as const;

/** Same asset as SITE_LOGO_SRC; use on blue report/header backgrounds */
export const SITE_LOGO_REPORT_SRC = SITE_LOGO_SRC;

export const SITE_LOGO_ALT = 'Pre Delivery' as const;

/** Hero phone mockup (`public/Pre Delivery Mobile App Graphics.png`). */
export const SITE_HERO_MOBILE_GRAPHICS_SRC =
  '/Pre%20Delivery%20Mobile%20App%20Graphics.png' as const;

/** Hero inspection report graphic (`public/Pre Delivery Design new.png`). */
export const SITE_HERO_REPORT_SRC = '/Pre%20Delivery%20Design%20new.png' as const;

/** Powerful Features section card images (`public/image (1).png` … `image (7).png`). */
export const FEATURE_IMAGES = {
  photoVideo: '/image%20(1).png',
  vinCapture: '/image%20(2).png',
  analytics: '/image%20(3).png',
  gpsPinning: '/image%20(4).png',
  secureCompliant: '/image%20(5).png',
  voiceToText: '/image%20(7).png',
  damageDetection: '/image%201111.png',
} as const;
