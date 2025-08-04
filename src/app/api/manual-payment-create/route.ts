import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { payment, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Manually create a payment record for debugging
 * This helps when webhooks are not working properly
 */
export async function POST(req: Request) {
  try {
    const {
      email,
      priceId,
      planType = 'pro_monthly',
      status = 'active',
    } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await getDb();

    // Find user
    const userResult = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: `User not found with email: ${email}` },
        { status: 404 }
      );
    }

    const userData = userResult[0];

    // Determine price ID and interval
    let finalPriceId = priceId;
    let interval = 'month';

    if (!finalPriceId) {
      switch (planType) {
        case 'pro_monthly':
          finalPriceId = process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY;
          interval = 'month';
          break;
        case 'pro_yearly':
          finalPriceId = process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY;
          interval = 'year';
          break;
        case 'lifetime':
          finalPriceId = process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME;
          interval = 'lifetime';
          break;
      }
    }

    // Create payment record
    const now = new Date();
    const paymentId = randomUUID();
    const subscriptionId = `sub_manual_${Date.now()}`;

    const newPayment = {
      id: paymentId,
      priceId: finalPriceId || 'manual_price',
      type: planType === 'lifetime' ? 'one_time' : 'subscription',
      interval: interval,
      userId: userData.id,
      customerId: userData.customerId || `manual_${userData.id}`,
      subscriptionId: subscriptionId,
      status: status,
      periodStart: now,
      periodEnd:
        planType === 'lifetime'
          ? null
          : new Date(
              now.getTime() +
                (interval === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000
            ),
      cancelAtPeriodEnd: false,
      trialStart: null,
      trialEnd: null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(payment).values(newPayment).returning();

    // Update user's customerId if not set
    if (!userData.customerId) {
      await db
        .update(user)
        .set({
          customerId: newPayment.customerId,
          updatedAt: now,
        })
        .where(eq(user.id, userData.id));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment record created manually',
      payment: result[0],
      user: {
        id: userData.id,
        email: userData.email,
        customerId: userData.customerId || newPayment.customerId,
      },
    });
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

export async function GET() {
  return NextResponse.json({
    message: 'POST to create a manual payment record',
    example: {
      email: 'user@example.com',
      planType: 'pro_monthly', // or 'pro_yearly', 'lifetime'
      priceId: 'optional - will use env var if not provided',
      status: 'active', // or 'canceled', 'past_due', etc.
    },
    description:
      'This endpoint creates a payment record manually for debugging purposes',
  });
}
