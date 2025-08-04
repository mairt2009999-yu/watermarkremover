import { NextResponse } from 'next/server';

/**
 * Clean price ID by removing any surrounding quotes
 */
const cleanPriceId = (priceId: string | undefined): string => {
  if (!priceId) return '';
  return priceId.replace(/^"+|"+$/g, '');
};

export async function GET() {
  // Return runtime configuration for client-side use
  const config = {
    paymentProvider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'stripe',
    priceIds: {
      creem: {
        monthly: cleanPriceId(process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY),
        yearly: cleanPriceId(process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY),
        lifetime: cleanPriceId(process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME),
      },
      stripe: {
        monthly: cleanPriceId(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY),
        yearly: cleanPriceId(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY),
        lifetime: cleanPriceId(process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME),
      },
    },
  };

  return NextResponse.json(config, {
    headers: {
      // Cache for 5 minutes
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
