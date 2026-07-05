-- Structured dealer-fitted accessories (separate boolean fields in JSON for export/reporting)
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS dealer_accessories_fitted JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN inspections.dealer_accessories_fitted IS
  'Dealer accessories fitted at delivery — keys: bullBar, towBar, nudgeBars, roofRacks, carpetMats, windowTints, bonnetProjector, doorWindProtector, bootLiner, evPortableCharger';
