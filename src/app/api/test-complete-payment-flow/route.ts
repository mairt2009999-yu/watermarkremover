import { getDb } from '@/db';
import { user, payment } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Test the complete payment flow from user creation to webhook processing
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const db = await getDb();
    const results: any = {
      steps: []
    };
    
    // Step 1: Check if user exists
    results.steps.push({ step: 'Check user exists', timestamp: new Date().toISOString() });
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    
    if (existingUser.length === 0) {
      results.steps.push({ 
        step: 'User not found', 
        error: `No user with email ${email}. Create user first.` 
      });
      return NextResponse.json(results, { status: 404 });
    }
    
    const userData = existingUser[0];
    results.user = {
      id: userData.id,
      email: userData.email,
      customerId: userData.customerId
    };
    results.steps.push({ 
      step: 'User found', 
      userId: userData.id,
      customerId: userData.customerId 
    });
    
    // Step 2: Simulate webhook event
    results.steps.push({ step: 'Simulate webhook event', timestamp: new Date().toISOString() });
    
    const webhookPayload = {
      type: 'checkout.completed',
      data: {
        id: `checkout_test_${Date.now()}`,
        subscription_id: `sub_test_${Date.now()}`,
        customer: {
          email: email,
          id: userData.customerId || `cus_test_${Date.now()}`
        },
        product_id: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || 'price_test',
        status: 'active',
        recurring: true,
        interval: 'month',
        metadata: {
          planId: 'pro',
          priceId: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || 'price_test',
          customerEmail: email,
          userId: userData.id
        }
      }
    };
    
    results.webhookPayload = webhookPayload;
    
    // Step 3: Directly process the webhook instead of calling the endpoint
    // This avoids the fetch error in production
    const { handleWebhookEvent } = await import('@/payment');
    
    const simulatedPayload = {
      type: 'checkout.completed',
      data: {
        id: `test_${Date.now()}`,
        subscription_id: `sub_test_${Date.now()}`,
        customer: {
          email: email,
          id: userData.customerId || `cus_test_${Date.now()}`
        },
        product_id: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || 'price_test',
        status: 'active',
        recurring: true,
        interval: 'month',
        metadata: {
          planId: 'pro',
          priceId: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || 'price_test',
          customerEmail: email,
          userId: userData.id
        }
      }
    };
    
    let webhookResult;
    try {
      await handleWebhookEvent(JSON.stringify(simulatedPayload), 'test-signature');
      webhookResult = { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      webhookResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    
    results.steps.push({ 
      step: 'Webhook processed', 
      success: webhookResult.success,
      result: webhookResult
    });
    
    // Step 4: Check if payment was created
    results.steps.push({ step: 'Check payment created', timestamp: new Date().toISOString() });
    
    const payments = await db
      .select()
      .from(payment)
      .where(eq(payment.userId, userData.id))
      .orderBy(payment.createdAt);
    
    results.payments = payments.map(p => ({
      id: p.id,
      priceId: p.priceId,
      type: p.type,
      status: p.status,
      subscriptionId: p.subscriptionId,
      createdAt: p.createdAt
    }));
    
    results.steps.push({ 
      step: 'Payments found', 
      count: payments.length,
      latestPayment: payments[payments.length - 1] || null
    });
    
    // Step 5: Summary
    results.summary = {
      userExists: true,
      userId: userData.id,
      customerId: userData.customerId,
      paymentsCount: payments.length,
      hasActiveSubscription: payments.some(p => p.status === 'active' && p.type === 'subscription'),
      testSuccessful: payments.length > 0
    };
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with a user email to test the complete payment flow',
    example: {
      email: 'user@example.com'
    },
    description: 'This will simulate a Creem webhook for the given user and check if payment records are created'
  });
}