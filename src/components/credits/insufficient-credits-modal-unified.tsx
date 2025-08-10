'use client';

import { isSimplifiedCreditSystem } from '@/config/features';
import { InsufficientCreditsModal as OriginalModal } from './insufficient-credits-modal';
import { SimplifiedInsufficientCreditsModal } from './insufficient-credits-modal-simplified';

interface UnifiedInsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  feature: string;
}

/**
 * Unified insufficient credits modal that switches between v1 and v2
 * based on the feature flag configuration
 */
export function InsufficientCreditsModal(
  props: UnifiedInsufficientCreditsModalProps
) {
  // Use simplified version if v2 is enabled (no purchase options)
  if (isSimplifiedCreditSystem()) {
    return <SimplifiedInsufficientCreditsModal {...props} />;
  }

  // Use original version with credit package purchase options
  return <OriginalModal {...props} />;
}

// Export as default for easier imports
export default InsufficientCreditsModal;
