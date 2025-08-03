import { NextResponse } from 'next/server';
import { getServerPaymentProvider, getServerPriceId, getServerPricePlans } from '@/lib/server-price-config';
import { getPaymentProvider } from '@/payment';

export async function GET() {
  try {
    // Get payment provider
    const provider = getServerPaymentProvider();
    
    // Get price IDs
    const priceIds = {
      pro_monthly: getServerPriceId('pro_monthly'),
      pro_yearly: getServerPriceId('pro_yearly'),
      lifetime: getServerPriceId('lifetime'),
    };
    
    // Get server price plans
    const serverPlans = getServerPricePlans();
    
    // Check Creem configuration
    const creemConfig = {
      apiKey: process.env.CREEM_API_KEY ? 'Set' : 'Not Set',
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET ? 'Set' : 'Not Set',
      provider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER,
      priceIds: {
        pro_monthly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY,
        pro_yearly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY,
        lifetime: process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME,
      }
    };
    
    // Try to initialize payment provider
    let paymentProviderStatus = 'Not initialized';
    try {
      const paymentProvider = getPaymentProvider();
      paymentProviderStatus = paymentProvider ? 'Initialized' : 'Failed';
    } catch (error) {
      paymentProviderStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    
    return NextResponse.json({
      provider,
      priceIds,
      serverPlans,
      creemConfig,
      paymentProviderStatus,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}