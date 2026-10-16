/*
# Add currency_code column to exchange_rates

## Purpose
Supports storing exchange rates for multiple currencies (not just KZT)
so the extension can convert any currency to RUB.

## 1. Modified Tables

### exchange_rates
- Added `currency_code` column (text, not null, default 'KZT') —
  ISO 4217 code of the source currency (e.g. KZT, USD, EUR, TRY, etc.)
  Each row now represents "1 unit of currency_code = rate RUB".

## 2. Indexes
- Added `idx_exchange_rates_currency_fetched` on (currency_code, fetched_at DESC)
  for efficiently querying the latest rate for a specific currency.

## 3. Security
- No changes to RLS policies — table remains fully accessible to anon + authenticated.
*/

ALTER TABLE exchange_rates
  ADD COLUMN IF NOT EXISTS currency_code text NOT NULL DEFAULT 'KZT';

CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_fetched
  ON exchange_rates (currency_code, fetched_at DESC);
