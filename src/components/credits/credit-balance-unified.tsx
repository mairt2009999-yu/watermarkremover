'use client';

import { isSimplifiedCreditSystem } from '@/config/features';
import { CreditBalance as OriginalCreditBalance } from './credit-balance';
import { SimplifiedCreditBalance } from './credit-balance-simplified';

/**
 * Unified credit balance component that switches between v1 and v2
 * based on the feature flag configuration
 */
export function CreditBalance() {
  // Use simplified version if v2 is enabled
  if (isSimplifiedCreditSystem()) {
    return <SimplifiedCreditBalance />;
  }

  // Use original version with purchase options
  return <OriginalCreditBalance />;
}

// Export as default for easier imports
export default CreditBalance;
