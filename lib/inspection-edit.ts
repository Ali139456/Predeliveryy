import { isReadOnlyRole } from '@/lib/roles';

/** Whether the user may edit this inspection (draft or completed). Admins: any; technicians: own only. */
export function canUserEditInspection(
  user: { email?: string; role?: string } | null | undefined,
  inspection: { inspectorEmail?: string } | null | undefined
): boolean {
  if (!user || !inspection) return false;
  if (isReadOnlyRole(user.role ?? '')) return false;
  if (user.role === 'admin') return true;
  const isOwner =
    String(user.email || '').toLowerCase() ===
    String(inspection.inspectorEmail || '').toLowerCase();
  return isOwner;
}
