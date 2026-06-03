/*
  # Drop Vouchers Schema

  ## Overview
  Removes the Supabase-side vouchers and voucher_redemptions tables. Vouchers are
  now persisted in MongoDB via the existing FastAPI backend, so these Supabase
  tables are unused. Both tables are empty (0 rows) so there is no data loss.

  ## Removed
  - public.voucher_redemptions
  - public.vouchers
*/

DROP TABLE IF EXISTS public.voucher_redemptions;
DROP TABLE IF EXISTS public.vouchers;
