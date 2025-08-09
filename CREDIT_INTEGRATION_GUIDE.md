# 积分系统集成指南 (Credit System Integration Guide)

## 快速开始 (Quick Start)

### 1. 运行数据库迁移
```bash
# 生成迁移文件
pnpm db:generate

# 应用迁移到数据库
pnpm db:migrate
```

### 2. 在水印移除功能中集成积分

#### 示例：水印移除组件集成

```tsx
// src/components/watermark/watermark-remover.tsx
'use client';

import { useState } from 'react';
import { useWatermarkCredits } from '@/hooks/use-credits';
import { InsufficientCreditsModal } from '@/components/credits/insufficient-credits-modal';
import { calculateCreditCost } from '@/credits/types';

export function WatermarkRemover() {
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  
  const { processWithCredits, checkBalance, balance } = useWatermarkCredits(
    (required, current) => {
      setRequiredCredits(required);
      setShowInsufficientModal(true);
    }
  );

  const handleRemoveWatermark = async (file: File) => {
    // 计算文件大小（MB）
    const fileSizeMB = file.size / (1024 * 1024);
    
    // 检查积分
    const creditCheck = await checkBalance(fileSizeMB);
    if (!creditCheck.hasCredits) {
      return;
    }

    // 使用积分处理
    const result = await processWithCredits(
      async () => {
        // 你的水印移除逻辑
        return await removeWatermarkAPI(file);
      },
      fileSizeMB,
      {
        fileName: file.name,
        fileType: file.type,
      }
    );

    if (result.success) {
      // 处理成功
      console.log('Watermark removed successfully');
    }
  };

  return (
    <>
      {/* 你的UI组件 */}
      
      <InsufficientCreditsModal
        open={showInsufficientModal}
        onOpenChange={setShowInsufficientModal}
        requiredCredits={requiredCredits}
        feature="watermark removal"
      />
    </>
  );
}
```

### 3. 在Dashboard显示积分余额

```tsx
// src/app/[locale]/dashboard/page.tsx
import { CreditBalance } from '@/components/credits/credit-balance';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 积分余额卡片 */}
      <CreditBalance />
      
      {/* 其他Dashboard内容 */}
    </div>
  );
}
```

### 4. 创建积分购买页面

```tsx
// src/app/[locale]/pricing/credits/page.tsx
import { getCreditPackages } from '@/actions/credits';
import { CreditPackagesGrid } from '@/components/credits/credit-packages-grid';

export default async function CreditPricingPage() {
  const packages = await getCreditPackages();
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Purchase Credits</h1>
      <CreditPackagesGrid packages={packages.data || []} />
    </div>
  );
}
```

## Stripe Webhook集成

### 更新Webhook处理器

```typescript
// src/app/api/webhooks/stripe/route.ts
import { creditService } from '@/credits/credit.service';

export async function POST(req: Request) {
  // ... 现有的Stripe webhook验证代码

  switch (event.type) {
    // 订阅创建
    case 'customer.subscription.created':
      const subscription = event.data.object;
      await creditService.allocateMonthlyCredits(
        userId,
        getPlanIdFromPriceId(subscription.price.id)
      );
      break;

    // 订阅更新
    case 'customer.subscription.updated':
      const updatedSub = event.data.object;
      const oldPlanId = getPlanIdFromPriceId(previousAttributes.price.id);
      const newPlanId = getPlanIdFromPriceId(updatedSub.price.id);
      
      if (oldPlanId !== newPlanId) {
        await creditService.handleSubscriptionChange(
          userId,
          oldPlanId,
          newPlanId
        );
      }
      break;

    // 积分包购买成功
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      if (paymentIntent.metadata.type === 'credit_package') {
        await creditService.purchaseCreditPackage(
          paymentIntent.metadata.userId,
          paymentIntent.metadata.packageId,
          paymentIntent.id
        );
      }
      break;
  }
}
```

## 定时任务设置

### 月度积分重置 (使用Vercel Cron或其他定时服务)

