import { isSimplifiedCreditSystem } from '@/config/features';
import { creditService } from '@/credits';

/**
 * Enhanced webhook handler for credit allocation
 * This module adds credit system integration to Stripe webhook events
 */

/**
 * Determine plan ID from price ID
 */
function getPlanIdFromPriceId(priceId: string): string | null {
  const priceIdMap: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '']: 'pro_monthly',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '']: 'pro_yearly',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME || '']: 'lifetime',
    // Add Creem price IDs if using Creem
    [process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || '']: 'pro_monthly',
    [process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY || '']: 'pro_yearly',
    [process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME || '']: 'lifetime',
  };

  return priceIdMap[priceId] || null;
}

/**
 * Handle subscription creation with credit allocation
 */
export async function handleSubscriptionCreated(
  userId: string,
  priceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const planId = getPlanIdFromPriceId(priceId);

    if (!planId) {
      console.warn(`[Credits] No plan mapping found for price ${priceId}`);
      return;
    }

    console.log(
      `[Credits] Allocating monthly credits for new subscription: user=${userId}, plan=${planId}`
    );

    // Allocate credits based on the plan
    await creditService.allocateMonthlyCredits(userId, planId);

    console.log(`[Credits] Successfully allocated credits for ${userId}`);
  } catch (error) {
    console.error(
      '[Credits] Error allocating credits on subscription creation:',
      error
    );
    // Don't throw - we don't want to fail the webhook if credits fail
  }
}

/**
 * Handle subscription update with credit adjustment
 */
export async function handleSubscriptionUpdated(
  userId: string,
  oldPriceId: string | null,
  newPriceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Only process if using simplified system
    if (!isSimplifiedCreditSystem()) {
      console.log('[Credits] Skipping credit update - using v1 system');
      return;
    }

    const oldPlanId = oldPriceId ? getPlanIdFromPriceId(oldPriceId) : null;
    const newPlanId = getPlanIdFromPriceId(newPriceId);

    if (!newPlanId) {
      console.warn(`[Credits] No plan mapping found for price ${newPriceId}`);
      return;
    }

    // Skip if plan hasn't actually changed
    if (oldPlanId === newPlanId) {
      console.log('[Credits] Plan unchanged, skipping credit adjustment');
      return;
    }

    console.log(
      `[Credits] Handling subscription change: user=${userId}, ${oldPlanId} -> ${newPlanId}`
    );

    // Handle the plan change
    // @ts-ignore - handleSubscriptionChange might not exist in v1
    await creditService.handleSubscriptionChange?.(
      userId,
      oldPlanId,
      newPlanId
    );

    console.log(`[Credits] Successfully adjusted credits for ${userId}`);
  } catch (error) {
    console.error(
      '[Credits] Error adjusting credits on subscription update:',
      error
    );
    // Don't throw - we don't want to fail the webhook if credits fail
  }
}

/**
 * Handle subscription cancellation
 */
export async function handleSubscriptionCanceled(
  userId: string,
  priceId: string
): Promise<void> {
  try {
    // Only process if using simplified system
    if (!isSimplifiedCreditSystem()) {
      console.log('[Credits] Skipping cancellation handling - using v1 system');
      return;
    }

    console.log(
      `[Credits] Handling subscription cancellation for user=${userId}`
    );

    // In v2, credits remain until period end
    // @ts-ignore - handleSubscriptionCancellation might not exist in v1
    await creditService.handleSubscriptionCancellation?.(userId);

    console.log(`[Credits] Marked subscription as canceled for ${userId}`);
  } catch (error) {
    console.error('[Credits] Error handling subscription cancellation:', error);
    // Don't throw - we don't want to fail the webhook if credits fail
  }
}

/**
 * Handle subscription deletion (when it actually expires)
 */
export async function handleSubscriptionDeleted(
  userId: string,
  priceId: string
): Promise<void> {
  try {
    // Only process if using simplified system
    if (!isSimplifiedCreditSystem()) {
      console.log('[Credits] Skipping deletion handling - using v1 system');
      return;
    }

    console.log(
      `[Credits] Handling subscription deletion (expiration) for user=${userId}`
    );

    // Expire all credits when subscription ends
    // @ts-ignore - expireUserCredits might not exist in v1
    await creditService.expireUserCredits?.(userId);

    console.log(`[Credits] Expired all credits for ${userId}`);
  } catch (error) {
    console.error(
      '[Credits] Error expiring credits on subscription deletion:',
      error
    );
    // Don't throw - we don't want to fail the webhook if credits fail
  }
}

/**
 * Handle one-time payment (lifetime plan)
 */
export async function handleOneTimePayment(
  userId: string,
  priceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const planId = getPlanIdFromPriceId(priceId);

    if (!planId) {
      console.warn(`[Credits] No plan mapping found for price ${priceId}`);
      return;
    }

    // Only allocate credits for lifetime plan
    if (planId === 'lifetime') {
      console.log(`[Credits] Allocating lifetime credits for user=${userId}`);
      await creditService.allocateMonthlyCredits(userId, 'lifetime');
      console.log(
        `[Credits] Successfully allocated lifetime credits for ${userId}`
      );
    }
  } catch (error) {
    console.error(
      '[Credits] Error allocating credits for one-time payment:',
      error
    );
    // Don't throw - we don't want to fail the webhook if credits fail
  }
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailed(
  userId: string,
  priceId: string
): Promise<void> {
  // In the future, you might want to:
  // - Send warning email about credit suspension
  // - Temporarily restrict credit usage
  // - Log the failure for admin review

  console.warn(`[Credits] Payment failed for user=${userId}, price=${priceId}`);
  // Currently no action taken - credits remain active until subscription expires
}

// Export all handlers
export const creditWebhookHandlers = {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionCanceled,
  handleSubscriptionDeleted,
  handleOneTimePayment,
  handlePaymentFailed,
};
