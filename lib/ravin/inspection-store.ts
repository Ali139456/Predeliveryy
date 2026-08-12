import getSupabase from '@/lib/supabase';
import { inspectionRowToInspection } from '@/types/db';
import type { InspectionRow, IInspection } from '@/types/db';
import type { RavinIntegrationState } from '@/types/ravin';

export async function findInspectionByInvitationId(
  invitationId: string
): Promise<(IInspection & { ravinIntegration?: RavinIntegrationState | null }) | null> {
  const supabase = getSupabase();

  const { data: byId } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', invitationId)
    .maybeSingle();

  if (byId) {
    const inspection = inspectionRowToInspection(byId as InspectionRow);
    return {
      ...inspection,
      ravinIntegration: (byId as InspectionRow & { ravin_integration?: RavinIntegrationState })
        .ravin_integration ?? null,
    };
  }

  const { data: rows } = await supabase
    .from('inspections')
    .select('*')
    .filter('ravin_integration->>invitationId', 'eq', invitationId)
    .limit(1);

  if (rows?.[0]) {
    const inspection = inspectionRowToInspection(rows[0] as InspectionRow);
    return {
      ...inspection,
      ravinIntegration: (rows[0] as InspectionRow & { ravin_integration?: RavinIntegrationState })
        .ravin_integration ?? null,
    };
  }

  return null;
}

export async function updateInspectionRavinState(
  inspectionId: string,
  tenantId: string,
  patch: Partial<RavinIntegrationState>,
  extraRow?: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabase();
  const { data: row } = await supabase
    .from('inspections')
    .select('ravin_integration')
    .eq('id', inspectionId)
    .eq('tenant_id', tenantId)
    .single();

  const current = (row?.ravin_integration as RavinIntegrationState | null) || {
    status: 'idle' as const,
  };

  const next: RavinIntegrationState = {
    ...current,
    ...patch,
    invitationId: patch.invitationId || current.invitationId || inspectionId,
  };

  const update: Record<string, unknown> = {
    ravin_integration: next,
    updated_at: new Date().toISOString(),
    ...extraRow,
  };

  const { error } = await supabase
    .from('inspections')
    .update(update)
    .eq('id', inspectionId)
    .eq('tenant_id', tenantId);

  if (error) throw new Error(error.message);
}

export async function saveInspectionAfterRavinReport(
  inspection: IInspection,
  ravin: RavinIntegrationState
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('inspections')
    .update({
      photos: inspection.photos,
      checklist: inspection.checklist,
      ravin_integration: ravin,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inspection.id)
    .eq('tenant_id', inspection.tenantId);

  if (error) throw new Error(error.message);
}
