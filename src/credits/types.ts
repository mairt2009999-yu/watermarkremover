export type TransactionType =
  | 'earned'
  | 'spent'
  | 'purchased'
  | 'expired'
  | 'refunded'
  | 'bonus';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type FeatureType =
  | 'watermark_removal'
  | 'batch_process'
  | 'ai_enhancement'
  | 'hd_processing';

export interface CreditConfig {
  planId: string;
  monthlyCredits: number;
  rolloverEnabled: boolean;
  rolloverMaxMonths: number;
  bonusPercentage: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in cents
  currency: string;
  description?: string;
  popular?: boolean;
  stripePriceId?: string;
  creemPriceId?: string;
}

export interface UserCredits {
  userId: string;
  balance: number;
  monthlyAllocation: number;
  purchasedCredits: number;
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

export interface CreditPurchase {
  id: string;
  userId: string;
  packageId: string;
  credits: number;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  status: PurchaseStatus;
  createdAt: Date;
}

// Credit costs for different features
export const CREDIT_COSTS: Record<FeatureType, number> = {
  watermark_removal: 10,
  batch_process: 15,
  ai_enhancement: 30,
  hd_processing: 20,
};

// Credit cost calculation based on image size
export function calculateCreditCost(
  feature: FeatureType,
  imageSize?: number // in MB
): number {
  let baseCost = CREDIT_COSTS[feature];

  // Adjust cost based on image size
  if (imageSize) {
    if (imageSize < 2) {
      baseCost = Math.floor(baseCost * 0.5); // 50% cost for small images
    } else if (imageSize > 5) {
      baseCost = Math.floor(baseCost * 2); // 2x cost for large images
    }
  }

  return baseCost;
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
