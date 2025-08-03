# Creem Payment Setup Guide

## Environment Variables Required

To use Creem as your payment provider, you need to set the following environment variables:

### 1. Payment Provider Selection
```bash
# Set Creem as the payment provider
NEXT_PUBLIC_PAYMENT_PROVIDER=creem
```

### 2. Creem API Credentials
```bash
# Get these from your Creem dashboard
CREEM_API_KEY=your_creem_api_key_here
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret_here
```

### 3. Creem Product/Price IDs
```bash
# Create products in Creem dashboard and get their IDs
NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY=your_monthly_product_id
NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY=your_yearly_product_id
NEXT_PUBLIC_CREEM_PRICE_LIFETIME=your_lifetime_product_id
```

## Setup Steps

1. **Create a Creem Account**
   - Go to https://creem.io and sign up
   - Access your dashboard

2. **Get API Credentials**
   - Navigate to Settings > API Keys
   - Create a new API key
   - Copy the API key and webhook secret

3. **Create Products**
   - Go to Products section
   - Create three products:
     - Pro Monthly (recurring, monthly)
     - Pro Yearly (recurring, yearly)
     - Lifetime (one-time payment)
   - Note down the product IDs

4. **Configure Webhook**
   - Go to Webhooks section
   - Add webhook endpoint: `https://your-domain.com/api/webhooks/creem`
   - Copy the webhook secret

5. **Update Environment Variables**
   - Copy all the values to your `.env.local` file
   - For production (Dokploy), add them to environment variables

## Testing

1. Visit `/api/debug-creem` to check your configuration
2. Visit `/api/debug-payment` to test the payment flow
3. Try creating a checkout session from the pricing page

## Common Issues

1. **"Failed to create checkout session"**
   - Check if all environment variables are set
   - Verify API key is correct
   - Check if products exist in Creem

2. **Price plans not showing**
   - Ensure NEXT_PUBLIC_CREEM_PRICE_* variables are set
   - Check if you're using the correct payment provider

3. **Webhook not working**
   - Verify webhook secret matches
   - Check webhook URL is accessible
   - Look at webhook logs in Creem dashboard