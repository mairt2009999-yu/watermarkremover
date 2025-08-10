'use client';

import { getUserCredits } from '@/actions/credits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SUBSCRIPTION_CREDITS,
  formatCredits,
  getUpgradeOptions,
} from '@/credits/types.simplified';
import { Check, Coins, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SimplifiedInsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  feature: string;
}

export function SimplifiedInsufficientCreditsModal({
  open,
  onOpenChange,
  requiredCredits,
  feature,
}: SimplifiedInsufficientCreditsModalProps) {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentAllocation, setCurrentAllocation] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const creditsResult = await getUserCredits();

      if (creditsResult.success && creditsResult.data) {
        setCurrentBalance(creditsResult.data.balance);
        setCurrentAllocation(creditsResult.data.monthlyAllocation);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const creditsNeeded = requiredCredits - currentBalance;
  const upgradeOptions = getUpgradeOptions(currentAllocation);

  const handleUpgradePlan = (plan?: string) => {
    onOpenChange(false);
    if (plan) {
      router.push(`/pricing?plan=${plan}`);
    } else {
      router.push('/pricing');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            More Credits Needed
          </DialogTitle>
          <DialogDescription>
            Upgrade your plan to get more monthly credits for {feature}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Credit Status */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">
                  Your Balance
                </div>
                <div className="text-xl font-bold">
                  {formatCredits(currentBalance)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Required</div>
                <div className="text-xl font-bold text-yellow-600">
                  {formatCredits(requiredCredits)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Short By</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCredits(creditsNeeded)}
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Info */}
          {!loading && (
            <div className="text-sm text-muted-foreground text-center">
              Your current plan includes{' '}
              <strong>{formatCredits(currentAllocation)}</strong> credits/month
            </div>
          )}

          {/* Upgrade Options */}
          <div className="space-y-3">
            <div className="text-sm font-medium">
              Choose a plan with more credits:
            </div>

            {upgradeOptions.map((option) => (
              <Card
                key={option.plan}
                className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                  option.recommended ? 'border-primary' : ''
                }`}
                onClick={() =>
                  handleUpgradePlan(option.plan.toLowerCase().replace(' ', '_'))
                }
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      option.recommended ? 'bg-primary/10' : 'bg-muted'
                    }`}
                  >
                    <TrendingUp
                      className={`h-5 w-5 ${
                        option.recommended
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{option.plan}</div>
                      {option.recommended && (
                        <Badge variant="default" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                      {option.savings && (
                        <Badge variant="secondary" className="text-xs">
                          {option.savings}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatCredits(option.credits)} credits per month
                    </div>
                    <div className="font-semibold text-sm mt-1">
                      {option.price}
                    </div>

                    {/* Show what they can do with these credits */}
                    <div className="text-xs text-muted-foreground mt-2">
                      ≈ {Math.floor(option.credits / 5)} watermark removals per
                      month
                    </div>
                  </div>
                  {option.credits >= requiredCredits && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </Card>
            ))}

            {/* If on highest plan */}
            {currentAllocation >= SUBSCRIPTION_CREDITS.lifetime && (
              <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                <p>You're on our highest plan!</p>
                <p className="mt-1">
                  Credits reset monthly. Current period has {currentBalance}{' '}
                  credits remaining.
                </p>
              </div>
            )}
          </div>

          {/* Benefits of upgrading */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Why upgrade?
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-0.5">
                  <li>• Credits refresh automatically every month</li>
                  <li>• No need to manage separate purchases</li>
                  <li>• Better value with annual plans</li>
                  <li>• Priority processing for Pro users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={() => handleUpgradePlan()}>View All Plans</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
