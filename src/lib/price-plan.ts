import { getPriceId, websiteConfig } from '@/config/website';
import type { Price, PricePlan } from '@/payment/types';
import { PlanIntervals } from '@/payment/types';

/**
 * Get runtime price plans with dynamic price IDs
 * This ensures price IDs are loaded from environment variables at runtime
 */
const getRuntimePricePlans = (): Record<string, PricePlan> => {
  const plans = JSON.parse(JSON.stringify(websiteConfig.price.plans));

  // Update Pro plan prices
  if (plans.pro && plans.pro.prices) {
    const monthlyPrice = plans.pro.prices.find(
      (p: Price) => p.interval === PlanIntervals.MONTH
    );
    const yearlyPrice = plans.pro.prices.find(
      (p: Price) => p.interval === PlanIntervals.YEAR
    );

    if (monthlyPrice) {
      monthlyPrice.priceId = getPriceId('pro_monthly');
    }
    if (yearlyPrice) {
      yearlyPrice.priceId = getPriceId('pro_yearly');
    }
  }

  // Update Lifetime plan price
  if (plans.lifetime && plans.lifetime.prices && plans.lifetime.prices[0]) {
    plans.lifetime.prices[0].priceId = getPriceId('lifetime');
  }

  return plans;
};

/**
 * Get all price plans (without translations, like name/description/features)
 * NOTICE: This function can be used in server or client components.
 * @returns Array of price plans
 */
export const getAllPricePlans = (): PricePlan[] => {
  const plans = getRuntimePricePlans();
  return Object.values(plans);
};

/**
 * Get plan by plan ID
 * @param planId Plan ID
 * @returns Plan or undefined if not found
 */
export const findPlanByPlanId = (planId: string): PricePlan | undefined => {
  const plans = getRuntimePricePlans();
  return plans[planId];
};

/**
 * Find plan by price ID
 * @param priceId Price ID (Stripe price ID)
 * @returns Plan or undefined if not found
 */
export const findPlanByPriceId = (priceId: string): PricePlan | undefined => {
  const plans = getAllPricePlans();
  for (const plan of plans) {
    const matchingPrice = plan.prices.find(
      (price) => price.priceId === priceId
    );
    if (matchingPrice) {
      return plan;
    }
  }
  return undefined;
};

/**
 * Find price in a plan by ID
 * @param planId Plan ID
 * @param priceId Price ID (Stripe price ID)
 * @returns Price or undefined if not found
 */
export const findPriceInPlan = (
  planId: string,
  priceId: string
): Price | undefined => {
  const plan = findPlanByPlanId(planId);
  if (!plan) {
    console.error(`findPriceInPlan, Plan with ID ${planId} not found`);
    return undefined;
  }
  return plan.prices.find((price) => price.priceId === priceId);
};

