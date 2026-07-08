/** OpenAI vision damage detection - shared client/server types */

export type DamageSeverity = 'minor' | 'moderate' | 'major' | 'unknown';

export interface VisionDamageFinding {
  label: string;
  severity: DamageSeverity;
  /** Normalized 0–1, image center of damage */
  x: number;
  y: number;
  confidence?: 'high' | 'medium' | 'low';
  /** Indicative AUD repair range e.g. "$80–$200" */
  repairEstimateAud?: string;
  /** Brief repair approach e.g. "Buff and touch-up paint" */
  repairNotes?: string;
}

export interface VisionDamageResult {
  summary: string;
  noDamageFound: boolean;
  findings: VisionDamageFinding[];
  model?: string;
  detectedAt?: string;
  /** Overall indicative repair cost narrative for the photo */
  repairEstimateSummary?: string;
  /** Total indicative AUD range e.g. "$250–$600" */
  totalRepairEstimateAud?: string;
}

export interface PhotoAiDamageFindingSummary {
  label: string;
  severity: DamageSeverity;
  repairEstimateAud?: string;
  repairNotes?: string;
}

export interface PhotoAiDamageMetadata {
  detectedAt: string;
  model: string;
  summary: string;
  noDamageFound: boolean;
  findingCount: number;
  repairEstimateSummary?: string;
  totalRepairEstimateAud?: string;
  findings?: PhotoAiDamageFindingSummary[];
}
