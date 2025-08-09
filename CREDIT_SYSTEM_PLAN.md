# 积分系统实施计划 (Credit System Implementation Plan)

## 🎯 系统概述 (System Overview)

将积分系统集成到现有订阅计划中，实现混合付费模式：订阅用户获得每月积分配额，同时支持额外购买积分包。

### 核心价值主张
- **订阅用户**：每月固定积分配额，稳定使用成本
- **按需用户**：灵活购买积分包，按使用付费
- **商业模式**：订阅收入 + 积分销售的双重收入流

## 📊 积分经济模型 (Credit Economics)

### 订阅计划积分配额
| 计划类型 | 月度积分 | 价值 (USD) | 特权 |
|---------|----------|------------|------|
| **Free** | 10 | $0.50 | 试用体验 |
| **Pro Monthly** | 300 | $15.00 | 标准使用 |
| **Pro Yearly** | 400 | $20.00 | 年付奖励 |
| **Lifetime** | 1000 | $50.00 | 终身优惠 |

### 积分包定价
| 包装规格 | 积分数量 | 价格 (USD) | 单价 | 折扣 |
|---------|----------|------------|------|------|
| **Starter** | 100 | $5 | $0.05 | - |
| **Popular** | 500 | $20 | $0.04 | 20% |
| **Value** | 2000 | $70 | $0.035 | 30% |
| **Enterprise** | 10000 | $300 | $0.03 | 40% |

### 功能消耗定价
| 功能 | 积分消耗 | 说明 |
|------|----------|------|
| **简单水印移除** | 5 | 文字/Logo水印，<2MB |
| **复杂水印移除** | 10 | 半透明/多重水印，2-5MB |
| **高清水印移除** | 20 | 4K图像，>5MB |
| **批量处理** | 15/张 | 批量优惠价 |
| **AI增强处理** | 30 | 使用高级AI模型 |

## 🗄️ 数据库架构 (Database Schema)

### 新增数据表

```sql
-- 用户积分账户表
CREATE TABLE user_credits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  monthly_allocation INTEGER NOT NULL DEFAULT 0,
  purchased_credits INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 积分交易记录表
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earned', 'spent', 'purchased', 'expired', 'refunded', 'bonus'
  reason TEXT NOT NULL,
  feature_used TEXT, -- 'watermark_removal', 'batch_process', etc.
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_transactions(user_id, created_at DESC)
);

-- 积分包定义表
CREATE TABLE credit_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'USD',
  stripe_price_id TEXT,
  creem_price_id TEXT,
  description TEXT,
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 积分包购买记录表
CREATE TABLE credit_purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL REFERENCES credit_packages(id),
  credits INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_purchases(user_id, created_at DESC)
);

-- 订阅积分配置表
CREATE TABLE subscription_credit_config (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  monthly_credits INTEGER NOT NULL,
  rollover_enabled BOOLEAN DEFAULT FALSE,
  rollover_max_months INTEGER DEFAULT 0,
  bonus_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(plan_id)
);
```

## 🔧 核心服务实现 (Core Service Implementation)

### CreditService 类结构

```typescript
// src/credits/credit.service.ts
export class CreditService {
  // 查询操作
  async getBalance(userId: string): Promise<number>
  async getTransactionHistory(userId: string, options?: PaginationOptions)
  async getMonthlyUsage(userId: string): Promise<MonthlyUsageStats>
  
  // 积分操作
  async checkCredits(userId: string, amount: number): Promise<boolean>
  async deductCredits(userId: string, amount: number, feature: string, metadata?: any)
  async addCredits(userId: string, amount: number, reason: string, metadata?: any)
  
  // 订阅相关
  async allocateMonthlyCredits(userId: string, planId: string)
  async resetMonthlyCredits() // Cron job
  async handleSubscriptionChange(userId: string, oldPlan: string, newPlan: string)
  
  // 购买相关
  async purchaseCreditPackage(userId: string, packageId: string, paymentIntentId: string)
  async refundCredits(userId: string, amount: number, reason: string)
  
  // 管理功能
  async expireUnusedCredits() // Optional
  async generateUsageReport(userId: string, startDate: Date, endDate: Date)
}
```

### 积分中间件

```typescript
// src/credits/credit.middleware.ts
export async function requireCredits(requiredAmount: number, feature: string) {
  return async function(req: Request, res: Response, next: NextFunction) {
    const userId = req.session.userId;
    const hasCredits = await creditService.checkCredits(userId, requiredAmount);
    
    if (!hasCredits) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: requiredAmount,
        balance: await creditService.getBalance(userId),
        purchaseUrl: '/pricing/credits'
      });
    }
    
    next();
  };
}
```

