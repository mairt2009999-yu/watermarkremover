import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { payment } from '@/db/schema';

/**
 * Raw webhook capture endpoint for Creem
 * This endpoint logs raw webhook data to help debug signature and data format issues
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Capture all headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Get raw body
    const rawBody = await req.text();
    
    // Try to parse as JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = { parseError: true, rawBody };
    }
    
    // Log everything
    console.log('=== CREEM RAW WEBHOOK DATA ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Raw Body Length:', rawBody.length);
    console.log('Raw Body:', rawBody);
    console.log('Parsed Body:', JSON.stringify(parsedBody, null, 2));
    console.log('==============================');
    
    // If this looks like a real Creem webhook, try to process it
    if (parsedBody && (parsedBody.type || parsedBody.event_type)) {
      console.log('Detected webhook event type:', parsedBody.type || parsedBody.event_type);
      
      // Check if we have required data
      const data = parsedBody.data || parsedBody;
      const hasRequiredFields = data.customer || data.email || data.metadata;
      
      if (hasRequiredFields) {
        console.log('Webhook has required fields, attempting to process...');
        
        // Import and call the handler
        try {
          const { handleWebhookEvent } = await import('@/payment');
          // Use a dummy signature for now since we're debugging
          await handleWebhookEvent(rawBody, 'debug-signature');
          console.log('Webhook processed successfully');
        } catch (error) {
          console.error('Error processing webhook:', error);
        }
        
        // Check if payment was created
        try {
          const db = await getDb();
          const recentPayments = await db
            .select()
            .from(payment)
            .orderBy(payment.createdAt)
            .limit(5);
          
          console.log('Recent payments after webhook:', recentPayments.map(p => ({
            id: p.id,
            type: p.type,
            status: p.status,
            createdAt: p.createdAt
          })));
        } catch (error) {
          console.error('Error checking payments:', error);
        }
      }
    }
    
    // Always return success to avoid webhook retries during debugging
    return NextResponse.json({ 
      received: true,
      message: 'Webhook data logged for debugging',
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in raw webhook handler:', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}