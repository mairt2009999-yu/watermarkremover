import { creditService } from '@/credits';
import { isSimplifiedCreditSystem } from '@/config/features';
import { getSession } from '@/lib/server';
import { NextResponse } from 'next/server';

/**
 * Credit system status endpoint
 * Returns information about the current credit system configuration and user balance
 */
export async function GET() {
  try {
    // Get current configuration
    const systemVersion = isSimplifiedCreditSystem() ? 'v2' : 'v1';
    const features = {
      version: systemVersion,
      purchasesEnabled: !isSimplifiedCreditSystem(),
      monthlyReset: isSimplifiedCreditSystem(),
      rolloverEnabled: false,
    };

    // Try to get user balance if authenticated
    let userBalance = null;
    let userPlan = null;
    
    try {
      const session = await getSession();
      if (session?.user?.id) {
        const balance = await creditService.getBalance(session.user.id);
        userBalance = balance;
        
        // Get user's subscription plan if available
        // This would require looking up the user's active subscription
        // For now, we'll just return the balance
      }
    } catch (error) {
      // User not authenticated or error getting balance
      console.log('Could not get user balance:', error);
    }

    const response = {
      status: 'ok',
      system: features,
      user: userBalance !== null ? {
        balance: userBalance,
        plan: userPlan,
      } : null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in credit status endpoint:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to get credit system status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Health check for credit system
 * Used by monitoring and deployment scripts
 */
export async function HEAD() {
  try {
    // Quick health check - just verify the service is accessible
    const systemVersion = isSimplifiedCreditSystem() ? 'v2' : 'v1';
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Credit-System-Version': systemVersion,
        'X-Credit-System-Status': 'healthy',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Credit-System-Status': 'unhealthy',
      },
    });
  }
}