'use server';

import {
  isCreditPurchaseEnabled,
  isSimplifiedCreditSystem,
} from '@/config/features';
import { creditService } from '@/credits';
import type { CreditTransaction } from '@/credits';
import type { CreditService } from '@/credits/credit.service';
import type { SimplifiedCreditService } from '@/credits/credit.service.simplified';
import { getSession } from '@/lib/server';
import { z } from 'zod';

// Schema for input validation
const deductCreditsSchema = z.object({
  amount: z.number().positive(),
  feature: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const purchasePackageSchema = z.object({
  packageId: z.string(),
  paymentIntentId: z.string(),
});

/**
 * Get current user's credit balance
 */
export async function getUserCredits() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const balance = await creditService.getBalance(session.user.id);
    const usage = await creditService.getMonthlyUsage(session.user.id);

    return {
      success: true,
      data: {
        balance,
        ...usage,
      },
    };
  } catch (error) {
    console.error('Error getting user credits:', error);
    return { success: false, error: 'Failed to get credits' };
  }
}

/**
 * Get user's transaction history
 */
export async function getCreditHistory(page = 1, limit = 20) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const history = await creditService.getTransactionHistory(session.user.id, {
      page,
      limit,
    });

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error('Error getting credit history:', error);
    return { success: false, error: 'Failed to get history' };
  }
}

/**
 * Check if user has enough credits
 */
export async function checkCredits(amount: number) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized', hasCredits: false };
    }

    const hasCredits = await creditService.checkCredits(
      session.user.id,
      amount
    );

    return {
      success: true,
      hasCredits,
    };
  } catch (error) {
    console.error('Error checking credits:', error);
    return {
      success: false,
      error: 'Failed to check credits',
      hasCredits: false,
    };
  }
}

/**
 * Deduct credits for a feature
 */
export async function deductCredits(
  input: z.infer<typeof deductCreditsSchema>
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const validated = deductCreditsSchema.parse(input);

    const result = await creditService.deductCredits(
      session.user.id,
      validated.amount,
      validated.feature,
      validated.metadata
    );

    return result;
  } catch (error) {
    console.error('Error deducting credits:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', newBalance: 0 };
    }
    return { success: false, error: 'Failed to deduct credits', newBalance: 0 };
  }
}

/**
 * Get available credit packages (v1 only)
 */
export async function getCreditPackages(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  // Credit packages only available in v1
  if (!isCreditPurchaseEnabled()) {
    return {
      success: false,
      error: 'Credit purchases are not available in the current system',
      data: [],
    };
  }

  try {
    // @ts-ignore - getCreditPackages only exists in v1
    const packages = await creditService.getCreditPackages?.();

    return {
      success: true,
      data: packages || [],
    };
  } catch (error) {
    console.error('Error getting credit packages:', error);
    return { success: false, error: 'Failed to get packages' };
  }
}

/**
 * Purchase a credit package (v1 only)
 */
export async function purchaseCreditPackage(
  input: z.infer<typeof purchasePackageSchema>
) {
  // Credit purchases only available in v1
  if (!isCreditPurchaseEnabled()) {
    return {
      success: false,
      error:
        'Credit purchases are not available. Please upgrade your subscription for more credits.',
    };
  }

  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const validated = purchasePackageSchema.parse(input);

    // @ts-ignore - purchaseCreditPackage only exists in v1
    const result = await creditService.purchaseCreditPackage?.(
      session.user.id,
      validated.packageId,
      validated.paymentIntentId
    );

    return result || { success: false, error: 'Feature not available' };
  } catch (error) {
    console.error('Error purchasing credit package:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' };
    }
    return { success: false, error: 'Failed to purchase package' };
  }
}

/**
 * Get usage report for date range
 */
export async function getUsageReport(startDate: Date, endDate: Date) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const report = await creditService.generateUsageReport(
      session.user.id,
      startDate,
      endDate
    );

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error('Error getting usage report:', error);
    return { success: false, error: 'Failed to get report' };
  }
}

/**
 * Admin: Add credits to a user
 */
export async function addCreditsToUser(
  userId: string,
  amount: number,
  reason: string
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin (you'll need to implement this check)
    // if (!isAdmin(session.user.id)) {
    //   return { success: false, error: 'Forbidden' };
    // }

    let result: any;
    if (isSimplifiedCreditSystem()) {
      result = await (creditService as SimplifiedCreditService).addBonusCredits(
        userId,
        amount,
        reason,
        session.user.id
      );
    } else {
      result = await (creditService as CreditService).addCredits(
        userId,
        amount,
        reason,
        'bonus',
        {
          addedBy: session.user.id,
        }
      );
    }

    return result;
  } catch (error) {
    console.error('Error adding credits:', error);
    return { success: false, error: 'Failed to add credits', newBalance: 0 };
  }
}
