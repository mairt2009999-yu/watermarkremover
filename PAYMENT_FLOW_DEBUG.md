# Payment Flow Debug Guide

## Complete Payment Flow

### 1. Price Plan Loading Flow

```
User visits page → Component renders → usePayment hook → payment-store.fetchPayment()
                                                              ↓
                                                   getUserPricePlansAction() [SERVER]
                                                              ↓
                                                   getServerPricePlans() with ENV vars
                                                              ↓
                                                   Returns plans with correct price IDs
```

### 2. Checkout Flow

```
User clicks "Get Started" → CheckoutButton → createCheckoutAction [SERVER]
                                                    ↓
                                          Validate user & plan
                                                    ↓
                                          createCheckout() → CreemProvider
                                                    ↓
                                          Creem API call with product_id
                                                    ↓
                                          Return checkout URL
```

## Current Issues & Solutions

### Issue 1: Price Plans Not Showing (已修复)
**原因**: 客户端无法在运行时获取环境变量
**解决**: 
- 创建了 `getUserPricePlansAction` 服务器action
- 修改 `payment-store` 使用服务器action获取价格计划

### Issue 2: Creem 403 Forbidden Error
**原因**: 使用测试API密钥 (`creem_test_*`)
**解决**: 
- 自动检测API密钥类型
- 测试密钥使用测试API URL: `https://test-api.creem.io/v1`
- 生产密钥使用生产API URL: `https://api.creem.io/v1`

## Debug Endpoints

1. **Check Configuration**: `/api/debug-creem`
   - Shows payment provider config
   - Verifies price IDs
   - Checks API key status

2. **Test Payment Flow**: `/api/test-payment-flow`
   - Shows user status
   - Displays loaded price plans
   - Verifies subscription status

3. **Runtime Config**: `/api/runtime-config`
   - Shows current payment provider
   - Displays all price IDs

## Environment Variables Check

```bash
# Required for Creem
NEXT_PUBLIC_PAYMENT_PROVIDER=creem
CREEM_API_KEY=creem_test_xxx  # Test key starts with creem_test_
CREEM_WEBHOOK_SECRET=whsec_xxx

# Price IDs (must match Creem products)
NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY=prod_xxx
NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY=prod_xxx
NEXT_PUBLIC_CREEM_PRICE_LIFETIME=prod_xxx
```

## Common Error Messages

### "Failed to create checkout session"
- Check if API key is set
- Verify API key permissions
- Check product IDs exist in Creem

### "403 Forbidden"
- Using test key? Must use test API URL
- Check if domain is allowed in Creem dashboard
- Verify API key is active

### "Plan not found"
- Check if price IDs are correctly set
- Verify getUserPricePlansAction is working
- Check server logs for errors

## Testing Steps

1. **Clear browser cache and cookies**
2. **Check debug endpoints**:
   ```
   curl https://cursoremail.shop/api/debug-creem
   curl https://cursoremail.shop/api/test-payment-flow
   ```
3. **Test checkout**:
   - Login to the site
   - Go to pricing page
   - Click on a plan
   - Check browser console for errors
4. **Check server logs** in Dokploy

## Creem Test Mode

When using test API keys:
- Use test product IDs
- Payments won't be real
- Use test credit cards
- Webhooks will be test events

## Next Steps

1. **For Production**:
   - Get production API key from Creem
   - Create production products
   - Update environment variables
   - Configure webhook URL in Creem

2. **For Testing**:
   - Ensure using test API URL
   - Use test product IDs
   - Enable debug logging