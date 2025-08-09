-- Add credit system tables
-- Migration: 0002_add_credit_system
-- Date: 2025-01-08

-- User credits account table
CREATE TABLE IF NOT EXISTS "user_credits" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "balance" integer NOT NULL DEFAULT 0,
  "monthly_allocation" integer NOT NULL DEFAULT 0,
  "purchased_credits" integer NOT NULL DEFAULT 0,
  "last_reset_date" timestamp,
  "total_earned" integer NOT NULL DEFAULT 0,
  "total_spent" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_credits_user_id_unique" UNIQUE("user_id"),
  CONSTRAINT "user_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "amount" integer NOT NULL,
  "balance_after" integer NOT NULL,
  "type" text NOT NULL, -- 'earned', 'spent', 'purchased', 'expired', 'refunded', 'bonus'
  "reason" text NOT NULL,
  "feature_used" text, -- 'watermark_removal', 'batch_process', etc.
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Create index for user transactions
CREATE INDEX IF NOT EXISTS "idx_user_transactions" ON "credit_transactions" ("user_id", "created_at" DESC);

-- Credit packages table
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

-- Credit purchases table
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

-- Create index for user purchases
CREATE INDEX IF NOT EXISTS "idx_user_purchases" ON "credit_purchases" ("user_id", "created_at" DESC);

-- Subscription credit configuration table
CREATE TABLE IF NOT EXISTS "subscription_credit_config" (
  "id" text PRIMARY KEY NOT NULL,
  "plan_id" text NOT NULL,
  "monthly_credits" integer NOT NULL,
  "rollover_enabled" boolean DEFAULT false,
  "rollover_max_months" integer DEFAULT 0,
  "bonus_percentage" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "subscription_credit_config_plan_id_unique" UNIQUE("plan_id")
);

-- Insert default credit packages
INSERT INTO "credit_packages" ("id", "name", "credits", "price", "description", "popular", "sort_order") VALUES
  ('pkg_starter', 'Starter', 100, 500, 'Perfect for trying out our service', false, 1),
  ('pkg_popular', 'Popular', 500, 2000, 'Most popular choice for regular users', true, 2),
  ('pkg_value', 'Value', 2000, 7000, 'Best value for power users', false, 3),
  ('pkg_enterprise', 'Enterprise', 10000, 30000, 'For teams and businesses', false, 4);

-- Insert subscription credit configurations
INSERT INTO "subscription_credit_config" ("id", "plan_id", "monthly_credits", "rollover_enabled") VALUES
  ('cfg_free', 'free', 10, false),
  ('cfg_pro_monthly', 'pro', 300, false),
  ('cfg_pro_yearly', 'pro', 400, false),
  ('cfg_lifetime', 'lifetime', 1000, false);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits_updated_at 
  BEFORE UPDATE ON "user_credits"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();