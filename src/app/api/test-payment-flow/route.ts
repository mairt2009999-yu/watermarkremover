import { NextResponse } from 'next/server';
import { getAllPricePlans } from '@/lib/price-plan';
import { getServerPricePlans } from '@/lib/server-price-config';
import { getSession } from '@/lib/server';
import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getLifetimeStatusAction } from '@/actions/get-lifetime-status';

export async function GET() {
  try {
    // Get current user session
    const session = await getSession();
    const userId = session?.user?.id;
    
    // Test 1: Check price plans loading
    const clientPlans = getAllPricePlans();
    const serverPlans = getServerPricePlans();
    
    // Test 2: Check user subscription status if logged in
    let subscriptionStatus = null;
    let lifetimeStatus = null;
    
    if (userId) {
      // Check active subscription
      const subResult = await getActiveSubscriptionAction({ userId });
      subscriptionStatus = {
        success: subResult?.data?.success,
        data: subResult?.data?.data,
        error: subResult?.data?.error
      };
      
      // Check lifetime status
      const lifetimeResult = await getLifetimeStatusAction({ userId });
      lifetimeStatus = {
        success: lifetimeResult?.data?.success,
        isLifetimeMember: lifetimeResult?.data?.isLifetimeMember,
        error: lifetimeResult?.data?.error
      };
    }
    
    // Test 3: Check if price IDs are properly loaded
    const priceValidation = {
      clientPrices: {
        pro_monthly: clientPlans.find(p => p.id === 'pro')?.prices[0]?.priceId,
        pro_yearly: clientPlans.find(p => p.id === 'pro')?.prices[1]?.priceId,
        lifetime: clientPlans.find(p => p.id === 'lifetime')?.prices[0]?.priceId,
      },
      serverPrices: {
        pro_monthly: serverPlans.pro?.prices[0]?.priceId,
        pro_yearly: serverPlans.pro?.prices[1]?.priceId,
        lifetime: serverPlans.lifetime?.prices[0]?.priceId,
      }
    };
    
    return NextResponse.json({
      user: {
        id: userId,
        email: session?.user?.email,
        name: session?.user?.name,
      },
      clientPlans,
      serverPlans,
      priceValidation,
      subscriptionStatus,
      lifetimeStatus,
      paymentProvider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}