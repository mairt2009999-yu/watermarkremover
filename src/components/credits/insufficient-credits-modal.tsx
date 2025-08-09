'use client';

import { getCreditPackages, getUserCredits } from '@/actions/credits';
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
import { formatCredits } from '@/credits/types';
import { Coins, CreditCard, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  feature: string;
}

export function InsufficientCreditsModal({
  open,
  onOpenChange,
  requiredCredits,
  feature,
}: InsufficientCreditsModalProps) {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [packages, setPackages] = useState<any[]>([]);
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
      const [creditsResult, packagesResult] = await Promise.all([
        getUserCredits(),
        getCreditPackages(),
      ]);

      if (creditsResult.success && creditsResult.data) {
        setCurrentBalance(creditsResult.data.balance);
      }

      if (packagesResult.success && packagesResult.data) {
        setPackages(packagesResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const creditsNeeded = requiredCredits - currentBalance;

  // Find the best package for the user
  const recommendedPackage =
    packages.find((pkg) => pkg.credits >= creditsNeeded) ||
    packages[packages.length - 1];

  const handleUpgradePlan = () => {
    onOpenChange(false);
    router.push('/pricing');
  };

  const handleBuyCredits = (packageId?: string) => {
    onOpenChange(false);
    if (packageId) {
      router.push(`/pricing/credits?package=${packageId}`);
    } else {
      router.push('/pricing/credits');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Insufficient Credits
          </DialogTitle>
          <DialogDescription>
            You need more credits to use {feature}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Credit Status */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Current</div>
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
                <div className="text-sm text-muted-foreground">Need</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCredits(creditsNeeded)}
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Choose how to get more credits:
            </div>

            {/* Option 1: Upgrade Plan */}
            <Card
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={handleUpgradePlan}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Upgrade Your Plan</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Get monthly credits with Pro subscription starting at
                    $9.99/month
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    300-1000 credits/month
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Option 2: Buy Credits */}
            <Card
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleBuyCredits(recommendedPackage?.id)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Buy Credit Package</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    One-time purchase for immediate use
                  </div>
                  {recommendedPackage && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-green-600">
                        Recommended: {recommendedPackage.name}
                      </Badge>
                      <span className="text-sm">
                        {formatCredits(recommendedPackage.credits)} credits for
                        ${(recommendedPackage.price / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Package Options */}
            {!loading && packages.length > 0 && (
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">
                  Quick purchase options:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {packages.slice(0, 4).map((pkg) => (
                    <Button
                      key={pkg.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleBuyCredits(pkg.id)}
                      className="justify-between"
                    >
                      <span>{formatCredits(pkg.credits)} credits</span>
                      <span className="font-bold">
                        ${(pkg.price / 100).toFixed(2)}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleBuyCredits()}>
            <Sparkles className="h-4 w-4 mr-2" />
            Get Credits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
