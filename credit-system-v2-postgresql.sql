-- =========================================
-- Credit System V2 - PostgreSQL Version
-- 积分系统 V2 - 仅订阅积分，无积分包购买
-- =========================================

-- 如果是迁移现有系统，先删除V1的表
DROP TABLE IF EXISTS "credit_purchases" CASCADE;
DROP TABLE IF EXISTS "credit_packages" CASCADE;

-- 如果 user_credits 表有 purchased_credits 列，删除它
-- ALTER TABLE "user_credits" DROP COLUMN IF EXISTS "purchased_credits";

-- User table (如果不存在)
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "role" text,
  "banned" boolean DEFAULT false,
  "ban_reason" text,
  "ban_expires" timestamp,
  "customer_id" text
);

-- Session table (如果不存在)
CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL,
  "impersonated_by" text,
  CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Account table (如果不存在)
CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "password" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Verification table (如果不存在)
CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Payment table (如果不存在)
CREATE TABLE IF NOT EXISTS "payment" (
  "id" text PRIMARY KEY NOT NULL,
  "price_id" text NOT NULL,
  "type" text NOT NULL,
  "interval" text,
  "user_id" text NOT NULL,
  "customer_id" text NOT NULL,
  "subscription_id" text,
  "status" text NOT NULL,
  "period_start" timestamp,
  "period_end" timestamp,
  "cancel_at_period_end" boolean DEFAULT false,
  "trial_start" timestamp,
  "trial_end" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- User credits table (V2 - 简化版本，仅订阅积分)
CREATE TABLE IF NOT EXISTS "user_credits" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL UNIQUE,
  "balance" integer NOT NULL DEFAULT 0,
  "monthly_allocation" integer NOT NULL DEFAULT 0,
  "last_reset_date" timestamp,
  "total_earned" integer NOT NULL DEFAULT 0,
  "total_spent" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "user_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Credit transactions table (V2 - 无购买类型)
CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "amount" integer NOT NULL,
  "balance_after" integer NOT NULL,
  "type" text NOT NULL CHECK ("type" IN ('earned', 'spent', 'expired', 'refunded', 'bonus')),
  "reason" text NOT NULL,
  "feature_used" text,
  "metadata" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Subscription credit configuration table
CREATE TABLE IF NOT EXISTS "subscription_credit_config" (
  "id" text PRIMARY KEY NOT NULL,
  "plan_id" text NOT NULL UNIQUE,
  "monthly_credits" integer NOT NULL,
  "rollover_enabled" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 创建索引以提升性能
CREATE INDEX IF NOT EXISTS "idx_user_transactions" ON "credit_transactions" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "credit_transactions" ("type", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_payment_user" ON "payment" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_session_user" ON "session" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_credits_user" ON "user_credits" ("user_id");

-- 插入初始订阅积分配置 (V2)
INSERT INTO "subscription_credit_config" ("id", "plan_id", "monthly_credits", "rollover_enabled") 
VALUES 
  ('cfg_free_v2', 'free', 5, false),
  ('cfg_pro_monthly_v2', 'pro_monthly', 100, false),
  ('cfg_pro_yearly_v2', 'pro_yearly', 150, false),
  ('cfg_lifetime_v2', 'lifetime', 500, false)
ON CONFLICT ("plan_id") DO UPDATE SET
  "monthly_credits" = EXCLUDED."monthly_credits",
  "rollover_enabled" = false;

-- 如果有现有用户积分数据，调整余额到月度分配限制内
-- UPDATE "user_credits" 
-- SET "balance" = LEAST("balance", "monthly_allocation")
-- WHERE "balance" > "monthly_allocation";

-- 验证数据
SELECT 'V2 Credit System Setup Complete!' as message;
SELECT 'Plan: ' || plan_id || ' - Credits: ' || monthly_credits as configuration 
FROM subscription_credit_config 
ORDER BY 
  CASE plan_id 
    WHEN 'free' THEN 1 
    WHEN 'pro_monthly' THEN 2 
    WHEN 'pro_yearly' THEN 3 
    WHEN 'lifetime' THEN 4 
  END;