## 🎨 UI/UX 组件设计 (UI/UX Components)

### 1. 积分显示组件
```tsx
// src/components/credits/CreditBalance.tsx
- 当前余额显示
- 月度配额/已购买积分分别显示
- 重置倒计时
- 快速购买入口
```

### 2. 积分使用历史
```tsx
// src/components/credits/CreditHistory.tsx
- 交易列表（分页）
- 筛选器（类型、日期范围）
- 导出功能
- 使用统计图表
```

### 3. 积分购买界面
```tsx
// src/components/credits/CreditPackages.tsx
- 积分包卡片展示
- 推荐标签
- 批量折扣提示
- Stripe/Creem支付集成
```

### 4. 积分不足提示
```tsx
// src/components/credits/InsufficientCreditsModal.tsx
- 当前余额 vs 所需积分
- 升级订阅选项
- 购买积分包选项
- 计算最优方案
```

## 📧 通知系统 (Notification System)

### 邮件通知触发点
1. **积分重置通知** - 每月1日
2. **低余额警告** - 余额 < 20积分
3. **购买成功确认** - 积分包购买后
4. **大额消耗提醒** - 单次消耗 > 50积分
5. **月度使用报告** - 每月末

## 🚀 实施阶段 (Implementation Phases)

### 第一阶段：基础架构 (第1-2周)
- [x] 数据库表创建和迁移
- [ ] CreditService 基础实现
- [ ] 用户积分余额显示
- [ ] 基础积分查询API

### 第二阶段：订阅集成 (第2-3周)
- [ ] 订阅积分配置
- [ ] 月度积分分配逻辑
- [ ] Stripe webhook 更新
- [ ] 积分重置定时任务

### 第三阶段：积分购买 (第3-4周)
- [ ] 积分包管理界面
- [ ] Stripe/Creem 支付集成
- [ ] 购买流程实现
- [ ] 交易历史UI

### 第四阶段：功能集成 (第4-5周)
- [ ] 水印移除积分扣除
- [ ] 积分检查中间件
- [ ] 积分不足处理
- [ ] 批量处理优化

### 第五阶段：优化与发布 (第5-6周)
- [ ] 性能优化
- [ ] 用户迁移脚本
- [ ] A/B测试
- [ ] 文档编写
- [ ] 生产环境部署

## 🔄 迁移策略 (Migration Strategy)

### 现有用户处理
1. **免费用户** - 赠送50积分欢迎礼包
2. **Pro订阅用户** - 立即获得当月全额积分
3. **终身会员** - 额外赠送500积分奖励
4. **历史数据** - 保留最近3个月的使用记录

### 回滚计划
- 数据库备份策略
- Feature flag 控制
- 灰度发布（5% → 20% → 50% → 100%）

## 📈 成功指标 (Success Metrics)

### 业务指标
- **积分包转化率** - 目标 > 15%
- **月度积分消耗率** - 目标 > 80%
- **用户留存率提升** - 目标 +20%
- **ARPU提升** - 目标 +30%

### 技术指标
- **API响应时间** - < 100ms
- **积分计算准确率** - 100%
- **系统可用性** - > 99.9%
- **并发处理能力** - > 1000 req/s

## ⚠️ 风险管理 (Risk Management)

### 潜在风险
1. **积分通胀** - 设置合理的价格和消耗率
2. **欺诈风险** - 实施防欺诈检测
3. **系统滥用** - 速率限制和异常检测
4. **用户流失** - 提供充足的免费配额

### 缓解措施
- 实时监控和告警系统
- 自动异常检测
- 用户行为分析
- 灵活的配置系统

## 📝 技术债务考虑 (Technical Debt Considerations)

### 需要重构的部分
1. 将支付逻辑抽象为统一接口
2. 实现事件驱动架构
3. 添加缓存层提升性能
4. 实现幂等性保证

### 未来扩展
- 积分交易市场
- 积分赠送功能
- 企业级积分管理
- API积分计费

## 🔗 相关文档 (Related Documents)

- [Stripe Integration Guide](./docs/stripe-integration.md)
- [Database Migration Guide](./docs/database-migration.md)
- [API Documentation](./docs/api/credits.md)
- [User Guide](./docs/user-guide/credits.md)

---

## 下一步行动 (Next Steps)

1. **审查并批准此计划**
2. **创建数据库迁移文件**
3. **实现 CreditService 核心功能**
4. **设计积分显示UI组件**
5. **集成到水印移除功能**

---

*最后更新：2025-01-08*
*作者：Claude Code Assistant*