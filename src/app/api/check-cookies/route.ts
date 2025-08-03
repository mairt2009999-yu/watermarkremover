import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const sessionToken = cookieStore.get('better-auth.session_token');

  return NextResponse.json({
    allCookies: allCookies.map((c) => ({
      name: c.name,
      value: c.value?.substring(0, 20) + '...',
      // Include other properties but not the full value for security
    })),
    sessionTokenExists: !!sessionToken,
    cookieNames: allCookies.map((c) => c.name),
    message: sessionToken
      ? 'Session cookie found!'
      : 'Session cookie NOT found - this is why redirect happens',
  });
}