```typescript
// src/app/api/cron/reset-credits/route.ts
import { creditService } from '@/credits/credit.service';
import { db } from '@/db';
import { payment, subscriptionCreditConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  // 验证是否是Vercel Cron请求
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 获取所有活跃订阅
    const activeSubscriptions = await db
      .select()
      .from(payment)
      .where(eq(payment.status, 'active'));

    // 为每个订阅分配月度积分
    for (const subscription of activeSubscriptions) {
      await creditService.allocateMonthlyCredits(
        subscription.userId,
        subscription.priceId
      );
    }

    return new Response('Credits reset successfully', { status: 200 });
  } catch (error) {
    console.error('Error resetting credits:', error);
    return new Response('Error resetting credits', { status: 500 });
  }
}
```

### Vercel配置 (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-credits",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

## 管理员功能

### 积分管理页面

```tsx
// src/app/[locale]/admin/credits/page.tsx
'use client';

import { useState } from 'react';
import { addCreditsToUser } from '@/actions/credits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminCreditsPage() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleAddCredits = async () => {
    const result = await addCreditsToUser(
      userId,
      parseInt(amount),
      reason
    );
    
    if (result.success) {
      toast.success(`Added ${amount} credits to user`);
      // Reset form
      setUserId('');
      setAmount('');
      setReason('');
    } else {
      toast.error(result.error || 'Failed to add credits');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Credit Management</h1>
      
      <div className="space-y-2">
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button onClick={handleAddCredits}>
          Add Credits
        </Button>
      </div>
    </div>
  );
}
```

## 测试检查清单

### 功能测试
- [ ] 用户注册时积分初始化
- [ ] 订阅创建时分配月度积分
- [ ] 订阅升级/降级时积分调整
- [ ] 积分购买流程
- [ ] 水印移除时积分扣除
- [ ] 积分不足提示
- [ ] 积分余额显示
- [ ] 交易历史查看

### 边界情况测试
- [ ] 积分为0时的处理
- [ ] 并发扣除积分的处理
- [ ] 退款时的积分处理
- [ ] 订阅取消时的积分保留
- [ ] 月度重置的准确性

### 性能测试
- [ ] 积分查询响应时间 < 100ms
- [ ] 积分扣除事务性保证
- [ ] 高并发下的稳定性

## 常见问题

### Q: 如何调整不同功能的积分消耗？
修改 `src/credits/types.ts` 中的 `CREDIT_COSTS` 对象：

```typescript
export const CREDIT_COSTS: Record<FeatureType, number> = {
  watermark_removal: 10,  // 修改这个值
  batch_process: 15,
  ai_enhancement: 30,
  hd_processing: 20,
};
```

### Q: 如何添加新的积分包？
在数据库中插入新记录或通过管理界面添加：

```sql
INSERT INTO credit_packages (id, name, credits, price, description, popular)
VALUES ('pkg_custom', 'Custom Package', 1500, 5000, 'Special offer', false);
```

### Q: 如何实现积分过期？
添加定时任务检查并过期超过指定时间的积分：

```typescript
// 在CreditService中添加方法
async expireOldCredits(daysToExpire = 90) {
  // 实现积分过期逻辑
}
```

## 监控和分析

### 关键指标
- 平均积分消耗率
- 积分包购买转化率
- 用户积分余额分布
- 功能使用频率
- 积分相关的客户投诉

### 建议的监控工具
- Sentry: 错误监控
- Mixpanel/Amplitude: 用户行为分析
- Stripe Dashboard: 支付相关指标
- Custom Dashboard: 积分使用统计

---

## 下一步优化建议

1. **积分缓存**: 使用Redis缓存用户积分余额，减少数据库查询
2. **批量操作优化**: 支持批量处理时的积分优化定价
3. **积分转赠功能**: 允许用户之间转赠积分
4. **积分活动系统**: 节假日双倍积分、首充奖励等
5. **API限流**: 基于积分的API调用限制
6. **详细报表**: 月度/年度积分使用报表导出

---

*文档最后更新: 2025-01-08*