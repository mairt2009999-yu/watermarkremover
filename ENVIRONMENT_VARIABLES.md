# Environment Variables Documentation

This document describes all environment variables used in the project, especially focusing on URLs and configurable endpoints.

## Required Environment Variables

### Base URL Configuration
```env
# Your application's base URL (required for production)
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
BETTER_AUTH_URL="https://your-domain.com"
```

These variables control:
- Authentication redirects
- OAuth callback URLs
- Trusted origins for CORS
- Default redirect URLs after login

## Optional Environment Variables

### Social Media Links
Override the default social media links by setting these variables:

```env
NEXT_PUBLIC_SOCIAL_GITHUB="https://github.com/YourOrg"
NEXT_PUBLIC_SOCIAL_TWITTER="https://twitter.com/YourAccount"
NEXT_PUBLIC_SOCIAL_BLUESKY="https://bsky.app/profile/your.handle"
NEXT_PUBLIC_SOCIAL_DISCORD="https://discord.gg/your-invite"
NEXT_PUBLIC_SOCIAL_MASTODON="https://mastodon.social/@YourAccount"
NEXT_PUBLIC_SOCIAL_LINKEDIN="https://linkedin.com/company/your-company"
NEXT_PUBLIC_SOCIAL_YOUTUBE="https://youtube.com/@YourChannel"
```

### External Links
Configure external resource links:

```env
NEXT_PUBLIC_ROADMAP_URL="https://your-roadmap.com"
NEXT_PUBLIC_DOCS_URL="https://docs.your-domain.com"
NEXT_PUBLIC_SUPPORT_URL="https://support.your-domain.com"
```

### Development Configuration
```env
EMAIL_DEV_PORT="3333"  # Port for email template development server
```

## Hardcoded URLs Replaced

The following hardcoded URLs have been replaced with environment variables:

1. **Authentication URLs** (`src/lib/auth.ts`):
   - `https://mk-saas-main.vercel.app` → Uses `NEXT_PUBLIC_BASE_URL` or `BETTER_AUTH_URL`
   - Trusted origins
   - Default redirect URL
   - OAuth callback URLs

2. **Client Authentication** (`src/lib/auth-client.ts`):
   - Base URL for API calls → Uses `NEXT_PUBLIC_BASE_URL`

3. **Social Media Links** (`src/config/website.tsx`):
   - All social media links → Use respective `NEXT_PUBLIC_SOCIAL_*` variables

4. **External Links** (`src/routes.ts`):
   - Roadmap link → Uses `NEXT_PUBLIC_ROADMAP_URL`

## Configuration Priority

Environment variables take priority in the following order:

1. **Explicit environment variable** (if set)
2. **Fallback environment variable** (e.g., `BETTER_AUTH_URL` as fallback for `NEXT_PUBLIC_BASE_URL`)
3. **Default hardcoded value** (for backward compatibility)

## Usage Examples

### Local Development
```env
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
# Social media and external links are optional
```

### Production Deployment
```env
NEXT_PUBLIC_BASE_URL="https://your-app.com"
BETTER_AUTH_URL="https://your-app.com"

# Optional: Override social links
NEXT_PUBLIC_SOCIAL_GITHUB="https://github.com/YourCompany"
NEXT_PUBLIC_SOCIAL_TWITTER="https://twitter.com/YourCompany"

# Optional: Custom external links
NEXT_PUBLIC_ROADMAP_URL="https://roadmap.your-app.com"
NEXT_PUBLIC_DOCS_URL="https://docs.your-app.com"
```

## Migration Guide

To migrate from hardcoded URLs to environment variables:

1. Set `NEXT_PUBLIC_BASE_URL` to your production domain
2. Set `BETTER_AUTH_URL` to the same value (for authentication)
3. Optionally set social media links if you want to override defaults
4. Optionally set external links if you have custom endpoints
5. Deploy with the new environment variables

All URLs will automatically use the environment variables if set, otherwise falling back to the original defaults.