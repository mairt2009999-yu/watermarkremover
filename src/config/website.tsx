import { PaymentTypes, PlanIntervals } from '@/payment/types';
import type { WebsiteConfig } from '@/types';
import { socialLinks } from './urls';

/**
 * Get the current payment provider from environment variable
 */
export const getPaymentProvider = (): 'stripe' | 'creem' => {
  return (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'stripe') as
    | 'stripe'
    | 'creem';
};

/**
 * Clean price ID by removing any surrounding quotes
 */
const cleanPriceId = (priceId: string | undefined): string => {
  if (!priceId) return '';
  // Remove surrounding quotes if present
  return priceId.replace(/^"+|"+$/g, '');
};

/**
 * Get price ID based on the current payment provider
 * This function should be called at runtime, not at build time
 */
export const getPriceId = (
  plan: 'pro_monthly' | 'pro_yearly' | 'lifetime'
): string => {
  const paymentProvider = getPaymentProvider();

  if (paymentProvider === 'creem') {
    switch (plan) {
      case 'pro_monthly':
        return cleanPriceId(process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY);
      case 'pro_yearly':
        return cleanPriceId(process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY);
      case 'lifetime':
        return cleanPriceId(process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME);
    }
  }

  // Default to Stripe
  switch (plan) {
    case 'pro_monthly':
      return cleanPriceId(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY);
    case 'pro_yearly':
      return cleanPriceId(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY);
    case 'lifetime':
      return cleanPriceId(process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME);
  }
};

/**
 * website config, without translations
 *
 * docs:
 * https://watermarkremover.tools/docs/config/website
 */
export const websiteConfig: WebsiteConfig = {
  metadata: {
    theme: {
      defaultTheme: 'default',
      enableSwitch: true,
    },
    mode: {
      defaultMode: 'system',
      enableSwitch: true,
    },
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
    social: socialLinks,
  },
  features: {
    enableDiscordWidget: false,
    enableUpgradeCard: true,
    enableAffonsoAffiliate: false,
    enablePromotekitAffiliate: false,
    enableDatafastRevenueTrack: false,
    enableTurnstileCaptcha: process.env.ENABLE_TURNSTILE === 'true',
  },
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  analytics: {
    enableVercelAnalytics: false,
    enableSpeedInsights: false,
  },
  auth: {
    enableGoogleLogin: true,
    enableGithubLogin: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: {
        flag: '🇺🇸',
        name: 'English',
      },
      zh: {
        flag: '🇨🇳',
        name: 'Chinese',
      },
    },
  },
  blog: {
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  mail: {
    provider: 'resend',
    fromEmail: 'WatermarkRemover <support@watermarkremover.io>',
    supportEmail: 'WatermarkRemover <support@watermarkremover.io>',
  },
  newsletter: {
    provider: 'resend',
    autoSubscribeAfterSignUp: true,
  },
  storage: {
    provider: 's3',
  },
  payment: {
    provider: 'stripe' as 'stripe' | 'creem', // This will be overridden at runtime by getPaymentProvider()
  },
  price: {
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        isLifetime: false,
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: '', // Will be set dynamically
            amount: 999,
            currency: 'USD',
            interval: PlanIntervals.MONTH,
          },
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: '', // Will be set dynamically
            amount: 7900,
            currency: 'USD',
            interval: PlanIntervals.YEAR,
          },
        ],
        isFree: false,
        isLifetime: false,
        recommended: true,
      },
      lifetime: {
        id: 'lifetime',
        prices: [
          {
            type: PaymentTypes.ONE_TIME,
            priceId: '', // Will be set dynamically
            amount: 14900,
            currency: 'USD',
            allowPromotionCode: true,
          },
        ],
        isFree: false,
        isLifetime: true,
      },
    },
  },
};
