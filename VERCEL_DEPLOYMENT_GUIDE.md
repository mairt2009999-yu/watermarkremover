# Vercel Deployment Guide

This guide helps you resolve common issues when deploying to Vercel.

## Issue 1: Prisma Client Error

Even though this project uses Drizzle ORM, you might see Prisma errors on Vercel. This is because some dependencies have Prisma as an optional peer dependency.

### Solution:
The postinstall script has been configured to handle this automatically.

## Issue 2: Google OAuth Not Working on Vercel

### Steps to fix:

1. **Update Google OAuth Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Select your OAuth 2.0 Client ID
   - Add these Authorized redirect URIs:
     ```
     https://bulkimageseo.com/api/auth/callback/google
     https://your-project.vercel.app/api/auth/callback/google
     ```

2. **Set Environment Variables on Vercel**
   
   Go to your Vercel project settings > Environment Variables and add:

   ```bash
   # Core Configuration
   NEXT_PUBLIC_BASE_URL=https://bulkimageseo.com
   
   # Database
   DATABASE_URL=your-postgresql-connection-string
   
   # Better Auth
   BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # GitHub OAuth (if using)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Email (Resend)
   RESEND_API_KEY=your-resend-api-key
   RESEND_AUDIENCE_ID=your-resend-audience-id
   
   # Stripe (if using payments)
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxx
   NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxx
   NEXT_PUBLIC_STRIPE_PRICE_LIFETIME=price_xxx
   ```

3. **Important Notes**
   - Make sure `NEXT_PUBLIC_BASE_URL` matches your custom domain exactly (https://bulkimageseo.com)
   - The `BETTER_AUTH_SECRET` must be the same in both local and production
   - Google OAuth requires HTTPS in production

## Issue 3: Database Connection

Make sure your PostgreSQL database:
1. Allows connections from Vercel's IP ranges
2. Has SSL enabled (add `?sslmode=require` to your connection string if needed)

## Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] OAuth redirect URIs are updated in provider consoles
- [ ] Database is accessible from Vercel
- [ ] `NEXT_PUBLIC_BASE_URL` matches your production domain
- [ ] Build succeeds locally with `pnpm build`

## Testing

After deployment:
1. Test Google OAuth login
2. Test GitHub OAuth login (if configured)
3. Verify email sending works
4. Check database connectivity