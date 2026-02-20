// Shared types for Supabase. Table rows use snake_case; app uses camelCase.

export type UserRole = 'technician' | 'manager' | 'admin';

export interface UserRow {
  id: string;
  email: string;
  phone_number: string;
  password: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IUser {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  created_at: string;
}

export interface IAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

// Inspection: nested objects stay as-is in JSONB; only top-level keys are snake_case in DB
export interface InspectionRow {
  id: string;
  inspection_number: string;
  inspector_name: string;
  inspector_email: string;
  inspection_date: string;
  location: InspectionLocation;
  barcode: string | null;
  vehicle_info: VehicleInfo;
  checklist: InspectionChecklistCategory[];
  photos: InspectionPhoto[];
  status: 'draft' | 'completed';
  signatures: { technician?: string; manager?: string };
  privacy_consent: boolean;
  data_retention_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface IInspection {
  id: string;
  inspectionNumber: string;
  inspectorName: string;
  inspectorEmail: string;
  inspectionDate: string;
  location: InspectionLocation;
  barcode?: string;
  vehicleInfo?: VehicleInfo;
  checklist: InspectionChecklistCategory[];
  photos: InspectionPhoto[];
  status: 'draft' | 'completed';
  signatures?: { technician?: string; manager?: string };
  privacyConsent: boolean;
  dataRetentionDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionLocation {
  start?: { latitude?: number; longitude?: number; address?: string; timestamp?: string };
  end?: { latitude?: number; longitude?: number; address?: string; timestamp?: string };
  current?: { latitude?: number; longitude?: number; address?: string };
  roadTest?: {
    distance?: number;
    duration?: number;
    route?: Array<{ latitude: number; longitude: number; timestamp: string }>;
  };
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface VehicleInfo {
  dealer?: string;
  dealerStockNo?: string;
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  engine?: string;
  odometer?: string;
  complianceDate?: string;
  buildDate?: string;
  licensePlate?: string;
  bookingNumber?: string;
}

export interface InspectionChecklistCategory {
  category: string;
  items: {
    item: string;
    status: string;
    notes?: string;
    photos?: { fileName: string; url?: string; metadata?: Record<string, unknown> }[];
  }[];
}

export interface InspectionPhoto {
  fileName: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

// Mappers: row (snake_case) <-> app (camelCase)
export function userRowToUser(row: UserRow): IUser & { _id?: string } {
  return {
    id: row.id,
    _id: row.id, // backward compatibility for frontend
    email: row.email,
    phoneNumber: row.phone_number,
    name: row.name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function inspectionRowToInspection(row: InspectionRow): IInspection & { _id?: string } {
  return {
    id: row.id,
    _id: row.id, // backward compatibility for frontend
    inspectionNumber: row.inspection_number,
    inspectorName: row.inspector_name,
    inspectorEmail: row.inspector_email,
    inspectionDate: row.inspection_date,
    location: row.location || {},
    barcode: row.barcode ?? undefined,
    vehicleInfo: row.vehicle_info,
    checklist: row.checklist || [],
    photos: row.photos || [],
    status: row.status,
    signatures: row.signatures,
    privacyConsent: row.privacy_consent,
    dataRetentionDays: row.data_retention_days ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function auditRowToLog(row: AuditLogRow): IAuditLog & { _id?: string } {
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id ?? undefined,
    details: row.details || {},
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    timestamp: row.timestamp,
    createdAt: row.created_at,
  };
}

// Build inspection row for insert/update from app-shaped body
export function inspectionBodyToRow(body: Record<string, unknown>): Record<string, unknown> {
  return {
    inspection_number: body.inspectionNumber,
    inspector_name: body.inspectorName,
    inspector_email: body.inspectorEmail,
    inspection_date: body.inspectionDate,
    location: body.location ?? {},
    barcode: body.barcode ?? null,
    vehicle_info: body.vehicleInfo ?? {},
    checklist: body.checklist ?? [],
    photos: body.photos ?? [],
    status: body.status ?? 'draft',
    signatures: body.signatures ?? {},
    privacy_consent: body.privacyConsent,
    data_retention_days: body.dataRetentionDays ?? 365,
  };
}
