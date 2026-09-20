-- MoveShopify legacy Supabase safeguard.
-- Purpose: prevent duplicate customer rows while this module still imports
-- Shopify customers directly into its own Supabase tables.
--
-- Run this before any further direct /api/migrate/customers import.
-- If the preflight SELECT returns rows, merge/delete duplicates first.

-- Preflight: case-insensitive duplicate emails.
SELECT
  lower(trim(email)) AS normalized_email,
  count(*) AS duplicate_count,
  array_agg(id ORDER BY created_at) AS customer_ids
FROM customers
WHERE email IS NOT NULL
GROUP BY lower(trim(email))
HAVING count(*) > 1;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT lower(trim(email)) AS normalized_email
      FROM customers
      WHERE email IS NOT NULL
      GROUP BY lower(trim(email))
      HAVING count(*) > 1
    ) duplicates
  ) THEN
    RAISE EXCEPTION 'Duplicate customer emails exist. Run the preflight query, merge duplicates, then re-run this migration.';
  END IF;
END $$;

UPDATE customers
SET
  email = lower(trim(email)),
  updated_at = now()
WHERE email <> lower(trim(email));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_email_unique'
      AND conrelid = 'customers'::regclass
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_email_unique UNIQUE (email);
  END IF;
END $$;

-- The unique constraint already creates an index for lookups.
DROP INDEX IF EXISTS customers_email_idx;
