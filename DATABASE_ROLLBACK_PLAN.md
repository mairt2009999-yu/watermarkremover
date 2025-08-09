# 数据库回滚计划 - 积分系统
# Database Rollback Plan - Credit System

## 🚨 紧急回滚程序 (Emergency Rollback Procedure)

### 快速回滚命令 (Quick Rollback Commands)

```bash
# 1. 立即停止应用服务
kubectl scale deployment watermark-remover --replicas=0

# 2. 执行数据库回滚
psql $DATABASE_URL < src/db/migrations/0003_rollback_credit_system.sql

# 3. 切换代码版本
git checkout tags/pre-credit-migration-v1
npm run build

# 4. 重启服务
kubectl scale deployment watermark-remover --replicas=3
```

## 📊 回滚决策矩阵 (Rollback Decision Matrix)

| 情况 | 严重程度 | 回滚时间窗口 | 回滚类型 |
|------|----------|--------------|----------|
| 积分计算错误 | 🔴 严重 | 立即 | 完全回滚 |
| 用户无法使用功能 | 🔴 严重 | 15分钟内 | 完全回滚 |
| 支付处理失败 | 🔴 严重 | 30分钟内 | 完全回滚 |
| 性能下降>50% | 🟡 中等 | 2小时内 | 部分回滚 |
| UI显示问题 | 🟢 轻微 | 24小时内 | 热修复 |

## 🔄 三阶段回滚策略 (Three-Stage Rollback Strategy)

### Stage 1: 即时回滚 (0-15分钟)
**触发条件**: 
- 核心功能完全失效
- 数据丢失或损坏
- 支付系统故障

**执行步骤**:
```sql
-- 1. 停止所有写入操作
ALTER DATABASE watermark_remover SET default_transaction_read_only = true;

-- 2. 创建当前状态快照
CREATE TABLE user_credits_backup_$(date +%Y%m%d_%H%M%S) AS SELECT * FROM user_credits;
CREATE TABLE credit_transactions_backup_$(date +%Y%m%d_%H%M%S) AS SELECT * FROM credit_transactions;

-- 3. 执行回滚脚本
\i src/db/migrations/0003_rollback_credit_system.sql

-- 4. 验证回滚
SELECT * FROM verify_rollback();

-- 5. 恢复写入
ALTER DATABASE watermark_remover SET default_transaction_read_only = false;
```

### Stage 2: 计划回滚 (15分钟-2小时)
**触发条件**:
- 转化率下降 >30%
- 错误率上升 >10%
- 客户投诉激增

**执行步骤**:
```bash
# 1. 发布维护通知
curl -X POST $NOTIFICATION_API \
  -d '{"message": "系统维护中，预计30分钟恢复", "type": "maintenance"}'

# 2. 备份当前数据
pg_dump $DATABASE_URL > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql

# 3. 执行回滚
psql $DATABASE_URL < src/db/migrations/0003_rollback_credit_system.sql

# 4. 切换应用版本
vercel rollback --to pre-credit-migration

# 5. 验证系统
npm run test:e2e
npm run test:integration
```

### Stage 3: 延迟回滚 (2-24小时)
**触发条件**:
- 业务指标未达预期
- 用户反馈负面
- 非关键问题累积

**执行步骤**:
1. 数据分析和影响评估
2. 制定详细回滚计划
3. 通知所有利益相关者
4. 在低峰期执行回滚
5. 全面测试和监控

## 🗄️ 数据库回滚SQL详解

### 1. 恢复表结构
```sql
-- 重建 credit_packages 表
CREATE TABLE "credit_packages" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "credits" integer NOT NULL,
  "price" integer NOT NULL,
  "currency" text DEFAULT 'USD',
  "stripe_price_id" text,
  "creem_price_id" text,
  "description" text,
  "popular" boolean DEFAULT false,
  "active" boolean DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now()
);

-- 重建 credit_purchases 表
CREATE TABLE "credit_purchases" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "package_id" text NOT NULL REFERENCES "credit_packages"("id"),
  "credits" integer NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'USD',
  "stripe_payment_intent_id" text,
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);
```

### 2. 恢复数据
```sql
-- 恢复 purchased_credits 列
ALTER TABLE "user_credits" 
ADD COLUMN "purchased_credits" integer NOT NULL DEFAULT 0;

-- 从交易历史重建购买数据
WITH purchase_history AS (
  SELECT 
    user_id,
    SUM(CASE WHEN type = 'purchased' THEN amount ELSE 0 END) as total_purchased
  FROM credit_transactions
  WHERE created_at >= '2024-01-01'
  GROUP BY user_id
)
UPDATE user_credits
SET purchased_credits = COALESCE(purchase_history.total_purchased, 0)
FROM purchase_history
WHERE user_credits.user_id = purchase_history.user_id;
```

### 3. 恢复配置
```sql
-- 恢复原始积分配置
UPDATE subscription_credit_config SET monthly_credits = CASE
  WHEN plan_id = 'free' THEN 10
  WHEN plan_id = 'pro' THEN 300
  WHEN plan_id = 'pro_monthly' THEN 300
  WHEN plan_id = 'pro_yearly' THEN 400
  WHEN plan_id = 'lifetime' THEN 1000
  ELSE monthly_credits
END;
```

## 🔍 回滚验证检查表 (Rollback Verification Checklist)

