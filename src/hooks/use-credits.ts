'use client';

import { checkCredits, deductCredits, getUserCredits } from '@/actions/credits';
import { type FeatureType, calculateCreditCost } from '@/credits/types';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface UseCreditsOptions {
  feature: FeatureType;
  onSuccess?: () => void;
  onInsufficientCredits?: (required: number, current: number) => void;
}

export function useCredits({
  feature,
  onSuccess,
  onInsufficientCredits,
}: UseCreditsOptions) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch current balance
  const fetchBalance = useCallback(async () => {
    try {
      const result = await getUserCredits();
      if (result.success && result.data) {
        setBalance(result.data.balance);
        return result.data.balance;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }, []);

  // Check if user has enough credits
  const checkBalance = useCallback(
    async (
      imageSize?: number
    ): Promise<{ hasCredits: boolean; required: number; current: number }> => {
      try {
        setLoading(true);
        const requiredCredits = calculateCreditCost(feature, imageSize);

        const result = await checkCredits(requiredCredits);
        const currentBalance = await fetchBalance();

        if (!result.hasCredits && onInsufficientCredits) {
          onInsufficientCredits(requiredCredits, currentBalance);
        }

        return {
          hasCredits: result.hasCredits,
          required: requiredCredits,
          current: currentBalance,
        };
      } catch (error) {
        console.error('Error checking credits:', error);
        toast.error('Failed to check credit balance');
        return { hasCredits: false, required: 0, current: 0 };
      } finally {
        setLoading(false);
      }
    },
    [feature, fetchBalance, onInsufficientCredits]
  );

  // Process with credits
  const processWithCredits = useCallback(
    async (
      processFn: () => Promise<any>,
      imageSize?: number,
      metadata?: Record<string, any>
    ) => {
      try {
        setProcessing(true);

        // Check credits first
        const creditCheck = await checkBalance(imageSize);
        if (!creditCheck.hasCredits) {
          toast.error('Insufficient credits');
          return { success: false, error: 'Insufficient credits' };
        }

        // Process the operation
        const processResult = await processFn();

        // If processing succeeded, deduct credits
        if (processResult.success) {
          const deductResult = await deductCredits({
            amount: creditCheck.required,
            feature,
            metadata: {
              ...metadata,
              imageSize,
              timestamp: new Date().toISOString(),
            },
          });

          if (deductResult.success && 'newBalance' in deductResult) {
            setBalance(deductResult.newBalance);
            toast.success(
              `${creditCheck.required} credits used. Balance: ${deductResult.newBalance}`
            );
            onSuccess?.();
          } else {
            // Log error but don't fail the operation since it already succeeded
            console.error('Failed to deduct credits:', deductResult.error);
            toast.warning('Operation completed but credits were not deducted');
          }
        }

        return processResult;
      } catch (error) {
        console.error('Error processing with credits:', error);
        toast.error('Operation failed');
        return { success: false, error: 'Operation failed' };
      } finally {
        setProcessing(false);
      }
    },
    [feature, checkBalance, onSuccess]
  );

  // Simple deduct credits function
  const deduct = useCallback(
    async (imageSize?: number, metadata?: Record<string, any>) => {
      try {
        setLoading(true);
        const requiredCredits = calculateCreditCost(feature, imageSize);

        const result = await deductCredits({
          amount: requiredCredits,
          feature,
          metadata,
        });

        if (result.success && 'newBalance' in result) {
          setBalance(result.newBalance);
          toast.success(`${requiredCredits} credits used`);
          onSuccess?.();
          return { success: true, newBalance: result.newBalance };
        } else {
          toast.error(result.error || 'Failed to deduct credits');
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Error deducting credits:', error);
        toast.error('Failed to deduct credits');
        return { success: false, error: 'Failed to deduct credits' };
      } finally {
        setLoading(false);
      }
    },
    [feature, onSuccess]
  );

  return {
    balance,
    loading,
    processing,
    checkBalance,
    processWithCredits,
    deduct,
    fetchBalance,
  };
}

// Export a specific hook for watermark removal
export function useWatermarkCredits(
  onInsufficientCredits?: (required: number, current: number) => void
) {
  return useCredits({
    feature: 'watermark_removal',
    onInsufficientCredits,
  });
}
