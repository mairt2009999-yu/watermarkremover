# 积分系统 V2 测试清单
# Credit System V2 Testing Checklist

## 📋 测试前准备 (Pre-Testing Setup)

### 1. 环境配置
```bash
# 确保 .env.local 包含以下配置
NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v1  # 先测试V1兼容性
NEXT_PUBLIC_ENABLE_CREDIT_PURCHASES=true
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CRON_SECRET=your-cron-secret
ADMIN_API_KEY=your-admin-key
```

### 2. 数据库备份
```bash
# 创建测试前备份
pg_dump $DATABASE_URL > backup_before_testing_$(date +%Y%m%d_%H%M%S).sql
```

---

## ✅ Phase 1: V1 系统测试 (确保现有系统正常)

### 基础功能测试
- [ ] **用户登录**
  - 可以正常登录
  - Session 正确创建
  - 用户信息正确显示

- [ ] **积分显示**
  - 积分余额正确显示
  - 积分历史记录可查看
  - 积分使用记录准确

- [ ] **积分购买 (V1特有)**
  - 可以看到积分包列表
  - 可以购买积分包
  - 购买后余额更新正确

- [ ] **积分使用**
  - 水印移除扣除积分正常
  - 余额不足时正确提示
  - 交易记录正确生成

---

## ✅ Phase 2: V2 系统测试 (新系统功能)

### 1. 切换到V2模式
```bash
# 更新环境变量
NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v2
NEXT_PUBLIC_ENABLE_CREDIT_PURCHASES=false

# 重启开发服务器
pnpm dev
```

### 2. UI变化验证
- [ ] **积分购买入口**
  - 积分购买按钮不再显示
  - 购买积分包页面不可访问
  - 余额不足时只显示升级选项

- [ ] **定价页面**
  - 每个订阅计划显示包含积分数
  - Free: 5 积分/月
  - Pro Monthly: 100 积分/月
  - Pro Yearly: 150 积分/月
  - Lifetime: 500 积分/月

### 3. 订阅功能测试

#### 新用户注册
- [ ] 注册新用户账号
- [ ] 自动获得 5 个免费积分
- [ ] 积分余额正确显示

#### 订阅购买流程
- [ ] **购买 Pro Monthly**
  - Stripe Checkout 正常打开
  - 支付成功后返回
  - 积分自动分配 (100积分)
  - 订阅状态正确

- [ ] **购买 Pro Yearly**
  - 支付流程正常
  - 积分分配正确 (150积分)
  - 年付标识正确

- [ ] **购买 Lifetime**
  - 一次性支付正常
  - 积分分配正确 (500积分)
  - 永久会员标识正确

### 4. 订阅管理测试

#### 升级测试
- [ ] **Free → Pro Monthly**
  - 升级流程正常
  - 积分从 5 → 100
  - 原有积分保留

- [ ] **Pro Monthly → Pro Yearly**
  - 升级流程正常
  - 积分调整为 150
  - 计费周期正确

#### 降级测试
- [ ] **Pro Yearly → Pro Monthly**
  - 降级在周期结束后生效
  - 积分在下个周期调整
  - 用户收到通知

#### 取消测试
- [ ] **取消订阅**
  - 可以成功取消
  - 积分保留到周期结束
  - 周期结束后积分归零

### 5. Webhook 测试

使用 Stripe CLI 测试 webhooks:
```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhooks 到本地
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 在另一个终端触发测试事件
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger checkout.session.completed
```

验证每个事件:
- [ ] subscription.created - 积分正确分配
- [ ] subscription.updated - 积分正确调整
- [ ] subscription.deleted - 积分正确处理
- [ ] checkout.session.completed - 一次性支付积分分配

### 6. Cron Job 测试

#### 手动触发月度重置
```bash
# 使用管理员密钥
curl -X POST http://localhost:3000/api/cron/reset-credits \
  -H "x-admin-key: your-admin-key"
```

验证:
- [ ] 所有活跃订阅用户积分重置
- [ ] 积分数量符合订阅计划
- [ ] 重置记录正确生成
- [ ] 错误用户被记录

