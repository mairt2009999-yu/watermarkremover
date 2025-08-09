# 迁移前检查清单 - 积分系统
# Pre-Migration Checklist - Credit System

## ✅ 迁移前必做事项 (Pre-Migration Requirements)

### 1. 🔐 备份和安全 (Backup & Security)

#### 数据库备份
- [ ] 创建完整数据库备份
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S)_pre_migration.sql
```

- [ ] 验证备份完整性
```bash
pg_restore --list backup_*.sql | head -20
```

- [ ] 备份存储到安全位置 (S3/云存储)
```bash
aws s3 cp backup_*.sql s3://backups/credit-migration/
```

#### 代码备份
- [ ] 创建Git标签
```bash
git tag -a pre-credit-migration-v1 -m "Before credit system simplification"
git push origin pre-credit-migration-v1
```

- [ ] 创建代码分支
```bash
git checkout -b backup/pre-credit-migration
git push origin backup/pre-credit-migration
```

### 2. 📊 数据验证 (Data Validation)

#### 当前系统数据统计
- [ ] 记录用户积分统计
```sql
-- 运行并保存结果
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  SUM(balance) as total_balance,
  SUM(purchased_credits) as total_purchased,
  AVG(balance) as avg_balance,
  MAX(balance) as max_balance
FROM user_credits;
```

- [ ] 记录交易统计
```sql
-- 运行并保存结果
SELECT 
  type,
  COUNT(*) as count,
  SUM(ABS(amount)) as total_amount
FROM credit_transactions
GROUP BY type;
```

- [ ] 导出关键用户数据
```sql
-- 导出高价值用户数据
COPY (
  SELECT * FROM user_credits 
  WHERE balance > 1000 OR purchased_credits > 0
) TO '/tmp/vip_users_backup.csv' CSV HEADER;
```

### 3. 🧪 测试准备 (Testing Preparation)

#### 测试环境
- [ ] 创建测试数据库副本
```bash
createdb test_credit_migration
pg_dump $DATABASE_URL | psql test_credit_migration
```

- [ ] 在测试环境运行迁移
```bash
DATABASE_URL=postgresql://test_credit_migration \
  psql -f src/db/migrations/0003_simplify_credit_system.sql
```

- [ ] 验证测试迁移成功
```sql
-- 检查表是否正确删除/修改
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('credit_packages', 'credit_purchases');
```

- [ ] 在测试环境运行回滚
```bash
DATABASE_URL=postgresql://test_credit_migration \
  psql -f src/db/migrations/0003_rollback_credit_system.sql
```

### 4. 📱 应用准备 (Application Preparation)

#### 代码准备
- [ ] 确保两个版本的服务都存在
  - `credit.service.ts` (原版)
  - `credit.service.simplified.ts` (新版)

- [ ] 实现Feature Flag
```typescript
// 确保此代码已部署
const creditService = process.env.CREDIT_SYSTEM_VERSION === 'v2' 
  ? simplifiedService 
  : originalService;
