'use server';

import { getServerPricePlans } from '@/lib/server-price-config';
import type { PricePlan } from '@/payment/types';

/**
 * Server action to get price plans with correct price IDs
 * This ensures price IDs are loaded from environment variables at runtime
 */
export async function getUserPricePlansAction(): Promise<{
  success: boolean;
  data?: PricePlan[];
  error?: string;
}> {
  try {
    const plans = getServerPricePlans();
    const planArray = Object.values(plans);
    
    return {
      success: true,
      data: planArray,
    };
  } catch (error) {
    console.error('Get user price plans error:', error);
    return {
      success: false,
      error: 'Failed to get price plans',
    };
  }
}