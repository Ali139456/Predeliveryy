'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, Sparkles, Upload, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import type { RavinIntegrationState } from '@/types/ravin';
import {
  createRavinOtl,
  fetchRavinConfig,
  submitInspectionToRavin,
  type RavinPublicConfig,
} from '@/lib/ravinClient';

interface RavinIntegrationPanelProps {
  inspectionId: string;
  ravin?: RavinIntegrationState | null;
  readOnly?: boolean;
  onUpdate?: (ravin: RavinIntegrationState) => void;
}

function statusLabel(status?: RavinIntegrationState['status']): string {
  switch (status) {
    case 'otl_created':
      return 'Walkaround link ready';
    case 'submitted':
      return 'Submitted to Ravin';
    case 'processing':
      return 'Ravin AI processing';
    case 'completed':
      return 'Ravin report received';
    case 'failed':
      return 'Ravin integration failed';
    default:
      return 'Not started';
  }
}

export default function RavinIntegrationPanel({
  inspectionId,
  ravin,
  readOnly = false,
  onUpdate,
}: RavinIntegrationPanelProps) {
  const [config, setConfig] = useState<RavinPublicConfig>({ enabled: false });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [localRavin, setLocalRavin] = useState<RavinIntegrationState | null | undefined>(ravin);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLocalRavin(ravin);
  }, [ravin]);

  useEffect(() => {
    fetchRavinConfig()
      .then(setConfig)
      .finally(() => setLoadingConfig(false));
  }, []);

  const handleCreateOtl = useCallback(async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await createRavinOtl(inspectionId);
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setLocalRavin(result.ravin);
    onUpdate?.(result.ravin);
    setNotice('Ravin walkaround link created. Send it to the inspector or open on a mobile device.');
  }, [inspectionId, onUpdate]);

  const handleSubmitS3 = useCallback(async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await submitInspectionToRavin(inspectionId);
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    const next: RavinIntegrationState = {
      status: (result.status as RavinIntegrationState['status']) || 'processing',
      inboundMode: 's3',
      invitationId: inspectionId,
      submittedAt: new Date().toISOString(),
      uploadedPhotoCount: result.uploaded,
    };
    setLocalRavin(next);
    onUpdate?.(next);
    setNotice(result.message || 'Photos submitted to Ravin AI.');
  }, [inspectionId, onUpdate]);

  const copyOtl = useCallback(async () => {
    const url = localRavin?.otlUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [localRavin?.otlUrl]);

  if (loadingConfig) return null;
  if (!config.enabled) return null;

  const inboundOtl = config.inboundMode === 'otl';
  const inboundS3 = config.inboundMode === 's3';

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-600 p-2 text-white shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">Ravin AI inspection</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {inboundOtl
              ? 'Generate a secure walkaround link for Ravin-guided capture.'
              : 'Submit captured photos to Ravin for full AI damage analysis.'}
          </p>
          <p className="text-xs font-medium text-indigo-700 mt-1">
            Status: {statusLabel(localRavin?.status)}
          </p>
        </div>
      </div>

      {localRavin?.summary && (
        <p className="text-sm text-slate-800 bg-white/80 rounded-lg px-3 py-2 border border-indigo-100">
          {localRavin.summary}
          {localRavin.damageCount != null && localRavin.damageCount > 0 && (
            <span className="text-indigo-700"> · {localRavin.damageCount} finding(s)</span>
          )}
        </p>
      )}

      {localRavin?.otlUrl && (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={localRavin.otlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Open Ravin walkaround
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={copyOtl}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      )}

      {localRavin?.reportPdfUrl && (
        <a
          href={localRavin.reportPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          View Ravin PDF report
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {!readOnly && (
        <div className="flex flex-wrap gap-2 pt-1">
          {inboundOtl && localRavin?.status !== 'completed' && (
            <button
              type="button"
              disabled={busy}
              onClick={handleCreateOtl}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
              {localRavin?.otlUrl ? 'Regenerate walkaround link' : 'Generate walkaround link'}
            </button>
          )}
          {inboundS3 && !['processing', 'completed'].includes(localRavin?.status || '') && (
            <button
              type="button"
              disabled={busy}
              onClick={handleSubmitS3}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Submit photos to Ravin AI
            </button>
          )}
        </div>
      )}

      {notice && (
        <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{notice}</p>
      )}
      {error && (
        <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      {localRavin?.status === 'processing' && (
        <p className="text-xs text-slate-600">
          Ravin is analysing the inspection. Results will appear here when the{' '}
          {config.outboundMode === 's3' ? 'S3 result file is ingested' : 'webhook'} delivers the report.
        </p>
      )}
    </div>
  );
}
