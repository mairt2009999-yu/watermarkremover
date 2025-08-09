-- Rollback script for credit system simplification
-- Migration: 0003_rollback_credit_system
-- Date: 2025-01-08
-- IMPORTANT: Create a backup before running this rollback

-- ============================================
-- STEP 1: Recreate credit_packages table
-- ============================================
CREATE TABLE IF NOT EXISTS "credit_packages" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "credits" integer NOT NULL,
  "price" integer NOT NULL, -- in cents
  "currency" text DEFAULT 'USD',
  "stripe_price_id" text,
  "creem_price_id" text,
  "description" text,
  "popular" boolean DEFAULT false,
  "active" boolean DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Restore default credit packages
INSERT INTO "credit_packages" ("id", "name", "credits", "price", "description", "popular", "sort_order") 
VALUES
  ('pkg_starter', 'Starter', 100, 500, 'Perfect for trying out our service', false, 1),
  ('pkg_popular', 'Popular', 500, 2000, 'Most popular choice for regular users', true, 2),
  ('pkg_value', 'Value', 2000, 7000, 'Best value for power users', false, 3),
  ('pkg_enterprise', 'Enterprise', 10000, 30000, 'For teams and businesses', false, 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Recreate credit_purchases table
-- ============================================
CREATE TABLE IF NOT EXISTS "credit_purchases" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "package_id" text NOT NULL,
  "credits" integer NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'USD',
  "stripe_payment_intent_id" text,
  "status" text NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "credit_purchases_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "credit_packages"("id")
);

-- Recreate index for user purchases
CREATE INDEX IF NOT EXISTS "idx_user_purchases" ON "credit_purchases" ("user_id", "created_at" DESC);

-- ============================================
-- STEP 3: Restore purchased_credits column
-- ============================================
ALTER TABLE "user_credits" 
  ADD COLUMN IF NOT EXISTS "purchased_credits" integer NOT NULL DEFAULT 0;

-- ============================================
-- STEP 4: Calculate purchased_credits from transaction history
-- ============================================
-- Update purchased_credits based on historical transactions
WITH purchased_totals AS (
  SELECT 
    user_id,
    COALESCE(SUM(amount), 0) as total_purchased
  FROM credit_transactions
  WHERE type = 'purchased' 
    AND amount > 0
  GROUP BY user_id
)
UPDATE user_credits uc
SET purchased_credits = COALESCE(pt.total_purchased, 0)
FROM purchased_totals pt
WHERE uc.user_id = pt.user_id;

-- ============================================
-- STEP 5: Restore original subscription credit values
-- ============================================
UPDATE "subscription_credit_config" SET "monthly_credits" = 10 WHERE "plan_id" = 'free';
UPDATE "subscription_credit_config" SET "monthly_credits" = 300 WHERE "plan_id" = 'pro';
UPDATE "subscription_credit_config" SET "monthly_credits" = 300 WHERE "plan_id" = 'pro_monthly';
UPDATE "subscription_credit_config" SET "monthly_credits" = 400 WHERE "plan_id" = 'pro_yearly';
UPDATE "subscription_credit_config" SET "monthly_credits" = 1000 WHERE "plan_id" = 'lifetime';

-- Re-enable rollover if it was previously enabled
UPDATE "subscription_credit_config" 
SET "rollover_enabled" = false,
    "rollover_max_months" = 0,
    "bonus_percentage" = 0
WHERE "rollover_enabled" IS NOT NULL;

-- ============================================
-- STEP 6: Remove constraint on transaction types
-- ============================================
ALTER TABLE "credit_transactions"
DROP CONSTRAINT IF EXISTS check_transaction_type;

-- ============================================
-- STEP 7: Reconcile user balances
-- ============================================
-- Add back any bonus credits that were removed during migration
WITH migration_bonuses AS (
  SELECT 
    user_id,
    SUM(amount) as bonus_amount
  FROM credit_transactions
  WHERE type = 'bonus' 
    AND reason LIKE '%Migration:%'
    AND created_at >= (CURRENT_DATE - INTERVAL '7 days')
  GROUP BY user_id
)
UPDATE user_credits uc
SET balance = balance + COALESCE(mb.bonus_amount, 0)
FROM migration_bonuses mb
WHERE uc.user_id = mb.user_id;

-- ============================================
-- STEP 8: Create rollback verification function
-- ============================================
CREATE OR REPLACE FUNCTION verify_rollback() RETURNS TABLE(
  check_name text,
  status text,
  details text
) AS $$
BEGIN
  -- Check if tables exist
  RETURN QUERY
  SELECT 'credit_packages table exists'::text,
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_packages') 
              THEN 'PASS'::text ELSE 'FAIL'::text END,
         'Table should be recreated'::text;
  
  RETURN QUERY
  SELECT 'credit_purchases table exists'::text,
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_purchases') 
              THEN 'PASS'::text ELSE 'FAIL'::text END,
         'Table should be recreated'::text;
  
  -- Check if column exists
  RETURN QUERY
  SELECT 'purchased_credits column exists'::text,
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'user_credits' AND column_name = 'purchased_credits') 
              THEN 'PASS'::text ELSE 'FAIL'::text END,
         'Column should be restored'::text;
  
  -- Check credit configurations
  RETURN QUERY
  SELECT 'Subscription credits restored'::text,
         CASE WHEN (SELECT monthly_credits FROM subscription_credit_config WHERE plan_id = 'pro' LIMIT 1) = 300
              THEN 'PASS'::text ELSE 'FAIL'::text END,
         'Pro plan should have 300 credits'::text;
  
  -- Check for data integrity
  RETURN QUERY
  SELECT 'User credits integrity'::text,
         CASE WHEN NOT EXISTS (SELECT 1 FROM user_credits WHERE balance < 0) 
              THEN 'PASS'::text ELSE 'FAIL'::text END,
         'No negative balances should exist'::text;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 9: Run verification
-- ============================================
-- Execute this to verify rollback success:
-- SELECT * FROM verify_rollback();

-- ============================================
-- STEP 10: Clean up
-- ============================================
-- Remove temporary indexes if any
DROP INDEX IF EXISTS "idx_transaction_type";

-- Add comment to track rollback
COMMENT ON TABLE credit_packages IS 'Restored via rollback on ' || CURRENT_DATE;
COMMENT ON TABLE credit_purchases IS 'Restored via rollback on ' || CURRENT_DATE;

-- ============================================
-- ROLLBACK COMPLETE
-- ============================================
-- After running this script:
-- 1. Run: SELECT * FROM verify_rollback();
-- 2. Check application functionality
-- 3. Monitor for errors
-- 4. Update application code to use original credit.service.ts