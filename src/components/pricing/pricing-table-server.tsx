import { getServerPricePlans } from '@/lib/server-price-config';
import type { PricePlan } from '@/payment/types';
import { PricingTableClient } from './pricing-table-client';

interface PricingTableServerProps {
  metadata?: Record<string, string>;
  currentPlan?: PricePlan | null;
  className?: string;
}

/**
 * Server-side pricing table that loads price plans with correct price IDs
 */
export async function PricingTableServer({
  metadata,
  currentPlan,
  className,
}: PricingTableServerProps) {
  // Get price plans from server configuration
  const serverPlans = getServerPricePlans();

  return (
    <PricingTableClient
      serverPlans={serverPlans}
      metadata={metadata}
      currentPlan={currentPlan}
      className={className}
    />
  );
}
