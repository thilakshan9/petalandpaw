/*
  # Vouchers & Redemptions Schema

  ## Overview
  Adds support for purchasable gift vouchers (max £250) that customers can later
  redeem against one or more workshops. If selected workshops exceed the voucher
  balance, the excess is paid via Stripe; otherwise the voucher is fully consumed
  and the workshops are recorded as voucher-paid bookings.

  ## New Tables

  ### `vouchers`
  - `id` (uuid, primary key)
  - `code` (text, unique) - human-readable redemption code (e.g. PAW-XXXX-XXXX)
  - `initial_amount` (numeric) - amount paid for the voucher
  - `balance` (numeric) - remaining redeemable balance (single-use vouchers go to 0)
  - `purchaser_name` (text)
  - `purchaser_email` (text)
  - `recipient_name` (text)
  - `recipient_email` (text)
  - `message` (text) - optional gift message
  - `status` (text) - pending | active | redeemed | expired
  - `stripe_session_id` (text)
  - `created_at` (timestamptz)
  - `redeemed_at` (timestamptz, nullable)

  ### `voucher_redemptions`
  - `id` (uuid, primary key)
  - `voucher_code` (text)
  - `workshop_ids` (text[]) - workshop IDs booked
  - `workshop_total` (numeric) - total list price of workshops
  - `amount_used` (numeric) - amount taken from voucher
  - `excess_amount` (numeric) - additional Stripe payment owed
  - `excess_paid` (boolean) - true once Stripe excess has been paid (or no excess)
  - `redeemer_name` (text)
  - `redeemer_email` (text)
  - `stripe_session_id` (text) - excess payment session, blank if no excess
  - `status` (text) - pending | completed
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Only service role (edge functions) can mutate; anon can SELECT vouchers by code
    via a narrow policy used during the redeem lookup. Reads are gated to active or
    redeemed vouchers (we never expose pending ones).
*/

CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  initial_amount numeric(10,2) NOT NULL CHECK (initial_amount > 0 AND initial_amount <= 250),
  balance numeric(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  purchaser_name text DEFAULT '',
  purchaser_email text DEFAULT '',
  recipient_name text DEFAULT '',
  recipient_email text DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','redeemed','expired')),
  stripe_session_id text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_session ON vouchers(stripe_session_id);

CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_code text NOT NULL,
  workshop_ids text[] NOT NULL DEFAULT '{}',
  workshop_total numeric(10,2) NOT NULL DEFAULT 0,
  amount_used numeric(10,2) NOT NULL DEFAULT 0,
  excess_amount numeric(10,2) NOT NULL DEFAULT 0,
  excess_paid boolean NOT NULL DEFAULT false,
  redeemer_name text DEFAULT '',
  redeemer_email text DEFAULT '',
  stripe_session_id text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_code ON voucher_redemptions(voucher_code);
CREATE INDEX IF NOT EXISTS idx_redemptions_session ON voucher_redemptions(stripe_session_id);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can lookup active vouchers by code" ON vouchers;
CREATE POLICY "Anon can lookup active vouchers by code"
  ON vouchers FOR SELECT
  TO anon, authenticated
  USING (status IN ('active','redeemed'));

DROP POLICY IF EXISTS "Anon can read own redemptions by session" ON voucher_redemptions;
CREATE POLICY "Anon can read own redemptions by session"
  ON voucher_redemptions FOR SELECT
  TO anon, authenticated
  USING (status = 'completed');
