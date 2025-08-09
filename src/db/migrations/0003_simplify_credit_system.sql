-- Simplify credit system - Remove credit purchases, keep only subscription credits
-- Migration: 0003_simplify_credit_system
-- Date: 2025-01-08

-- Drop credit purchase related tables
DROP TABLE IF EXISTS "credit_purchases";
DROP TABLE IF EXISTS "credit_packages";

-- Simplify user_credits table by removing purchased_credits column
ALTER TABLE "user_credits" 
  DROP COLUMN IF EXISTS "purchased_credits";

-- Update subscription credit configurations with new allocations
UPDATE "subscription_credit_config" SET "monthly_credits" = 5 WHERE "plan_id" = 'free';
UPDATE "subscription_credit_config" SET "monthly_credits" = 100 WHERE "plan_id" = 'pro';
UPDATE "subscription_credit_config" SET "monthly_credits" = 150 WHERE "plan_id" = 'pro_yearly';
UPDATE "subscription_credit_config" SET "monthly_credits" = 500 WHERE "plan_id" = 'lifetime';

-- Add new config entries if they don't exist
INSERT INTO "subscription_credit_config" ("id", "plan_id", "monthly_credits", "rollover_enabled")
VALUES 
  ('cfg_pro_monthly_v2', 'pro_monthly', 100, false),
  ('cfg_pro_yearly_v2', 'pro_yearly', 150, false)
ON CONFLICT (plan_id) 
DO UPDATE SET 
  monthly_credits = EXCLUDED.monthly_credits,
  rollover_enabled = false;

-- Update existing user credits to remove any purchased credits from balance
UPDATE "user_credits"
SET balance = LEAST(balance, monthly_allocation)
WHERE balance > monthly_allocation;

-- Clean up transaction types - remove 'purchased' type transactions going forward
-- Historical data can remain for record keeping
ALTER TABLE "credit_transactions"
ADD CONSTRAINT check_transaction_type 
CHECK (type IN ('earned', 'spent', 'expired', 'refunded', 'bonus'));

-- Add index for faster queries on transaction type
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "credit_transactions" ("type", "created_at" DESC);