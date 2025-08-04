/**
 * Runtime configuration loader
 * This ensures environment variables are loaded at runtime instead of build time
 */

// Cache for runtime config
let runtimeConfig: any = null;

/**
 * Get runtime configuration
 * This function fetches configuration from the server if running in browser
 */
export async function getRuntimeConfig() {
  // Server-side: directly return env vars
  if (typeof window === 'undefined') {
    return {
      paymentProvider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'stripe',
      priceIds: {
        creem: {
          monthly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || '',
          yearly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY || '',
          lifetime: process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME || '',
        },
        stripe: {
          monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
          yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '',
          lifetime: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME || '',
        },
      },
    };
  }

  // Client-side: fetch from API if not cached
  if (!runtimeConfig) {
    try {
      const response = await fetch('/api/runtime-config');
      if (response.ok) {
        runtimeConfig = await response.json();
      }
    } catch (error) {
      console.error('Failed to load runtime config:', error);
    }
  }

  return (
    runtimeConfig || {
      paymentProvider: 'stripe',
      priceIds: {
        creem: { monthly: '', yearly: '', lifetime: '' },
        stripe: { monthly: '', yearly: '', lifetime: '' },
      },
    }
  );
}

/**
 * Get price ID from runtime config
 */
export async function getRuntimePriceId(
  plan: 'pro_monthly' | 'pro_yearly' | 'lifetime'
): Promise<string> {
  const config = await getRuntimeConfig();
  const provider = config.paymentProvider;

  const planMap = {
    pro_monthly: 'monthly',
    pro_yearly: 'yearly',
    lifetime: 'lifetime',
  } as const;

  const planKey = planMap[plan];
  return config.priceIds[provider]?.[planKey] || '';
}
