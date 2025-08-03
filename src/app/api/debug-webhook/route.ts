import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug webhook endpoint to log incoming webhook data
 */
export async function POST(req: NextRequest) {
  try {
    // Get all headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Get body
    const body = await req.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = body;
    }
    
    // Log webhook data
    console.log('=== WEBHOOK DEBUG ===');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify(parsedBody, null, 2));
    console.log('===================');
    
    // Return debug info
    return NextResponse.json({
      headers,
      body: parsedBody,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}