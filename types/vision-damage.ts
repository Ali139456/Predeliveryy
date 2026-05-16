/** OpenAI vision damage detection — shared client/server types */

export type DamageSeverity = 'minor' | 'moderate' | 'major' | 'unknown';

export interface VisionDamageFinding {
  label: string;
  severity: DamageSeverity;
  /** Normalized 0–1, image center of damage */
  x: number;
  y: number;
  confidence?: 'high' | 'medium' | 'low';
}

export interface VisionDamageResult {
  summary: string;
  noDamageFound: boolean;
  findings: VisionDamageFinding[];
  model?: string;
  detectedAt?: string;
}

export interface PhotoAiDamageMetadata {
  detectedAt: string;
  model: string;
  summary: string;
  noDamageFound: boolean;
  findingCount: number;
}
