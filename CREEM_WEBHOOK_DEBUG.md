# Creem Webhook 调试指南

## 当前状态
- ✅ 测试webhook可以成功创建payment记录
- ❌ 真实的Creem webhook还未成功创建记录
- ✅ 用户查找逻辑已优化（支持customerId和email查找）

## 好消息！
测试webhook已经可以成功创建payment记录了！现在需要让真实的Creem webhook也能正常工作。

## 调试步骤

### 1. 使用原始webhook端点捕获数据

在Creem后台**临时**添加一个新的webhook端点：
```
https://cursoremail.shop/api/webhooks/creem-raw
```

这个端点会：
- 记录所有header信息（找到签名header名称）
- 记录原始请求体（了解数据结构）
- 尝试处理webhook（跳过签名验证）
- 显示处理后的payment记录

### 2. 检查现有payment数据

```bash
# 查看特定用户的支付状态
curl https://cursoremail.shop/api/debug-payment-state?email=zhuazi2009999@gmail.com
```

### 3. 测试webhook处理（已确认工作）

```bash
# 模拟webhook事件
curl -X POST https://cursoremail.shop/api/test-creem-webhook \
  -H "Content-Type: application/json" \
  -d '{"customerEmail": "zhuazi2009999@gmail.com"}'
```

### 4. 手动创建支付记录（紧急备用）

如果webhook暂时无法工作，可以手动创建支付记录：

```bash
# 为用户创建月度订阅
curl -X POST https://cursoremail.shop/api/manual-payment-create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhuazi2009999@gmail.com",
    "planType": "pro_monthly",
    "status": "active"
  }'
```

### 5. 查看Dokploy日志

在Dokploy中查看应用日志，特别关注：
- "=== CREEM RAW WEBHOOK DATA ===" 部分
- Headers中的签名字段名
- Parsed Body的数据结构

## 可能的问题和解决方案

### 问题1: Webhook URL配置错误
**检查**: Creem后台的webhook URL是否正确
**解决**: 确保URL是 `https://cursoremail.shop/api/webhooks/creem`

### 问题2: 签名验证失败
**检查**: 日志中的signature header名称
**解决**: 
1. 从creem-raw端点的日志中找到正确的header名称
2. 更新webhook route中的signature获取逻辑

### 问题3: 数据格式不匹配
**检查**: Creem发送的实际数据结构
**解决**: 根据creem-raw端点记录的数据更新解析逻辑

### 问题4: 用户关联失败
**检查**: webhook中是否包含正确的用户标识
**解决**: 
1. 确保checkout时传递了正确的metadata
2. 检查用户是否有customerId

## 修复checklist

- [ ] 部署包含creem-raw端点的新版本
- [ ] 在Creem后台添加creem-raw webhook
- [ ] 触发一次真实支付
- [ ] 查看Dokploy日志中的原始数据
- [ ] 根据日志更新签名验证和数据解析
- [ ] 切换回正式的webhook端点

## 环境变量检查

确保以下环境变量正确设置：
- `CREEM_API_KEY` - Creem API密钥
- `CREEM_WEBHOOK_SECRET` - Webhook签名密钥
- `NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY` - 月度价格ID
- `NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY` - 年度价格ID
- `NEXT_PUBLIC_CREEM_PRICE_LIFETIME` - 终身价格ID

## 代码位置

- Webhook处理: `/src/app/api/webhooks/creem/route.ts`
- Creem Provider: `/src/payment/provider/creem.ts`
- 调试端点:
  - `/src/app/api/webhooks/creem-raw/route.ts` (新)
  - `/src/app/api/test-creem-webhook/route.ts`
  - `/src/app/api/debug-payment-state/route.ts`
  - `/src/app/api/test-complete-payment-flow/route.ts`