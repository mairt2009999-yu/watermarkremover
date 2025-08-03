'use client';

import { getAllPricePlans } from '@/lib/price-plan';
import type { PricePlan } from '@/payment/types';
import { useTranslations } from 'next-intl';

/**
 * Get price plans with translations for client components
 *
 * NOTICE: This function should only be used in client components.
 * If you need to get the price plans in server components, use getAllPricePlans instead.
 * Use this function when showing the pricing table or the billing card to the user.
 *
 * docs:
 * https://mksaas.com/docs/config/price
 *
 * @returns The price plans with translated content
 */
export function getPricePlans(): Record<string, PricePlan> {
  const t = useTranslations('PricePlans');
  // Get runtime plans with correct price IDs
  const runtimePlans = getAllPricePlans();
  const plans: Record<string, PricePlan> = {};

  // Convert array to object and add translations
  runtimePlans.forEach((plan) => {
    if (plan.id === 'free') {
      plans.free = {
        ...plan,
        name: t('free.name'),
        description: t('free.description'),
        features: [
          t('free.features.feature-1'),
          t('free.features.feature-2'),
          t('free.features.feature-3'),
          t('free.features.feature-4'),
        ],
        limits: [
          t('free.limits.limit-1'),
          t('free.limits.limit-2'),
          t('free.limits.limit-3'),
        ],
      };
    } else if (plan.id === 'pro') {
      plans.pro = {
        ...plan,
        name: t('pro.name'),
        description: t('pro.description'),
        features: [
          t('pro.features.feature-1'),
          t('pro.features.feature-2'),
          t('pro.features.feature-3'),
          t('pro.features.feature-4'),
          t('pro.features.feature-5'),
        ],
        limits: [t('pro.limits.limit-1'), t('pro.limits.limit-2')],
      };
    } else if (plan.id === 'lifetime') {
      plans.lifetime = {
        ...plan,
        name: t('lifetime.name'),
        description: t('lifetime.description'),
        features: [
          t('lifetime.features.feature-1'),
          t('lifetime.features.feature-2'),
          t('lifetime.features.feature-3'),
          t('lifetime.features.feature-4'),
          t('lifetime.features.feature-5'),
          t('lifetime.features.feature-6'),
          t('lifetime.features.feature-7'),
        ],
        limits: [],
      };
    }
  });

  return plans;
}
