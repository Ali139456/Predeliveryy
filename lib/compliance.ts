// Data Privacy and Compliance Utilities

export interface PrivacySettings {
  dataRetentionDays: number;
  allowDataExport: boolean;
  allowDataDeletion: boolean;
  encryptionEnabled: boolean;
  auditLogEnabled: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataRetentionDays: 365,
  allowDataExport: true,
  allowDataDeletion: true,
  encryptionEnabled: true,
  auditLogEnabled: true,
};

export function validateDataRetention(inspectionDate: Date, retentionDays: number): boolean {
  const expirationDate = new Date(inspectionDate);
  expirationDate.setDate(expirationDate.getDate() + retentionDays);
  return new Date() <= expirationDate;
}

export function shouldDeleteData(inspectionDate: Date, retentionDays: number): boolean {
  return !validateDataRetention(inspectionDate, retentionDays);
}

export function formatPrivacyConsent(consent: boolean, timestamp: Date): string {
  return `Privacy consent: ${consent ? 'Granted' : 'Not Granted'} on ${timestamp.toISOString()}`;
}

// GDPR Compliance: Right to be forgotten
export async function anonymizeInspectionData(inspectionId: string): Promise<void> {
  // This would anonymize personal data while keeping inspection records
  // Implementation depends on your specific requirements
}

// Data export for GDPR compliance
export function formatDataForExport(data: any): any {
  return {
    ...data,
    exportedAt: new Date().toISOString(),
    format: 'GDPR-compliant export',
  };
}


