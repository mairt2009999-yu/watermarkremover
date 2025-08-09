import { creditService } from '@/credits';
import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { isSimplifiedCreditSystem } from '@/config/features';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Monthly credit reset endpoint
 * This should be called by a cron job on the 1st of each month
 * 
 * For Vercel Cron: Add to vercel.json
 * {
 *   "crons": [{
 *     "path": "/api/cron/reset-credits",
 *     "schedule": "0 0 1 * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron (in production)
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Cron] Starting monthly credit reset...');

    // Only run for simplified system (v2)
    if (!isSimplifiedCreditSystem()) {
      console.log('[Cron] Credit reset skipped - using v1 system');
      return NextResponse.json({
        message: 'Credit reset not needed for v1 system',
        version: 'v1',
      });
    }

    // Get all active subscriptions
    const db = await getDb();
    const activeSubscriptions = await db
      .select()
      .from(payment)
      .where(eq(payment.status, 'active'));

    console.log(`[Cron] Found ${activeSubscriptions.length} active subscriptions`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Reset credits for each active subscription
    for (const subscription of activeSubscriptions) {
      try {
        // Determine plan type from price ID or subscription type
        const planId = determinePlanId(subscription);
        
        if (planId) {
          await creditService.allocateMonthlyCredits(
            subscription.userId,
            planId
          );
          successCount++;
        } else {
          console.warn(`[Cron] Could not determine plan for user ${subscription.userId}`);
          errors.push(`Unknown plan for user ${subscription.userId}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`[Cron] Error resetting credits for user ${subscription.userId}:`, error);
        errors.push(`Failed for user ${subscription.userId}: ${error}`);
        errorCount++;
      }
    }

    // Also handle monthly reset for all users (expired credits)
    try {
      // @ts-ignore - resetMonthlyCredits might not exist in v1
      await creditService.resetMonthlyCredits?.();
    } catch (error) {
      console.error('[Cron] Error in resetMonthlyCredits:', error);
    }

    const result = {
      success: errorCount === 0,
      message: `Credit reset completed: ${successCount} successful, ${errorCount} failed`,
      stats: {
        total: activeSubscriptions.length,
        successful: successCount,
        failed: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };

    console.log('[Cron] Credit reset completed:', result);

    return NextResponse.json(result, {
      status: errorCount === 0 ? 200 : 207, // 207 = Multi-Status (partial success)
    });
  } catch (error) {
    console.error('[Cron] Fatal error in credit reset:', error);
    return NextResponse.json(
      {
        error: 'Internal server error during credit reset',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Determine plan ID from subscription data
 */
function determinePlanId(subscription: any): string | null {
  // Map price IDs to plan IDs
  const priceIdMap: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '']: 'pro_monthly',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '']: 'pro_yearly',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME || '']: 'lifetime',
  };

  // Check if we can map from price ID
  if (subscription.priceId && priceIdMap[subscription.priceId]) {
    return priceIdMap[subscription.priceId];
  }

  // Fallback to subscription type/interval
  if (subscription.type === 'lifetime') {
    return 'lifetime';
  }

  if (subscription.interval === 'year') {
    return 'pro_yearly';
  }

  if (subscription.interval === 'month') {
    return 'pro_monthly';
  }

  // Default to pro_monthly if we can't determine
  return 'pro_monthly';
}

// Also export POST for manual triggering (admin only)
export async function POST(request: Request) {
  // Check for admin authentication
  // You should implement proper admin authentication here
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Call the same logic as GET
  return GET(request);
}