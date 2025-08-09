/**
 * Dynamic credit service selector based on feature flags
 * This module exports the appropriate credit service based on the current system version
 */

import { isSimplifiedCreditSystem } from '@/config/features';
import { CreditService } from './credit.service';
import { SimplifiedCreditService } from './credit.service.simplified';

// Import helper functions from both versions
import * as typesV1 from './types';
import * as typesV2 from './types.simplified';

// Export types based on version
export type TransactionType = typesV1.TransactionType | typesV2.TransactionType;
export type FeatureType = typesV1.FeatureType | typesV2.FeatureType;
export type CreditTransaction = typesV1.CreditTransaction | typesV2.CreditTransaction;
export type UserCredits = typesV1.UserCredits | typesV2.UserCredits;

// Export service-specific types
export type { PaginationOptions, MonthlyUsageStats } from './credit.service.simplified';

// Export V2-specific types
export type { PlanUpgradeBenefit } from './types.simplified';

// Export V1-specific types when needed
export type { CreditPackage, CreditPurchase, PurchaseStatus } from './types';

// Export the appropriate service based on feature flag
function getCreditService() {
  if (isSimplifiedCreditSystem()) {
    console.log('[CreditService] Using simplified v2 system');
    return new SimplifiedCreditService();
  }
  console.log('[CreditService] Using original v1 system');
  return new CreditService();
}

// Export singleton instance
export const creditService = getCreditService();

// Export dynamic helper functions
export function formatCredits(credits: number): string {
  if (isSimplifiedCreditSystem()) {
    return typesV2.formatCredits(credits);
  }
  return typesV1.formatCredits(credits);
}

export function calculateCreditCost(
  feature: string,
  param?: any
): number {
  if (isSimplifiedCreditSystem()) {
    return typesV2.calculateCreditCost(feature as any, param);
  }
  return typesV1.calculateCreditCost(feature as any, param);
}

export function getDaysUntilReset(lastResetDate: Date | null): number {
  if (isSimplifiedCreditSystem()) {
    return typesV2.getDaysUntilReset(lastResetDate);
  }
  return typesV1.getDaysUntilReset(lastResetDate);
}

// V2-specific helper functions
export function getUsagePercentage(balance: number, allocation: number): number {
  if (isSimplifiedCreditSystem()) {
    return typesV2.getUsagePercentage(balance, allocation);
  }
  // V1 doesn't have this function, provide fallback
  if (allocation === 0) return 0;
  const used = allocation - balance;
  return Math.round((used / allocation) * 100);
}

export function getRecommendedPlan(monthlyUsage: number): string {
  if (isSimplifiedCreditSystem()) {
    return typesV2.getRecommendedPlan(monthlyUsage);
  }
  // V1 fallback logic
  if (monthlyUsage <= 10) return 'free';
  if (monthlyUsage <= 300) return 'pro';
  return 'pro';
}

export function getUpgradeOptions(currentCredits: number) {
  if (isSimplifiedCreditSystem()) {
    return typesV2.getUpgradeOptions(currentCredits);
  }
  // V1 doesn't have upgrade options in the same format
  return [];
}

// Export constants based on version
export function getCreditCosts() {
  if (isSimplifiedCreditSystem()) {
    return typesV2.CREDIT_COSTS;
  }
  return typesV1.CREDIT_COSTS;
}

// Export subscription credits based on version
export function getSubscriptionCredits(planId: string): number {
  if (isSimplifiedCreditSystem()) {
    return typesV2.SUBSCRIPTION_CREDITS[planId as keyof typeof typesV2.SUBSCRIPTION_CREDITS] || 0;
  }
  
  // V1 subscription credits (fallback values since V1 doesn't have a constant)
  const v1Config = {
    free: 10,
    pro: 300,
    pro_monthly: 300,
    pro_yearly: 400,
    lifetime: 1000,
  };
  
  return v1Config[planId as keyof typeof v1Config] || 0;
}

// Export version-aware subscription credits constant
export function getSubscriptionCreditsConfig() {
  if (isSimplifiedCreditSystem()) {
    return typesV2.SUBSCRIPTION_CREDITS;
  }
  
  return {
    free: 10,
    pro: 300,
    pro_monthly: 300,
    pro_yearly: 400,
    lifetime: 1000,
  } as const;
}