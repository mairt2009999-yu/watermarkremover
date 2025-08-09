/**
 * Feature flags configuration for safe feature rollout
 * Allows switching between different implementations without code deployment
 */

export type CreditSystemVersion = 'v1' | 'v2';

export interface FeatureFlags {
  creditSystem: {
    version: CreditSystemVersion;
    enablePurchases: boolean;
    enableRollover: boolean;
    debugMode: boolean;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
  };
}

/**
 * Get feature flags from environment or defaults
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    creditSystem: {
      // v1 = original system with purchases
      // v2 = simplified subscription-only system
      version: (process.env.NEXT_PUBLIC_CREDIT_SYSTEM_VERSION as CreditSystemVersion) || 'v1',
      enablePurchases: process.env.NEXT_PUBLIC_ENABLE_CREDIT_PURCHASES !== 'false',
      enableRollover: process.env.NEXT_PUBLIC_ENABLE_CREDIT_ROLLOVER === 'true',
      debugMode: process.env.NODE_ENV === 'development',
    },
    maintenance: {
      enabled: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
      message: process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE,
    },
  };
}

/**
 * Check if using simplified credit system
 */
export function isSimplifiedCreditSystem(): boolean {
  const flags = getFeatureFlags();
  return flags.creditSystem.version === 'v2';
}

/**
 * Check if credit purchases are enabled
 */
export function isCreditPurchaseEnabled(): boolean {
  const flags = getFeatureFlags();
  return flags.creditSystem.version === 'v1' && flags.creditSystem.enablePurchases;
}

/**
 * Get credit system configuration based on version
 */
export function getCreditSystemConfig() {
  const flags = getFeatureFlags();
  
  if (flags.creditSystem.version === 'v2') {
    return {
      subscriptionCredits: {
        free: 5,
        pro_monthly: 100,
        pro_yearly: 150,
        lifetime: 500,
      },
      features: {
        purchases: false,
        rollover: false,
        monthlyReset: true,
      },
    };
  }
  
  // v1 - original system
  return {
    subscriptionCredits: {
      free: 10,
      pro_monthly: 300,
      pro_yearly: 400,
      lifetime: 1000,
    },
    features: {
      purchases: true,
      rollover: flags.creditSystem.enableRollover,
      monthlyReset: true,
    },
  };
}

// Export singleton instance
export const features = getFeatureFlags();