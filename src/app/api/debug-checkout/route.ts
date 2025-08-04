import { getDb } from '@/db';
import {
  findServerPlanByPlanId,
  findServerPriceInPlan,
  getServerPaymentProvider,
  getServerPriceId,
} from '@/lib/server-price-config';
import { getPaymentProvider } from '@/payment';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

async function debugCheckout(request?: Request) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
    errors: [],
  };

  try {
    // 1. Check environment variables
    debugInfo.checks.envVars = {
      NEXT_PUBLIC_PAYMENT_PROVIDER: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER,
      CREEM_API_KEY: !!process.env.CREEM_API_KEY,
      CREEM_WEBHOOK_SECRET: !!process.env.CREEM_WEBHOOK_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    };

    // 2. Check price IDs
    debugInfo.checks.priceIds = {
      monthly: getServerPriceId('pro_monthly'),
      yearly: getServerPriceId('pro_yearly'),
      lifetime: getServerPriceId('lifetime'),
    };

    // 3. Check payment provider
    debugInfo.checks.paymentProvider = {
      serverProvider: getServerPaymentProvider(),
      paymentProviderClass: null,
    };

    try {
      const provider = getPaymentProvider();
      debugInfo.checks.paymentProvider.paymentProviderClass =
        provider.constructor.name;
    } catch (error) {
      debugInfo.errors.push({
        location: 'getPaymentProvider',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // 4. Check plan configuration
    const plan = findServerPlanByPlanId('pro');
    debugInfo.checks.planConfig = {
      planFound: !!plan,
      pricesCount: plan?.prices.length || 0,
    };

    if (plan && debugInfo.checks.priceIds.monthly) {
      const price = findServerPriceInPlan(
        'pro',
        debugInfo.checks.priceIds.monthly
      );
      debugInfo.checks.priceInPlan = !!price;
    }

    // 5. Check database connection
    debugInfo.checks.database = {
      connected: false,
      error: null,
    };

    try {
      const db = await getDb();
      // Simple query to test connection
      const result = await db.execute(sql`SELECT 1 as test`);
      debugInfo.checks.database.connected = true;
      debugInfo.checks.database.testResult = result;
    } catch (error) {
      debugInfo.checks.database.connected = false;
      debugInfo.checks.database.error =
        error instanceof Error
          ? {
              message: error.message,
              code: (error as any).code,
              errno: (error as any).errno,
              syscall: (error as any).syscall,
            }
          : 'Unknown error';
      debugInfo.errors.push({
        location: 'database',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // 6. Test Creem API directly
    if (process.env.CREEM_API_KEY && debugInfo.checks.priceIds.monthly) {
      debugInfo.checks.creemApi = {
        tested: false,
        success: false,
      };

      try {
        // Test Creem API with a simple checkout creation
        const testBody = {
          product_id: debugInfo.checks.priceIds.monthly,
          units: 1,
          customer: {
            email: 'test@example.com',
            name: 'Test User',
          },
        };

        const response = await fetch('https://test-api.creem.io/v1/checkouts', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.CREEM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testBody),
        });

        debugInfo.checks.creemApi.tested = true;
        debugInfo.checks.creemApi.success = response.ok;
        debugInfo.checks.creemApi.status = response.status;
      } catch (error) {
        debugInfo.checks.creemApi.error =
          error instanceof Error ? error.message : 'Unknown error';
        debugInfo.errors.push({
          location: 'creemApi',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 7. Summary
    debugInfo.summary = {
      hasRequiredEnvVars: !!(
        process.env.NEXT_PUBLIC_PAYMENT_PROVIDER &&
        process.env.CREEM_API_KEY &&
        process.env.DATABASE_URL
      ),
      hasPriceIds: !!(
        debugInfo.checks.priceIds.monthly &&
        debugInfo.checks.priceIds.yearly &&
        debugInfo.checks.priceIds.lifetime
      ),
      databaseConnected: debugInfo.checks.database.connected,
      paymentProviderReady:
        !!debugInfo.checks.paymentProvider.paymentProviderClass,
      errorsCount: debugInfo.errors.length,
    };

    // Get request body if provided (POST only)
    if (request && request.method === 'POST') {
      try {
        const body = await request.json();
        if (body.testCheckout) {
          // Test checkout creation
          debugInfo.checkoutTest = {
            requested: true,
            params: body,
          };
        }
      } catch {
        // No body provided
      }
    }

    return NextResponse.json(debugInfo, {
      status: debugInfo.errors.length > 0 ? 500 : 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        debugInfo,
      },
      { status: 500 }
    );
  }
}

// Support both GET and POST methods
export async function GET() {
  return debugCheckout();
}

export async function POST(request: Request) {
  return debugCheckout(request);
}
