/**
 * Backfill analytics tables from completed inspections.
 * Usage: node scripts/backfill-analytics.js
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const DEFECT = new Set(['R', 'RP']);
const REVIEW = new Set(['C', 'A', 'R', 'RP']);

function extractLocationLabel(location) {
  if (!location || typeof location !== 'object') return 'Unknown';
  const start = location.start;
  const current = location.current;
  const raw =
    (start?.address && String(start.address).trim()) ||
    (current?.address && String(current.address).trim()) ||
    (location.address && String(location.address).trim()) ||
    '';
  if (!raw) return 'Unknown';
  return (raw.split(',')[0]?.trim() || raw).slice(0, 120);
}

function buildPayload(row) {
  const checklist = row.checklist || [];
  let total = 0,
    ok = 0,
    repair = 0,
    flagged = 0,
    hasDefect = false,
    hasReview = false;
  let checklistPhotos = 0;
  const items = [];

  for (const cat of checklist) {
    const category = String(cat.category || 'Uncategorised').trim() || 'Uncategorised';
    for (const item of cat.items || []) {
      total += 1;
      const status = String(item.status || 'OK').toUpperCase();
      if (status === 'OK' || status === 'N') ok += 1;
      if (DEFECT.has(status)) {
        repair += 1;
        hasDefect = true;
      }
      if (REVIEW.has(status)) hasReview = true;
      if (status !== 'OK' && status !== 'N') flagged += 1;
      const pc = Array.isArray(item.photos) ? item.photos.length : 0;
      checklistPhotos += pc;
      items.push({
        tenant_id: row.tenant_id,
        inspection_id: row.id,
        inspection_number: row.inspection_number,
        category,
        item_name: String(item.item || 'Item').trim() || 'Item',
        status,
        is_defect: DEFECT.has(status),
        needs_review: REVIEW.has(status),
        photo_count: pc,
        location_label: extractLocationLabel(row.location),
        completed_at: row.updated_at || row.created_at,
      });
    }
  }

  const topPhotos = Array.isArray(row.photos) ? row.photos.length : 0;
  const completedAt = row.updated_at || row.created_at;
  const start = new Date(row.created_at).getTime();
  const end = new Date(completedAt).getTime();
  const durationMinutes =
    Number.isFinite(start) && Number.isFinite(end) && end > start
      ? Math.max(1, Math.round((end - start) / 60000))
      : null;

  const summary = {
    tenant_id: row.tenant_id,
    inspection_id: row.id,
    inspection_number: row.inspection_number,
    inspector_email: row.inspector_email,
    inspector_name: row.inspector_name,
    location_label: extractLocationLabel(row.location),
    inspection_date: row.inspection_date,
    completed_at: completedAt,
    total_items: total,
    items_ok: ok,
    items_repair: repair,
    items_flagged: flagged,
    is_pass: !hasDefect,
    needs_review: hasReview,
    photo_count: topPhotos + checklistPhotos,
    duration_minutes: durationMinutes,
  };

  return { summary, items };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const pageSize = 100;
  let offset = 0;
  let total = 0;

  console.log('Fetching completed inspections…');

  for (;;) {
    const { data: rows, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error(error.message);
      process.exit(1);
    }
    if (!rows?.length) break;

    for (const row of rows) {
      await supabase.from('analytics_checklist_items').delete().eq('inspection_id', row.id);
      await supabase.from('analytics_inspection_summary').delete().eq('inspection_id', row.id);

      const { summary, items } = buildPayload(row);
      const { error: sErr } = await supabase.from('analytics_inspection_summary').insert(summary);
      if (sErr) {
        console.error(`Summary ${row.inspection_number}:`, sErr.message);
        continue;
      }
      if (items.length) {
        const { error: iErr } = await supabase.from('analytics_checklist_items').insert(items);
        if (iErr) console.error(`Items ${row.inspection_number}:`, iErr.message);
      }
      total += 1;
      if (total % 50 === 0) console.log(`  ${total}…`);
    }

    offset += rows.length;
    if (rows.length < pageSize) break;
  }

  console.log(`Done. Backfilled ${total} completed inspection(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
