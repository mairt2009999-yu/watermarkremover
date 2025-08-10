'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import {
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PricePlan,
} from '@/payment/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PricingCard } from './pricing-card';

interface PricingTableClientProps {
  serverPlans: Record<string, PricePlan>;
  metadata?: Record<string, string>;
  currentPlan?: PricePlan | null;
  className?: string;
}

/**
 * Client-side pricing table that receives plans from server
 */
export function PricingTableClient({
  serverPlans,
  metadata,
  currentPlan,
  className,
}: PricingTableClientProps) {
  const t = useTranslations('PricingPage');
  const tPlans = useTranslations('PricePlans');
  const [interval, setInterval] = useState<PlanInterval>(PlanIntervals.MONTH);

  // Add translations to server plans
  const plans = Object.values(serverPlans).map((plan) => {
    const translatedPlan = { ...plan };

    // Add translations based on plan ID
    if (plan.id === 'free') {
      translatedPlan.name = tPlans('free.name');
      translatedPlan.description = tPlans('free.description');
      translatedPlan.features = [
        tPlans('free.features.feature-1'),
        tPlans('free.features.feature-2'),
        tPlans('free.features.feature-3'),
        tPlans('free.features.feature-4'),
      ];
      translatedPlan.limits = [
        tPlans('free.limits.limit-1'),
        tPlans('free.limits.limit-2'),
        tPlans('free.limits.limit-3'),
      ];
    } else if (plan.id === 'starter') {
      translatedPlan.name = tPlans('starter.name');
      translatedPlan.description = tPlans('starter.description');
      translatedPlan.features = [
        tPlans('starter.features.feature-1'),
        tPlans('starter.features.feature-2'),
        tPlans('starter.features.feature-3'),
        tPlans('starter.features.feature-4'),
      ];
      translatedPlan.limits = [tPlans('starter.limits.limit-1')];
    } else if (plan.id === 'pro') {
      translatedPlan.name = tPlans('pro.name');
      translatedPlan.description = tPlans('pro.description');
      translatedPlan.features = [
        tPlans('pro.features.feature-1'),
        tPlans('pro.features.feature-2'),
        tPlans('pro.features.feature-3'),
        tPlans('pro.features.feature-4'),
        tPlans('pro.features.feature-5'),
      ];
      translatedPlan.limits = [
        tPlans('pro.limits.limit-1'),
        tPlans('pro.limits.limit-2'),
      ];
    }

    return translatedPlan;
  });

  // Current plan ID for comparison
  const currentPlanId = currentPlan?.id || null;

  // Filter plans into free, subscription and one-time plans
  const freePlans = plans.filter((plan) => plan.isFree && !plan.disabled);

  const subscriptionPlans = plans.filter(
    (plan) =>
      !plan.isFree &&
      !plan.isLifetime &&
      plan.prices.some((price) => price.type === PaymentTypes.SUBSCRIPTION) &&
      !plan.disabled
  );

  const oneTimePlans = plans.filter(
    (plan) =>
      !plan.isFree &&
      plan.isLifetime &&
      plan.prices.some((price) => price.type === PaymentTypes.ONE_TIME) &&
      !plan.disabled
  );

  // Get available intervals from subscription plans
  const availableIntervals = Array.from(
    new Set(
      subscriptionPlans.flatMap((plan) =>
        plan.prices
          .filter((price) => price.type === PaymentTypes.SUBSCRIPTION)
          .map((price) => price.interval)
          .filter((interval): interval is PlanInterval => !!interval)
      )
    )
  );

  return (
    <div className={cn('space-y-8', className)}>
      {/* Interval selector for subscription plans */}
      {availableIntervals.length > 1 && (
        <div className="flex justify-center">
          <ToggleGroup
            type="single"
            value={interval}
            onValueChange={(value) =>
              value && setInterval(value as PlanInterval)
            }
            className="bg-secondary p-1 rounded-lg"
          >
            {availableIntervals.includes(PlanIntervals.MONTH) && (
              <ToggleGroupItem
                value={PlanIntervals.MONTH}
                className="px-6 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                {t('monthly')}
              </ToggleGroupItem>
            )}
            {availableIntervals.includes(PlanIntervals.YEAR) && (
              <ToggleGroupItem
                value={PlanIntervals.YEAR}
                className="px-6 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                {t('yearly')}
              </ToggleGroupItem>
            )}
          </ToggleGroup>
        </div>
      )}

      {/* Display plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Free plans */}
        {freePlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            interval={interval}
            isCurrentPlan={plan.id === currentPlanId}
            metadata={metadata}
          />
        ))}

        {/* Subscription plans */}
        {subscriptionPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            interval={interval}
            isCurrentPlan={plan.id === currentPlanId}
            metadata={metadata}
          />
        ))}

        {/* One-time purchase plans */}
        {oneTimePlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            interval={interval}
            isCurrentPlan={plan.id === currentPlanId}
            metadata={metadata}
          />
        ))}
      </div>
    </div>
  );
}
