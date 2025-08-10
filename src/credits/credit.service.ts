import { db } from '@/db';
import {
  creditPackages,
  creditPurchases,
  creditTransactions,
  subscriptionCreditConfig,
  userCredits,
} from '@/db/schema';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export type TransactionType =
  | 'earned'
  | 'spent'
  | 'purchased'
  | 'expired'
  | 'refunded'
  | 'bonus';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface MonthlyUsageStats {
  totalSpent: number;
  totalEarned: number;
  currentBalance: number;
  monthlyAllocation: number;
  daysUntilReset: number;
  transactions: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: TransactionType;
  reason: string;
  featureUsed?: string;
  metadata?: any;
  createdAt: Date;
}

export class CreditService {
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<number> {
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (!credits.length) {
      // Initialize user credits if not exists
      await this.initializeUserCredits(userId);
      return 0;
    }

    return credits[0].balance;
  }

  /**
   * Initialize credit account for new user
   */
  private async initializeUserCredits(userId: string, initialBalance = 0) {
    const id = nanoid();
    await db.insert(userCredits).values({
      id,
      userId,
      balance: initialBalance,
      monthlyAllocation: 0,
      totalEarned: initialBalance,
      totalSpent: 0,
      lastResetDate: new Date(),
    });
    return id;
  }

  /**
   * Get transaction history with pagination
   */
  async getTransactionHistory(
    userId: string,
    options: PaginationOptions = {}
  ): Promise<{ transactions: CreditTransaction[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const [transactions, totalResult] = await Promise.all([
      db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId)),
    ]);

