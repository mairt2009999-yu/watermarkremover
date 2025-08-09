# 迁移到订阅积分系统 - 实施指南
# Migration to Subscription-Only Credits - Implementation Guide

## 🚀 快速迁移步骤 (Quick Migration Steps)

### Step 1: 备份数据库
```bash
# 备份现有数据库
pg_dump your_database > backup_$(date +%Y%m%d).sql
```

### Step 2: 应用数据库迁移
```bash
# 运行新的迁移文件
pnpm db:migrate

# 或手动执行SQL
psql your_database < src/db/migrations/0003_simplify_credit_system.sql
```

### Step 3: 更新代码引用

#### 替换 CreditService
```typescript
// OLD: src/credits/credit.service.ts
import { creditService } from '@/credits/credit.service';

// NEW: src/credits/credit.service.simplified.ts  
import { creditService } from '@/credits/credit.service.simplified';
```

#### 替换 Types
```typescript
// OLD: src/credits/types.ts
import { formatCredits, calculateCreditCost } from '@/credits/types';

// NEW: src/credits/types.simplified.ts
import { formatCredits, calculateCreditCost } from '@/credits/types.simplified';
```

#### 替换 UI Components
```typescript
// OLD Components
import { CreditBalance } from '@/components/credits/credit-balance';
import { InsufficientCreditsModal } from '@/components/credits/insufficient-credits-modal';

// NEW Simplified Components
import { SimplifiedCreditBalance } from '@/components/credits/credit-balance-simplified';
import { SimplifiedInsufficientCreditsModal } from '@/components/credits/insufficient-credits-modal-simplified';
```

### Step 4: 更新 Actions
```typescript
// src/actions/credits.ts - 删除购买相关函数
// REMOVE:
// - getCreditPackages()
// - purchaseCreditPackage()

// KEEP:
// - getUserCredits()
// - checkCredits()
// - deductCredits()
// - getCreditHistory()
```

### Step 5: 更新 Webhook 处理

```typescript
// src/app/api/webhooks/stripe/route.ts
import { creditService } from '@/credits/credit.service.simplified';

export async function POST(req: Request) {
  // ... Stripe webhook验证

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const planId = getPlanIdFromPriceId(subscription.price.id);
      
      // 分配订阅积分
      await creditService.allocateMonthlyCredits(userId, planId);
      break;

    case 'customer.subscription.deleted':
      // 订阅取消 - 积分保留到期末
      await creditService.handleSubscriptionCancellation(userId);
      break;

    // REMOVE: payment_intent.succeeded for credit packages
  }
}
```

### Step 6: 更新定价页面

```tsx
// src/app/[locale]/pricing/page.tsx
export default function PricingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Choose Your Plan
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <PricingCard
          name="Free"
          price="$0"
          credits={5}
          features={[
            "5 credits per month",
            "Basic watermark removal",
            "Community support"
          ]}
        />
        
        <PricingCard
          name="Pro Monthly"
          price="$9.99/mo"
          credits={100}
          popular
          features={[
            "100 credits per month",
            "All features unlocked",
            "Priority processing",
            "Email support"
          ]}
        />
        
        <PricingCard
          name="Pro Yearly"
          price="$79/year"
          credits={150}
          savings="Save 34%"
          features={[
            "150 credits per month",
            "50% more credits",
            "All Pro features",
            "Priority support"
          ]}
        />
        
        <PricingCard
          name="Lifetime"
          price="$149"
          credits={500}
          lifetime
          features={[
            "500 credits per month forever",
            "Best value",
            "All features",
            "Premium support"
          ]}
        />
      </div>
      
      {/* Credit Calculator */}
      <CreditCalculator className="mt-12" />
    </div>
  );
}
```

### Step 7: 配置定时任务

```typescript
// src/app/api/cron/reset-credits/route.ts
import { creditService } from '@/credits/credit.service.simplified';

export async function GET(request: Request) {
  // 验证cron密钥
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 重置所有用户的月度积分
    await creditService.resetMonthlyCredits();
    return new Response('Credits reset successfully', { status: 200 });
  } catch (error) {
    console.error('Error resetting credits:', error);
    return new Response('Error', { status: 500 });
  }
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/reset-credits",
      "schedule": "0 0 1 * *"  // 每月1日 00:00 UTC
    }
  ]
}
```

