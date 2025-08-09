-- =========================================
-- 从 V1 迁移到 V2 积分系统
-- Migration from V1 to V2 Credit System
-- =========================================

-- 备份现有数据（推荐在执行前先备份整个数据库）

-- 1. 创建备份表（如果需要保留历史数据）
CREATE TABLE IF NOT EXISTS "credit_packages_backup" AS SELECT * FROM "credit_packages";
CREATE TABLE IF NOT EXISTS "credit_purchases_backup" AS SELECT * FROM "credit_purchases";

-- 2. 删除 V1 特有的表
DROP TABLE IF EXISTS "credit_purchases" CASCADE;
DROP TABLE IF EXISTS "credit_packages" CASCADE;

-- 3. 如果 user_credits 表有 purchased_credits 列，删除它
-- PostgreSQL 版本:
ALTER TABLE "user_credits" DROP COLUMN IF EXISTS "purchased_credits";

-- SQLite 版本（SQLite 不支持 DROP COLUMN，需要重建表）:
-- CREATE TABLE "user_credits_new" AS 
-- SELECT "id", "user_id", "balance", "monthly_allocation", "last_reset_date", "total_earned", "total_spent", "created_at", "updated_at"
-- FROM "user_credits";
-- DROP TABLE "user_credits";
-- ALTER TABLE "user_credits_new" RENAME TO "user_credits";

-- 4. 更新交易类型约束（移除 'purchased' 类型）
-- PostgreSQL 版本:
ALTER TABLE "credit_transactions" DROP CONSTRAINT IF EXISTS "check_transaction_type";
ALTER TABLE "credit_transactions" 
ADD CONSTRAINT "check_transaction_type" 
CHECK ("type" IN ('earned', 'spent', 'expired', 'refunded', 'bonus'));

-- SQLite 版本需要重建表:
-- CREATE TABLE "credit_transactions_new" (
--   "id" TEXT PRIMARY KEY NOT NULL,
--   "user_id" TEXT NOT NULL,
--   "amount" INTEGER NOT NULL,
--   "balance_after" INTEGER NOT NULL,
--   "type" TEXT NOT NULL CHECK ("type" IN ('earned', 'spent', 'expired', 'refunded', 'bonus')),
--   "reason" TEXT NOT NULL,
--   "feature_used" TEXT,
--   "metadata" TEXT,
--   "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
-- );
-- INSERT INTO "credit_transactions_new" 
-- SELECT "id", "user_id", "amount", "balance_after", "type", "reason", "feature_used", "metadata", "created_at"
-- FROM "credit_transactions" 
-- WHERE "type" IN ('earned', 'spent', 'expired', 'refunded', 'bonus');
-- DROP TABLE "credit_transactions";
-- ALTER TABLE "credit_transactions_new" RENAME TO "credit_transactions";

-- 5. 确保订阅积分配置表存在并有正确数据
CREATE TABLE IF NOT EXISTS "subscription_credit_config" (
  "id" text PRIMARY KEY NOT NULL,
  "plan_id" text NOT NULL UNIQUE,
  "monthly_credits" integer NOT NULL,
  "rollover_enabled" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 6. 插入或更新 V2 积分配置
INSERT INTO "subscription_credit_config" ("id", "plan_id", "monthly_credits", "rollover_enabled") 
VALUES 
  ('cfg_free_v2', 'free', 5, false),
  ('cfg_pro_monthly_v2', 'pro_monthly', 100, false),
  ('cfg_pro_yearly_v2', 'pro_yearly', 150, false),
  ('cfg_lifetime_v2', 'lifetime', 500, false)
ON CONFLICT ("plan_id") DO UPDATE SET
  "monthly_credits" = EXCLUDED."monthly_credits",
  "rollover_enabled" = false;

-- 7. 调整现有用户积分到订阅限制内（防止积分过多）
UPDATE "user_credits" 
SET "balance" = LEAST("balance", "monthly_allocation")
WHERE "balance" > "monthly_allocation" AND "monthly_allocation" > 0;

-- 8. 为没有月度分配的用户设置免费计划积分
UPDATE "user_credits" 
SET "monthly_allocation" = 5, "balance" = GREATEST("balance", 5)
WHERE "monthly_allocation" = 0;

-- 9. 创建必要的索引
CREATE INDEX IF NOT EXISTS "idx_user_transactions" ON "credit_transactions" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "credit_transactions" ("type", "created_at" DESC);

-- 10. 验证迁移结果
SELECT 'Migration V1 to V2 Complete!' as status;

SELECT 'Credit Configuration:' as section;
SELECT 'Plan: ' || plan_id || ' - Credits: ' || monthly_credits as config 
FROM subscription_credit_config 
ORDER BY 
  CASE plan_id 
    WHEN 'free' THEN 1 
    WHEN 'pro_monthly' THEN 2 
    WHEN 'pro_yearly' THEN 3 
    WHEN 'lifetime' THEN 4 
  END;

SELECT 'User Credits Status:' as section;
SELECT 
  COUNT(*) as total_users,
  AVG(balance) as avg_balance,
  AVG(monthly_allocation) as avg_allocation
FROM user_credits;

SELECT 'Transaction Types:' as section;
SELECT type, COUNT(*) as count 
FROM credit_transactions 
GROUP BY type 
ORDER BY count DESC;