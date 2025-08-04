import { handleWebhookEvent } from '@/payment';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Creem webhook handler
 * This endpoint receives webhook events from Creem and processes them
 *
 * @param req The incoming request
 * @returns NextResponse
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Get the request body as text
  const payload = await req.text();

  // Log all headers for debugging
  console.log('=== Creem Webhook Headers ===');
  req.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });
  console.log('===========================');

  // Get the Creem signature from headers
  // Creem might use different header names
  const possibleSignatureHeaders = [
    'x-creem-signature',
    'creem-signature',
    'x-webhook-signature',
    'x-signature',
    'x-hub-signature',
    'x-hub-signature-256',
    'webhook-signature',
  ];

  let signature = '';
  for (const headerName of possibleSignatureHeaders) {
    const value = req.headers.get(headerName);
    if (value) {
      signature = value;
      console.log(`Found signature in header: ${headerName}`);
      break;
    }
  }

  console.log('Selected signature:', signature);

  try {
    // Validate inputs
    if (!payload) {
      console.error('Missing webhook payload');
      return NextResponse.json(
        { error: 'Missing webhook payload' },
        { status: 400 }
      );
    }

    // Log webhook info
    console.log('=== Processing Creem Webhook ===');
    console.log('Payload length:', payload.length);
    console.log('Signature found:', !!signature);

    // Parse payload to check event type
    try {
      const event = JSON.parse(payload);
      console.log('Event type:', event.type || event.event_type);
      console.log('Event data keys:', Object.keys(event.data || event));
    } catch (e) {
      console.error('Failed to parse webhook payload:', e);
    }

    if (!signature) {
      console.warn('No signature found, but processing anyway for now');
      // For debugging, we'll process without signature
      // return NextResponse.json(
      //   { error: 'Missing Creem signature' },
      //   { status: 400 }
      // );
    }

    // Process the webhook event
    await handleWebhookEvent(payload, signature || 'missing-signature');

    console.log('Webhook processed successfully');
    // Return success
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error in Creem webhook route:', error);

    // Return error
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
