import { getDb } from '@/db';
import { payment, user } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check payment system state
 */
export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const result: any = {
      timestamp: new Date().toISOString(),
      environment: {
        provider: process.env.PAYMENT_PROVIDER,
        creem: {
          apiKey: process.env.CREEM_API_KEY
            ? process.env.CREEM_API_KEY.substring(0, 15) + '...'
            : 'NOT SET',
          webhookSecret: process.env.CREEM_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
          isTestKey:
            process.env.CREEM_API_KEY?.startsWith('creem_test_') || false,
          prices: {
            monthly:
              process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || 'NOT SET',
            yearly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY || 'NOT SET',
            lifetime: process.env.NEXT_PUBLIC_CREEM_PRICE_LIFETIME || 'NOT SET',
          },
        },
      },
    };

    // Get user info if email provided
    if (email) {
      const userResult = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (userResult.length > 0) {
        const userData = userResult[0];
        result.user = {
          id: userData.id,
          email: userData.email,
          customerId: userData.customerId,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        };

        // Get payments for this user
        const payments = await db
          .select()
          .from(payment)
          .where(eq(payment.userId, userData.id))
          .orderBy(desc(payment.createdAt));

        result.payments = payments.map((p) => ({
          id: p.id,
          priceId: p.priceId,
          type: p.type,
          status: p.status,
          subscriptionId: p.subscriptionId,
          customerId: p.customerId,
          interval: p.interval,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
      } else {
        result.user = null;
        result.message = `No user found with email: ${email}`;
      }
    } else {
      // Get recent payments
      const recentPayments = await db
        .select({
          id: payment.id,
          userId: payment.userId,
          priceId: payment.priceId,
          type: payment.type,
          status: payment.status,
          subscriptionId: payment.subscriptionId,
          createdAt: payment.createdAt,
        })
        .from(payment)
        .orderBy(desc(payment.createdAt))
        .limit(10);

      result.recentPayments = recentPayments;
      result.message = 'Add ?email=user@example.com to check specific user';
    }

    // Get payment stats
    const stats = await db.select().from(payment);

    result.stats = {
      totalPayments: stats.length,
      byType: {
        subscription: stats.filter((p) => p.type === 'subscription').length,
        oneTime: stats.filter((p) => p.type === 'one_time').length,
      },
      byStatus: {
        active: stats.filter((p) => p.status === 'active').length,
        canceled: stats.filter((p) => p.status === 'canceled').length,
        completed: stats.filter((p) => p.status === 'completed').length,
        other: stats.filter(
          (p) => !['active', 'canceled', 'completed'].includes(p.status || '')
        ).length,
      },
    };

    return NextResponse.json(result);
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
