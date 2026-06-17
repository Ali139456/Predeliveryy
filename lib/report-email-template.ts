import { formatReportDateTime } from '@/lib/inspection-report-data';
import type { IInspection } from '@/types/db';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Branded HTML body for inspection report emails (attachment holds the full PDF). */
export function buildInspectionReportEmailHtml(inspection: IInspection): string {
  const inspectionNumber = esc(inspection.inspectionNumber || inspection.id || '');
  const inspector = esc(inspection.inspectorName || 'Not provided');
  const date = esc(formatReportDateTime(inspection.inspectionDate || inspection.createdAt));
  const vehicle = [
    inspection.vehicleInfo?.year,
    inspection.vehicleInfo?.make,
    inspection.vehicleInfo?.model,
  ]
    .filter(Boolean)
    .join(' ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pre-Delivery Inspection Report</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,51,255,0.08);">
          <tr>
            <td style="background:linear-gradient(180deg,#002060 0%,#0033ff 100%);padding:28px 32px;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.72);">Pre Delivery</p>
              <h1 style="margin:0;font-size:24px;line-height:1.25;color:#ffffff;font-weight:800;">Inspection Report</h1>
              <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.88);">Verified before your drive.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">Hello,</p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
                Please find the pre-delivery inspection report attached for
                <strong style="color:#0033ff;">${inspectionNumber}</strong>.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#eef2ff;border:1px solid rgba(0,51,255,0.12);border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    ${vehicle ? `<p style="margin:0 0 10px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Vehicle</p><p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#0f172a;">${esc(vehicle)}</p>` : ''}
                    <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Inspector</p>
                    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#0f172a;">${inspector}</p>
                    <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Inspection date</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${date}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">
                Open the attached PDF for vehicle details, checklist results, photos, and verification badges.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                This is an automated message from Pre Delivery. Please do not reply to this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:12px;color:#64748b;text-align:center;">
                <a href="https://predelivery.ai" style="color:#0033ff;text-decoration:none;font-weight:600;">predelivery.ai</a>
                &nbsp;·&nbsp; info@predelivery.ai
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
