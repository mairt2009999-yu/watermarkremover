# 积分系统 V2 部署指南
# Credit System V2 Deployment Guide

## 🚀 部署步骤 (Deployment Steps)

### Phase 1: 开发环境测试 (Development Testing)

#### 1. 环境变量配置
```env
# .env.local
NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v1  # 先保持v1测试兼容性
NEXT_PUBLIC_ENABLE_CREDIT_PURCHASES=true
CRON_SECRET=your-cron-secret-here
ADMIN_API_KEY=your-admin-key-here
```

#### 2. 测试V1兼容性
```bash
# 启动开发服务器
pnpm dev

# 测试清单
- [ ] 用户登录正常
- [ ] 积分余额显示正确
- [ ] 积分购买功能正常 (V1)
- [ ] 水印移除扣除积分正常
```

#### 3. 切换到V2测试
```env
# 更新 .env.local
NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v2
NEXT_PUBLIC_ENABLE_CREDIT_PURCHASES=false
```

```bash
# 重启开发服务器
pnpm dev

# 测试清单
- [ ] 积分余额显示 (无购买选项)
- [ ] 不足提示只显示升级选项
- [ ] 定价页面显示包含积分
- [ ] 模拟订阅创建分配积分
```

### Phase 2: 数据库迁移 (Database Migration)

#### 1. 备份生产数据库
```bash
# 创建备份
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 验证备份
pg_restore --list backup_*.sql | wc -l
```

#### 2. 在测试数据库运行迁移
```bash
# 创建测试数据库
createdb watermark_test
pg_dump $DATABASE_URL | psql watermark_test

# 运行迁移
DATABASE_URL=postgresql://...watermark_test \
  psql -f src/db/migrations/0003_simplify_credit_system.sql

# 验证迁移
DATABASE_URL=postgresql://...watermark_test \
  psql -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('credit_packages', 'credit_purchases');"
# 应返回0行
```

#### 3. 测试回滚
```bash
# 在测试数据库运行回滚
DATABASE_URL=postgresql://...watermark_test \
  psql -f src/db/migrations/0003_rollback_credit_system.sql

# 验证回滚
DATABASE_URL=postgresql://...watermark_test \
  psql -c "SELECT * FROM verify_rollback();"
```

### Phase 3: 预生产部署 (Staging Deployment)

#### 1. 部署到Staging
```bash
# 设置staging环境变量
vercel env add NEXT_PUBLIC_CREDIT_SYSTEM_VERSION v1 --environment=preview

# 部署
vercel --environment=preview

# 测试V1工作正常
```

#### 2. 在Staging切换到V2
```bash
# 更新环境变量
vercel env add NEXT_PUBLIC_CREDIT_SYSTEM_VERSION v2 --environment=preview

# 重新部署
vercel --environment=preview --force
```

#### 3. Staging完整测试
- [ ] 新用户注册流程
- [ ] 订阅购买流程
- [ ] 积分分配验证
- [ ] 升级/降级测试
- [ ] 取消订阅测试
- [ ] Webhook处理验证

### Phase 4: 生产部署 (Production Deployment)

#### 1. 部署准备
```bash
# 创建git标签
git tag -a v2.0.0-credit-system -m "Credit System V2 - Subscription Only"
git push origin v2.0.0-credit-system

# 最终备份
pg_dump $DATABASE_URL > final_backup_before_v2.sql
aws s3 cp final_backup_before_v2.sql s3://backups/
```

#### 2. 设置Feature Flag (生产环境仍使用V1)
```bash
# 生产环境保持V1
vercel env add NEXT_PUBLIC_CREDIT_SYSTEM_VERSION v1 --environment=production

# 部署代码 (包含V2但未激活)
vercel --prod
```

#### 3. 数据库迁移 (维护窗口)
```bash
# 1. 启用维护模式
vercel env add NEXT_PUBLIC_MAINTENANCE_MODE true --environment=production
vercel --prod --force

# 2. 运行迁移
psql $DATABASE_URL < src/db/migrations/0003_simplify_credit_system.sql

# 3. 验证迁移
psql $DATABASE_URL -c "SELECT COUNT(*) FROM user_credits;"
```

#### 4. 激活V2系统
```bash
# 切换到V2
vercel env add NEXT_PUBLIC_CREDIT_SYSTEM_VERSION v2 --environment=production

# 关闭维护模式
vercel env add NEXT_PUBLIC_MAINTENANCE_MODE false --environment=production

# 部署
vercel --prod --force
```

