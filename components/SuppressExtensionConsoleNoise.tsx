'use client';

import { useEffect } from 'react';

/** Ignore known Chrome extension promise rejections (not from this app). */
const EXTENSION_NOISE =
  /message channel closed|extension context invalidated|Receiving end does not exist/i;

export default function SuppressExtensionConsoleNoise() {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason instanceof Error
            ? reason.message
            : String(reason ?? '');
      if (EXTENSION_NOISE.test(message)) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);

  return null;
}
