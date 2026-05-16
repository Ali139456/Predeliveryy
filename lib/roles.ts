import type { UserRole } from '@/types/db';

/** Roles that can list/view all inspections within their tenant (read-only or full). */
export const ROLES_VIEW_ALL_TENANT_INSPECTIONS: UserRole[] = ['admin', 'manager', 'viewer'];

export function canViewAllTenantInspections(role: string): boolean {
  return ROLES_VIEW_ALL_TENANT_INSPECTIONS.includes(role as UserRole);
}

export function isReadOnlyRole(role: string): boolean {
  return role === 'viewer';
}

export function canAccessAdminPanel(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

export function canMutateInspections(role: string): boolean {
  return role !== 'viewer';
}

export function canUploadFiles(role: string): boolean {
  return role !== 'viewer';
}
