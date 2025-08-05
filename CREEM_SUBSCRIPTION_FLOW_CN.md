# Creem 订阅流程图

## 概述
本文档展示了 WATERMARKREMOVERTOOLS 应用程序中 Creem 订阅处理的完整数据流程。

## 时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 定价页面<br/>(CheckoutButton)
    participant SA as 服务器操作<br/>(createCheckoutAction)
    participant PP as 支付提供商<br/>(CreemProvider)
    participant CA as Creem API
    participant CP as Creem 支付<br/>页面
    participant WH as Webhook 路由<br/>(/api/webhooks/creem)
    participant DB as PostgreSQL<br/>数据库
    participant N as 通知<br/>服务

    %% 用户发起结账
    User->>UI: 点击"订阅"按钮
    Note over UI: CheckoutButton 组件<br/>收集元数据：<br/>- userId<br/>- planId<br/>- priceId<br/>- 推广数据
    
    UI->>SA: createCheckoutAction({<br/>userId, planId, priceId,<br/>metadata})
    
    %% 服务器端验证
    Note over SA: 1. 验证用户会话<br/>2. 检查授权<br/>3. 验证套餐是否存在<br/>4. 添加用户元数据
    
    SA->>PP: createCheckout({<br/>planId, priceId,<br/>customerEmail,<br/>metadata, urls})
    
    %% 创建 Creem 结账
    Note over PP: 1. 获取/创建 customerId<br/>2. 更新用户记录<br/>3. 准备结账请求体
    
    PP->>DB: 更新 user.customerId
    DB-->>PP: 成功
    
    PP->>CA: POST /checkouts<br/>{product_id, customer,<br/>metadata, success_url}
    CA-->>PP: {checkout_url,<br/>request_id}
    
    PP-->>SA: {url, id}
    SA-->>UI: {success: true,<br/>data: {url, id}}
    
    %% 用户完成支付
    UI->>User: 重定向到 Creem
    User->>CP: 完成支付
    CP->>User: 支付成功
    CP->>User: 重定向到 success_url
    
    %% Webhook 处理
    CP->>WH: POST webhook<br/>{type: "checkout.completed",<br/>data: {...}}
    
    Note over WH: 1. 提取签名<br/>2. 验证载荷<br/>3. 转发给处理器
    
    WH->>PP: handleWebhookEvent(<br/>payload, signature)
    
    Note over PP: 1. 验证签名<br/>2. 解析事件类型<br/>3. 路由到处理器
    
    alt checkout.completed 事件
        PP->>PP: onCreateSubscription(event)
        Note over PP: 提取数据：<br/>- customerEmail<br/>- customerId<br/>- priceId<br/>- subscriptionId
        
        PP->>DB: 通过 customerId<br/>或 email 查找 userId
        DB-->>PP: userId
        
        PP->>DB: INSERT payment 记录<br/>{id, priceId, type,<br/>userId, customerId,<br/>subscriptionId, status,<br/>interval, dates}
        DB-->>PP: 成功
        
        PP->>N: sendNotification(<br/>userId, amount)
        N-->>PP: 成功
    else subscription.updated 事件
        PP->>PP: onUpdateSubscription(event)
        PP->>DB: UPDATE payment<br/>SET status, dates
        DB-->>PP: 成功
    else subscription.cancelled 事件
        PP->>PP: onDeleteSubscription(event)
        PP->>DB: UPDATE payment<br/>SET status='canceled'
        DB-->>PP: 成功
    end
    
    WH-->>CP: 200 OK {received: true}
```

## 数据流详情

### 1. 结账发起
- **组件**：`CheckoutButton`（客户端）
- **收集的数据**：
  - `userId`：当前用户 ID
  - `planId`：选择的套餐（free、pro、lifetime）
  - `priceId`：来自环境变量的特定价格 ID
  - `metadata`：附加数据（推广链接等）

### 2. 服务器操作处理
- **操作**：`createCheckoutAction`
- **验证**：
  - 用户身份验证检查
  - 授权（用户只能为自己结账）
  - 套餐存在性验证
- **数据增强**：
  - 将 `userId` 和 `userName` 添加到元数据
  - 如果启用，添加分析跟踪 ID
  - 生成本地化的成功/取消 URL

### 3. 支付提供商（CreemProvider）
- **结账创建**：
  - 创建/获取客户 ID（格式：`creem_{email}`）
  - 使用 `customerId` 更新用户记录
  - 准备带有元数据的 Creem API 请求
- **API 配置**：
  - 测试 API：`https://test-api.creem.io/v1`（用于测试密钥）
  - 生产 API：`https://api.creem.io/v1`
  - 认证：同时使用 `x-api-key` 和 `Authorization: Bearer` 头

### 4. Webhook 处理
- **端点**：`/api/webhooks/creem/route.ts`
- **签名验证**：
  - 检查多种头格式以获取签名
  - 使用 HMAC-SHA256 和 webhook 密钥进行验证
  - 支持多种签名格式（hex、base64、带前缀）
- **处理的事件类型**：
  - `checkout.completed`、`subscription.active`、`subscription.created`
  - `subscription.paid`、`subscription.updated`
  - `subscription.cancelled`、`subscription.deleted`
  - `payment.completed`（一次性付款）

### 5. 数据库架构
```sql
-- 用户表
user {
  id: text (主键)
  email: text (唯一)
  customerId: text
  ...
}

-- 支付表
payment {
  id: text (主键)
  priceId: text
  type: text (subscription/one_time)
  interval: text (month/year)
  userId: text (外键)
  customerId: text
  subscriptionId: text
  status: text
  periodStart: timestamp
  periodEnd: timestamp
  cancelAtPeriodEnd: boolean
  trialStart: timestamp
  trialEnd: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 6. 状态映射
- Creem 状态映射到内部支付状态：
  - `active` → `active`
  - `cancelled`/`canceled` → `canceled`
  - `incomplete` → `incomplete`
  - `expired` → `incomplete_expired`
  - `past_due` → `past_due`
  - `trialing`/`trial` → `trialing`
  - `completed` → `completed`

### 7. 错误处理
- API 错误记录完整上下文
- Webhook 处理即使签名验证失败也会继续（用于调试）
- 用户查找尝试多种方法（customerId，然后 email）
- 查找失败会触发 customerId 更新以供将来尝试

## 关键配置

### 环境变量
```bash
# 支付提供商
NEXT_PUBLIC_PAYMENT_PROVIDER=creem

# Creem API 配置
CREEM_API_KEY=creem_test_xxx...  # 或 creem_live_xxx...
CREEM_WEBHOOK_SECRET=whsec_xxx...

# 价格 ID
NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY=price_xxx
NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY=price_yyy
NEXT_PUBLIC_CREEM_PRICE_LIFETIME=price_zzz
```

### 测试模式
- 测试密钥以 `creem_test_` 开头
- 自动使用测试 API 端点
- 可通过 `/api/test-creem-webhook` 模拟测试 webhook 事件

## 安全考虑

1. **身份验证**：所有结账会话都需要经过身份验证的用户
2. **授权**：用户只能为自己创建结账
3. **Webhook 验证**：签名验证防止重放攻击
4. **数据完整性**：用户 ID 存储在元数据中并在 webhook 时验证
5. **客户跟踪**：用户识别的多种回退方法