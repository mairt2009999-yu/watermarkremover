import { getDb } from '@/db';
import {
  creditTransactions,
  subscriptionCreditConfig,
  userCredits,
} from '@/db/schema';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Simplified transaction types - no 'purchased' type
export type TransactionType =
  | 'earned'
  | 'spent'
  | 'expired'
  | 'refunded'
  | 'bonus';

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
  usagePercentage: number;
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

/**
 * Simplified Credit Service for Subscription-Only Model
 * Credits are only available through subscriptions - no separate purchases
 */
export class SimplifiedCreditService {
  private async getDatabase() {
    return await getDb();
  }
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<number> {
    const db = await getDb();
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
    const db = await this.getDatabase();
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
    const db = await this.getDatabase();

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
   * Get monthly usage statistics (simplified without purchased credits)
   */
  async getMonthlyUsage(userId: string): Promise<MonthlyUsageStats> {
    const db = await this.getDatabase();
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
        usagePercentage: 0,
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

    // Calculate usage percentage
    const usedCredits = credit.monthlyAllocation - credit.balance;
    const usagePercentage =
      credit.monthlyAllocation > 0
        ? (usedCredits / credit.monthlyAllocation) * 100
        : 0;

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
      usagePercentage: Math.round(usagePercentage),
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
    const db = await this.getDatabase();
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
   * Internal method to add credits (for monthly allocation, refunds, etc)
   */
  private async addCredits(
    userId: string,
    amount: number,
    reason: string,
    type: TransactionType = 'earned',
    metadata?: any
  ): Promise<{ success: boolean; newBalance: number }> {
    const db = await this.getDatabase();
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
          monthlyAllocation: type === 'earned' ? amount : 0,
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

      // Update balance
      await tx
        .update(userCredits)
        .set({
          balance: newBalance,
          totalEarned: credits[0].totalEarned + amount,
          updatedAt: new Date(),
        })
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
    const db = await this.getDatabase();
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

    // Set balance to monthly allocation (no rollover)
    await db.transaction(async (tx) => {
      const existingCredits = await tx
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .limit(1);

      if (existingCredits.length) {
        // Update existing record - reset to monthly allocation
        await tx
          .update(userCredits)
          .set({
            balance: monthlyCredits,
            monthlyAllocation: monthlyCredits,
            lastResetDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId));
      } else {
        // Create new record
        await tx.insert(userCredits).values({
          id: nanoid(),
          userId,
          balance: monthlyCredits,
          monthlyAllocation: monthlyCredits,
          totalEarned: monthlyCredits,
          totalSpent: 0,
          lastResetDate: new Date(),
        });
      }

      // Record allocation transaction
      await tx.insert(creditTransactions).values({
        id: nanoid(),
        userId,
        amount: monthlyCredits,
        balanceAfter: monthlyCredits,
        type: 'earned',
        reason: `Monthly allocation for ${planId} plan`,
        metadata: { planId, allocation: 'monthly' },
      });
    });
  }

  /**
   * Reset monthly credits for all users (called by cron job)
   * Credits don't roll over - use it or lose it
   */
  async resetMonthlyCredits(): Promise<void> {
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const db = await this.getDatabase();

    // Get all users whose credits need resetting
    const usersToReset = await db
      .select()
      .from(userCredits)
      .where(
        and(
          sql`${userCredits.lastResetDate} <= ${oneMonthAgo}`,
          sql`${userCredits.monthlyAllocation} > 0`
        )
      );

    for (const user of usersToReset) {
      // Record expired credits if any remain
      if (user.balance > 0) {
        await db.insert(creditTransactions).values({
          id: nanoid(),
          userId: user.userId,
          amount: -user.balance,
          balanceAfter: 0,
          type: 'expired',
          reason: 'Monthly credits expired (no rollover)',
          metadata: { expiredAmount: user.balance },
        });
      }

      // Reset to monthly allocation
      await db
        .update(userCredits)
        .set({
          balance: user.monthlyAllocation,
          lastResetDate: now,
          updatedAt: now,
        })
        .where(eq(userCredits.userId, user.userId));

      // Record new allocation
      await db.insert(creditTransactions).values({
        id: nanoid(),
        userId: user.userId,
        amount: user.monthlyAllocation,
        balanceAfter: user.monthlyAllocation,
        type: 'earned',
        reason: 'Monthly credit reset',
        metadata: { resetDate: now },
      });
    }
  }

  /**
   * Handle subscription plan changes
   * Immediately adjust credits to new plan allocation
   */
  async handleSubscriptionChange(
    userId: string,
    oldPlanId: string | null,
    newPlanId: string
  ): Promise<void> {
    // Get new plan configuration
    const db = await this.getDatabase();
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
    const newMonthlyCredits = config.monthlyCredits;

    // Get current user credits
    const currentCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (!currentCredits.length) {
      // Initialize with new plan credits
      await this.allocateMonthlyCredits(userId, newPlanId);
      return;
    }

    const current = currentCredits[0];

    // Calculate pro-rated credits for the remaining month
    const now = new Date();
    const lastReset = current.lastResetDate || now;
    const daysInMonth = 30; // Simplified calculation
    const daysSinceReset = Math.floor(
      (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, daysInMonth - daysSinceReset);
    const proRatedCredits = Math.floor(
      (newMonthlyCredits * daysRemaining) / daysInMonth
    );

    // Update to new allocation
    await db.transaction(async (tx) => {
      await tx
        .update(userCredits)
        .set({
          balance: proRatedCredits,
          monthlyAllocation: newMonthlyCredits,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      // Record the change
      await tx.insert(creditTransactions).values({
        id: nanoid(),
        userId,
        amount: proRatedCredits - current.balance,
        balanceAfter: proRatedCredits,
        type: 'earned',
        reason: `Plan change from ${oldPlanId || 'free'} to ${newPlanId}`,
        metadata: {
          oldPlan: oldPlanId,
          newPlan: newPlanId,
          proRated: true,
          daysRemaining,
        },
      });
    });
  }

  /**
   * Handle subscription cancellation
   * Credits remain until period end
   */
  async handleSubscriptionCancellation(userId: string): Promise<void> {
    // Credits remain active until subscription period ends
    // Just log the cancellation
    const db = await this.getDatabase();
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (credits.length && credits[0].balance > 0) {
      await db.insert(creditTransactions).values({
        id: nanoid(),
        userId,
        amount: 0,
        balanceAfter: credits[0].balance,
        type: 'bonus', // Using bonus type for informational transaction
        reason: 'Subscription cancelled - credits valid until period end',
        metadata: { cancellation: true },
      });
    }
  }

  /**
   * Expire user credits (when subscription ends)
   */
  async expireUserCredits(userId: string): Promise<void> {
    const db = await this.getDatabase();
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (!credits.length || credits[0].balance === 0) {
      return;
    }

    const expiredAmount = credits[0].balance;

    await db.transaction(async (tx) => {
      // Set balance to 0
      await tx
        .update(userCredits)
        .set({
          balance: 0,
          monthlyAllocation: 0,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      // Record expiration
      await tx.insert(creditTransactions).values({
        id: nanoid(),
        userId,
        amount: -expiredAmount,
        balanceAfter: 0,
        type: 'expired',
        reason: 'Subscription ended - all credits expired',
        metadata: { expiredAmount },
      });
    });
  }

  /**
   * Refund credits (for billing issues, etc)
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
   * Admin: Add bonus credits to a user
   */
  async addBonusCredits(
    userId: string,
    amount: number,
    reason: string,
    addedBy: string
  ): Promise<{ success: boolean; newBalance: number }> {
    return await this.addCredits(userId, amount, reason, 'bonus', {
      addedBy,
      bonus: true,
    });
  }

  /**
   * Generate usage report
   */
  async generateUsageReport(userId: string, startDate: Date, endDate: Date) {
    const db = await this.getDatabase();
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
      totalExpired: 0,
      totalRefunded: 0,
      byFeature: {} as Record<string, number>,
    };

    transactions.forEach((tx) => {
      if (tx.type === 'earned' || tx.type === 'bonus') {
        summary.totalEarned += tx.amount;
      }
      if (tx.type === 'spent') {
        summary.totalSpent += Math.abs(tx.amount);
      }
      if (tx.type === 'expired') {
        summary.totalExpired += Math.abs(tx.amount);
      }
      if (tx.type === 'refunded') {
        summary.totalRefunded += tx.amount;
      }

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

  /**
   * Get subscription credit configuration
   */
  async getSubscriptionCredits(planId: string): Promise<number> {
    const db = await this.getDatabase();
    const configs = await db
      .select()
      .from(subscriptionCreditConfig)
      .where(eq(subscriptionCreditConfig.planId, planId))
      .limit(1);

    return configs.length ? configs[0].monthlyCredits : 0;
  }
}

// Export singleton instance
export const creditService = new SimplifiedCreditService();
