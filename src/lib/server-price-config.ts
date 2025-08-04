/**
 * Server-side price configuration
 * This ensures price IDs are read from environment variables at runtime on the server
 */

import { PaymentTypes, PlanIntervals } from '@/payment/types';
import type { PricePlan } from '@/payment/types';

/**
 * Get payment provider from environment variable (server-side)
 */
export const getServerPaymentProvider = (): 'stripe' | 'creem' => {
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
 * Get price ID from environment variables (server-side)
 */
export const getServerPriceId = (
  plan: 'pro_monthly' | 'pro_yearly' | 'lifetime'
): string => {
  const provider = getServerPaymentProvider();

  if (provider === 'creem') {
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
 * Get server-side price plans with correct price IDs
 * This function should only be used in server components/actions
 */
export const getServerPricePlans = (): Record<string, PricePlan> => {
  return {
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
          priceId: getServerPriceId('pro_monthly'),
          amount: 990,
          currency: 'USD',
          interval: PlanIntervals.MONTH,
        },
        {
          type: PaymentTypes.SUBSCRIPTION,
          priceId: getServerPriceId('pro_yearly'),
          amount: 9900,
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
          priceId: getServerPriceId('lifetime'),
          amount: 19900,
          currency: 'USD',
          allowPromotionCode: true,
        },
      ],
      isFree: false,
      isLifetime: true,
    },
  };
};

/**
 * Find plan by ID (server-side)
 */
export const findServerPlanByPlanId = (
  planId: string
): PricePlan | undefined => {
  const plans = getServerPricePlans();
  return plans[planId];
};

/**
 * Find price in plan (server-side)
 */
export const findServerPriceInPlan = (
  planId: string,
  priceId: string
): PricePlan['prices'][0] | undefined => {
  const plan = findServerPlanByPlanId(planId);
  if (!plan) {
    return undefined;
  }
  return plan.prices.find((price) => price.priceId === priceId);
};

/**
 * Find plan by price ID (server-side)
 */
export const findServerPlanByPriceId = (
  priceId: string
): PricePlan | undefined => {
  const plans = getServerPricePlans();
  for (const plan of Object.values(plans)) {
    const matchingPrice = plan.prices.find(
      (price) => price.priceId === priceId
    );
    if (matchingPrice) {
      return plan;
    }
  }
  return undefined;
};