    return {
      transactions: transactions as CreditTransaction[],
      total: Number(totalResult[0]?.count || 0),
    };
  }

  /**
   * Get monthly usage statistics
   */
  async getMonthlyUsage(userId: string): Promise<MonthlyUsageStats> {
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (!credits.length) {
      await this.initializeUserCredits(userId);
      return {
        totalSpent: 0,
        totalEarned: 0,
        currentBalance: 0,
        monthlyAllocation: 0,
        daysUntilReset: 30,
        transactions: 0,
      };
    }

    const credit = credits[0];
    const now = new Date();
    const lastReset = credit.lastResetDate || now;
    const nextReset = new Date(lastReset);
    nextReset.setMonth(nextReset.getMonth() + 1);
    const daysUntilReset = Math.ceil(
      (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get monthly transactions count
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const transactionCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          gte(creditTransactions.createdAt, startOfMonth)
        )
      );

    return {
      totalSpent: credit.totalSpent,
      totalEarned: credit.totalEarned,
      currentBalance: credit.balance,
      monthlyAllocation: credit.monthlyAllocation,
      daysUntilReset,
      transactions: Number(transactionCount[0]?.count || 0),
    };
  }

  /**
   * Check if user has enough credits
   */
  async checkCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    userId: string,
    amount: number,
    feature: string,
    metadata?: any
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    // Start transaction
    return await db.transaction(async (tx) => {
      // Get current balance with lock
      const credits = await tx
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .for('update')
        .limit(1);

      if (!credits.length) {
        return {
          success: false,
          newBalance: 0,
          error: 'User credits not initialized',
        };
      }

      const currentBalance = credits[0].balance;
      if (currentBalance < amount) {
        return {
          success: false,
          newBalance: currentBalance,
          error: `Insufficient credits. Required: ${amount}, Available: ${currentBalance}`,
        };
      }

      const newBalance = currentBalance - amount;

      // Update balance
      await tx
        .update(userCredits)
        .set({
          balance: newBalance,
          totalSpent: credits[0].totalSpent + amount,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      // Record transaction
      await tx.insert(creditTransactions).values({
        id: nanoid(),
        userId,
        amount: -amount,
        balanceAfter: newBalance,
        type: 'spent',
        reason: `Used for ${feature}`,
        featureUsed: feature,
        metadata,
      });

      return { success: true, newBalance };
    });
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    userId: string,
    amount: number,
    reason: string,
    type: TransactionType = 'earned',
    metadata?: any
  ): Promise<{ success: boolean; newBalance: number }> {
    return await db.transaction(async (tx) => {
      // Get or create user credits
      const credits = await tx
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .for('update')
        .limit(1);

      if (!credits.length) {
        await tx.insert(userCredits).values({
          id: nanoid(),
          userId,
          balance: amount,
          monthlyAllocation: 0,
          totalEarned: amount,
          totalSpent: 0,
          lastResetDate: new Date(),
        });

        await tx.insert(creditTransactions).values({
          id: nanoid(),
          userId,
          amount,
          balanceAfter: amount,
          type,
          reason,
          metadata,
        });

        return { success: true, newBalance: amount };
      }

      const newBalance = credits[0].balance + amount;
      const updates: any = {
        balance: newBalance,
        totalEarned: credits[0].totalEarned + amount,
        updatedAt: new Date(),
      };

      if (type === 'purchased') {
      }

      // Update balance
      await tx
        .update(userCredits)
        .set(updates)
        .where(eq(userCredits.userId, userId));

      // Record transaction
      await tx.insert(creditTransactions).values({
        id: nanoid(),
        userId,
        amount,
        balanceAfter: newBalance,
        type,
        reason,
        metadata,
      });

      return { success: true, newBalance };
    });
  }

  /**
   * Allocate monthly credits based on subscription plan
   */
  async allocateMonthlyCredits(userId: string, planId: string): Promise<void> {
    // Get plan configuration
    const configs = await db
      .select()
      .from(subscriptionCreditConfig)
      .where(eq(subscriptionCreditConfig.planId, planId))
      .limit(1);

    if (!configs.length) {
      console.warn(`No credit configuration found for plan: ${planId}`);
      return;
    }

    const config = configs[0];
    const monthlyCredits = config.monthlyCredits;

    // Add monthly allocation
    await this.addCredits(
      userId,
      monthlyCredits,
      `Monthly allocation for ${planId} plan`,
      'earned',
      { planId, allocation: 'monthly' }
    );

    // Update monthly allocation field
    await db
      .update(userCredits)
      .set({
        monthlyAllocation: monthlyCredits,
        lastResetDate: new Date(),
      })
      .where(eq(userCredits.userId, userId));
  }

  /**
   * Reset monthly credits for all users (called by cron job)
   */
  async resetMonthlyCredits(): Promise<void> {
    // This would be called by a cron job on the 1st of each month
    // Implementation would fetch all active subscriptions and allocate credits
    console.log('Monthly credit reset would be implemented here');
  }

  /**
   * Handle subscription plan changes
   */
  async handleSubscriptionChange(
    userId: string,
    oldPlanId: string | null,
    newPlanId: string
  ): Promise<void> {
    // Get new plan configuration
    const configs = await db
      .select()
      .from(subscriptionCreditConfig)
      .where(eq(subscriptionCreditConfig.planId, newPlanId))
      .limit(1);

    if (!configs.length) {
      console.warn(`No credit configuration found for plan: ${newPlanId}`);
      return;
    }

    const config = configs[0];

    // Check if this is an upgrade or new subscription
    if (!oldPlanId || oldPlanId === 'free') {
      // New subscription or upgrade from free - allocate full monthly credits
      await this.allocateMonthlyCredits(userId, newPlanId);
    } else {
      // Plan change - pro-rate credits based on days remaining
      const now = new Date();
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      const daysPassed = now.getDate();
      const daysRemaining = daysInMonth - daysPassed;
      const proRatedCredits = Math.floor(
        (config.monthlyCredits * daysRemaining) / daysInMonth
      );

      await this.addCredits(
        userId,
        proRatedCredits,
        `Pro-rated credits for plan change to ${newPlanId}`,
        'earned',
        { planId: newPlanId, proRated: true, daysRemaining }
      );
    }
  }

  /**
   * Purchase credit package
   */
  async purchaseCreditPackage(
    userId: string,
    packageId: string,
    paymentIntentId: string
  ): Promise<{ success: boolean; error?: string }> {
    // Get package details
    const packages = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.id, packageId))
      .limit(1);

    if (!packages.length) {
      return { success: false, error: 'Invalid package' };
    }

    const pkg = packages[0];

    // Record purchase
    const purchaseId = nanoid();
    await db.insert(creditPurchases).values({
      id: purchaseId,
      userId,
      packageId,
      credits: pkg.credits,
      amount: pkg.price,
      currency: pkg.currency || 'USD',
      stripePaymentId: paymentIntentId,
      status: 'completed',
    });

    // Add credits to user account
    await this.addCredits(
      userId,
      pkg.credits,
      `Purchased ${pkg.name} package`,
      'purchased',
      { packageId, purchaseId }
    );

    return { success: true };
  }

  /**
   * Refund credits
   */
  async refundCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; newBalance: number }> {
    return await this.addCredits(userId, amount, reason, 'refunded', {
      refund: true,
    });
  }

  /**
   * Get available credit packages
   */
  async getCreditPackages() {
    return await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.active, true))
      .orderBy(creditPackages.sortOrder);
  }

  /**
   * Generate usage report
   */
  async generateUsageReport(userId: string, startDate: Date, endDate: Date) {
    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          gte(creditTransactions.createdAt, startDate),
          sql`${creditTransactions.createdAt} <= ${endDate}`
        )
      )
      .orderBy(desc(creditTransactions.createdAt));

    const summary = {
      totalEarned: 0,
      totalSpent: 0,
      totalPurchased: 0,
      totalRefunded: 0,
      byFeature: {} as Record<string, number>,
    };

    transactions.forEach((tx) => {
      if (tx.type === 'earned') summary.totalEarned += tx.amount;
      if (tx.type === 'spent') summary.totalSpent += Math.abs(tx.amount);
      if (tx.type === 'purchased') summary.totalPurchased += tx.amount;
      if (tx.type === 'refunded') summary.totalRefunded += tx.amount;

      if (tx.featureUsed) {
        summary.byFeature[tx.featureUsed] =
          (summary.byFeature[tx.featureUsed] || 0) + Math.abs(tx.amount);
      }
    });

    return {
      transactions,
      summary,
      period: { startDate, endDate },
    };
  }
}

// Export singleton instance
export const creditService = new CreditService();
