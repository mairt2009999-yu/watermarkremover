'use client';

import { getUserCredits } from '@/actions/credits';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCredits, getDaysUntilReset } from '@/credits/types';
import { Calendar, Coins, ShoppingCart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CreditData {
  balance: number;
  monthlyAllocation: number;
  purchasedCredits: number;
  totalSpent: number;
  totalEarned: number;
  daysUntilReset: number;
}

export function CreditBalance() {
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const result = await getUserCredits();
      if (result.success && result.data) {
        const data = result.data as any; // Type assertion to handle type mismatch
        setCredits({
          balance: data.balance || 0,
          monthlyAllocation: data.monthlyAllocation || 0,
          purchasedCredits: data.purchasedCredits || 0,
          totalSpent: data.totalSpent || 0,
          totalEarned: data.totalEarned || 0,
          daysUntilReset: data.daysUntilReset || getDaysUntilReset(null),
        });
      } else {
        setError(result.error || 'Failed to load credits');
      }
    } catch (err) {
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (error || !credits) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Failed to load credits</div>
        <Button onClick={fetchCredits} className="mt-2" variant="outline">
          Retry
        </Button>
      </Card>
    );
  }

  const usagePercentage =
    credits.monthlyAllocation > 0
      ? ((credits.monthlyAllocation -
          (credits.balance - credits.purchasedCredits)) /
          credits.monthlyAllocation) *
        100
      : 0;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Main Balance Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Coins className="h-4 w-4" />
              <span>Credit Balance</span>
            </div>
            <div className="text-3xl font-bold">
              {formatCredits(credits.balance)}
            </div>
          </div>
          <Link href="/pricing/credits">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </Link>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Monthly Credits</div>
            <div className="font-semibold">
              {formatCredits(
                Math.max(0, credits.balance - credits.purchasedCredits)
              )}{' '}
              / {formatCredits(credits.monthlyAllocation)}
            </div>
            {credits.monthlyAllocation > 0 && (
              <Progress value={100 - usagePercentage} className="mt-1 h-2" />
            )}
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              Purchased Credits
            </div>
            <div className="font-semibold">
              {formatCredits(credits.purchasedCredits)}
            </div>
          </div>
        </div>

        {/* Reset Timer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Monthly reset in</span>
            <span className="font-semibold">{credits.daysUntilReset} days</span>
          </div>
          <Link href="/dashboard/credits/history">
            <Button variant="ghost" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View History
            </Button>
          </Link>
        </div>

        {/* Low Balance Warning */}
        {credits.balance < 20 && credits.balance > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg">
            <p className="text-sm font-medium">Low credit balance</p>
            <p className="text-xs mt-1">
              You have {formatCredits(credits.balance)} credits remaining.
              Consider purchasing more credits to continue using our services.
            </p>
          </div>
        )}

        {/* No Credits Warning */}
        {credits.balance === 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-lg">
            <p className="text-sm font-medium">No credits remaining</p>
            <p className="text-xs mt-1">
              Purchase credits or upgrade your subscription to continue.
            </p>
            <div className="flex gap-2 mt-2">
              <Link href="/pricing/credits">
                <Button size="sm" variant="default">
                  Buy Credits
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="sm" variant="outline">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
