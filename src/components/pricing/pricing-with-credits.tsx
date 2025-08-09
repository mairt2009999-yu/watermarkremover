'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getCreditSystemConfig, isSimplifiedCreditSystem } from '@/config/features';
import { Check, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  interval?: string;
  credits: number;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

export function PricingWithCredits() {
  const config = getCreditSystemConfig();
  const isV2 = isSimplifiedCreditSystem();
  
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      credits: config.subscriptionCredits.free,
      features: [
        `${config.subscriptionCredits.free} credits per month`,
        'Basic watermark removal',
        'Standard processing',
        'Community support',
      ],
    },
    {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      price: '$9.99',
      interval: '/month',
      credits: config.subscriptionCredits.pro_monthly,
      features: [
        `${config.subscriptionCredits.pro_monthly} credits per month`,
        'All watermark removal features',
        'Priority processing',
        'Email support',
        'HD processing',
      ],
      recommended: true,
    },
    {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      price: '$79',
      interval: '/year',
      credits: config.subscriptionCredits.pro_yearly,
      features: [
        `${config.subscriptionCredits.pro_yearly} credits per month`,
        isV2 ? '50% more credits than monthly!' : '33% more credits',
        'All Pro features',
        'Priority support',
        'Advanced AI features',
      ],
      savings: 'Save 34%',
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '$149',
      credits: config.subscriptionCredits.lifetime,
      features: [
        `${config.subscriptionCredits.lifetime} credits per month forever`,
        'Best value for power users',
        'All features unlocked',
        'Premium support',
        'Early access to new features',
      ],
      savings: 'One-time payment',
    },
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isV2 
            ? 'All plans include monthly credits. No hidden fees, no separate purchases needed.'
            : 'Get started with our flexible pricing plans. Purchase additional credits anytime.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.recommended ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.recommended && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.interval && (
                    <span className="text-muted-foreground">{plan.interval}</span>
                  )}
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2">
                    {plan.savings}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">
                    {plan.credits} Credits
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ≈ {Math.floor(plan.credits / 5)}-{Math.floor(plan.credits / 3)} operations/month
                </p>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Link href={`/signup?plan=${plan.id}`} className="w-full">
                <Button 
                  className="w-full" 
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  {plan.id === 'free' ? 'Start Free' : 'Get Started'}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Credit Calculator */}
      <div className="mt-16 max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>How many credits do I need?</CardTitle>
            <CardDescription>
              Estimate your monthly usage to find the perfect plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Light User</div>
                <div className="text-muted-foreground mb-4">1-20 images/month</div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold">Free or Pro Monthly</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    5-100 credits needed
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Regular User</div>
                <div className="text-muted-foreground mb-4">20-30 images/month</div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="font-semibold">Pro Yearly</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    100-150 credits needed
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Power User</div>
                <div className="text-muted-foreground mb-4">50+ images/month</div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold">Lifetime</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    250+ credits needed
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* V2 specific messaging */}
      {isV2 && (
        <div className="mt-12 text-center max-w-2xl mx-auto px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Simple, Transparent Pricing</h3>
              <p className="text-sm text-muted-foreground">
                All credits are included in your subscription. No need to buy extra credits - 
                just upgrade your plan when you need more. Credits refresh automatically every month.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PricingWithCredits;