### 数据库验证
```sql
-- 运行完整验证套件
SELECT * FROM verify_rollback();

-- 检查表存在性
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('credit_packages', 'credit_purchases');

-- 验证数据完整性
SELECT 
  COUNT(*) as user_count,
  SUM(CASE WHEN balance < 0 THEN 1 ELSE 0 END) as negative_balances,
  SUM(CASE WHEN balance != (monthly_allocation + purchased_credits - 
    (SELECT COALESCE(SUM(ABS(amount)), 0) 
     FROM credit_transactions 
     WHERE user_id = uc.user_id AND type = 'spent')) 
    THEN 1 ELSE 0 END) as balance_mismatches
FROM user_credits uc;

-- 检查外键约束
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('credit_purchases', 'user_credits');
```

### 应用验证
```typescript
// 测试脚本: test-rollback.ts
import { creditService } from '@/credits/credit.service';

async function verifyRollback() {
  const tests = [
    // 测试积分包购买功能
    async () => {
      const packages = await creditService.getCreditPackages();
      return packages && packages.length > 0;
    },
    
    // 测试购买积分
    async () => {
      const result = await creditService.purchaseCreditPackage(
        'test_user_id',
        'pkg_starter',
        'test_payment_intent'
      );
      return result.success;
    },
    
    // 测试余额计算
    async () => {
      const balance = await creditService.getBalance('test_user_id');
      return balance >= 0;
    }
  ];
  
  const results = await Promise.all(tests.map(t => t().catch(() => false)));
  return results.every(r => r === true);
}
```

## 📱 应用代码回滚 (Application Code Rollback)

### Git标签管理
```bash
# 迁移前创建标签
git tag -a pre-credit-migration-v1 -m "Before credit system migration"
git push origin pre-credit-migration-v1

# 回滚到标签
git checkout pre-credit-migration-v1
npm install
npm run build
```

### 环境变量切换
```env
# .env.production
CREDIT_SYSTEM_VERSION=v1  # v1=原始系统, v2=简化系统
ENABLE_CREDIT_PURCHASES=true
ROLLBACK_MODE=true
```

### Feature Flag配置
```typescript
// config/features.ts
export const features = {
  creditSystem: {
    version: process.env.CREDIT_SYSTEM_VERSION || 'v1',
    enablePurchases: process.env.ENABLE_CREDIT_PURCHASES === 'true',
    rollbackMode: process.env.ROLLBACK_MODE === 'true'
  }
};

// 使用示例
import { creditService as v1Service } from '@/credits/credit.service';
import { creditService as v2Service } from '@/credits/credit.service.simplified';

const creditService = features.creditSystem.version === 'v2' ? v2Service : v1Service;
```

## 📊 监控和告警 (Monitoring & Alerts)

### 关键指标监控
```typescript
// monitoring/rollback-metrics.ts
export const rollbackMetrics = {
  // 数据一致性
  creditBalanceAccuracy: async () => {
    const discrepancies = await db.query(`
      SELECT COUNT(*) FROM user_credits 
      WHERE balance != (monthly_allocation + purchased_credits - spent_credits)
    `);
    return discrepancies[0].count === 0;
  },
  
  // 交易处理
  transactionSuccessRate: async () => {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful
      FROM credit_transactions
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `);
    return stats[0].successful / stats[0].total;
  },
  
  // 系统性能
  apiResponseTime: async () => {
    // 监控API响应时间
    return performanceMonitor.getAverageResponseTime();
  }
};
```

### 告警配置
```yaml
# alerts.yaml
alerts:
  - name: credit_balance_mismatch
    condition: discrepancy_count > 10
    severity: critical
    action: page_oncall
    
  - name: transaction_failure_rate
    condition: failure_rate > 0.05
    severity: high
    action: email_team
    
  - name: rollback_verification_failed
    condition: any_check_failed
    severity: critical
    action: block_deployment
```

## 📧 用户通知模板 (User Communication Templates)

### 回滚前通知
```html
Subject: 系统维护通知 - 积分系统临时调整

尊敬的用户，

我们将在接下来的30分钟内进行系统维护，以优化积分系统体验。

维护期间：
- 您的积分余额将被保护，不会丢失
- 部分功能可能暂时不可用
- 维护完成后将自动恢复

如有任何问题，请联系客服。

感谢您的理解和支持！
```

### 回滚后通知
```html
Subject: 系统更新完成 - 积分系统已恢复

尊敬的用户，

系统维护已完成，所有功能已恢复正常。

重要说明：
- 您的积分余额已核对并确认无误
- 积分购买功能已恢复
- 如发现任何异常，请立即联系我们

作为补偿，我们已向您的账户赠送50积分。

谢谢您的耐心等待！
```

## ✅ 回滚成功标准 (Rollback Success Criteria)

1. **数据完整性** ✓
   - 所有用户积分余额正确
   - 交易历史完整保留
   - 无数据丢失

2. **功能恢复** ✓
   - 积分购买功能正常
   - 积分扣除正常
   - 订阅积分分配正常

3. **性能指标** ✓
   - API响应时间 <100ms
   - 错误率 <0.1%
   - 数据库查询时间 <50ms

4. **用户体验** ✓
   - 无明显UI问题
   - 支付流程顺畅
   - 客户投诉减少

## 📝 回滚后续工作 (Post-Rollback Tasks)

- [ ] 完整的事后分析报告
- [ ] 更新部署流程文档
- [ ] 改进测试覆盖率
- [ ] 制定新的迁移计划
- [ ] 团队复盘会议
- [ ] 更新监控和告警
- [ ] 客户满意度调查

---

**紧急联系人**:
- 数据库管理员: +86-xxx-xxxx
- 后端负责人: +86-xxx-xxxx
- DevOps: +86-xxx-xxxx
- 产品经理: +86-xxx-xxxx

**回滚授权级别**:
- Level 1 (即时): DevOps团队
- Level 2 (计划): 技术负责人
- Level 3 (延迟): CTO批准

*最后更新: 2025-01-08*