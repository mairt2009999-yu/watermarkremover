/**
 * Centralized URL configuration
 * All external URLs and configurable paths should be defined here
 */

/**
 * Get the base URL for the application
 */
export const getAppBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return (
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BETTER_AUTH_URL ||
      'https://mk-saas-main.vercel.app'
    );
  }
  return 'http://localhost:3000';
};

/**
 * Get the default redirect URL after login
 */
export const getDefaultRedirectUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return `${getAppBaseUrl()}/dashboard`;
  }
  return '/dashboard';
};

/**
 * Get OAuth callback URLs
 */
export const getOAuthCallbackUrl = (provider: 'google' | 'github'): string => {
  if (process.env.NODE_ENV === 'production') {
    return `${getAppBaseUrl()}/api/auth/callback/${provider}`;
  }
  return undefined as any; // Let the auth library handle it in development
};

/**
 * Social media links with environment variable support
 */
export const socialLinks = {
  github:
    process.env.NEXT_PUBLIC_SOCIAL_GITHUB ||
    'https://github.com/WatermarkRemoverToolsHQ',
  twitter:
    process.env.NEXT_PUBLIC_SOCIAL_TWITTER ||
    'https://watermarkremovertools.link/twitter',
  blueSky:
    process.env.NEXT_PUBLIC_SOCIAL_BLUESKY ||
    'https://watermarkremovertools.link/bsky',
  discord:
    process.env.NEXT_PUBLIC_SOCIAL_DISCORD ||
    'https://watermarkremovertools.link/discord',
  mastodon:
    process.env.NEXT_PUBLIC_SOCIAL_MASTODON ||
    'https://watermarkremovertools.link/mastodon',
  linkedin:
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ||
    'https://watermarkremovertools.link/linkedin',
  youtube:
    process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ||
    'https://watermarkremovertools.link/youtube',
};

/**
 * Get external links with environment variable support
 * This function ensures that environment variables are read at runtime
 */
export const getExternalLinks = () => ({
  roadmap:
    process.env.NEXT_PUBLIC_ROADMAP_URL ||
    'https://watermarkremovertools.link/roadmap',
  documentation: process.env.NEXT_PUBLIC_DOCS_URL || '/docs',
  support: process.env.NEXT_PUBLIC_SUPPORT_URL || '/contact',
});

/**
 * Static external links for build time
 */
export const externalLinks = {
  roadmap: 'https://watermarkremovertools.link/roadmap',
  documentation: '/docs',
  support: '/contact',
};

/**
 * Email development server port
 */
export const EMAIL_DEV_PORT = process.env.EMAIL_DEV_PORT || '3333';
