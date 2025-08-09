-- Create SQLite database with simplified credit system (V2)
-- This script creates the database with only subscription-based credits

-- User table
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "role" TEXT,
  "banned" INTEGER DEFAULT 0,
  "ban_reason" TEXT,
  "ban_expires" DATETIME,
  "customer_id" TEXT
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expires_at" DATETIME NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "user_id" TEXT NOT NULL,
  "impersonated_by" TEXT,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Account table
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" DATETIME,
  "refresh_token_expires_at" DATETIME,
  "scope" TEXT,
  "password" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Verification table
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" DATETIME NOT NULL,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment table
CREATE TABLE IF NOT EXISTS "payment" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "price_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "interval" TEXT,
  "user_id" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "subscription_id" TEXT,
  "status" TEXT NOT NULL,
  "period_start" DATETIME,
  "period_end" DATETIME,
  "cancel_at_period_end" INTEGER DEFAULT 0,
  "trial_start" DATETIME,
  "trial_end" DATETIME,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- User credits table (V2 - Simplified)
CREATE TABLE IF NOT EXISTS "user_credits" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL UNIQUE,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "monthly_allocation" INTEGER NOT NULL DEFAULT 0,
  "last_reset_date" DATETIME,
  "total_earned" INTEGER NOT NULL DEFAULT 0,
  "total_spent" INTEGER NOT NULL DEFAULT 0,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "balance_after" INTEGER NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('earned', 'spent', 'expired', 'refunded', 'bonus')),
  "reason" TEXT NOT NULL,
  "feature_used" TEXT,
  "metadata" TEXT, -- JSON as text in SQLite
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Subscription credit configuration table
CREATE TABLE IF NOT EXISTS "subscription_credit_config" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "plan_id" TEXT NOT NULL UNIQUE,
  "monthly_credits" INTEGER NOT NULL,
  "rollover_enabled" INTEGER DEFAULT 0,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_transactions" ON "credit_transactions" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "credit_transactions" ("type", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_payment_user" ON "payment" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_session_user" ON "session" ("user_id");

-- Insert initial subscription credit configurations
INSERT OR REPLACE INTO "subscription_credit_config" ("id", "plan_id", "monthly_credits", "rollover_enabled") 
VALUES 
  ('cfg_free_v2', 'free', 5, 0),
  ('cfg_pro_monthly_v2', 'pro_monthly', 100, 0),
  ('cfg_pro_yearly_v2', 'pro_yearly', 150, 0),
  ('cfg_lifetime_v2', 'lifetime', 500, 0);

-- Log successful creation
SELECT 'Database created successfully with V2 credit system (subscription-only)' AS message;