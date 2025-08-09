'use client';

import { getUserCredits } from '@/actions/credits';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCredits, getUsagePercentage } from '@/credits/types.simplified';
import { Calendar, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CreditData {
  balance: number;
  monthlyAllocation: number;
  totalSpent: number;
  totalEarned: number;
  daysUntilReset: number;
  usagePercentage: number;
}

export function SimplifiedCreditBalance() {
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
        setCredits(result.data);
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

  const usagePercentage = getUsagePercentage(credits.balance, credits.monthlyAllocation);
  const remainingPercentage = 100 - usagePercentage;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Main Balance Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Coins className="h-4 w-4" />
              <span>Monthly Credits</span>
            </div>
            <div className="text-3xl font-bold">
              {formatCredits(credits.balance)}
              <span className="text-lg text-muted-foreground ml-2">
                / {formatCredits(credits.monthlyAllocation)}
              </span>
            </div>
          </div>
          {credits.monthlyAllocation < 100 && (
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          )}
        </div>

        {/* Usage Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Usage this month</span>
            <span className="font-medium">{usagePercentage}%</span>
          </div>
          <Progress value={remainingPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatCredits(credits.monthlyAllocation - credits.balance)} used</span>
            <span>{formatCredits(credits.balance)} remaining</span>
          </div>
        </div>

        {/* Reset Timer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Credits reset in</span>
            <span className="font-semibold">{credits.daysUntilReset} days</span>
          </div>
          <Link href="/dashboard/credits/history">
            <Button variant="ghost" size="sm">
              View History
            </Button>
          </Link>
        </div>

        {/* Low Balance Warning */}
        {credits.balance < 20 && credits.balance > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Running low on credits</p>
                <p className="text-xs mt-1">
                  You have {formatCredits(credits.balance)} credits left. 
                  Consider upgrading your plan for more monthly credits.
                </p>
                <Link href="/pricing">
                  <Button size="sm" variant="secondary" className="mt-2">
                    View Upgrade Options
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* No Credits Warning */}
        {credits.balance === 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="text-sm font-medium">No credits remaining</p>
                <p className="text-xs mt-1">
                  Your monthly credits are exhausted. Upgrade your plan or wait {credits.daysUntilReset} days for reset.
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="mt-2">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Free Plan Prompt */}
        {credits.monthlyAllocation <= 5 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Free Plan:</strong> You get {credits.monthlyAllocation} credits/month.
              Upgrade to Pro for 100+ credits monthly!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}