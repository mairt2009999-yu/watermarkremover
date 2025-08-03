# Vercel Deployment Configuration

## Important Environment Variables

When deploying to Vercel, make sure to set the following environment variables:

### Required for Authentication
- `AUTH_TRUST_HOST=true` - Required for Better Auth to work behind Vercel's reverse proxy
- `BETTER_AUTH_URL=https://mk-saas-main.vercel.app` - Your production URL
- `NEXT_PUBLIC_BASE_URL=https://mk-saas-main.vercel.app` - Your production URL
- `BETTER_AUTH_SECRET` - Required for session encryption (generate with `openssl rand -base64 32`)

### Cookie Configuration
The application has been configured with the following cookie settings for production:
- `secure: true` - Cookies will only be sent over HTTPS
- `httpOnly: true` - Cookies cannot be accessed via JavaScript
- `sameSite: 'lax'` - Provides CSRF protection while allowing navigation

## Troubleshooting

If users are being redirected to login page after successful authentication:

1. **Check Debug Pages**:
   - Visit `/debug-auth` to see session status and cookies
   - Visit `/api/debug-session` to see server-side session info
   - Visit `/api/check-cookies` to see server-side cookie detection

2. **Browser Console**:
   - Check for cookie warnings in console
   - Look for any CORS or security errors

3. **Verify Cookies**:
   - Open Browser DevTools > Application > Cookies
   - Look for `better-auth.session_token` cookie
   - Verify it has correct domain and secure flags

4. **Email Verification**:
   - Email verification has been temporarily disabled for testing
   - Re-enable by setting `requireEmailVerification: true` in auth.ts

## Debug Checklist

- [ ] Cookie `better-auth.session_token` is present after login
- [ ] Cookie has `Secure` flag in production
- [ ] Cookie domain matches your deployment URL
- [ ] No CORS errors in console
- [ ] Middleware logs show cookie is detected

## Additional Notes

- The cookie name used is `better-auth.session_token` in development
- In production with secure cookies, it becomes `__Secure-better-auth.session_token`
- Cookie prefix is explicitly set to `better-auth`
- Middleware checks for this cookie to determine if user is logged in
- Email verification can be toggled in `/src/lib/auth.ts`

## Important Cookie Naming

Better Auth automatically adds the `__Secure-` prefix to cookies in production when:
- `useSecureCookies` is enabled
- The cookie has `secure: true` attribute
- The app is running over HTTPS

This is a security feature that ensures cookies can only be set over secure connections.