/*
# Create exchange_rates and settings tables

## Purpose
Stores KZT→RUB exchange rate history and extension settings for the
Steam KZT→RUB browser extension. This is a single-tenant app with no
sign-in, so all data is publicly accessible to the anon-key client.

## 1. New Tables

### exchange_rates
- `id` (uuid, primary key)
- `rate` (numeric, not null) — the KZT→RUB conversion rate (how many rubles per 1 tenge)
- `source` (text, not null, default 'open.er-api.com') — API source the rate was fetched from
- `fetched_at` (timestamptz, not null, default now()) — when the rate was retrieved

### settings
- `id` (uuid, primary key)
- `key` (text, unique, not null) — setting name (e.g. 'display_mode', 'decimal_places')
- `value` (text, not null) — setting value stored as text
- `updated_at` (timestamptz, not null, default now()) — last modification time

## 2. Indexes
- `idx_exchange_rates_fetched_at` on exchange_rates(fetched_at DESC) — for querying latest/historical rates efficiently

## 3. Security
- RLS enabled on both tables.
- All CRUD operations allowed for anon + authenticated (single-tenant, no auth, data is intentionally public).
*/

CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate numeric NOT NULL,
  source text NOT NULL DEFAULT 'open.er-api.com',
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched_at
  ON exchange_rates (fetched_at DESC);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_exchange_rates" ON exchange_rates;
CREATE POLICY "anon_select_exchange_rates" ON exchange_rates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_exchange_rates" ON exchange_rates;
CREATE POLICY "anon_insert_exchange_rates" ON exchange_rates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_exchange_rates" ON exchange_rates;
CREATE POLICY "anon_update_exchange_rates" ON exchange_rates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_exchange_rates" ON exchange_rates;
CREATE POLICY "anon_delete_exchange_rates" ON exchange_rates FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE
  TO anon, authenticated USING (true);
