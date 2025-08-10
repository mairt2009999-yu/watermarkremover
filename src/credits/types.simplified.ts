// Simplified types for subscription-only credit system
export type TransactionType =
  | 'earned'
  | 'spent'
  | 'expired'
  | 'refunded'
  | 'bonus';
export type FeatureType =
  | 'watermark_removal'
  | 'batch_process'
  | 'ai_enhancement'
  | 'hd_processing';

// Subscription plans with included credits
export const SUBSCRIPTION_CREDITS = {
  free: 5,
  pro_monthly: 100,
  pro_yearly: 150,
  lifetime: 500,
} as const;

export interface SubscriptionCreditConfig {
  planId: string;
  monthlyCredits: number;
  rolloverEnabled: boolean; // Always false in simplified model
}

export interface UserCredits {
  userId: string;
  balance: number;
  monthlyAllocation: number;
  lastResetDate: Date | null;
  totalEarned: number;
  totalSpent: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: TransactionType;
  reason: string;
  featureUsed?: FeatureType;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Credit costs for different features (simplified)
export const CREDIT_COSTS: Record<FeatureType, number> = {
  watermark_removal: 5, // Base cost for simple watermark
  batch_process: 8, // Per image in batch
  ai_enhancement: 20, // Premium AI processing
  hd_processing: 15, // High-resolution processing
};

// Credit cost calculation based on complexity
export function calculateCreditCost(
  feature: FeatureType,
  complexity?: 'simple' | 'standard' | 'complex'
): number {
  const baseCost = CREDIT_COSTS[feature];

  // Adjust based on complexity
  switch (complexity) {
    case 'simple':
      return Math.floor(baseCost * 0.6); // 40% discount
    case 'complex':
      return Math.floor(baseCost * 1.5); // 50% premium
    case 'standard':
    default:
      return baseCost;
  }
}

// Helper to format credits display
export function formatCredits(credits: number): string {
  return new Intl.NumberFormat('en-US').format(credits);
}

// Helper to calculate days until reset
export function getDaysUntilReset(lastResetDate: Date | null): number {
  if (!lastResetDate) return 30;

  const now = new Date();
  const nextReset = new Date(lastResetDate);
  nextReset.setMonth(nextReset.getMonth() + 1);

  const daysRemaining = Math.ceil(
    (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, daysRemaining);
}

// Helper to get usage percentage
export function getUsagePercentage(
  balance: number,
  allocation: number
): number {
  if (allocation === 0) return 0;
  const used = allocation - balance;
  return Math.round((used / allocation) * 100);
}

// Helper to get recommended plan based on usage
export function getRecommendedPlan(monthlyUsage: number): string {
  if (monthlyUsage <= 5) return 'free';
  if (monthlyUsage <= 100) return 'pro_monthly';
  if (monthlyUsage <= 150) return 'pro_yearly';
  return 'lifetime';
}

// Plan upgrade benefits
export interface PlanUpgradeBenefit {
  plan: string;
  credits: number;
  price: string;
  savings?: string;
  recommended?: boolean;
}

export function getUpgradeOptions(
  currentCredits: number
): PlanUpgradeBenefit[] {
  const options: PlanUpgradeBenefit[] = [];

  if (currentCredits < SUBSCRIPTION_CREDITS.pro_monthly) {
    options.push({
      plan: 'Pro Monthly',
      credits: SUBSCRIPTION_CREDITS.pro_monthly,
      price: '$9.99/month',
    });
  }

  if (currentCredits < SUBSCRIPTION_CREDITS.pro_yearly) {
    options.push({
      plan: 'Pro Yearly',
      credits: SUBSCRIPTION_CREDITS.pro_yearly,
      price: '$6.58/month',
      savings: 'Save 34%',
      recommended: true,
    });
  }

  if (currentCredits < SUBSCRIPTION_CREDITS.lifetime) {
    options.push({
      plan: 'Lifetime',
      credits: SUBSCRIPTION_CREDITS.lifetime,
      price: '$149 once',
      savings: 'Best Value',
    });
  }

  return options;
}
