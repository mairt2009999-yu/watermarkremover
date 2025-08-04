import { handleWebhookEvent } from '@/payment';
import { NextResponse } from 'next/server';

/**
 * Test endpoint to simulate Creem webhook events
 * This helps debug webhook processing without needing actual Creem webhooks
 */
export async function POST(req: Request) {
  try {
    const { eventType, customerEmail, priceId, planId } = await req.json();

    // Create a simulated Creem webhook payload
    const simulatedPayload = {
      type: eventType || 'checkout.completed',
      data: {
        id: `test_${Date.now()}`,
        subscription_id: `sub_test_${Date.now()}`,
        customer: {
          email: customerEmail || 'test@example.com',
          id: `cus_test_${Date.now()}`,
        },
        product_id: priceId || process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY,
        status: 'active',
        recurring: true,
        interval: 'month',
        metadata: {
          planId: planId || 'pro',
          priceId: priceId || process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY,
          customerEmail: customerEmail || 'test@example.com',
        },
      },
    };

    console.log(
      'Simulating Creem webhook with payload:',
      JSON.stringify(simulatedPayload, null, 2)
    );

    // Process the webhook event
    // For testing, we'll bypass signature validation
    const testSignature = 'test-signature';
    await handleWebhookEvent(JSON.stringify(simulatedPayload), testSignature);

    return NextResponse.json({
      success: true,
      message: 'Test webhook processed',
      payload: simulatedPayload,
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      'POST to this endpoint with: { eventType, customerEmail, priceId, planId }',
    examplePayload: {
      eventType: 'checkout.completed',
      customerEmail: 'user@example.com',
      priceId: 'price_xxx',
      planId: 'pro',
    },
  });
}
