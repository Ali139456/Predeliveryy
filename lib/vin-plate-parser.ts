/**
 * Parse OCR text from Australian/EU vehicle identification (compliance) plates.
 * Handles rotated plates, spaced VINs, and common manufacturer labels.
 */

export interface VinPlateParseResult {
  vin?: string;
  make?: string;
  model?: string;
  engine?: string;
  rawText: string;
}

const VIN_CHARS = /^[A-HJ-NPR-Z0-9]{17}$/;

/** World Manufacturer Identifier (partial map for AU market). */
const WMI_TO_MAKE: Record<string, string> = {
  WAU: 'Audi',
  WBA: 'BMW',
  WBS: 'BMW',
  WDB: 'Mercedes-Benz',
  WDC: 'Mercedes-Benz',
  WDD: 'Mercedes-Benz',
  WVW: 'Volkswagen',
  WVG: 'Volkswagen',
  TMB: 'Skoda',
  VSS: 'Seat',
  WP0: 'Porsche',
  WP1: 'Porsche',
  YV1: 'Volvo',
  YV4: 'Volvo',
  SAJ: 'Jaguar',
  SAL: 'Land Rover',
  JHM: 'Honda',
  JH4: 'Honda',
  JT2: 'Toyota',
  JTD: 'Toyota',
  KMH: 'Hyundai',
  KNA: 'Kia',
  KND: 'Kia',
  MNA: 'Ford',
  MNT: 'Ford',
  MR0: 'Toyota',
  MLH: 'Honda',
  MMB: 'Mitsubishi',
  MMK: 'Mitsubishi',
  VF1: 'Renault',
  VF3: 'Peugeot',
  VF7: 'Citroen',
  VNK: 'Toyota',
  ZFF: 'Ferrari',
  ZFA: 'Fiat',
};

const LABEL_MAKE_PATTERNS: Array<{ pattern: RegExp; make: string }> = [
  { pattern: /\bAUDI\s*AG\b/i, make: 'Audi' },
  { pattern: /\bBMW\s*AG\b/i, make: 'BMW' },
  { pattern: /\bMERCEDES[- ]?BENZ\b/i, make: 'Mercedes-Benz' },
  { pattern: /\bVOLKSWAGEN\s*AG\b/i, make: 'Volkswagen' },
  { pattern: /\bVOLKSWAGEN\b/i, make: 'Volkswagen' },
  { pattern: /\bTOYOTA\b/i, make: 'Toyota' },
  { pattern: /\bHONDA\b/i, make: 'Honda' },
  { pattern: /\bHYUNDAI\b/i, make: 'Hyundai' },
  { pattern: /\bKIA\b/i, make: 'Kia' },
  { pattern: /\bFORD\b/i, make: 'Ford' },
  { pattern: /\bMAZDA\b/i, make: 'Mazda' },
  { pattern: /\bNISSAN\b/i, make: 'Nissan' },
  { pattern: /\bSUBARU\b/i, make: 'Subaru' },
  { pattern: /\bMITSUBISHI\b/i, make: 'Mitsubishi' },
  { pattern: /\bLEXUS\b/i, make: 'Lexus' },
  { pattern: /\bSKODA\b/i, make: 'Skoda' },
  { pattern: /\bSEAT\b/i, make: 'Seat' },
  { pattern: /\bPORSCHE\b/i, make: 'Porsche' },
  { pattern: /\bLAND\s*ROVER\b/i, make: 'Land Rover' },
  { pattern: /\bJAGUAR\b/i, make: 'Jaguar' },
  { pattern: /\bVOLVO\b/i, make: 'Volvo' },
];

function normalizeVinCandidate(s: string): string {
  return s.replace(/[\s\-_.]/g, '').toUpperCase();
}

/** Find a valid 17-character VIN in noisy OCR output. */
export function extractVinFromText(text: string): string | undefined {
  if (!text?.trim()) return undefined;

  const upper = text.toUpperCase();

  // Exact token
  const tokenMatch = upper.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
  if (tokenMatch && VIN_CHARS.test(tokenMatch[1])) return tokenMatch[1];

  // Sliding window on compacted alphanumeric stream (handles split OCR)
  const compact = upper.replace(/[^A-Z0-9]/g, '');
  for (let i = 0; i <= compact.length - 17; i++) {
    const candidate = compact.slice(i, i + 17);
    if (VIN_CHARS.test(candidate)) return candidate;
  }

  return undefined;
}

function makeFromWmi(vin: string): string | undefined {
  if (vin.length < 3) return undefined;
  return WMI_TO_MAKE[vin.slice(0, 3).toUpperCase()];
}

function makeFromLabels(text: string): string | undefined {
  for (const { pattern, make } of LABEL_MAKE_PATTERNS) {
    if (pattern.test(text)) return make;
  }
  return undefined;
}

/** Model / type code e.g. "Typ F3" on German compliance plates. */
export function extractModelFromText(text: string): string | undefined {
  const typ =
    text.match(/\bTyp\s*[:\-]?\s*([A-Z0-9][A-Z0-9\s\-]{0,12})\b/i) ||
    text.match(/\bType\s*[:\-]?\s*([A-Z0-9][A-Z0-9\s\-]{0,12})\b/i) ||
    text.match(/\bMODEL\s*[:\-]?\s*([A-Z0-9][A-Z0-9\s\-]{0,20})\b/i);
  if (!typ) return undefined;
  const model = typ[1].replace(/\s+/g, ' ').trim();
  if (model.length < 1 || model.length > 24) return undefined;
  return model;
}

/** Engine / variant code (e.g. CZDA on Audi plates) — 3–5 letters, not a VIN fragment. */
function extractEngineCode(text: string, vin?: string): string | undefined {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const m = line.match(/^([A-Z]{3,5}\d?)$/i);
    if (!m) continue;
    const code = m[1].toUpperCase();
    if (vin && vin.includes(code)) continue;
    if (['AUDI', 'AG', 'GMBH', 'GERMANY', 'DEUTSCHLAND'].includes(code)) continue;
    return code;
  }
  return undefined;
}

export function parseVinPlateText(rawText: string): VinPlateParseResult {
  const text = rawText?.trim() || '';
  const vin = extractVinFromText(text);
  const make = makeFromLabels(text) || (vin ? makeFromWmi(vin) : undefined);
  const model = extractModelFromText(text);
  const engine = extractEngineCode(text, vin);

  return {
    vin,
    make,
    model,
    engine,
    rawText: text,
  };
}

export function scanTypeFromParse(parsed: VinPlateParseResult): 'VIN' | 'COMPLIANCE' | 'OTHER' {
  if (parsed.vin) return 'VIN';
  if (parsed.make || parsed.model) return 'COMPLIANCE';
  return 'OTHER';
}

/** Primary barcode / ID string for legacy storage. */
export function primaryScanValue(parsed: VinPlateParseResult): string {
  return parsed.vin || parsed.rawText.trim().slice(0, 120) || '';
}
