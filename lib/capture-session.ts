/** Tracks active camera / native picker sessions so autosave does not navigate away mid-capture. */
let activeSessions = 0;

export function beginCaptureSession(): () => void {
  activeSessions += 1;
  return () => {
    activeSessions = Math.max(0, activeSessions - 1);
  };
}

export function isCaptureSessionActive(): boolean {
  return activeSessions > 0;
}