### Phase 5: 验证和监控 (Verification & Monitoring)

#### 1. 立即验证 (T+0)
```bash
# 检查应用健康
curl https://watermarkremover.io/api/health

# 检查积分系统
curl https://watermarkremover.io/api/credits/status

# 查看错误日志
vercel logs --prod --since 10m
```

#### 2. 监控指标 (T+30分钟)
- [ ] 错误率 < 0.1%
- [ ] API响应时间 < 100ms
- [ ] 成功登录率 > 99%
- [ ] 积分扣除成功率 > 99.9%

#### 3. 业务指标 (T+24小时)
- [ ] 转化率对比
- [ ] 用户活跃度
- [ ] 支持工单数量
- [ ] 收入影响

## 🔄 Cron Job 配置

### Vercel Cron配置
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

### 手动触发 (测试用)
```bash
# 使用管理员密钥手动触发
curl -X POST https://watermarkremover.io/api/cron/reset-credits \
  -H "x-admin-key: $ADMIN_API_KEY"
```

## 🚨 紧急回滚程序

### 快速回滚 (如果出现严重问题)
```bash
# 1. 立即切回V1 (不需要数据库更改)
vercel env add NEXT_PUBLIC_CREDIT_SYSTEM_VERSION v1 --environment=production
vercel --prod --force

# 2. 如果需要数据库回滚
psql $DATABASE_URL < src/db/migrations/0003_rollback_credit_system.sql

# 3. 验证系统恢复
curl https://watermarkremover.io/api/health
```

## 📊 监控仪表板

### 关键指标查询
```sql
-- 检查积分余额分布
SELECT 
  CASE 
    WHEN balance = 0 THEN '0'
    WHEN balance <= 10 THEN '1-10'
    WHEN balance <= 50 THEN '11-50'
    WHEN balance <= 100 THEN '51-100'
    ELSE '100+'
  END as range,
  COUNT(*) as users
FROM user_credits
GROUP BY range
ORDER BY range;

-- 检查今日积分使用
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  SUM(ABS(amount)) as credits_used
FROM credit_transactions
WHERE type = 'spent' 
  AND created_at > CURRENT_DATE
GROUP BY hour
ORDER BY hour;

-- 检查订阅分布
SELECT 
  plan_id,
  COUNT(*) as subscribers
FROM (
  SELECT 
    CASE 
      WHEN price_id = '${STRIPE_PRICE_PRO_MONTHLY}' THEN 'pro_monthly'
      WHEN price_id = '${STRIPE_PRICE_PRO_YEARLY}' THEN 'pro_yearly'
      WHEN price_id = '${STRIPE_PRICE_LIFETIME}' THEN 'lifetime'
      ELSE 'unknown'
    END as plan_id
  FROM payment
  WHERE status = 'active'
) as plans
GROUP BY plan_id;
```

## ✅ 部署后检查清单

### 立即检查 (部署后30分钟内)
- [ ] 网站可访问
- [ ] 用户可以登录
- [ ] 积分余额显示正确
- [ ] 水印移除功能正常
- [ ] 订阅购买流程正常
- [ ] Webhook接收正常

### 第一天检查
- [ ] 积分重置定时任务配置
- [ ] 新用户注册获得积分
- [ ] 订阅升级积分调整
- [ ] 取消订阅处理正确
- [ ] 错误日志清洁
- [ ] 性能指标正常

### 第一周检查
- [ ] 月度重置准备就绪
- [ ] 用户满意度维持
- [ ] 转化率提升
- [ ] 支持工单减少
- [ ] 收入增长符合预期

## 📝 注意事项

1. **不要在高峰期部署** - 选择用户活跃度最低的时间
2. **保持V1代码** - 确保可以快速回滚
3. **监控Stripe Webhooks** - 确保支付处理正常
4. **准备客服响应** - 提前准备FAQ和响应模板
5. **记录所有更改** - 为事后分析做准备

## 🆘 支持联系

- 技术支持: tech@watermarkremover.io
- 紧急热线: +86-xxx-xxxx
- Slack频道: #credit-system-migration

---

**部署负责人签字**: ________________  
**部署日期**: ________________  
**部署结果**: [ ] 成功 [ ] 部分成功 [ ] 失败 [ ] 回滚