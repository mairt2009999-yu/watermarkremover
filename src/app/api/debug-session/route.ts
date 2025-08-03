import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const cookies = request.headers.get('cookie');

    return NextResponse.json({
      session,
      cookies: cookies?.split('; ') || [],
      headers: {
        cookie: cookies,
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
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