### 7. API 端点测试

#### 积分状态端点
```bash
curl http://localhost:3000/api/credits/status
```

验证响应:
- [ ] 系统版本正确 (v2)
- [ ] 功能标识正确
- [ ] 用户余额正确（如已登录）

---

## ✅ Phase 3: 数据迁移测试

### 1. 在测试数据库运行迁移
```bash
# 创建测试数据库副本
createdb watermark_test
pg_dump $DATABASE_URL | psql watermark_test

# 运行迁移脚本
./scripts/run-credit-migration.sh
```

### 2. 验证迁移结果
- [ ] credit_packages 表已删除
- [ ] credit_purchases 表已删除
- [ ] user_credits.purchased_credits 列已删除
- [ ] subscription_credit_config 更新正确
- [ ] 用户积分余额调整正确

### 3. 测试回滚
```bash
# 运行回滚脚本
psql watermark_test < src/db/migrations/0003_rollback_credit_system.sql
```

验证:
- [ ] 表结构恢复
- [ ] 数据完整性保持
- [ ] 系统可以切回V1

---

## ✅ Phase 4: 性能测试

### 负载测试
- [ ] 100个并发用户积分查询
- [ ] 50个并发积分扣除操作
- [ ] 响应时间 < 100ms
- [ ] 无数据库锁问题

### 压力测试
- [ ] 月度重置 1000+ 用户
- [ ] 批量订阅创建
- [ ] Webhook 批量处理
- [ ] 系统保持稳定

---

## ✅ Phase 5: 边界情况测试

### 异常场景
- [ ] 积分余额为0时的操作
- [ ] 负数积分处理
- [ ] 并发扣除积分
- [ ] 网络中断恢复
- [ ] 数据库连接失败

### 错误处理
- [ ] Webhook 签名验证失败
- [ ] Stripe API 调用失败
- [ ] 积分分配失败但订阅成功
- [ ] Cron job 部分失败

---

## 📊 测试报告模板

### 测试环境
- **日期**: ___________
- **测试人员**: ___________
- **环境**: Development / Staging / Production
- **数据库**: PostgreSQL 版本 _____
- **Node.js**: 版本 _____

### 测试结果汇总
| 测试阶段 | 通过项 | 失败项 | 通过率 |
|---------|--------|--------|--------|
| V1兼容性 | ___ | ___ | ___% |
| V2功能  | ___ | ___ | ___% |
| 数据迁移 | ___ | ___ | ___% |
| 性能测试 | ___ | ___ | ___% |
| 边界测试 | ___ | ___ | ___% |

### 发现的问题
1. **问题描述**: 
   - **严重程度**: 高/中/低
   - **复现步骤**: 
   - **解决方案**: 

### 测试结论
- [ ] **通过** - 可以部署到生产环境
- [ ] **条件通过** - 修复以下问题后可部署: _____
- [ ] **未通过** - 需要重新测试

### 签字确认
- **测试负责人**: _________ 日期: _________
- **技术负责人**: _________ 日期: _________
- **项目负责人**: _________ 日期: _________

---

## 🚀 部署前最终检查

### 代码准备
- [ ] 所有测试通过
- [ ] 代码已提交到版本控制
- [ ] 创建了发布标签
- [ ] 更新了 CHANGELOG

### 环境准备
- [ ] 生产数据库已备份
- [ ] 环境变量已配置
- [ ] 监控告警已设置
- [ ] 回滚方案已准备

### 团队准备
- [ ] 运维团队已通知
- [ ] 客服团队已培训
- [ ] 用户通知已准备
- [ ] 应急响应计划就绪

---

## 📞 紧急联系

- **技术支持**: tech@watermarkremover.io
- **数据库管理员**: dba@watermarkremover.io
- **产品经理**: pm@watermarkremover.io
- **值班电话**: +86-xxx-xxxx

---

**注意**: 本测试清单是部署积分系统V2的关键文档，请确保每个步骤都认真执行并记录结果。