```

- [ ] 准备环境变量
```env
# 准备但不启用
CREDIT_SYSTEM_VERSION=v1  # 迁移时改为v2
ENABLE_ROLLBACK=true
```

### 5. 📢 通知准备 (Communication Preparation)

#### 内部通知
- [ ] 通知技术团队迁移时间
- [ ] 通知客服团队可能的问题
- [ ] 准备紧急联系人列表

#### 用户通知
- [ ] 准备维护通知邮件模板
- [ ] 准备社交媒体公告
- [ ] 更新状态页面

### 6. 🔍 监控设置 (Monitoring Setup)

#### 关键指标监控
- [ ] 设置数据库性能监控
- [ ] 设置错误率告警
- [ ] 设置交易失败告警
- [ ] 设置用户投诉监控

#### 仪表板准备
- [ ] 创建迁移监控仪表板
- [ ] 设置实时指标显示
- [ ] 配置告警通知渠道

## 🚀 迁移执行清单 (Migration Execution Checklist)

### Phase 1: 准备阶段 (T-1小时)
- [ ] 确认所有备份完成
- [ ] 确认测试环境验证通过
- [ ] 确认团队就位
- [ ] 发布维护通知

### Phase 2: 执行阶段 (T+0)
- [ ] 启用只读模式
```sql
ALTER DATABASE watermark_remover SET default_transaction_read_only = true;
```

- [ ] 执行迁移脚本
```bash
psql $DATABASE_URL < src/db/migrations/0003_simplify_credit_system.sql
```

- [ ] 验证迁移结果
```sql
-- 验证表删除
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name IN ('credit_packages', 'credit_purchases');
-- 结果应该为0
```

- [ ] 切换应用版本
```bash
# 更新环境变量
export CREDIT_SYSTEM_VERSION=v2
# 重启应用
pm2 restart watermark-remover
```

- [ ] 禁用只读模式
```sql
ALTER DATABASE watermark_remover SET default_transaction_read_only = false;
```

### Phase 3: 验证阶段 (T+30分钟)
- [ ] 功能测试
  - [ ] 用户登录正常
  - [ ] 积分显示正确
  - [ ] 积分扣除正常
  - [ ] 订阅升级正常

- [ ] 性能验证
  - [ ] API响应时间 <100ms
  - [ ] 数据库查询时间 <50ms
  - [ ] 错误率 <0.1%

- [ ] 数据验证
```sql
-- 验证用户积分总数
SELECT SUM(balance) as total_balance FROM user_credits;
-- 应该与迁移前相近
```

### Phase 4: 监控阶段 (T+2小时)
- [ ] 监控错误日志
- [ ] 检查用户反馈
- [ ] 跟踪关键指标
- [ ] 准备回滚（如需要）

## 🚨 回滚触发条件 (Rollback Triggers)

立即回滚如果出现：
- [ ] 积分余额大量错误 (>10个用户)
- [ ] 支付处理完全失败
- [ ] 核心功能无法使用
- [ ] 数据库连接异常
- [ ] 错误率 >5%

## 📋 迁移后验证 (Post-Migration Verification)

### 24小时后检查
- [ ] 用户投诉率
- [ ] 转化率变化
- [ ] 系统性能指标
- [ ] 积分使用模式

### 一周后评估
- [ ] 业务指标达成情况
- [ ] 用户满意度调查
- [ ] 系统稳定性报告
- [ ] 决定是否保留新系统

## 📞 紧急联系人 (Emergency Contacts)

| 角色 | 姓名 | 电话 | 职责 |
|------|------|------|------|
| DBA | - | - | 数据库操作 |
| 后端Lead | - | - | 应用切换 |
| DevOps | - | - | 部署和监控 |
| 产品经理 | - | - | 业务决策 |
| CTO | - | - | 最终决策 |

## 📝 文档和资源 (Documentation & Resources)

- 迁移计划: `SUBSCRIPTION_CREDIT_SYSTEM_V2.md`
- 回滚计划: `DATABASE_ROLLBACK_PLAN.md`
- 迁移SQL: `src/db/migrations/0003_simplify_credit_system.sql`
- 回滚SQL: `src/db/migrations/0003_rollback_credit_system.sql`
- 紧急回滚脚本: `scripts/emergency-rollback.sh`

## ⚡ 快速命令参考 (Quick Commands)

```bash
# 备份
pg_dump $DATABASE_URL > backup.sql

# 迁移
psql $DATABASE_URL < migrations/0003_simplify_credit_system.sql

# 回滚
./scripts/emergency-rollback.sh --confirm

# 验证
psql $DATABASE_URL -c "SELECT * FROM verify_rollback();"

# 监控
tail -f logs/application.log | grep ERROR
```

---

**重要提醒**：
1. 在生产环境执行前，必须在测试环境完整演练
2. 确保至少2名团队成员在场
3. 保持与客服团队的实时沟通
4. 准备好随时回滚

*最后更新: 2025-01-08*  
*负责人签字: ________________*