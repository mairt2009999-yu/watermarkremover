import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'CREEM_API_KEY not set' }, { status: 500 });
    }
    
    // Determine API URL based on key type
    const isTestKey = apiKey.startsWith('creem_test_');
    const apiBaseUrl = isTestKey
      ? 'https://test-api.creem.io/v1'
      : 'https://api.creem.io/v1';
    
    // Test different authentication methods
    const authMethods = [
      { name: 'x-api-key', headers: { 'x-api-key': apiKey } },
      { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${apiKey}` } },
      { name: 'Authorization', headers: { 'Authorization': apiKey } },
      { name: 'Api-Key', headers: { 'Api-Key': apiKey } },
    ];
    
    const results = [];
    
    for (const method of authMethods) {
      try {
        const response = await fetch(`${apiBaseUrl}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...method.headers
          }
        });
        
        const data = await response.json().catch(() => null);
        
        results.push({
          method: method.name,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          data: response.ok ? data : null,
          error: !response.ok ? data : null
        });
      } catch (error) {
        results.push({
          method: method.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      apiKey: apiKey.substring(0, 15) + '...',
      isTestKey,
      apiBaseUrl,
      results
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}