## 📊 配置更新 (Configuration Updates)

### 更新环境变量
```env
# .env.local
# REMOVE these:
# NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL=
# NEXT_PUBLIC_STRIPE_PRICE_CREDIT_MEDIUM=
# NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE=

# KEEP these:
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_yyy
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME=price_zzz
```

### 更新积分配置
```typescript
// src/config/credits.ts
export const CREDIT_CONFIG = {
  // 订阅积分配额
  SUBSCRIPTION_CREDITS: {
    free: 5,
    pro_monthly: 100,
    pro_yearly: 150,
    lifetime: 500,
  },
  
  // 功能消耗
  FEATURE_COSTS: {
    watermark_removal_simple: 5,
    watermark_removal_complex: 10,
    batch_process_per_image: 8,
    ai_enhancement: 20,
  },
  
  // 系统规则
  RULES: {
    rollover: false,  // 不滚存
    expireOnCancel: true,  // 取消后过期
    resetDay: 1,  // 每月1日重置
  }
};
```

## 🔄 用户数据迁移 (User Data Migration)

### 处理现有积分
```sql
-- 迁移脚本: 处理已购买的积分
-- 将purchased_credits加到balance中作为bonus
UPDATE user_credits 
SET balance = balance + purchased_credits,
    total_earned = total_earned + purchased_credits
WHERE purchased_credits > 0;

-- 记录迁移
INSERT INTO credit_transactions (id, user_id, amount, balance_after, type, reason, created_at)
SELECT 
    gen_random_uuid(),
    user_id,
    purchased_credits,
    balance,
    'bonus',
    'Migration: Previously purchased credits converted to bonus',
    NOW()
FROM user_credits
WHERE purchased_credits > 0;
```

### 通知用户
```typescript
// 发送迁移通知邮件
async function notifyUsersAboutMigration() {
  const users = await getUsersWithPurchasedCredits();
  
  for (const user of users) {
    await sendEmail({
      to: user.email,
      subject: '重要更新：积分系统简化升级',
      template: 'credit-migration',
      data: {
        name: user.name,
        previousCredits: user.purchasedCredits,
        newSystem: true,
      }
    });
  }
}
```

## ✅ 测试检查清单 (Testing Checklist)

### 功能测试
- [ ] 新用户注册获得免费积分
- [ ] 订阅升级立即获得新积分
- [ ] 订阅降级正确调整积分
- [ ] 取消订阅积分保留到期末
- [ ] 月度积分正确重置
- [ ] 积分不足显示升级提示
- [ ] 积分扣除正常工作

### UI测试
- [ ] 积分余额正确显示
- [ ] 无购买按钮显示
- [ ] 升级提示正确跳转
- [ ] 历史记录正确显示
- [ ] 移动端响应正常

### 性能测试
- [ ] 积分查询 < 100ms
- [ ] 批量重置正常运行
- [ ] 数据库索引优化

## 🚨 回滚方案 (Rollback Plan)

如果需要回滚到原系统：

```bash
# 1. 恢复数据库
psql your_database < backup_20250108.sql

# 2. 切换代码分支
git checkout main

# 3. 重新部署
vercel --prod
```

## 📈 监控指标 (Monitoring Metrics)

### 关键指标监控
```typescript
// 添加监控代码
import { track } from '@/lib/analytics';

// 监控升级转化
track('subscription_upgrade', {
  from_plan: oldPlan,
  to_plan: newPlan,
  trigger: 'insufficient_credits',
});

// 监控积分使用
track('credits_depleted', {
  plan: userPlan,
  days_since_reset: daysSinceReset,
});
```

### 告警设置
- 积分重置失败
- 异常高的积分消耗
- 订阅升级失败
- 数据库错误

---

## 🎯 预期结果 (Expected Results)

### Week 1
- 转化率提升 15-20%
- 支持工单减少 25%
- 系统复杂度降低 40%

### Month 1
- MRR增长 25-30%
- 用户满意度提升
- 维护成本降低 50%

---

**完成迁移后**：
1. 删除旧的文件和表
2. 更新文档
3. 通知团队
4. 监控系统稳定性

*迁移支持联系: tech@watermarkremover.io*