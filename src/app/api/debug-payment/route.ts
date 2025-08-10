import {
  getPaymentProvider,
  getPriceId,
  websiteConfig,
} from '@/config/website';
import {
  findPlanByPlanId,
  findPriceInPlan,
  getAllPricePlans,
} from '@/lib/price-plan';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const paymentProvider = getPaymentProvider();
    const envProvider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER;
    const plans = getAllPricePlans();

    // Get price IDs
    const monthlyPriceId = getPriceId('pro_monthly');
    const yearlyPriceId = getPriceId('pro_yearly');
    // Note: lifetime plan doesn't exist in getPriceId, commenting out
    // const lifetimePriceId = getPriceId('lifetime');

    // Test finding plan and price
    const proPlan = findPlanByPlanId('pro');
    const testPrice = proPlan ? findPriceInPlan('pro', monthlyPriceId) : null;

    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_PAYMENT_PROVIDER: envProvider,
        NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY:
          process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY,
        NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY:
          process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY,
        NEXT_PUBLIC_CREEM_PRICE_LIFETIME:
          process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        HAS_CREEM_API_KEY: !!process.env.CREEM_API_KEY,
      },
      config: {
        paymentProvider: paymentProvider,
        websiteConfigProvider: websiteConfig.payment.provider,
        priceIds: {
          monthly: monthlyPriceId,
          yearly: yearlyPriceId,
          // lifetime: lifetimePriceId,
        },
      },
      plans: plans.map((plan) => ({
        id: plan.id,
        prices: plan.prices.map((price) => ({
          priceId: price.priceId,
          type: price.type,
          amount: price.amount,
          interval: price.interval,
        })),
      })),
      testResults: {
        proPlanFound: !!proPlan,
        monthlyPriceFound: !!testPrice,
        priceIdMatch: testPrice?.priceId === monthlyPriceId,
      },
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
